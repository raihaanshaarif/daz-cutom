import Sidebar from "@/components/shared/Sidebar";
import { redirect } from "next/navigation";
import { authOptions } from "@/helpers/authOptions";
import { getServerSession } from "next-auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-dvh flex">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </main>
  );
}
