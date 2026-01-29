import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role, Status } from "@prisma/client";
import { toPrismaEnumValue } from "@/lib/prisma/enum-helpers";
import bcrypt from "bcryptjs";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL (ou DIRECT_URL) precisa estar configurado para executar o seed.",
  );
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  const hashedPassword = await bcrypt.hash("123123123", 10);

  const seedUserEmail = "joao@fisiotime.com";
  await prisma.appointment.deleteMany({
    where: {
      patient: {
        phone: {
          in: ["11999999999", "11888888888", "11777777777"],
        },
      },
    },
  });
  await prisma.patient.deleteMany({
    where: {
      phone: {
        in: ["11999999999", "11888888888", "11777777777"],
      },
    },
  });
  await prisma.user.deleteMany({
    where: { email: seedUserEmail },
  });

  const user = await prisma.user.create({
    data: {
      name: "Dr. João Silva",
      email: seedUserEmail,
      password: hashedPassword,
      createdAt: new Date(),
      role: Role.ADMIN,
    },
  });

  console.log("👤 Usuário criado:", user.name);

  const patientSeedData = [
    {
      name: "Maria Santos",
      phone: "11999999999",
      email: "maria@email.com",
      birthDate: new Date("1985-03-15"),
      notes: "Paciente com dor nas costas",
    },
    {
      name: "Pedro Oliveira",
      phone: "11888888888",
      email: "pedro@email.com",
      birthDate: new Date("1990-07-22"),
      notes: "Fisioterapia pós-cirúrgica",
    },
    {
      name: "Ana Costa",
      phone: "11777777777",
      email: null,
      birthDate: new Date("1978-12-10"),
      notes: "Reabilitação do joelho",
    },
  ] as const;

  const patients = await Promise.all(
    patientSeedData.map((patient) =>
      prisma.patient.create({
        data: patient,
      }),
    ),
  );

  console.log(`👥 ${patients.length} pacientes criados`);

  const patientByPhone = new Map(
    patients.map((patient) => [patient.phone, patient.id]),
  );

  const appointments = await Promise.all([
    prisma.appointment.create({
      data: {
        name: "Maria Santos",
        phone: "11999999999",
        date: new Date("2024-01-15T10:00:00"),
        status: toPrismaEnumValue(Status.CONFIRMED),
        professionalId: user.id,
        patientId: patientByPhone.get("11999999999")!,
        notes: "Sessão inicial de fisioterapia",
      },
    }),
    prisma.appointment.create({
      data: {
        name: "Pedro Oliveira",
        phone: "11888888888",
        date: new Date("2024-01-16T09:30:00"),
        status: toPrismaEnumValue(Status.WAITING),
        professionalId: user.id,
        patientId: patientByPhone.get("11888888888")!,
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
