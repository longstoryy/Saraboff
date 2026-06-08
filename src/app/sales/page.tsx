"use client";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";

type Product = { id: string; name: string; emoji: string; category: string; sellingPrice: number; costPrice: number; currentStock: number; };
type CartItem = { product: Product; quantity: number };

export default function SalesPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showMobileCart, setShowMobileCart] = useState(false);

    useEffect(() => {
        fetch("/api/products").then(r => r.json()).then(setProducts);
    }, []);

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );

    const addToCart = (product: Product) => {
        if (product.currentStock === 0) return;
        setCart(prev => {
            const existing = prev.find(c => c.product.id === product.id);
            if (existing) {
                if (existing.quantity >= product.currentStock) return prev;
                return prev.map(c => c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c);
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const updateQty = (id: string, qty: number) => {
        if (qty <= 0) {
            setCart(prev => prev.filter(c => c.product.id !== id));
            return;
        }
        setCart(prev => prev.map(c => {
            if (c.product.id === id) {
                if (qty > c.product.currentStock) return { ...c, quantity: c.product.currentStock };
                return { ...c, quantity: qty };
            }
            return c;
        }));
    };

    const total = cart.reduce((s, c) => s + c.product.sellingPrice * c.quantity, 0);
    const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

    const submitSale = async () => {
        if (cart.length === 0) return;
        setSubmitting(true);
        const res = await fetch("/api/sales", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: cart.map(c => ({ productId: c.product.id, quantity: c.quantity })) }),
        });
        setSubmitting(false);
        if (res.ok) {
            setCart([]);
            setShowMobileCart(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            fetch("/api/products").then(r => r.json()).then(setProducts);
        }
    };

    const fmt = (n: number) => "GH₵ " + n.toLocaleString("en-GH", { minimumFractionDigits: 2 });

    const renderCartContents = () => (
        <>
            <div style={{ padding: "20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Order</h2>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{cartCount} item{cartCount !== 1 ? "s" : ""}</p>
                </div>
                {cart.length > 0 && (
                    <button onClick={() => setCart([])} style={{ fontSize: "12px", color: "#ef4444", background: "rgba(239,68,68,0.1)", padding: "4px 10px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", fontWeight: 700 }}>
                        Clear
                    </button>
                )}
            </div>

            <div style={{ padding: "12px", minHeight: "120px", flex: 1, overflowY: "auto" }}>
                {cart.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: "14px" }}>
                        <div style={{ fontSize: "36px", marginBottom: "12px" }}>🛒</div>
                        Tap a drink to add it to your cart.
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {cart.map(c => (
                            <div key={c.product.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "rgba(0,0,0,0.03)", border: "1px solid var(--border)", borderRadius: "12px" }}>
                                <span style={{ fontSize: "24px" }}>{c.product.emoji}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.product.name}</div>
                                    <div style={{ fontSize: "12px", color: "var(--gold)", fontWeight: 600 }}>{fmt(c.product.sellingPrice)}</div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", padding: "2px" }}>
                                    <button onClick={() => updateQty(c.product.id, c.quantity - 1)} style={{ width: "28px", height: "28px", borderRadius: "6px", background: "transparent", border: "none", color: "var(--text-secondary)", fontWeight: 700, cursor: "pointer", fontSize: "16px" }}>−</button>
                                    <span style={{ width: "24px", textAlign: "center", fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>{c.quantity}</span>
                                    <button onClick={() => updateQty(c.product.id, c.quantity + 1)} style={{ width: "28px", height: "28px", borderRadius: "6px", background: "transparent", border: "none", color: "var(--text-secondary)", fontWeight: 700, cursor: "pointer", fontSize: "16px" }}>+</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ padding: "20px", borderTop: "1px solid var(--border)", background: "var(--bg-card)", borderBottomLeftRadius: "20px", borderBottomRightRadius: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
                    <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 600 }}>Total</span>
                    <span style={{ fontSize: "26px", fontWeight: 800, color: "var(--gold)", letterSpacing: "-0.5px" }}>{fmt(total)}</span>
                </div>
                <button
                    onClick={submitSale}
                    disabled={cart.length === 0 || submitting}
                    className="sb-btn"
                    style={{ width: "100%", fontSize: "16px", padding: "16px" }}
                >
                    {submitting ? "Processing..." : "💳 Complete Sale"}
                </button>
            </div>
        </>
    );

    return (
        <AppLayout>
            <div style={{ padding: "20px", display: "flex", gap: "24px", maxWidth: "1200px", margin: "0 auto", paddingBottom: "100px" }}>
                {/* Left — Products */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ marginBottom: "20px" }}>
                        <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
                            Store
                        </h1>
                        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>Select items to build the order</p>
                    </div>

                    {success && (
                        <div style={{ marginBottom: "16px", padding: "14px 18px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "12px", color: "#34d399", fontWeight: 600, fontSize: "14px" }}>
                            ✅ Sale completed and logged!
                        </div>
                    )}

                    {/* Search */}
                    <div style={{ position: "relative", marginBottom: "20px" }}>
                        <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "18px" }}>🔍</span>
                        <input
                            type="search" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Find drinks or categories..."
                            className="sb-input"
                            style={{ paddingLeft: "48px", paddingRight: "16px", height: "52px", fontSize: "16px", borderRadius: "16px" }}
                        />
                    </div>

                    {/* Product grid */}
                    {filtered.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-muted)", fontSize: "15px" }}>
                            No products found matching "{search}".
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "12px" }}>
                            {filtered.map(p => {
                                const inCart = cart.find(c => c.product.id === p.id);
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => addToCart(p)}
                                        disabled={p.currentStock === 0}
                                        className={`product-card ${inCart ? "in-cart" : ""} ${p.currentStock === 0 ? "out-stock" : ""}`}
                                        style={{ border: "none", textAlign: "left", fontFamily: "inherit", width: "100%" }}
                                    >
                                        {inCart && (
                                            <div style={{
                                                position: "absolute", top: "10px", right: "10px",
                                                background: "var(--gold)", color: "#000",
                                                width: "24px", height: "24px", borderRadius: "50%",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: "12px", fontWeight: 800, boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
                                            }}>{inCart.quantity}</div>
                                        )}
                                        <div style={{ fontSize: "42px", marginBottom: "12px" }}>{p.emoji}</div>
                                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px", lineHeight: 1.3 }}>{p.name}</div>
                                        <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--gold)" }}>{fmt(p.sellingPrice)}</div>
                                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px", fontWeight: 600 }}>
                                            {p.currentStock > 0 ? `${p.currentStock} in stock` : "Out of stock"}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Desktop Cart */}
                <div style={{ width: "340px", flexShrink: 0 }} className="lg-cart-show">
                    <style>{`@media(max-width:1023px){.lg-cart-show{display:none}}`}</style>
                    <div style={{ position: "sticky", top: "28px" }}>
                        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 60px)" }}>
                            {renderCartContents()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Mobile Floating Button */}
            <div className="lg-cart-show-mobile" style={{ position: "fixed", bottom: "80px", left: "50%", transform: "translateX(-50%)", zIndex: 40, width: "calc(100% - 32px)", maxWidth: "400px" }}>
                <style>{`@media(min-width:1024px){.lg-cart-show-mobile{display:none}}`}</style>
                <button
                    onClick={() => setShowMobileCart(true)}
                    className="sb-btn"
                    style={{ width: "100%", fontSize: "16px", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "100px", boxShadow: "0 10px 25px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05) inset" }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "20px" }}>🛍️</span>
                        <span style={{ fontWeight: 600 }}>{cartCount} item{cartCount !== 1 ? "s" : ""}</span>
                    </div>
                    <span style={{ fontWeight: 800 }}>View Cart • {fmt(total)}</span>
                </button>
            </div>

            {/* Mobile Cart Modal (Slide-up) */}
            {showMobileCart && (
                <div className="lg-cart-show-mobile" style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    {/* Backdrop */}
                    <div
                        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
                        onClick={() => setShowMobileCart(false)}
                    />

                    {/* Drawer */}
                    <div style={{
                        position: "relative", background: "var(--bg-base)", width: "100%",
                        borderTopLeftRadius: "28px", borderTopRightRadius: "28px", borderTop: "1px solid var(--border)",
                        maxHeight: "85vh", display: "flex", flexDirection: "column",
                        animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                    }}>
                        <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

                        {/* Drag Handle Area */}
                        <div style={{ width: "100%", padding: "12px 0 4px", display: "flex", justifyContent: "center" }} onClick={() => setShowMobileCart(false)}>
                            <div style={{ width: "40px", height: "5px", background: "var(--border)", borderRadius: "10px" }} />
                        </div>

                        {renderCartContents()}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
