"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        setLoading(false);
        if (!res.ok) {
            setError(data.error || "Invalid credentials");
        } else {
            router.push(data.role === "manager" ? "/dashboard" : "/sales");
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "radial-gradient(ellipse at 60% 0%, rgba(245,158,11,0.12) 0%, #0a0e1a 60%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
        }}>
            {/* Background grid */}
            <div style={{
                position: "fixed", inset: 0, zIndex: 0,
                backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
                pointerEvents: "none",
            }} />

            <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "420px" }} className="fade-in">
                {/* Brand */}
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <div style={{
                        width: "72px", height: "72px",
                        background: "linear-gradient(135deg, #f59e0b, #d97706)",
                        borderRadius: "20px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "36px",
                        margin: "0 auto 20px",
                        boxShadow: "0 8px 32px rgba(245,158,11,0.4)",
                    }}>🍺</div>
                    <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.5px" }}>
                        Saraboff Bar
                    </h1>
                    <p style={{ color: "#64748b", marginTop: "6px", fontSize: "13px" }}>Staff Management Portal</p>
                </div>

                {/* Card */}
                <div className="glass" style={{ borderRadius: "24px", padding: "32px", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ marginBottom: "24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <div className="pulse-dot" />
                            <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>System Online</span>
                        </div>
                        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#f1f5f9" }}>Sign in</h2>
                    </div>

                    {error && (
                        <div style={{
                            marginBottom: "20px", padding: "12px 16px",
                            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                            borderRadius: "10px", color: "#fca5a5", fontSize: "13px", fontWeight: 500,
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Email Address
                            </label>
                            <input
                                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                placeholder="staff@saraboff.com"
                                className="sb-input"
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Password
                            </label>
                            <input
                                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                                placeholder="Enter your password"
                                className="sb-input"
                            />
                        </div>
                        <button type="submit" disabled={loading} className="sb-btn" style={{ width: "100%", marginTop: "8px", fontSize: "15px" }}>
                            {loading ? "Authenticating..." : "Sign In →"}
                        </button>
                    </form>

                    <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
                        <span style={{ color: "#475569", fontSize: "13px" }}>No account? </span>
                        <Link href="/signup" style={{ color: "#f59e0b", fontWeight: 600, fontSize: "13px", textDecoration: "none" }}>
                            Create one →
                        </Link>
                    </div>
                </div>

                <p style={{ textAlign: "center", color: "#334155", fontSize: "12px", marginTop: "24px" }}>
                    Saraboff Bar System · Secure Staff Access
                </p>
            </div>
        </div>
    );
}
