import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getDefaultDashboardPath } from "@/lib/rbac/permissions";

export default async function DashboardIndexPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  redirect(getDefaultDashboardPath(user.activeRole));
}
