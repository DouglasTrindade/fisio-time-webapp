import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...")

  const user = await prisma.user.upsert({
    where: { email: "joao@fisiotime.com" },
    update: {},
    create: {
      id: "user_1",
      name: "Dr. João Silva",
      email: "joao@fisiotime.com",
      password: "$2b$10$example", 
    },
  })

  console.log("👤 Usuário criado:", user.name)

  const patients = await Promise.all([
    prisma.patient.upsert({
      where: { id: "patient_1" },
      update: {},
      create: {
        id: "patient_1",
        name: "Maria Santos",
        phone: "(11) 99999-9999",
        email: "maria@email.com",
        birthDate: new Date("1985-03-15"),
        notes: "Paciente com dor nas costas",
      },
    }),
    prisma.patient.upsert({
      where: { id: "patient_2" },
      update: {},
      create: {
        id: "patient_2",
        name: "Pedro Oliveira",
        phone: "(11) 88888-8888",
        email: "pedro@email.com",
        birthDate: new Date("1990-07-22"),
        notes: "Fisioterapia pós-cirúrgica",
      },
    }),
    prisma.patient.upsert({
      where: { id: "patient_3" },
      update: {},
      create: {
        id: "patient_3",
        name: "Ana Costa",
        phone: "(11) 77777-7777",
        email: null,
        birthDate: new Date("1978-12-10"),
        notes: "Reabilitação do joelho",
      },
    }),
  ])

  console.log(`👥 ${patients.length} pacientes criados`)

  const appointments = await Promise.all([
    prisma.appointment.upsert({
      where: { id: "appointment_1" },
      update: {},
      create: {
        id: "appointment_1",
        name: "Maria Santos",
        phone: "(11) 99999-9999",
        date: new Date("2024-01-15T10:00:00"),
        status: "confirmed",
        professionalId: user.id,
        patientId: "patient_1",
      },
    }),
  ])

  console.log(`📅 ${appointments.length} agendamentos criados`)
  console.log("✅ Seed concluído com sucesso!")
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
