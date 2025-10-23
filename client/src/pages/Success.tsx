import React, { useEffect, useState } from "react";
import { getLicenseBySession } from "../api";

export default function Success() {
    const [state, setState] = useState<
        { loading: boolean; err?: string; licenseKey?: string; email?: string | null; productName?: string | null }
    >({ loading: true });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id");
        if (!sessionId) {
            setState({ loading: false, err: "Paramètre manquant: session_id" });
            return;
        }
        getLicenseBySession(sessionId)
            .then(d => setState({
                loading: false,
                licenseKey: d.licenseKey,
                email: d.email ?? null,
                productName: d.product?.name ?? null
            }))
            .catch(() => setState({ loading: false, err: "Impossible de retrouver la licence" }));
    }, []);

    if (state.loading) return <p>Chargement…</p>;
    if (state.err) return <p style={{color:"crimson"}}>{state.err}</p>;

    return (
        <div>
            <h2>Merci !</h2>
            {state.productName && <p>Produit : <strong>{state.productName}</strong></p>}
            <p>Votre clé de licence :</p>
            <code style={{ fontSize: 18, padding: 8, display: "inline-block", background: "#f4f4f4", borderRadius: 6 }}>
                {state.licenseKey}
            </code>
            <div style={{ marginTop: 12 }}>
                <button onClick={() => navigator.clipboard.writeText(state.licenseKey || "")}>
                    Copier la clé
                </button>
            </div>
            {state.email ? <p style={{ marginTop: 8 }}>Envoyée à : {state.email}</p> : null}
            <p style={{ marginTop: 12 }}>
                Dans l’extension, collez cette clé puis cliquez sur “Activer”.
            </p>
        </div>
    );
}
