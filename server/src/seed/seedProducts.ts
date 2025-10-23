import "dotenv/config";
import { connectDB, Products } from "../db.js";

async function main() {
    const { MONGO_URL = "mongodb://localhost:27017/licensesdb" } = process.env;
    await connectDB(MONGO_URL);

    const docs = [
        {
            _id: "extract_js_flipbook_to_pdf",
            name: "Extract JS FlipBook to PDF (lifetime)",
            stripePriceId: "price_1SLMyxJAnYGuyFY2kmRgAVUg",
            maxActivationsDefault: 1,
            active: true,
            metadata: {},
            createdAt: new Date(),
        }
    ];

    for (const d of docs) {
        await Products.updateOne({ _id: d._id }, { $set: d }, { upsert: true });
    }

    console.log("✅ Products seeded/updated.");
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
