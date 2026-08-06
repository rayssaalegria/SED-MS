import { redirect } from "next/navigation";
import { SecretariaDashboardClient } from "@/features/dashboards/components/secretaria-dashboard-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Dashboard da SED" };

export default async function DashboardSecretariaPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "dashboard.secretaria")) {
    if (hasPermission(user.permissions, "dashboard.estadual")) {
      redirect("/dashboard/estadual");
    }
    redirect("/notificacoes");
  }

  const org =
    user.roles.find((r) => r.organization_id === user.activeOrganizationId)
      ?.organization?.acronym ?? "Secretaria";

  return <SecretariaDashboardClient organizationAcronym={org} />;
}
