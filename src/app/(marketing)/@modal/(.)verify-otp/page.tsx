import Modal from "@/components/modal";
import { VerifyOTPForm } from "@/features/auth/components/verify-otp-form";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <Modal title="verify otp modal">
      <VerifyOTPForm email={email ?? ""} />
    </Modal>
  );
}
