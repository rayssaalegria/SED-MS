import { redirect } from "next/navigation";
import { ContractFormClient } from "@/features/contracts/components/contract-form-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Novo contrato" };

export default async function NovoContratoPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "contracts.write")) {
    redirect("/contratos");
  }
  return <ContractFormClient />;
}
