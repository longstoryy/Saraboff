import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

interface SaleItemInput {
    productId: string;
    quantity: number;
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { items } = await req.json();
    const attendantId = session.id;

    let totalAmount = 0;
    let totalProfit = 0;
    const saleItemsData = [];

    // Pre-validate stock levels to avoid partial transactions
    for (const item of (items as SaleItemInput[])) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 400 });
        if (product.currentStock < item.quantity) {
            return NextResponse.json({ error: `Not enough stock for ${product.name}. Only ${product.currentStock} left.` }, { status: 400 });
        }
    }

    // Process sale
    for (const item of (items as SaleItemInput[])) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) continue;
        const lineTotal = product.sellingPrice * item.quantity;
        const lineProfit = (product.sellingPrice - product.costPrice) * item.quantity;
        totalAmount += lineTotal;
        totalProfit += lineProfit;
        saleItemsData.push({
            productId: product.id,
            productName: product.name,
            quantity: item.quantity,
            unitPrice: product.sellingPrice,
            unitCost: product.costPrice,
            lineTotal,
            lineProfit,
        });
        await prisma.product.update({
            where: { id: product.id },
            data: { currentStock: { decrement: item.quantity } },
        });
    }

    const sale = await prisma.sale.create({
        data: { attendantId, totalAmount, totalProfit, items: { create: saleItemsData } },
        include: { items: true },
    });

    return NextResponse.json(sale, { status: 201 });
}

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const where: Prisma.SaleWhereInput = {};
    if (session.role === "attendant") {
        where.attendantId = session.id;
    }
    if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = new Date(from);
        if (to) where.createdAt.lte = new Date(to + "T23:59:59.999Z");
    }
    const sales = await prisma.sale.findMany({
        where,
        include: { attendant: { select: { name: true } }, items: true },
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(sales);
}
