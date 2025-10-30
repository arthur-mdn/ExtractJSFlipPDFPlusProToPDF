import React from 'react';
import BuyButton from "@/components/BuyButton";

type Product = {
    id: string;
    name: string;
    description?: string;
    price?: number;
};

interface Props {
    params: { id: string } | Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: Props) {
    const { id } = await params;

    const base = process.env.NEXT_API_URL;
    const url = `${base.replace(/\/$/, '')}/api/products/${id}`;
    console.log('[product] fetch url:', url);

    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
            console.error('[product] fetch failed:', res.status, res.statusText);
            return <div>Produit introuvable</div>;
        }
        const product: Product = await res.json();

        return (
            <main>
                <h1>{product.name}</h1>
                <p>{product.description}</p>
                <p>Prix: {product.price ?? '—'}</p>
                <BuyButton productId={product._id} />
            </main>
        );
    } catch (err: any) {
        console.error('[product] network error:', err);
        return <div style={{ color: 'crimson' }}>Impossible de charger le produit — {err?.message ?? String(err)}</div>;
    }
}
