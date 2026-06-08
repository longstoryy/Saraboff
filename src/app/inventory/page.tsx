"use client";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";

type Product = { id: string; name: string; emoji: string; currentStock: number; };
type Entry = { productId: string; productName: string; productEmoji: string; systemCount: number; physicalCount: number | string; };

export default function InventoryPage() {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [updateStock, setUpdateStock] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetch("/api/products").then(r => r.json()).then((prods: Product[]) => {
            setEntries(prods.map(p => ({ productId: p.id, productName: p.name, productEmoji: p.emoji, systemCount: p.currentStock, physicalCount: "" })));
        });
    }, []);

    const setPhysical = (id: string, val: string) => {
        setEntries(prev => prev.map(e => e.productId === id ? { ...e, physicalCount: val } : e));
    };

    const fillSystem = () => setEntries(prev => prev.map(e => ({ ...e, physicalCount: e.systemCount })));

    const submit = async () => {
        const filled = entries.filter(e => e.physicalCount !== "");
        if (filled.length === 0) return;
        setSubmitting(true);
        await fetch("/api/audits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                entries: filled.map(e => ({ ...e, physicalCount: +e.physicalCount })),
                updateStock,
            }),
        });
        setSubmitting(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    };

    const totalDiscrepancies = entries.filter(e => e.physicalCount !== "" && +e.physicalCount !== e.systemCount).length;

    return (
        <AppLayout>
            <div style={{ padding: "28px", maxWidth: "800px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>Stock Audit</h1>
                        <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>End-of-shift physical count</p>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        {totalDiscrepancies > 0 && (
                            <span style={{ padding: "5px 12px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "999px", fontSize: "12px", fontWeight: 700, color: "#fbbf24" }}>
                                ⚠️ {totalDiscrepancies} variance{totalDiscrepancies > 1 ? "s" : ""}
                            </span>
                        )}
                        <button onClick={fillSystem} className="sb-btn-ghost">Auto-fill System Counts</button>
                    </div>
                </div>

                {success && (
                    <div style={{ marginBottom: "20px", padding: "14px 18px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "12px", color: "#34d399", fontWeight: 600, fontSize: "14px" }}>
                        ✅ Audit submitted successfully!
                    </div>
                )}

                {/* Table */}
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", marginBottom: "16px" }}>
                    <div style={{ padding: "0 20px", borderBottom: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1fr 100px 100px 80px", gap: "12px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", padding: "14px 0" }}>Product</div>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", padding: "14px 0", textAlign: "center" }}>System</div>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.8px", padding: "14px 0", textAlign: "center" }}>Physical</div>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", padding: "14px 0", textAlign: "center" }}>Variance</div>
                    </div>

                    {entries.map((e, i) => {
                        const variance = e.physicalCount !== "" ? +e.physicalCount - e.systemCount : null;
                        return (
                            <div key={e.productId} style={{
                                padding: "14px 20px",
                                display: "grid",
                                gridTemplateColumns: "1fr 100px 100px 80px",
                                gap: "12px",
                                alignItems: "center",
                                borderBottom: i < entries.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                                background: variance !== null && variance !== 0 ? "rgba(239,68,68,0.04)" : "transparent",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span style={{ fontSize: "20px" }}>{e.productEmoji}</span>
                                    <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>{e.productName}</span>
                                </div>
                                <div style={{ textAlign: "center", fontSize: "15px", fontWeight: 700, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                                    {e.systemCount}
                                </div>
                                <div style={{ display: "flex", justifyContent: "center" }}>
                                    <input
                                        type="number" min={0}
                                        value={e.physicalCount}
                                        onChange={ev => setPhysical(e.productId, ev.target.value)}
                                        placeholder="—"
                                        className="sb-input"
                                        style={{
                                            width: "80px",
                                            textAlign: "center",
                                            padding: "8px 10px",
                                            fontSize: "15px",
                                            fontWeight: 700,
                                            borderColor: variance !== null && variance !== 0 ? "rgba(239,68,68,0.5)" : variance === 0 ? "rgba(16,185,129,0.5)" : undefined,
                                            color: variance !== null && variance !== 0 ? "#f87171" : variance === 0 ? "#34d399" : undefined,
                                        }}
                                    />
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    {variance !== null ? (
                                        <span style={{ fontSize: "13px", fontWeight: 700, color: variance === 0 ? "#10b981" : "#ef4444" }}>
                                            {variance === 0 ? "✓" : (variance > 0 ? `+${variance}` : variance)}
                                        </span>
                                    ) : <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>—</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Update toggle */}
                <div style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "12px", padding: "16px 20px", marginBottom: "16px", display: "flex", alignItems: "flex-start", gap: "14px" }}>
                    <input type="checkbox" id="update-stock" checked={updateStock} onChange={e => setUpdateStock(e.target.checked)} style={{ marginTop: "2px", width: "16px", height: "16px", accentColor: "var(--gold)", cursor: "pointer" }} />
                    <label htmlFor="update-stock" style={{ cursor: "pointer" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Update system stock to match physical count</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>Any variance will be logged as a discrepancy for manager review</div>
                    </label>
                </div>

                <button onClick={submit} disabled={submitting} className="sb-btn" style={{ width: "100%", fontSize: "15px", padding: "16px" }}>
                    {submitting ? "Submitting..." : "📋 Submit Audit Report"}
                </button>
            </div>
        </AppLayout>
    );
}
