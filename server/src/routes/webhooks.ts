import { Router } from "express";
import Stripe from "stripe";
import crypto from "node:crypto";
import { Licenses, Products } from "../db.js";
import type { License } from "../models/License.js";

const router = Router();

export default function webhookRoutes(stripe: Stripe, webhookSecret: string) {
    router.post("/", async (req, res) => {
        let event: Stripe.Event;

        try {
            const sig = req.headers["stripe-signature"] as string;
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err: any) {
            console.error("❌ Webhook signature verification failed:", err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        try {
            switch (event.type) {
                case "checkout.session.completed": {
                    const session = event.data.object as Stripe.Checkout.Session;
                    const productId = (session.metadata?.productId as string) || null;
                    if (!productId) {
                        console.error("Missing productId in checkout session metadata");
                        break;
                    }

                    const product = await Products.findOne({ _id: productId, active: true });
                    if (!product) {
                        console.error("Product not found or inactive:", productId);
                        break;
                    }

                    const licenseId = crypto.randomUUID();
                    const doc: License = {
                        _id: licenseId,
                        productId,
                        email: (session.customer_details?.email as string) || null,
                        stripePaymentIntentId: (session.payment_intent as string) || null,
                        stripeCheckoutSessionId: session.id,
                        status: "active",
                        maxActivations: product.maxActivationsDefault,
                        activations: [],
                        createdAt: new Date(),
                    };

                    await Licenses.insertOne(doc);
                    break;
                }

                case "charge.refunded":
                case "charge.dispute.created": {
                    const charge = event.data.object as Stripe.Charge;
                    const pi = charge.payment_intent as string | null;
                    if (pi) {
                        await Licenses.updateOne(
                            { stripePaymentIntentId: pi },
                            { $set: { status: "refunded" as const } }
                        );
                    }
                    break;
                }

                default:
                    break;
            }

            return res.json({ received: true });
        } catch (e) {
            console.error("⚠️ Webhook handler error:", e);
            return res.status(500).json({ error: "webhook_handler_failed" });
        }
    });

    return router;
}
