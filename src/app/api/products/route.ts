import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    const products = await (await import("@/lib/prisma")).prisma.product.findMany({
        orderBy: { name: "asc" },
    });
    return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== "manager") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const data = await req.json();
    const product = await (await import("@/lib/prisma")).prisma.product.create({ data });
    return NextResponse.json(product, { status: 201 });
}
