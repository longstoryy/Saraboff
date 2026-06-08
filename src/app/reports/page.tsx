"use client";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type Sale = { id: string; totalAmount: number; totalProfit: number; createdAt: string; attendant: { name: string }; items: { productName: string; quantity: number; lineTotal: number }[]; };
type AuditEntry = { productName: string; productEmoji: string; systemCount: number; physicalCount: number; variance: number; };
type Audit = { id: string; discrepancies: number; createdAt: string; attendant: { name: string }; entries: AuditEntry[]; };

export default function ReportsPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [audits, setAudits] = useState<Audit[]>([]);
    const [from, setFrom] = useState(new Date().toISOString().split("T")[0]);
    const [to, setTo] = useState(new Date().toISOString().split("T")[0]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [tab, setTab] = useState<"sales" | "audits">("sales");
    const [role, setRole] = useState("attendant");

    useEffect(() => { fetch("/api/session").then(r => r.json()).then(u => setRole(u?.role || "attendant")); }, []);

    const [page, setPage] = useState(1);
    const perPage = 10;

    const load = async () => {
        setLoading(true);
        const [sr, ar] = await Promise.all([
            fetch(`/api/sales?from=${from}&to=${to}`).then(r => r.json()),
            fetch("/api/audits").then(r => r.json()),
        ]);
        setSales(Array.isArray(sr) ? sr : []);
        setAudits(Array.isArray(ar) ? ar : []);
        setPage(1); // reset page on load
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const rev = sales.reduce((s, x) => s + x.totalAmount, 0);
    const pft = sales.reduce((s, x) => s + x.totalProfit, 0);
    const fmt = (n: number) => "GH₵ " + n.toLocaleString("en-GH", { minimumFractionDigits: 2 });
    const fmtDate = (d: string) => new Date(d).toLocaleString("en-GH", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

    // Chart Data (Group by date)
    const chartDataMap = sales.reduce((acc, sale) => {
        const date = sale.createdAt.split("T")[0];
        if (!acc[date]) acc[date] = { date, revenue: 0, profit: 0 };
        acc[date].revenue += sale.totalAmount;
        acc[date].profit += sale.totalProfit;
        return acc;
    }, {} as Record<string, { date: string, revenue: number, profit: number }>);
    const chartData = Object.values(chartDataMap).sort((a, b) => a.date.localeCompare(b.date));

    // Pagination
    const list = tab === "sales" ? sales : audits;
    const totalPages = Math.ceil(list.length / perPage);
    const displayed = list.slice((page - 1) * perPage, page * perPage);

    const exportCSV = () => {
        let scsv = "";
        if (tab === "sales") {
            scsv = "Date,Attendant,TotalAmount,TotalProfit,Items\n" + sales.map(s =>
                `"${s.createdAt}","${s.attendant.name}",${s.totalAmount},${s.totalProfit},"${s.items.map(i => `${i.productName}x${i.quantity}`).join('; ')}"`
            ).join("\n");
        } else {
            scsv = "Date,Attendant,Discrepancies,Details\n" + audits.map(a =>
                `"${a.createdAt}","${a.attendant.name}",${a.discrepancies},"${a.entries.filter(e => e.variance !== 0).map(e => `${e.productName}(${e.variance})`).join('; ')}"`
            ).join("\n");
        }
        const blob = new Blob([scsv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `${tab}-report-${from}-to-${to}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <AppLayout>
            <div style={{ padding: "28px", maxWidth: "1000px" }}>
                {/* Header */}
                <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>Reports & Analytics</h1>
                        <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>Sales analytics and audit history</p>
                    </div>
                    <button onClick={exportCSV} className="sb-btn-ghost">
                        📥 Export {tab === "sales" ? "Sales" : "Audits"}
                    </button>
                </div>

                {/* Filters */}
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-end" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>From</label>
                        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="sb-input" style={{ width: "160px" }} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>To</label>
                        <input type="date" value={to} onChange={e => setTo(e.target.value)} className="sb-input" style={{ width: "160px" }} />
                    </div>
                    <button onClick={load} className="sb-btn" style={{ padding: "12px 24px" }}>Apply Filter</button>
                </div>

                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "24px" }}>
                    {[
                        { label: "Revenue", value: fmt(rev), color: "var(--blue)", show: true },
                        { label: "Profit", value: fmt(pft), color: "var(--green)", show: role === "manager" },
                        { label: "Transactions", value: sales.length.toString(), color: "var(--gold)", show: true },
                        { label: "Margin", value: rev > 0 ? ((pft / rev) * 100).toFixed(1) + "%" : "—", color: "var(--purple)", show: role === "manager" },
                    ].filter(s => s.show).map(s => (
                        <div key={s.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "18px 20px" }}>
                            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>{s.label}</div>
                            <div style={{ fontSize: "22px", fontWeight: 800, color: s.color, letterSpacing: "-0.5px" }}>{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Chart Section */}
                {tab === "sales" && chartData.length > 0 && (
                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", marginBottom: "24px", height: "300px" }}>
                        <h2 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>{role === "manager" ? "Daily Revenue vs Profit" : "Daily Revenue"}</h2>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `GH₵${val}`} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                                <Bar dataKey="revenue" fill="var(--blue)" radius={[4, 4, 0, 0]} name="Revenue" />
                                {role === "manager" && <Bar dataKey="profit" fill="var(--green)" radius={[4, 4, 0, 0]} name="Profit" />}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Tabs */}
                <div style={{ display: "flex", gap: "4px", marginBottom: "16px", background: "var(--bg-card)", padding: "4px", borderRadius: "12px", border: "1px solid var(--border)", width: "fit-content" }}>
                    {(["sales", "audits"] as const).map(t => (
                        <button key={t} onClick={() => { setTab(t); setPage(1); setExpanded(null); }} style={{
                            padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                            background: tab === t ? "var(--gold-dim)" : "transparent",
                            color: tab === t ? "var(--gold)" : "var(--text-muted)",
                            border: tab === t ? "1px solid var(--border-glow)" : "1px solid transparent",
                            cursor: "pointer", transition: "all 0.2s",
                            textTransform: "capitalize",
                        }}>{t}</button>
                    ))}
                </div>

                {/* Table Details */}
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden" }}>
                    {loading ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: "60px", gap: "12px" }}>
                            <div style={{ width: "28px", height: "28px", border: "3px solid var(--gold-dim)", borderTopColor: "var(--gold)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                        </div>
                    ) : displayed.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)", fontSize: "14px" }}>No data in this date range</div>
                    ) : (
                        <>
                            {tab === "sales" && (displayed as Sale[]).map(sale => (
                                <div key={sale.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <button onClick={() => setExpanded(expanded === sale.id ? null : sale.id)} style={{
                                        width: "100%", display: "flex", alignItems: "center", gap: "16px",
                                        padding: "16px 20px", background: "none", border: "none", cursor: "pointer",
                                        textAlign: "left",
                                        transition: "background 0.2s",
                                    }} onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-surface)")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{sale.attendant.name}</div>
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                                                {fmtDate(sale.createdAt)} · {sale.items.length} item{sale.items.length !== 1 ? "s" : ""}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--gold)" }}>{fmt(sale.totalAmount)}</div>
                                            {role === "manager" && <div style={{ fontSize: "12px", color: "var(--green)", marginTop: "2px" }}>+{fmt(sale.totalProfit)}</div>}
                                        </div>
                                        <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>{expanded === sale.id ? "▲" : "▼"}</span>
                                    </button>
                                    {expanded === sale.id && (
                                        <div style={{ padding: "0 20px 16px", borderTop: "1px solid var(--border)", background: "rgba(0,0,0,0.02)" }}>
                                            {sale.items.map((item, i) => (
                                                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < sale.items.length - 1 ? "1px dashed var(--border)" : "none" }}>
                                                    <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>{item.productName} <span style={{ color: "var(--text-muted)" }}>× {item.quantity}</span></span>
                                                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{fmt(item.lineTotal)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {tab === "audits" && (displayed as Audit[]).map(audit => (
                                <div key={audit.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <button onClick={() => setExpanded(expanded === audit.id ? null : audit.id)} style={{
                                        width: "100%", display: "flex", alignItems: "center", gap: "16px",
                                        padding: "16px 20px", background: "none", border: "none", cursor: "pointer",
                                        textAlign: "left",
                                        transition: "background 0.2s",
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{audit.attendant.name}</div>
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{fmtDate(audit.createdAt)}</div>
                                        </div>
                                        <span style={{
                                            padding: "4px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: 700,
                                            background: audit.discrepancies > 0 ? "var(--red-glow)" : "var(--green-glow)",
                                            border: `1px solid ${audit.discrepancies > 0 ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
                                            color: audit.discrepancies > 0 ? "var(--red)" : "var(--green)",
                                        }}>
                                            {audit.discrepancies > 0 ? `⚠️ ${audit.discrepancies} issue${audit.discrepancies > 1 ? "s" : ""}` : "✅ Clean"}
                                        </span>
                                        <span style={{ color: "var(--text-muted)", fontSize: "12px", marginLeft: "10px" }}>{expanded === audit.id ? "▲" : "▼"}</span>
                                    </button>

                                    {expanded === audit.id && audit.discrepancies > 0 && (
                                        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", background: "rgba(0,0,0,0.02)" }}>
                                            <h4 style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "12px" }}>Discrepant Items</h4>
                                            {audit.entries.filter((e) => e.variance !== 0).map((e, idx) => (
                                                <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--border)" }}>
                                                    <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>{e.productEmoji} {e.productName}</span>
                                                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--red)" }}>
                                                        {e.variance > 0 ? `+${e.variance}` : e.variance} (Counted: {e.physicalCount})
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "var(--bg-surface)" }}>
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage(p => p - 1)}
                                        className="sb-btn-ghost" style={{ padding: "6px 12px", fontSize: "12px" }}
                                    >
                                        ← Previous
                                    </button>
                                    <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        disabled={page === totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                        className="sb-btn-ghost" style={{ padding: "6px 12px", fontSize: "12px" }}
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
