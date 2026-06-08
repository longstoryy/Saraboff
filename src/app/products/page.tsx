"use client";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";

type Product = { id: string; name: string; emoji: string; category: string; sellingPrice: number; costPrice: number; currentStock: number; };
const EMOJIS = ["🍺", "🍻", "🍷", "🥂", "🥃", "🍸", "🍹", "🍾", "🥤", "💧", "🍶", "🌵", "🫙", "🧃", "📦", "🍔", "🥜", "🌭"];
const CATS = ["Beer", "Wine", "Spirits", "Cocktails", "Non-Alcoholic", "Snacks", "Other"];
const EMPTY = { name: "", emoji: "🍺", category: "Beer", sellingPrice: "", costPrice: "", currentStock: "" };

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [form, setForm] = useState<any>(EMPTY);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [role, setRole] = useState("attendant");

    useEffect(() => { fetch("/api/session").then(r => r.json()).then(u => setRole(u?.role || "attendant")); }, []);

    // Pagination
    const [page, setPage] = useState(1);
    const perPage = 10;

    // reset page on search
    useEffect(() => { setPage(1); }, [search]);

    const load = () => fetch("/api/products").then(r => r.json()).then(setProducts);
    useEffect(() => { load(); }, []);

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => { setEditing(null); setForm(EMPTY); setError(""); setShowModal(true); };
    const openEdit = (p: Product) => { setEditing(p); setForm({ ...p }); setError(""); setShowModal(true); };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true); setError("");
        const data = { ...form, sellingPrice: +form.sellingPrice, costPrice: +form.costPrice, currentStock: +form.currentStock };
        const res = editing
            ? await fetch(`/api/products/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
            : await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        setSaving(false);
        if (!res.ok) { setError("Save failed. Check you are logged in as manager."); return; }
        setShowModal(false); load();
    };

    const remove = async (id: string) => {
        if (!confirm("Delete this product?")) return;
        await fetch(`/api/products/${id}`, { method: "DELETE" });
        load();
    };

    const fmt = (n: number) => "GH₵ " + n.toLocaleString("en-GH", { minimumFractionDigits: 2 });
    const profitMargin = (p: Product) => p.sellingPrice > 0 ? (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(0) + "%" : "—";

    return (
        <AppLayout>
            <div style={{ padding: "28px", maxWidth: "900px" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>Products</h1>
                        <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>{products.length} items in catalog</p>
                    </div>
                    {role === "manager" && <button onClick={openAdd} className="sb-btn">+ Add Product</button>}
                </div>

                {/* Search */}
                <div style={{ position: "relative", marginBottom: "20px" }}>
                    <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>🔍</span>
                    <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="sb-input" style={{ paddingLeft: "42px" }} />
                </div>

                {/* Product list */}
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden" }}>
                    <table className="sb-table" style={{ width: "100%" }}>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Sell Price</th>
                                {role === "manager" && <th>Margin</th>}
                                <th>Stock</th>
                                {role === "manager" && <th style={{ textAlign: "right" }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.slice((page - 1) * perPage, page * perPage).map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <span style={{ fontSize: "24px" }}>{p.emoji}</span>
                                            <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "14px" }}>{p.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ background: "rgba(100,116,139,0.1)", padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>{p.category}</span>
                                    </td>
                                    <td style={{ fontWeight: 700, color: "var(--gold)", fontSize: "14px" }}>{fmt(p.sellingPrice)}</td>
                                    {role === "manager" && <td style={{ color: "var(--green)", fontWeight: 600, fontSize: "13px" }}>{profitMargin(p)}</td>}
                                    <td>
                                        <span style={{ fontWeight: 700, color: p.currentStock <= 5 ? (p.currentStock === 0 ? "var(--red)" : "var(--gold)") : "var(--text-secondary)", fontSize: "14px" }}>
                                            {p.currentStock === 0 ? "OUT" : p.currentStock}
                                        </span>
                                    </td>
                                    {role === "manager" && (
                                        <td style={{ textAlign: "right" }}>
                                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                <button onClick={() => openEdit(p)} className="sb-btn-ghost" style={{ padding: "6px 14px", fontSize: "12px" }}>Edit</button>
                                                <button onClick={() => remove(p.id)} style={{ padding: "6px 14px", fontSize: "12px", background: "var(--red-glow)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "var(--red)", cursor: "pointer", fontWeight: 600 }}>Delete</button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan={6} style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)" }}>
                                    No products yet. Click "Add Product" to get started.
                                </td></tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {Math.ceil(filtered.length / perPage) > 1 && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderTop: "1px solid var(--border)", background: "var(--bg-surface)" }}>
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="sb-btn-ghost" style={{ padding: "6px 12px", fontSize: "12px" }}
                            >
                                ← Previous
                            </button>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
                                Page {page} of {Math.ceil(filtered.length / perPage)}
                            </span>
                            <button
                                disabled={page === Math.ceil(filtered.length / perPage)}
                                onClick={() => setPage(p => p + 1)}
                                className="sb-btn-ghost" style={{ padding: "6px 12px", fontSize: "12px" }}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "16px", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "28px", width: "100%", maxWidth: "460px" }} className="fade-in">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>{editing ? "Edit" : "Add"} Product</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "24px", cursor: "pointer", lineHeight: 1 }}>×</button>
                        </div>
                        {error && <div style={{ marginBottom: "16px", padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", color: "#fca5a5", fontSize: "13px" }}>{error}</div>}
                        <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Name</label>
                                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="sb-input" placeholder="e.g. Star Beer" />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Sell Price</label>
                                    <input type="number" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: e.target.value })} required min={0} step={0.5} className="sb-input" />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Cost</label>
                                    <input type="number" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} required min={0} step={0.5} className="sb-input" />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Stock</label>
                                    <input type="number" value={form.currentStock} onChange={e => setForm({ ...form, currentStock: e.target.value })} required min={0} className="sb-input" />
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Category</label>
                                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="sb-input" style={{ cursor: "pointer" }}>
                                        {CATS.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Emoji</label>
                                    <select value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} className="sb-input" style={{ cursor: "pointer" }}>
                                        {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "12px", paddingTop: "4px" }}>
                                <button type="button" onClick={() => setShowModal(false)} className="sb-btn-ghost" style={{ flex: 1, padding: "13px" }}>Cancel</button>
                                <button type="submit" disabled={saving} className="sb-btn" style={{ flex: 1 }}>{saving ? "Saving..." : "Save Product"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
