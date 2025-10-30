import React from 'react';
import Link from 'next/link';

type Product = {
    _id: string;
    name: string;
    description?: string;
    price?: number;
};

export const dynamic = 'force-dynamic';

async function fetchProducts(): Promise<Product[]> {
    const base = process.env.NEXT_API_URL;
    if (!base) {
        throw new Error('NEXT_API_URL non défini');
    }

    const url = `${base.replace(/\/$/, '')}/api/products`;
    console.log('[catalog] fetch url:', url);

    try {
        const res = await fetch(url, { cache: 'no-store' });
        console.log('[catalog] response status:', res.status, res.statusText);

        const text = await res.text();
        try {
            const data = text ? JSON.parse(text) : null;
            if (!res.ok) {
                console.error('[catalog] api error body:', data ?? text);
                throw new Error(`API error ${res.status}: ${JSON.stringify(data ?? text)}`);
            }
            return data.items || [];
        } catch (parseErr) {
            throw new Error(`Invalid response from API: ${text}`);
        }
    } catch (err: any) {
        throw new Error(`Network Error ${url}: ${err?.message ?? String(err)}`);
    }
}


export default async function Catalog() {
    try {
        const products = await fetchProducts();
        if (!products.length) return <p>Aucun produit disponible.</p>;

        return (
            <main>
                <h2>Produits</h2>
                <div className={"fc g1"}>
                    {products.map((p) => (
                            <Link href={`/product/${p._id}`} className="fr g1 ai-c" style={{ textDecoration: 'none', color: 'inherit' }} key={p._id}>
                                <div className="product-image" style={{ width: '100px' }} >
                                    <img src={`${process.env.NEXT_PUBLIC_API_URL}/images/${p._id}.png`} />
                                </div>
                                <div>
                                    <strong>{p.name}</strong>
                                    {p?.metadata?.shortDescription.fr ? <div style={{ color: '#666' }}>{p.metadata.shortDescription.fr}</div> : null}
                                </div>
                            </Link>
                    ))}
                </div>
            </main>
        );
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('[catalog] error:', e);
        return <p style={{ color: 'crimson' }}>Impossible de charger les produits — {msg}</p>;
    }
}
