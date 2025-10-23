import { Router } from "express";
import Stripe from "stripe";
import { Products } from "../db.js";

const router = Router();
const { APP_URL = "http://localhost:5173" } = process.env;

export default function checkoutRoutes(stripe: Stripe) {
    router.post("/", async (req, res) => {
        try {
            const { productId } = req.body as { productId: string };
            const product = await Products.findOne({ _id: productId, active: true });
            if (!product) return res.status(404).json({ error: "unknown_product" });

            const session = await stripe.checkout.sessions.create({
                mode: "payment",
                line_items: [{ price: product.stripePriceId, quantity: 1 }],
                success_url: `${APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${APP_URL}/cancel`,
                metadata: { productId }
            });
            res.json({ url: session.url });
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: "checkout_failed" });
        }
    });

    return router;
}
