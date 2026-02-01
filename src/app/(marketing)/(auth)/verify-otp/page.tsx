import { VerifyOTPForm } from "@/features/auth/components/verify-otp-form";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; callbackUrl?: string }>;
}) {
  const { email, callbackUrl } = await searchParams;
  return (
    <div className="w-full max-w-md rounded-xl border shadow-sm">
      <VerifyOTPForm email={email ?? ""} callbackUrl={callbackUrl} />
    </div>
  );
}
