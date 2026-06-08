import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getSession();
    if (!session || session.role !== "manager") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const users = await prisma.user.findMany({
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return NextResponse.json(users);
}
