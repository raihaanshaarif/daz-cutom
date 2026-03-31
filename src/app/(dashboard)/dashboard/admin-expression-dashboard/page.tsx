import { getUserSession } from "@/helpers/getUserSession";

import UserDashboard from "@/components/modules/Dashboard/UserDashboard";

import AdminDashboard from "@/components/modules/Dashboard/AdminDashboard";

export default async function DashboardExpression() {
  const session = await getUserSession();
  const role = session?.user?.role;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  //   return isAdmin ? <AdminCommandCenter /> : <UserDashboard />;
  return isAdmin ? <AdminDashboard /> : <UserDashboard />;
}
