'use client';
import React, { useState } from 'react';

export default function BuyButton({ productId, disabled }: { productId: string; disabled?: boolean }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleCheckout() {
        setError(null);
        setLoading(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data?.error ?? 'Erreur lors de la création du paiement');
                console.error('checkout proxy error', data);
                return;
            }

            if (data.url) {
                window.location.href = data.url;
                return;
            }

            setError('Réponse checkout inattendue');
            console.error('Unexpected checkout response', data);
        } catch (err: any) {
            console.error('checkout network error', err);
            setError(err?.message ?? String(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button onClick={handleCheckout} disabled={loading || disabled}>
                {loading ? '...' : 'Acheter'}
            </button>
            {error ? <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div> : null}
        </>
    );
}
