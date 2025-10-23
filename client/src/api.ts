const API = import.meta.env.VITE_API_URL as string;

export async function listProducts() {
    const r = await fetch(`${API}/api/products`);
    if (!r.ok) throw new Error("Erreur produits");
    return r.json() as Promise<{ items: Array<{ _id: string; name: string }> }>;
}

export async function createCheckoutSession(productId: string) {
    const r = await fetch(`${API}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId })
    });
    if (!r.ok) throw new Error("Erreur checkout");
    return r.json() as Promise<{ url: string }>;
}

export async function getLicenseBySession(sessionId: string) {
    const r = await fetch(`${API}/api/licenses/by-session/${sessionId}`);
    if (!r.ok) throw new Error("Licence introuvable");
    return r.json() as Promise<{ ok: boolean; licenseKey: string; email?: string | null; product?: { id: string; name: string } | null }>;
}
