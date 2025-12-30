import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Status, HistoryKind } from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL (ou DIRECT_URL) precisa estar configurado para executar o seed.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  const hashedPassword = await bcrypt.hash("123123123", 10);

  const user = await prisma.user.upsert({
    where: { email: "joao@fisiotime.com" },
    update: {},
    create: {
      id: "usr_joao_silva",
      name: "Dr. João Silva",
      email: "joao@fisiotime.com",
      password: hashedPassword,
      createdAt: new Date(),
    },
  });

  console.log("👤 Usuário criado:", user.name);

  const patients = await Promise.all([
    prisma.patient.upsert({
      where: { id: "pat_maria_santos" },
      update: {},
      create: {
        id: "pat_maria_santos",
        name: "Maria Santos",
        phone: "11999999999",
        email: "maria@email.com",
        birthDate: new Date("1985-03-15"),
        notes: "Paciente com dor nas costas",
      },
    }),
    prisma.patient.upsert({
      where: { id: "pat_pedro_oliveira" },
      update: {},
      create: {
        id: "pat_pedro_oliveira",
        name: "Pedro Oliveira",
        phone: "11888888888",
        email: "pedro@email.com",
        birthDate: new Date("1990-07-22"),
        notes: "Fisioterapia pós-cirúrgica",
      },
    }),
    prisma.patient.upsert({
      where: { id: "pat_ana_costa" },
      update: {},
      create: {
        id: "pat_ana_costa",
        name: "Ana Costa",
        phone: "11777777777",
        email: null,
        birthDate: new Date("1978-12-10"),
        notes: "Reabilitação do joelho",
      },
    }),
  ]);

  console.log(`👥 ${patients.length} pacientes criados`);

  if (patients.length > 0) {
    await prisma.patientHistory.createMany({
      data: [
        {
          patientId: patients[0].id,
          kind: HistoryKind.EVOLUTION,
          cidCode: "M54.5",
          cidDescription: "Dor lombar baixa",
          content:
            "Relata melhora após exercícios de estabilização lombar. Dor reduzida para 3/10.",
        },
        {
          patientId: patients[0].id,
          kind: HistoryKind.EVOLUTION,
          cidCode: "M79.1",
          cidDescription: "Mialgia",
          content:
            "Aplicado protocolo de liberação miofascial. Reavaliação em 7 dias.",
        },
      ],
    });
    console.log("📝 Evoluções de exemplo adicionadas");
  }

  const appointments = await Promise.all([
    prisma.appointment.upsert({
      where: { id: "appt_maria_15jan" },
      update: {},
      create: {
        id: "appt_maria_15jan",
        name: "Maria Santos",
        phone: "11999999999",
        date: new Date("2024-01-15T10:00:00"),
        status: Status.CONFIRMED, 
        professionalId: user.id,
        patientId: "pat_maria_santos",
        notes: "Sessão inicial de fisioterapia",
      },
    }),
    prisma.appointment.upsert({
      where: { id: "appt_pedro_16jan" },
      update: {},
      create: {
        id: "appt_pedro_16jan",
        name: "Pedro Oliveira",
        phone: "11888888888",
        date: new Date("2024-01-16T09:30:00"),
        status: Status.WAITING,
        professionalId: user.id,
        patientId: "pat_pedro_oliveira",
        notes: "Aguardando avaliação pós-cirúrgica",
      },
    }),
  ]);

  console.log(`📅 ${appointments.length} agendamentos criados`);
  console.log("✅ Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
