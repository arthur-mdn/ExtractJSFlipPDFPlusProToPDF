import { Router } from "express";
import { Products } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
    const items = await Products.find({ active: true })
        .project({ _id: 1, name: 1 })
        .toArray();
    res.json({ items });
});

export default router;
