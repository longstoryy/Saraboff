"use client";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";

type Stats = {
    revenue: number; profit: number; itemsSold: number;
    totalProducts: number; transactionCount: number;
    lowStock: { id: string; name: string; emoji: string; currentStock: number }[];
};

function StatCard({ label, value, sub, colorClass, icon }: {
    label: string; value: string; sub?: string; colorClass: string; icon: string;
}) {
    return (
        <div className={`stat-card ${colorClass} fade-in`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{ fontSize: "28px" }}>{icon}</div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>{value}</div>
            {sub && <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{sub}</div>}
        </div>
    );
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState("");

    const load = async () => {
        setLoading(true);
        const res = await fetch("/api/dashboard");
        if (res.ok) setStats(await res.json());
        setLoading(false);
    };

    useEffect(() => {
        load();
        setNow(new Date().toLocaleDateString("en-GH", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
    }, []);

    const fmt = (n: number) => "GH₵ " + n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const margin = stats?.revenue ? ((stats.profit / stats.revenue) * 100).toFixed(1) + "%" : "—";

    return (
        <AppLayout>
            <div style={{ padding: "28px", maxWidth: "1100px" }}>
                {/* Header */}
                <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                            <div className="pulse-dot" />
                            <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Live</span>
                        </div>
                        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
                            Today's Overview
                        </h1>
                        <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>{now}</p>
                    </div>
                    <button onClick={load} className="sb-btn-ghost" style={{ alignSelf: "flex-start" }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px", gap: "12px" }}>
                        <div style={{ width: "32px", height: "32px", border: "3px solid rgba(245,158,11,0.2)", borderTopColor: "var(--gold)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                        <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading data...</span>
                    </div>
                ) : stats ? (
                    <>
                        {/* Stats row */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                            <StatCard label="Revenue" value={fmt(stats.revenue)} sub="Today's total sales" colorClass="gold" icon="💰" />
                            <StatCard label="Profit" value={fmt(stats.profit)} sub={`${margin} margin`} colorClass="green" icon="📈" />
                            <StatCard label="Items Sold" value={stats.itemsSold.toString()} sub={`${stats.transactionCount} transactions`} colorClass="blue" icon="🍺" />
                            <StatCard label="Products" value={stats.totalProducts.toString()} sub={`${stats.lowStock.length} low stock`} colorClass="purple" icon="📦" />
                        </div>

                        {/* Low Stock Alert */}
                        {stats.lowStock.length > 0 && (
                            <div style={{
                                background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)",
                                borderRadius: "16px", padding: "20px", marginBottom: "24px",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                                    <span style={{ fontSize: "16px" }}>⚠️</span>
                                    <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#fbbf24" }}>
                                        Low Stock Alert — {stats.lowStock.length} item{stats.lowStock.length > 1 ? "s" : ""} need attention
                                    </h2>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
                                    {stats.lowStock.map(p => (
                                        <div key={p.id} style={{
                                            background: "rgba(10,14,26,0.6)", borderRadius: "10px", padding: "12px 16px",
                                            display: "flex", justifyContent: "space-between", alignItems: "center",
                                            border: "1px solid rgba(245,158,11,0.1)",
                                        }}>
                                            <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                                                {p.emoji} {p.name}
                                            </span>
                                            <span style={{ fontSize: "12px", fontWeight: 700, color: p.currentStock === 0 ? "#ef4444" : "#f59e0b" }}>
                                                {p.currentStock === 0 ? "OUT" : `${p.currentStock}`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick actions */}
                        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
                            <h2 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>
                                Quick Actions
                            </h2>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                <a href="/sales" className="sb-btn">🛒 New Sale</a>
                                <a href="/products" className="sb-btn-ghost">🏷️ Products</a>
                                <a href="/inventory" className="sb-btn-ghost">📦 Audit Stock</a>
                                <a href="/reports" className="sb-btn-ghost">📈 Reports</a>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
                        Failed to load data. Please refresh or try again later.
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
