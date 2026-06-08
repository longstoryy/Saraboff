import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session || session.role !== "manager") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    if (id === session.id) {
        return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
    }
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session || session.role !== "manager") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const { role } = await req.json();
    if (!["manager", "attendant"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    const updated = await prisma.user.update({ where: { id }, data: { role } });
    return NextResponse.json(updated);
}
