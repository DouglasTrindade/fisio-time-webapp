import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { FinanceResumePage } from "./_components/FinanceResumePage";
import type { FinanceTransaction } from "./_components/FinanceResumePage";

type AttendanceTypeDB = "evaluation" | "evolution";
type PaymentMethodDB = "pix" | "bank_slip" | "credit_card" | null;

type FinanceAttendanceRow = {
  id: string;
  type: AttendanceTypeDB;
  date: Date;
  patient_name: string | null;
  finance_amount: Prisma.Decimal | number;
  finance_payment_method: PaymentMethodDB;
  finance_account: string | null;
  finance_paid: boolean;
  finance_paid_at: Date | null;
  observations: string | null;
};

const buildMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const paymentMethodLabels: Record<
  NonNullable<PaymentMethodDB>,
  string
> = {
  pix: "Pix",
  bank_slip: "Boleto bancário",
  credit_card: "Cartão de crédito",
};

const mapPaymentMethod = (method: PaymentMethodDB) => {
  if (!method) {
    return paymentMethodLabels.pix;
  }

  return (
    paymentMethodLabels[method] ??
    method
      .split("_")
      .map((piece) => piece.charAt(0).toUpperCase() + piece.slice(1))
      .join(" ")
  );
};

export default async function ResumePage() {
  const attendances = await prisma.$queryRaw<FinanceAttendanceRow[]>`
    SELECT
      a.id,
      a.type::text AS type,
      a.date,
      p.name AS patient_name,
      a.finance_amount,
      a.finance_payment_method::text AS finance_payment_method,
      a.finance_account,
      a.finance_paid,
      a.finance_paid_at,
      a.observations
    FROM "attendances" a
    LEFT JOIN "patients" p ON p.id = a.patient_id
    WHERE a.launch_to_finance = true
      AND a.finance_amount IS NOT NULL
    ORDER BY a.date DESC
    LIMIT 200
  `;

  const transactions: FinanceTransaction[] = attendances.map((attendance) => {
    const amount = Number(attendance.finance_amount ?? 0);
    const referenceDate = attendance.finance_paid_at ?? attendance.date;

    return {
      id: attendance.id,
      description: `${
        attendance.type === "evaluation" ? "Avaliação" : "Evolução"
      } • ${attendance.patient_name ?? "Paciente"}`,
      amount,
      account: attendance.finance_account ?? "Conta principal",
      category: attendance.type === "evaluation" ? "Atendimento" : "Depósito",
      paymentMethod: mapPaymentMethod(attendance.finance_payment_method),
      date: referenceDate.toISOString(),
      paid: attendance.finance_paid,
      additionalInfo: attendance.observations ?? undefined,
    };
  });

  const generalBalance = transactions.reduce(
    (total, transaction) => total + transaction.amount,
    0
  );

  const evaluationTotal = attendances.filter(
    (attendance) => attendance.type === "evaluation"
  ).length;
  const evolutionTotal = attendances.filter(
    (attendance) => attendance.type === "evolution"
  ).length;

  const now = new Date();
  const monthlyTotals = new Map<
    string,
    { income: number; expense: number }
  >();

  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.date);
    const key = buildMonthKey(transactionDate);
    const entry = monthlyTotals.get(key) ?? { income: 0, expense: 0 };

    if (transaction.paid) {
      entry.income += transaction.amount;
    } else {
      entry.expense += transaction.amount;
    }

    monthlyTotals.set(key, entry);
  });

  const monthlyHistory = Array.from({ length: 12 }).map((_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (11 - index),
      1
    );
    const key = buildMonthKey(date);
    const entry = monthlyTotals.get(key) ?? { income: 0, expense: 0 };

    return {
      month: date
        .toLocaleString("pt-BR", { month: "short" })
        .replace(".", ""),
      income: Number(entry.income.toFixed(2)),
      expense: Number(entry.expense.toFixed(2)),
    };
  });

  return (
    <FinanceResumePage
      transactions={transactions}
      generalBalance={generalBalance}
      attendanceChart={[
        { label: "Avaliações", total: evaluationTotal },
        { label: "Evoluções", total: evolutionTotal },
      ]}
      monthlyHistory={monthlyHistory}
    />
  );
}
