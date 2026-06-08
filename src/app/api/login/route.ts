import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, getCookieName } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();
        if (!email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

        const token = await signToken({ id: user.id, name: user.name, email: user.email, role: user.role });
        const res = NextResponse.json({ id: user.id, name: user.name, role: user.role });
        res.cookies.set(getCookieName(), token, {
            httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax",
        });
        return res;
    } catch (e) {
        console.error("Login error:", e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
