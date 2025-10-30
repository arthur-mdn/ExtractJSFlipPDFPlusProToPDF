import { Router } from "express";
import { Products, Prices } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
    const items = await Products.find({ active: true })
        .project({ _id: 1, name: 1, metadata: 1, maxActivationsDefault: 1 })
        .toArray();

    const productIds = items.map((it) => it._id);
    if (productIds.length === 0) {
        return res.json({ items: [] });
    }

    const prices = await Prices.find({ productId: { $in: productIds }, active: true })
        .project({ _id: 1, productId: 1, unitAmount: 1, currency: 1, recurring: 1, metadata: 1 })
        .toArray();

    const byProduct: Record<string, any[]> = {};
    for (const p of prices) {
        (byProduct[p.productId] ||= []).push(p);
    }

    const itemsWithPrices = items.map((it) => ({ ...it, prices: byProduct[it._id] ?? [] }));
    res.json({ items: itemsWithPrices });
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const product = await Products.findOne(
        { _id: id, active: true },
        { projection: { _id: 1, name: 1, metadata: 1, maxActivationsDefault: 1 } }
    );
    if (!product) {
        return res.status(404).json({ error: "Produit non trouvé" });
    }

    const prices = await Prices.find({ productId: id, active: true })
        .project({ _id: 1, unitAmount: 1, currency: 1, recurring: 1, metadata: 1 })
        .toArray();

    res.json({ ...product, prices });
});

export default router;