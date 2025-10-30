'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type LicenseResp = {
    licenseKey?: string;
    email?: string | null;
    product?: { name?: string | null } | null;
};

type State = {
    loading: boolean;
    err?: string;
    licenseKey?: string;
    email?: string | null;
    productName?: string | null;
};

export default function Success() {
    const params = useParams<{ session_id?: string }>();
    const sessionId = typeof params?.session_id === 'string' ? params.session_id : '';

    const [state, setState] = useState<State>({ loading: true });

    useEffect(() => {
        if (!sessionId) {
            setState({ loading: false, err: 'Paramètre manquant: session_id' });
            return;
        }

        const fetchLicense = async () => {
            try {
                const res = await fetch(`/api/license/${encodeURIComponent(sessionId)}`, {
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                });
                console.log(res.status)
                const ct = (res.headers.get('content-type') ?? '').toLowerCase();
                if (!ct.includes('application/json')) {
                    const text = await res.text();
                    console.error('[success] backend returned non-json:', { status: res.status, snippet: text.slice(0, 1000) });
                    setState({ loading: false, err: 'Réponse serveur inattendue (non JSON)' });
                    return;
                }

                let data: LicenseResp | undefined;
                try {
                    data = await res.json();
                } catch (e) {
                    console.error('[success] invalid JSON from backend');
                    setState({ loading: false, err: 'Réponse serveur invalide' });
                    return;
                }

                if (!res.ok) {
                    console.error('[success] backend error:', data);
                    setState({ loading: false, err: 'Impossible de retrouver la licence' });
                    return;
                }

                setState({
                    loading: false,
                    licenseKey: data?.licenseKey,
                    email: data?.email ?? null,
                    productName: data?.product?.name ?? null,
                });
            } catch (err: any) {
                console.error('[success] network error:', err);
                setState({ loading: false, err: 'Erreur réseau lors de la récupération de la licence' });
            }
        };

        fetchLicense();
    }, [sessionId]);

    if (state.loading) return <p>Chargement…</p>;
    if (state.err) return <p style={{ color: 'crimson' }}>{state.err}</p>;

    return (
        <div>
            <h2>Merci !</h2>
            {state.productName && (
                <p>
                    Produit : <strong>{state.productName}</strong>
                </p>
            )}
            <p>Votre clé de licence :</p>
            <code
                style={{
                    fontSize: 18,
                    padding: 8,
                    display: 'inline-block',
                    background: '#f4f4f4',
                    borderRadius: 6,
                }}
            >
                {state.licenseKey ?? '(aucune)'}
            </code>
            <div style={{ marginTop: 12 }}>
                <button
                    onClick={() => {
                        const text = state.licenseKey || '';
                        navigator.clipboard.writeText(text).catch((e) => console.error('clipboard error', e));
                    }}
                >
                    Copier la clé
                </button>
            </div>
            {state.email ? <p style={{ marginTop: 8 }}>Envoyée à : {state.email}</p> : null}
            <p style={{ marginTop: 12 }}>Dans l’extension, collez cette clé puis cliquez sur “Activer”.</p>
        </div>
    );
}