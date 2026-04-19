import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/helpers/authOptions";
import { DashboardLayoutWrapper } from "@/components/shared/DashboardLayoutWrapper";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("[DASHBOARD LAYOUT] Checking session...");
  const session = await getServerSession(authOptions);

  console.log("[DASHBOARD LAYOUT] Session status:", {
    hasSession: !!session,
    user: session?.user?.email,
    hasBackendToken: !!session?.backendToken,
  });

  if (!session) {
    console.log("[DASHBOARD LAYOUT] No session found, redirecting to login");
    redirect("/login");
  }

  console.log("[DASHBOARD LAYOUT] Session valid, rendering dashboard");
  return <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>;
}
