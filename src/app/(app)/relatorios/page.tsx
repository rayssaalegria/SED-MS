import { redirect } from "next/navigation";
import { ReportsClient } from "@/features/reports/components/reports-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Central de relatórios" };

export default async function RelatoriosPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "reports.export")) {
    redirect("/dashboard");
  }
  return <ReportsClient />;
}
