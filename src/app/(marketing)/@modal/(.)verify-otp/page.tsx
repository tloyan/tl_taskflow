import Modal from "@/components/modal";
import { VerifyOTPForm } from "@/features/auth/components/verify-otp-form";

export default function Page() {
  return (
    <Modal title="verify otp modal">
      <VerifyOTPForm />
    </Modal>
  );
}
