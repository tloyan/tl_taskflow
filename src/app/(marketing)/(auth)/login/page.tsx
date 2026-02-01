import { LoginForm } from "@/features/auth/components/login-form";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  return (
    <div className="w-full max-w-sm">
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
