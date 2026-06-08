"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type User = { id: string; name: string; email: string; role: string } | null;

const managerNav = [
    { href: "/dashboard", emoji: "⬛", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { href: "/sales", emoji: "⬛", label: "Sales", icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" },
    { href: "/products", emoji: "⬛", label: "Products", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
    { href: "/inventory", emoji: "⬛", label: "Stock", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { href: "/reports", emoji: "⬛", label: "Reports", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
];
const attendantNav = managerNav;

const mobileEmojis: Record<string, string> = {
    "/dashboard": "🏠", "/sales": "🛒", "/products": "🏷️", "/inventory": "📦", "/reports": "📈"
};

function SvgIcon({ path }: { path: string }) {
    return (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d={path} />
        </svg>
    );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User>(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        fetch("/api/session").then(r => r.json()).then(u => {
            setUser(u);
            if (!u) router.push("/login");
        });
    }, []);

    const signOut = async () => {
        await fetch("/api/logout", { method: "POST" });
        router.push("/login");
    };

    const nav = user?.role === "manager" ? managerNav : attendantNav;

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
            {/* Desktop Sidebar */}
            <aside style={{
                display: "none",
                position: "fixed", left: 0, top: 0, bottom: 0, width: "240px", zIndex: 50,
                background: "rgba(10,14,26,0.95)",
                borderRight: "1px solid var(--border)",
                flexDirection: "column",
            }} className="lg-sidebar">
                <style>{`@media(min-width:1024px){.lg-sidebar{display:flex!important}}`}</style>

                {/* Logo */}
                <div style={{ padding: "24px 20px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                            width: "40px", height: "40px",
                            background: "linear-gradient(135deg, #f59e0b, #d97706)",
                            borderRadius: "12px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "20px",
                            boxShadow: "0 4px 16px rgba(245,158,11,0.35)",
                            flexShrink: 0,
                        }}>🍺</div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: "15px", color: "var(--text-primary)", letterSpacing: "-0.3px" }}>Saraboff Bar</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "capitalize", marginTop: "1px" }}>
                                {user?.role || "Loading..."}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "2px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", padding: "4px 14px", marginBottom: "8px" }}>
                        Navigation
                    </div>
                    {nav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-item ${pathname === item.href ? "active" : ""}`}
                        >
                            <span className="nav-icon" style={{ opacity: 0.8 }}>
                                <SvgIcon path={item.icon} />
                            </span>
                            {item.label}
                            {pathname === item.href && (
                                <span style={{ marginLeft: "auto", width: "6px", height: "6px", borderRadius: "50%", background: "var(--gold)", boxShadow: "0 0 8px var(--gold)" }} />
                            )}
                        </Link>
                    ))}
                </nav>

                {/* User footer */}
                <div style={{ padding: "16px 12px", borderTop: "1px solid var(--border)" }}>
                    <div style={{
                        padding: "12px 14px",
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: "10px",
                        marginBottom: "8px",
                    }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {user?.name || "..."}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {user?.email}
                        </div>
                    </div>
                    <button onClick={signOut} style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        width: "100%", padding: "10px 14px",
                        background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
                        borderRadius: "10px", color: "#f87171",
                        fontSize: "13px", fontWeight: 600, cursor: "pointer",
                        transition: "background 0.2s",
                    }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.15)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav style={{
                position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
                background: "rgba(10,14,26,0.95)",
                borderTop: "1px solid var(--border)",
                display: "flex",
                backdropFilter: "blur(20px)",
            }} className="lg-hide-nav">
                <style>{`@media(min-width:1024px){.lg-hide-nav{display:none!important}}`}</style>
                {nav.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                flex: 1,
                                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                padding: "10px 4px 12px",
                                textDecoration: "none",
                                color: active ? "var(--gold)" : "var(--text-muted)",
                                fontSize: "10px", fontWeight: 600,
                                gap: "4px",
                                transition: "color 0.2s",
                                textTransform: "uppercase", letterSpacing: "0.3px",
                            }}
                        >
                            <span style={{ fontSize: "20px", transform: active ? "scale(1.15)" : "scale(1)", transition: "transform 0.2s" }}>
                                {mobileEmojis[item.href]}
                            </span>
                            {item.label}
                            {active && <span style={{ position: "absolute", bottom: 0, width: "32px", height: "2px", background: "var(--gold)", borderRadius: "2px 2px 0 0" }} />}
                        </Link>
                    );
                })}
            </nav>

            {/* Main content */}
            <div style={{ marginLeft: 0 }} className="lg-content-offset">
                <style>{`@media(min-width:1024px){.lg-content-offset{margin-left:240px!important}}`}</style>
                <div style={{ paddingBottom: "80px" }} className="lg-no-pb">
                    <style>{`@media(min-width:1024px){.lg-no-pb{padding-bottom:0!important}}`}</style>
                    <div style={{ padding: "16px 28px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
                        <Link href="/dashboard" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Saraboff Bar</Link>
                        <span>›</span>
                        <span style={{ color: "var(--text-primary)", fontWeight: 600, textTransform: "capitalize" }}>{pathname.replace("/", "") || "Home"}</span>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
