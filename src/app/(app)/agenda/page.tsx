import { redirect } from "next/navigation";
import { AgendaClient } from "@/features/reports/components/agenda-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Agenda" };

export default async function AgendaPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (
    !hasPermission(user.permissions, [
      "dashboard.estadual",
      "dashboard.secretaria",
    ])
  ) {
    redirect("/dashboard");
  }
  return <AgendaClient />;
}
