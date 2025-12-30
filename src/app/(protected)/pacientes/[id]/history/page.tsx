import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PatientHistory } from "../../domain/history";

interface HistoryPageProps {
  params: Promise<{ id: string }>;
}

const PatientHistoryPage = async ({ params }: HistoryPageProps) => {
  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id },
  });

  if (!patient) {
    notFound();
  }

  return <PatientHistory patient={patient} />;
};

export default PatientHistoryPage;
