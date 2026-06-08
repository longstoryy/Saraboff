import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface AuditEntryInput {
    productId: string;
    productName: string;
    productEmoji: string;
    systemCount: number;
    physicalCount: number;
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { entries, updateStock } = await req.json();
    const attendantId = session.id;
    let discrepancies = 0;
    const entryData = entries.map((e: AuditEntryInput) => {
        const variance = e.physicalCount - e.systemCount;
        if (variance !== 0) discrepancies++;
        return { productName: e.productName, productEmoji: e.productEmoji, systemCount: e.systemCount, physicalCount: e.physicalCount, variance };
    });
    const audit = await prisma.audit.create({
        data: { attendantId, discrepancies, entries: { create: entryData } },
        include: { entries: true },
    });
    if (updateStock) {
        for (const e of (entries as AuditEntryInput[])) {
            await prisma.product.update({ where: { id: e.productId }, data: { currentStock: e.physicalCount } });
        }
    }
    return NextResponse.json(audit, { status: 201 });
}

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const where: any = {};
    if (session.role === "attendant") {
        where.attendantId = session.id;
    }
    const audits = await prisma.audit.findMany({
        where,
        include: { attendant: { select: { name: true } }, entries: true },
        orderBy: { createdAt: "desc" },
        take: 20,
    });
    return NextResponse.json(audits);
}
