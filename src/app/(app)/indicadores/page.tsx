import { redirect } from "next/navigation";
import { IndicatorsListClient } from "@/features/indicators/components/indicators-list-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Indicadores" };

export default async function IndicadoresPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "indicators.read")) {
    redirect("/dashboard");
  }
  return <IndicatorsListClient />;
}
