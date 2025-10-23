import React, { useEffect, useState } from "react";
import { listProducts, createCheckoutSession } from "../api";

export default function Catalog() {
    const [items, setItems] = useState<Array<{ _id: string; name: string }>>([]);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        listProducts()
            .then(d => setItems(d.items))
            .catch(() => setError("Impossible de charger les produits"));
    }, []);

    const onBuy = async (productId: string) => {
        setError(null);
        setLoadingId(productId);
        try {
            const { url } = await createCheckoutSession(productId);
            window.location.href = url; // Stripe Checkout
        } catch {
            setError("Erreur lors de la création du paiement");
        } finally {
            setLoadingId(null);
        }
    };

    if (error) return <p style={{color:"crimson"}}>{error}</p>;
    if (!items.length) return <p>Chargement des produits…</p>;

    return (
        <div>
            <h2>Produits</h2>
            <ul style={{listStyle:"none", padding:0}}>
                {items.map(p => (
                    <li key={p._id} style={{margin:"12px 0", padding:"12px", border:"1px solid #ddd", borderRadius:8}}>
                        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                            <strong>{p.name}</strong>
                            <button
                                onClick={() => onBuy(p._id)}
                                disabled={loadingId === p._id}
                            >
                                {loadingId === p._id ? "..." : "Acheter"}
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            <p style={{marginTop:16, color:"#666"}}>
                Apple Pay / Google Pay s’affichent automatiquement sur la page de paiement Stripe si l’appareil est éligible.
            </p>
        </div>
    );
}
