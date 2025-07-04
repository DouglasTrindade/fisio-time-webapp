import { prisma } from "@/lib/prisma"

export async function setupDatabase() {
  try {
    console.log("🔄 Verificando conexão com o banco de dados...")

    await prisma.$connect()
    console.log("✅ Conexão com banco estabelecida")

    const tables = (await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('User', 'Patient', 'Appointment')
    `) as Array<{ table_name: string }>

    console.log(
      "📋 Tabelas encontradas:",
      tables.map((t) => t.table_name),
    )

    if (tables.length === 0) {
      console.log("⚠️  Nenhuma tabela encontrada. Execute as migrações do Prisma.")
      return false
    }

    const patientCount = await prisma.patient.count()
    console.log(`👥 Total de pacientes: ${patientCount}`)

    return true
  } catch (error) {
    console.error("❌ Erro ao conectar com banco:", error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}
