import DashboardLayout from "@/shared/components/layouts/dashboard-layout";

// Minimal layout - each page handles its own DashboardLayout
export default function Layout({
  children,
  modal,
}: {
  children: Readonly<React.ReactNode>;
  modal: Readonly<React.ReactNode>;
}) {
  return (
    <DashboardLayout>
      {children}
      {modal}
    </DashboardLayout>
  );
}
