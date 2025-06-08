import { SignOutButton } from "@/app/components/SignOutButton";
import { auth } from "@/auth";

const DashboardPage = async () => {
  const session = await auth();

  if (!session) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="container">
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <SignOutButton />
    </div>
  );
};

export default DashboardPage;
