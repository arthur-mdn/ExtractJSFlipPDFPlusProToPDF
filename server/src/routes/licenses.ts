import { Router } from "express";
import { Licenses, Products } from "../db.js";
import { authJwt, signToken } from "../utils/auth.js";

const router = Router();

router.get("/by-session/:sessionId", async (req, res) => {
    const { sessionId } = req.params;
    const lic = await Licenses.findOne({ stripeCheckoutSessionId: sessionId });
    if (!lic) return res.status(404).json({ ok: false });

    const product = await Products.findOne({ _id: lic.productId });
    return res.json({
        ok: true,
        licenseKey: lic._id,
        email: lic.email || null,
        product: product ? { id: product._id, name: product.name } : null,
    });
});

router.post("/activate", async (req, res) => {
    const { key, deviceId } = req.body as { key: string; deviceId: string };
    if (!key || !deviceId) return res.status(400).json({ ok: false, reason: "missing_params" });

    const lic = await Licenses.findOne({ _id: key, status: "active" });
    if (!lic) return res.status(400).json({ ok: false, reason: "invalid_or_revoked" });

    const already = lic.activations.find(a => a.deviceId === deviceId);
    if (!already && lic.activations.length >= lic.maxActivations) {
        return res.status(403).json({ ok: false, reason: "activation_limit" });
    }

    if (!already) {
        await Licenses.updateOne(
            { _id: key },
            { $push: { activations: { deviceId, activatedAt: new Date() } } }
        );
    }

    const token = signToken({ k: key, d: deviceId }, "30d");
    return res.json({ ok: true, token });
});

router.get("/validate", authJwt, async (req: any, res) => {
    const { k: key, d: deviceId } = req.token as { k: string; d: string };
    const lic = await Licenses.findOne({ _id: key });
    const valid =
        !!lic &&
        lic.status === "active" &&
        lic.activations.some(a => a.deviceId === deviceId);

    return res.json({ ok: valid, productId: lic?.productId ?? null, status: lic?.status ?? null });
});

export default router;
