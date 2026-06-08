"use client";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";

type User = { id: string; name: string; email: string; role: string; createdAt: string; };

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentId, setCurrentId] = useState("");

    const load = async () => {
        setLoading(true);
        const [usersRes, sessionRes] = await Promise.all([
            fetch("/api/users").then(r => r.json()),
            fetch("/api/session").then(r => r.json()),
        ]);
        setUsers(Array.isArray(usersRes) ? usersRes : []);
        setCurrentId(sessionRes?.id || "");
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const deleteUser = async (user: User) => {
        if (!confirm(`Are you sure you want to delete "${user.name}"? This cannot be undone.`)) return;
        const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
        if (res.ok) {
            setUsers(prev => prev.filter(u => u.id !== user.id));
        } else {
            const data = await res.json();
            alert(data.error || "Failed to delete user.");
        }
    };

    const toggleRole = async (user: User) => {
        const newRole = user.role === "manager" ? "attendant" : "manager";
        if (!confirm(`Change "${user.name}" to ${newRole}?`)) return;
        const res = await fetch(`/api/users/${user.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: newRole }),
        });
        if (res.ok) {
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
        }
    };

    const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-GH", { day: "2-digit", month: "short", year: "numeric" });

    const managers = users.filter(u => u.role === "manager");
    const attendants = users.filter(u => u.role === "attendant");

    return (
        <AppLayout>
            <div style={{ padding: "28px", maxWidth: "800px" }}>
                {/* Header */}
                <div style={{ marginBottom: "28px" }}>
                    <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>User Management</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>
                        {users.length} account{users.length !== 1 ? "s" : ""} — {managers.length} manager{managers.length !== 1 ? "s" : ""}, {attendants.length} attendant{attendants.length !== 1 ? "s" : ""}
                    </p>
                </div>

                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "60px", gap: "12px" }}>
                        <div style={{ width: "28px", height: "28px", border: "3px solid var(--border)", borderTopColor: "var(--blue)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        {[
                            { label: "Managers", list: managers, color: "var(--blue)" },
                            { label: "Attendants", list: attendants, color: "var(--gold)" },
                        ].map(group => (
                            <div key={group.label}>
                                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px", paddingLeft: "4px" }}>
                                    {group.label} ({group.list.length})
                                </div>
                                {group.list.length === 0 ? (
                                    <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px", background: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                                        No {group.label.toLowerCase()} yet.
                                    </div>
                                ) : (
                                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden" }}>
                                        {group.list.map((user, i) => (
                                            <div key={user.id} style={{
                                                display: "flex", alignItems: "center", gap: "16px",
                                                padding: "16px 20px",
                                                borderBottom: i < group.list.length - 1 ? "1px solid var(--border)" : "none",
                                            }}>
                                                {/* Avatar */}
                                                <div style={{
                                                    width: "42px", height: "42px", borderRadius: "12px",
                                                    background: user.id === currentId ? "var(--blue)" : "var(--bg-surface)",
                                                    border: "1px solid var(--border)",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: "18px", fontWeight: 800, color: user.id === currentId ? "#fff" : "var(--text-muted)",
                                                    flexShrink: 0,
                                                }}>
                                                    {user.name[0].toUpperCase()}
                                                </div>

                                                {/* Info */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                        <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{user.name}</span>
                                                        {user.id === currentId && (
                                                            <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px", background: "rgba(59,130,246,0.1)", color: "var(--blue)", border: "1px solid rgba(59,130,246,0.2)" }}>YOU</span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                        {user.email} · Joined {fmtDate(user.createdAt)}
                                                    </div>
                                                </div>

                                                {/* Role badge */}
                                                <span style={{
                                                    padding: "4px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: 700,
                                                    background: user.role === "manager" ? "rgba(59,130,246,0.1)" : "rgba(245,158,11,0.1)",
                                                    color: user.role === "manager" ? "var(--blue)" : "var(--gold)",
                                                    border: `1px solid ${user.role === "manager" ? "rgba(59,130,246,0.2)" : "rgba(245,158,11,0.2)"}`,
                                                    textTransform: "capitalize",
                                                    flexShrink: 0,
                                                }}>
                                                    {user.role}
                                                </span>

                                                {/* Actions — hidden for own account */}
                                                {user.id !== currentId && (
                                                    <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                                                        <button
                                                            onClick={() => toggleRole(user)}
                                                            className="sb-btn-ghost"
                                                            style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 700 }}
                                                            title={`Make ${user.role === "manager" ? "Attendant" : "Manager"}`}
                                                        >
                                                            {user.role === "manager" ? "↓ Demote" : "↑ Promote"}
                                                        </button>
                                                        <button
                                                            onClick={() => deleteUser(user)}
                                                            style={{
                                                                padding: "6px 12px", fontSize: "11px", fontWeight: 700,
                                                                background: "var(--red-glow)", border: "1px solid rgba(239,68,68,0.2)",
                                                                borderRadius: "8px", color: "var(--red)", cursor: "pointer",
                                                            }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
