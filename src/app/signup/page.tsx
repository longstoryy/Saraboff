"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "attendant" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const res = await fetch("/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        const data = await res.json();
        setLoading(false);
        if (!res.ok) {
            setError(data.error || "Something went wrong");
        } else {
            router.push("/login?created=1");
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
            <div style={{ position: "fixed", inset: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

            <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "420px" }} className="fade-in">
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <div style={{ width: "72px", height: "72px", background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", margin: "0 auto 20px", boxShadow: "0 8px 32px rgba(245,158,11,0.4)" }}>🍺</div>
                    <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.5px" }}>Create Account</h1>
                    <p style={{ color: "#64748b", marginTop: "6px", fontSize: "13px" }}>Register a new staff member</p>
                </div>

                <div className="glass" style={{ borderRadius: "24px", padding: "32px", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#f1f5f9", marginBottom: "24px" }}>Staff Registration</h2>

                    {error && (
                        <div style={{ marginBottom: "20px", padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "10px", color: "#fca5a5", fontSize: "13px", fontWeight: 500 }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Full Name</label>
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Cephas Mensah" className="sb-input" />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Role</label>
                            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="sb-input" style={{ cursor: "pointer" }}>
                                <option value="attendant">Bartender / Attendant</option>
                                <option value="manager">Manager / Admin</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Email Address</label>
                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="staff@saraboff.com" className="sb-input" />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Password</label>
                            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} placeholder="Min. 6 characters" className="sb-input" />
                        </div>
                        <button type="submit" disabled={loading} className="sb-btn" style={{ width: "100%", marginTop: "8px", fontSize: "15px" }}>
                            {loading ? "Creating account..." : "Register Staff Member →"}
                        </button>
                    </form>

                    <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
                        <span style={{ color: "#475569", fontSize: "13px" }}>Already registered? </span>
                        <Link href="/login" style={{ color: "#f59e0b", fontWeight: 600, fontSize: "13px", textDecoration: "none" }}>Sign in →</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
