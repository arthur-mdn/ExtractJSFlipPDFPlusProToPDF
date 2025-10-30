import { Router } from "express";
import Stripe from "stripe";
import { randomUUID } from "crypto";
import { Products, Prices, Licenses } from "../db.js";

const router = Router();
const APP_URL = process.env.APP_URL;

export default function checkoutRoutes(stripe: Stripe) {
    router.post("/", async (req, res) => {
        try {
            const { priceId } = req.body as { priceId?: string };
            if (!priceId) {
                return res.status(400).json({ error: "missing_priceId" });
            }

            const priceDoc = await Prices.findOne({ _id: priceId, active: true });
            if (!priceDoc) {
                return res.status(400).json({ error: "invalid_price" });
            }

            const product = await Products.findOne({ _id: priceDoc.productId, active: true });
            if (!product) {
                return res.status(404).json({ error: "unknown_product_for_price" });
            }

            const session = await stripe.checkout.sessions.create({
                mode: "payment",
                line_items: [{ price: priceId, quantity: 1 }],
                success_url: `${APP_URL}/success/{CHECKOUT_SESSION_ID}`,
                cancel_url: `${APP_URL}/cancel`,
                metadata: { productId: product._id, priceId }
            });

            res.json({ url: session.url });
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: "checkout_failed" });
        }
    });

    return router;
}
