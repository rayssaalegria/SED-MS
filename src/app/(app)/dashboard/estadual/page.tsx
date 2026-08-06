import { redirect } from "next/navigation";
import { EstadualDashboardClient } from "@/features/dashboards/components/estadual-dashboard-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Dashboard estadual" };

export default async function DashboardEstadualPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "dashboard.estadual")) {
    redirect("/dashboard/secretaria");
  }
  return <EstadualDashboardClient />;
}
