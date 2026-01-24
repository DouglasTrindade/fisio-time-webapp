import { SignUp } from "../domain/SignUp";

interface SignUpPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

const SignUpPage = ({ searchParams }: SignUpPageProps) => {
  const inviteToken = Array.isArray(searchParams?.invite)
    ? searchParams?.invite[0]
    : searchParams?.invite

  return <SignUp inviteToken={inviteToken} />;
};

export default SignUpPage;
