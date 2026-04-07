import { getUserSession } from "@/helpers/getUserSession";
import UserDashboard from "@/components/modules/Dashboard/UserDashboard";

export default async function UserDashboardPage() {
  // Since this is user-dashboard, assume it's for users, but check if needed
  return <UserDashboard />;
}
