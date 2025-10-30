import React from 'react';
import BuyButton from "@/components/BuyButton";
import feather from 'feather-icons';
import { Download } from 'react-feather';

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

        console.log(product)

        return (
            <main className={"product-page fc g2"}>
                <div className="fr g2">
                    <div className="product-image">
                        <img src={`${process.env.NEXT_PUBLIC_API_URL}/images/${product._id}.png`} />
                    </div>

                    <div className={"fc g0-5"}>
                        <h1>{product.name}</h1>
                        <p>{product.metadata.shortDescription.fr}</p>
                        <p className={"c-t-sec"}>{product.metadata.version}</p>
                        <button style={{width:'fit-content'}}>
                            <Download size={16} />
                            Télécharger l'extension
                        </button>
                    </div>
                </div>

                <hr/>

                <div className={"fc g0-5"}>
                    <h2>Description</h2>
                    <p>{product.metadata.description.fr}</p>
                </div>

                {
                    product.prices && product.prices.length > 0 ? (
                        <div className={"fc g0-5"}>
                            <h2>Tarifs</h2>
                            <div className={"fr g0-5 fw-w"}>
                                {product.prices.map((price: any) => (
                                    <div key={price._id} className={"fr g2 box ai-c"}>
                                        <div>
                                            {price.metadata?.name && (
                                                <h3>{price.metadata.name}</h3>
                                            )}
                                            <p>{price.unitAmount} {price.currency.toUpperCase()}</p>
                                            {price.recurring ? ` (récurrent: ${price.recurring.interval})` : ''}
                                        </div>
                                        <BuyButton productId={product._id} priceId={price._id} />
                                    </div>
                                ))
                                }
                            </div>
                        </div>
                    ) :
                        <div>Aucun tarif disponible</div>
                }
            </main>
        );
    } catch (err: any) {
        console.error('[product] network error:', err);
        return <div style={{ color: 'crimson' }}>Impossible de charger le produit — {err?.message ?? String(err)}</div>;
    }
}
