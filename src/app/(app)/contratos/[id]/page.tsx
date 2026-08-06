import { redirect } from "next/navigation";
import { ContractDetailClient } from "@/features/contracts/components/contract-detail-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Detalhe do contrato" };

export default async function ContratoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "contracts.read")) {
    redirect("/dashboard");
  }
  const { id } = await params;
  return <ContractDetailClient id={id} />;
}
