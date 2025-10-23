import React from "react";
import Catalog from "./pages/Catalog";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";

export default function App() {
    const pathname = window.location.pathname;

    return (
        <div style={{ maxWidth: 720, margin: "32px auto", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
            <h1>Ma Super Extension</h1>
            {pathname === "/success" ? (
                <Success />
            ) : pathname === "/cancel" ? (
                <Cancel />
            ) : (
                <Catalog />
            )}
        </div>
    );
}
