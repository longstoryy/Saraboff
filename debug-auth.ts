import { signToken, verifyToken } from "./src/lib/auth";

async function main() {
    const token = await signToken({ id: "123", name: "Test", email: "test@example.com", role: "manager" });
    console.log("Token:", token);
    const user = await verifyToken(token);
    console.log("Verified User:", user);
}
main().catch(console.error);
