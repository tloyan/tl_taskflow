import DashboardLayout from "@/shared/components/layouts/dashboard-layout";

// Minimal layout - each page handles its own DashboardLayout
export default function Layout({
  children,
}: {
  children: Readonly<React.ReactNode>;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
