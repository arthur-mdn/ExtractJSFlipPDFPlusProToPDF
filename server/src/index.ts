import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import Stripe from "stripe";
import { connectDB } from "./db.js";
import productsRoutes from "./routes/products.js";
import checkoutRoutes from "./routes/checkout.js";
import webhookRoutes from "./routes/webhooks.js";
import licensesRoutes from "./routes/licenses.js";

const {
    PORT = "3001",
    APP_URL = "http://localhost:5173",
    MONGO_URL = "mongodb://localhost:27017/licensesdb",
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
} = process.env;

if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    console.error("Configure STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in .env");
    process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

const app = express();

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
