import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL (ou DIRECT_URL) precisa estar configurado para executar o seed-admin.")
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seed de administrador - iniciando...")

  const seedUserEmail = "joao@fisiotime.com"
  const hashedPassword = await bcrypt.hash("123123123", 10)

  await prisma.user.deleteMany({ where: { email: seedUserEmail } })

  const user = await prisma.user.create({
    data: {
      name: "Dr. João Silva",
      email: seedUserEmail,
      password: hashedPassword,
      role: Role.ADMIN,
    },
  })

  console.log("✅ Usuário administrador recriado:", user.email)
}

main()
  .catch((error) => {
    console.error("❌ Seed de admin falhou:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
