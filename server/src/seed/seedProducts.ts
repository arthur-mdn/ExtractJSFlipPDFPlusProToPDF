import "dotenv/config";
import fs from "fs/promises";
import Stripe from "stripe";
import { connectDB, Products } from "../db.js";

async function main() {
    const jsonPath = new URL("./products.json", import.meta.url);
    const raw = await fs.readFile(jsonPath, "utf8");
    const docs = JSON.parse(raw) as Array<Record<string, any>>;

    const { MONGO_URL = "mongodb://localhost:27017/licensesdb" } = process.env;
    await connectDB(MONGO_URL);

    const stripeKey = process.env.STRIPE_SECRET_KEY ?? process.env.STRIPE_SECRET ?? process.env.STRIPE_API_KEY;
    const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: "2022-11-15" }) : null;
    if (!stripe) {
        console.warn("[seed] STRIPE key not provided — les prix seront `undefined` si non présent dans le JSON.");
    }

    for (const d of docs) {
        if (d.createdAt && typeof d.createdAt === "string") {
            d.createdAt = new Date(d.createdAt);
        } else if (!d.createdAt) {
            d.createdAt = new Date();
        }

        let priceValue: number | undefined = undefined;

        if (stripe && d.stripePriceId) {
            try {
                const price = await stripe.prices.retrieve(d.stripePriceId);
                console.log(price)
                // unit_amount est en centimes -> convertir en nombre décimal (ex: 349 -> 3.49)
                if (typeof price.unit_amount === "number") {
                    priceValue = Math.round(price.unit_amount) / 100;
                } else {
                    console.warn(`[seed] stripe price ${d.stripePriceId} sans unit_amount pour ${d._id}`);
                }
            } catch (err) {
                console.error(`[seed] impossible de récupérer le price Stripe ${d.stripePriceId} pour ${d._id}:`, err);
            }
        } else if (d.price !== undefined) {
            // Forcer un prix via le JSON
            priceValue = d.price;
        }

        const docToSet = { ...d, price: priceValue };
        await Products.updateOne({ _id: d._id }, { $set: docToSet }, { upsert: true });
        console.log(`[seed] produit seedé/mis à jour: ${d._id} (price: ${priceValue ?? "undefined"})`);
    }

    console.log("✅ Products seeded/updated.");
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
