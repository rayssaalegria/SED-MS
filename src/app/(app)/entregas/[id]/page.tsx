import { redirect } from "next/navigation";
import { DeliverableDetailClient } from "@/features/deliverables/components/deliverable-detail-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Detalhe da entrega" };

export default async function EntregaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "deliverables.read")) {
    redirect("/dashboard");
  }
  const { id } = await params;
  return <DeliverableDetailClient id={id} />;
}
