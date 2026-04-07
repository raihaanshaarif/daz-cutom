import { getUserSession } from "@/helpers/getUserSession";

import UserDashboard from "@/components/modules/Dashboard/UserDashboard";
import UserCommandCenter from "@/components/modules/Dashboard/UserCommandCenter";
import AdminCommandCenter from "@/components/modules/Dashboard/AdminCommandCenter";

export default async function DashboardHome() {
  const session = await getUserSession();
  const role = session?.user?.role;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  return isAdmin ? <AdminCommandCenter /> : <UserCommandCenter />;
}
