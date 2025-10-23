import jwt from "jsonwebtoken";

const { JWT_SECRET = "change_me" } = process.env;

export function signToken(payload: object, exp: string | number = "30d") {
    return (jwt.sign as any)(payload, JWT_SECRET, { expiresIn: exp });
}

export function authJwt(req: any, res: any, next: any) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ ok: false });
    try {
        req.token = (jwt.verify as any)(token, JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ ok: false });
    }
}
