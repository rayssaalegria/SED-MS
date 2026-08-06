import { redirect } from "next/navigation";
import { StrategicSettingsClient } from "@/features/settings/components/strategic-settings-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "settings.manage")) {
    redirect("/dashboard");
  }

  return <StrategicSettingsClient />;
}
