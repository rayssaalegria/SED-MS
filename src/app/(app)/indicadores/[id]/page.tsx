import { redirect } from "next/navigation";
import { IndicatorDetailClient } from "@/features/indicators/components/indicator-detail-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Detalhe do indicador" };

export default async function IndicadorDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "indicators.read")) {
    redirect("/dashboard");
  }
  const { id } = await params;
  return <IndicatorDetailClient id={id} />;
}
