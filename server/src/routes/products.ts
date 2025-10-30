import { Router } from "express";
import { Products } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
    const items = await Products.find({ active: true })
        .project({ _id: 1, name: 1 })
        .toArray();
    res.json({ items });
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const product = await Products.findOne({ _id: id, active: true }, { projection: { _id: 1, name: 1, description: 1, price: 1 } });
    if (!product) {
        return res.status(404).json({ error: "Produit non trouvé" });
    }
    res.json(product);
});

export default router;
