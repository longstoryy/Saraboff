import { cookies } from "next/headers";

const SECRET = process.env.AUTH_SECRET || "saraboff-secret-key-change-in-production";
const COOKIE_NAME = "sb_session";

export type SessionUser = {
    id: string;
    name: string;
    email: string;
    role: string;
};

// --- Simple base64url helpers (no deps) ---
function b64url(buf: ArrayBuffer | Uint8Array) {
    return Buffer.from(new Uint8Array(buf)).toString("base64url");
}
function b64urlToBuffer(s: string) {
    return Buffer.from(s, "base64url");
}

async function getKey() {
    const enc = new TextEncoder();
    const raw = enc.encode(SECRET);
    return crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signToken(user: SessionUser): Promise<string> {
    const header = b64url(new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
    const payload = b64url(new TextEncoder().encode(JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 })));
    const key = await getKey();
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${header}.${payload}`));
    return `${header}.${payload}.${b64url(sig)}`;
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
    try {
        const [header, payload, sig] = token.split(".");
        if (!header || !payload || !sig) return null;
        const key = await getKey();
        const sigBuf = b64urlToBuffer(sig);
        const valid = await crypto.subtle.verify("HMAC", key, sigBuf, new TextEncoder().encode(`${header}.${payload}`));
        if (!valid) return null;
        const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
        if (data.exp < Math.floor(Date.now() / 1000)) return null;
        return { id: data.id, name: data.name, email: data.email, role: data.role };
    } catch {
        return null;
    }
}

export async function getSession(): Promise<SessionUser | null> {
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
}

export function getCookieName() {
    return COOKIE_NAME;
}
