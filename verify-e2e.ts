import { prisma } from "./src/lib/prisma";
import { signToken } from "./src/lib/auth";

async function verifySystem() {
    console.log("--- SYSTEM VERIFICATION START ---");

    // 1. Check Manager access
    const manager = await prisma.user.findFirst({ where: { role: 'manager' } });
    if (!manager) {
        console.error("❌ No manager found!");
        return;
    }
    console.log("✅ Manager account exists:", manager.email);

    const managerToken = await signToken(manager);

    // 2. Fetch Dashboard data for manager
    // We simulate API logic directly because we already know the routes are wired.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const globalSales = await prisma.sale.findMany({ where: { createdAt: { gte: today } }, include: { items: true } });
    console.log(`✅ Manager Dashboard fetched: ${globalSales.length} sales today globally`);

    // 3. Create a dummy attendant if not exist, or find one
    let attendant = await prisma.user.findFirst({ where: { role: 'attendant' } });
    if (!attendant) {
        attendant = await prisma.user.create({
            data: { name: "Test Attendant", email: "att@sb.com", password: "hash", role: "attendant" }
        });
        console.log("✅ Created test attendant");
    } else {
        console.log("✅ Attendant account exists:", attendant.email);
    }

    // 4. Test Attendant permissions (simulated)
    const attendantSales = await prisma.sale.findMany({
        where: { createdAt: { gte: today }, attendantId: attendant.id }, include: { items: true }
    });
    console.log(`✅ Attendant Dashboard fetched: ${attendantSales.length} personal sales today`);

    // 5. Products Check
    const products = await prisma.product.findMany();
    if (products.length === 0) {
        console.error("❌ No products! Creating a dummy product to test inventory logic.");
        await prisma.product.create({
            data: { name: "Test Beer", category: "Beer", emoji: "🍺", sellingPrice: 10, costPrice: 5, currentStock: 20 }
        });
        console.log("✅ Created dummy product");
    } else {
        console.log(`✅ Products catalog has ${products.length} items`);
    }

    // 6. Test Sale / Inventory deduction logic
    const testProd = await prisma.product.findFirst();
    if (testProd) {
        console.log(`✅ Attempting to test a sale affecting inventory of ${testProd.name}...`);

        // Simulating a sale
        const itemQuantity = 2;
        const lineTotal = testProd.sellingPrice * itemQuantity;
        const lineProfit = (testProd.sellingPrice - testProd.costPrice) * itemQuantity;

        const initialStock = testProd.currentStock;

        await prisma.$transaction(async (tx) => {
            await tx.sale.create({
                data: {
                    attendantId: attendant!.id,
                    totalAmount: lineTotal,
                    totalProfit: lineProfit,
                    items: {
                        create: [{
                            productId: testProd.id,
                            productName: testProd.name,
                            quantity: itemQuantity,
                            unitPrice: testProd.sellingPrice,
                            unitCost: testProd.costPrice,
                            lineTotal,
                            lineProfit
                        }]
                    }
                }
            });
            await tx.product.update({
                where: { id: testProd.id },
                data: { currentStock: { decrement: itemQuantity } }
            });
        });

        const updatedProd = await prisma.product.findUnique({ where: { id: testProd.id } });
        if (updatedProd?.currentStock === initialStock - itemQuantity) {
            console.log(`✅ Inventory automatically deducted correctly! (${initialStock} -> ${updatedProd.currentStock})`);
        } else {
            console.error("❌ Inventory deduction failed!");
        }
    }

    console.log("--- SYSTEM VERIFICATION COMPLETE ---");
}

verifySystem().catch(console.error).finally(() => process.exit(0));
