import Modal from "@/components/modal";
import { LoginForm } from "@/features/auth/components/login-form";

export default function Page() {
  return (
    <Modal title="login modal">
      <div className="flex flex-col items-center justify-center">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </Modal>
  );
}
