import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/helpers/authOptions";
import { DashboardLayoutWrapper } from "@/components/shared/DashboardLayoutWrapper";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>;
}
