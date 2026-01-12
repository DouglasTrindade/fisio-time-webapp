import { Suspense } from "react";
import { DashboardHome } from "./_components";
import { DashboardPageSkeleton } from "@/app/(protected)/components/loading-fallbacks";

const DashboardPage = async () => {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <DashboardHome />
    </Suspense>
  );
};

export default DashboardPage;
