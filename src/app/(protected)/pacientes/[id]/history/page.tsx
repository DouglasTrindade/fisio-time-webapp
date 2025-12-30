import { PatientHistory } from "../../domain/History";

interface HistoryPageProps {
  params: Promise<{ id: string }>;
}

const PatientHistoryPage = async ({ params }: HistoryPageProps) => {
  const { id } = await params;

  return <PatientHistory patientId={id} />;
};

export default PatientHistoryPage;
