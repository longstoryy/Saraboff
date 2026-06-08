import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

type SaleWithItems = Prisma.SaleGetPayload<{ include: { items: true } }>;

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const salesFilters: Prisma.SaleWhereInput = { createdAt: { gte: today } };
    if (session.role === "attendant") {
        salesFilters.attendantId = session.id;
    }
    const [todaySales, totalProducts, lowStockProducts] = await Promise.all([
        prisma.sale.findMany({ where: salesFilters, include: { items: true } }),
        prisma.product.count(),
        prisma.product.findMany({ where: { currentStock: { lte: 5 } }, orderBy: { currentStock: "asc" } }),
    ]);
    const revenue = todaySales.reduce((s: number, sale: SaleWithItems) => s + sale.totalAmount, 0);
    const profit = todaySales.reduce((s: number, sale: SaleWithItems) => s + sale.totalProfit, 0);
    const itemsSold = todaySales.reduce((s: number, sale: SaleWithItems) => s + sale.items.reduce((si: number, item: { quantity: number }) => si + item.quantity, 0), 0);
    return NextResponse.json({
        revenue, profit, itemsSold, totalProducts, lowStock: lowStockProducts, transactionCount: todaySales.length,
    });
}
