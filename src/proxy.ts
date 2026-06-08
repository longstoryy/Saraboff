import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getCookieName } from "@/lib/auth";

export default async function proxy(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    // Public routes — always allowed
    if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
        return NextResponse.next();
    }

    // API routes handle their own auth
    if (pathname.startsWith("/api")) {
        return NextResponse.next();
    }

    // Verify auth cookie
    const token = req.cookies.get(getCookieName())?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
