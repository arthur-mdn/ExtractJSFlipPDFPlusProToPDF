import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import Stripe from "stripe";
import { connectDB } from "./db.js";
import productsRoutes from "./routes/products.js";
import checkoutRoutes from "./routes/checkout.js";
import webhookRoutes from "./routes/webhooks.js";
import licensesRoutes from "./routes/licenses.js";

const {
    PORT,
    APP_URL,
    MONGO_URL,
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
    STRIPE_API_VERSION
} = process.env;

if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !STRIPE_API_VERSION) {
    console.error("Configure STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_API_VERSION in .env");
    process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: STRIPE_API_VERSION });

const app = express();
const publicDir = path.join(process.cwd(), "public");

app.use(
    "/images",
    express.static(publicDir, {
        dotfiles: "ignore",
        index: false,
        maxAge: "1d",
        setHeaders(res) {
            res.setHeader("Access-Control-Allow-Origin", APP_URL);
        },
    })
);

app.use(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    webhookRoutes(stripe, STRIPE_WEBHOOK_SECRET)
);

app.use(helmet());
app.use(cors({ origin: APP_URL, credentials: true }));
app.use(express.json());

app.use("/api/products", productsRoutes);
app.use("/api/checkout", checkoutRoutes(stripe));
app.use("/api/licenses", licensesRoutes);

(async () => {
    await connectDB(MONGO_URL);
    app.listen(Number(PORT), () => {
        console.log(`✅ API running on http://localhost:${PORT}`);
    });
})();
