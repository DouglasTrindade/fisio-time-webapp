import { TransactionStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { FinanceResumePage } from "./_components/FinanceResumePage";
import type { FinanceTransaction } from "./_components/FinanceResumePage";

type PaymentMethodDB = "pix" | "bank_slip" | "credit_card" | null;

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
    return "Não informado";
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
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const financeTransactions: FinanceTransaction[] = transactions.map((transaction) => {
    const amount = Number(transaction.amount ?? 0)
    const referenceDate =
      transaction.paidAt ??
      transaction.dueDate ??
      transaction.competenceDate ??
      transaction.createdAt;

    return {
      id: transaction.id,
      description: transaction.description,
      amount,
      account: transaction.account ?? "Conta principal",
      category:
        transaction.category === "deposit" ? "Depósito" : "Atendimento",
      paymentMethod: mapPaymentMethod(
        (transaction.paymentMethod as PaymentMethodDB) ?? null,
      ),
      date: referenceDate.toISOString(),
      paid: transaction.status === TransactionStatus.PAID,
      additionalInfo: transaction.notes ?? undefined,
    };
  });

  const generalBalance = financeTransactions.reduce(
    (total, transaction) => total + transaction.amount,
    0
  );

  const evaluationTotal = transactions.filter(
    (transaction) => transaction.attendanceType === "evaluation"
  ).length;
  const evolutionTotal = transactions.filter(
    (transaction) => transaction.attendanceType === "evolution"
  ).length;

  const now = new Date();
  const monthlyTotals = new Map<
    string,
    { income: number; expense: number }
  >();

  financeTransactions.forEach((transaction) => {
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
      transactions={financeTransactions}
      generalBalance={generalBalance}
      attendanceChart={[
        { label: "Avaliações", total: evaluationTotal },
        { label: "Evoluções", total: evolutionTotal },
      ]}
      monthlyHistory={monthlyHistory}
    />
  );
}
