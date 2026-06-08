import { prisma } from "./src/lib/prisma";

async function main() {
    const users = await prisma.user.findMany();
    console.log("Users in DB:", users.map((u: any) => ({ id: u.id, email: u.email, role: u.role })));
    const products = await prisma.product.count();
    console.log("Products count:", products);
}

main().catch(console.error);
