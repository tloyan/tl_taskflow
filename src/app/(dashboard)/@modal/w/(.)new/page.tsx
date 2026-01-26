import Modal from "@/components/modal";
import CreateWorkspaceForm from "@/features/workspace/components/create-workspace-form";

export default function Page() {
  return (
    <Modal title="create workspace form modal">
      <CreateWorkspaceForm />
    </Modal>
  );
}
