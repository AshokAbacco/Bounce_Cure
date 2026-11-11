// server/scripts/setUserRole.js
// Make a user Admin (or back to User):
//   node scripts/setUserRole.js you@example.com ADMIN
//   node scripts/setUserRole.js someone@example.com USER
import "dotenv/config";
import { prisma } from "../prisma/prismaClient.js";

const [, , email, roleArg] = process.argv;
const role = String(roleArg || "").toUpperCase();

if (!email || !["ADMIN", "USER"].includes(role)) {
  console.error("Usage: node scripts/setUserRole.js <email> <ADMIN|USER>");
  process.exit(1);
}

try {
  const found = await prisma.user.findFirst({
    where: { email: { equals: email.trim(), mode: "insensitive" } },
    select: { id: true },
  });
  if (!found) throw Object.assign(new Error("not found"), { code: "P2025" });
  const user = await prisma.user.update({
    where: { id: found.id },
    data: { role },
    select: { id: true, email: true, role: true },
  });
  console.log(`✅ ${user.email} (id ${user.id}) is now ${user.role}`);
} catch (e) {
  console.error(e.code === "P2025" ? `❌ No user with email ${email}` : `❌ ${e.message}`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}