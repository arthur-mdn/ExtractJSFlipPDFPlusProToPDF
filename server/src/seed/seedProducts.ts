import "dotenv/config";
import fs from "fs/promises";
import Stripe from "stripe";
import { connectDB, Products, Prices } from "../db.js";

async function main() {
    const jsonPath = new URL("./products.json", import.meta.url);
    const raw = await fs.readFile(jsonPath, "utf8");
    const docs = JSON.parse(raw) as Array<Record<string, any>>;

    const MONGO_URL = process.env.MONGO_URL;
    await connectDB(MONGO_URL);

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const stripeApiVersion = process.env.STRIPE_API_VERSION;
    const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: stripeApiVersion }) : null;
    if (!stripe) {
        console.warn("[seed] STRIPE key not provided — les prix seront `undefined` si non présent dans le JSON.");
    }

    for (const d of docs) {
        if (d.createdAt && typeof d.createdAt === "string") {
            d.createdAt = new Date(d.createdAt);
        } else if (!d.createdAt) {
            d.createdAt = new Date();
        }

        const docToSet = { ...d };
        await Products.updateOne({ _id: d._id }, { $set: docToSet }, { upsert: true });
        console.log(`[seed] produit seedé/mis à jour: ${d._id}`);

        if (!stripe) continue;

        let fetchedPrices: Stripe.Price[] = [];

        try {
            if (d.stripeProductId) {
                const list = await stripe.prices.list({ product: d.stripeProductId, active: true, limit: 100 });
                fetchedPrices = list.data;
            } else if (d.stripePriceId) {
                const price = await stripe.prices.retrieve(d.stripePriceId);
                fetchedPrices = [price];
            } else {
                // pas de références stripe pour ce produit
                // on peut décider de ne rien faire (produit gratuit)
                continue;
            }
        } catch (err) {
            console.error(`[seed] erreur récupération prices Stripe pour ${d._id}:`, err);
            continue;
        }


        const fetchedIds: string[] = [];
        for (const p of fetchedPrices) {
            fetchedIds.push(p.id);
            let unitAmount: number | undefined = undefined;
            if (typeof p.unit_amount === "number") {
                unitAmount = Math.round(p.unit_amount) / 100;
            }
            const priceDoc = {
                _id: p.id,
                productId: d._id,
                unitAmount,
                currency: p.currency,
                recurring: p.recurring ?? null,
                active: (p.active ?? true),
                metadata: p.metadata ?? {},
                createdAt: new Date()
            };
            await Prices.updateOne({ _id: p.id }, { $set: priceDoc }, { upsert: true });
            console.log(`[seed] price upserted: ${p.id} for product ${d._id}`);
        }

        // Marquer comme inactifs les prices existants pour ce produit mais non retournés par l'API Stripe
        if (fetchedIds.length > 0) {
            await Prices.updateMany(
                { productId: d._id, _id: { $nin: fetchedIds } },
                { $set: { active: false } }
            );
        }
    }

    console.log("✅ Products seeded/updated.");
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
