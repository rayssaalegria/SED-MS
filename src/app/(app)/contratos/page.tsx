import { redirect } from "next/navigation";
import { ContractsListClient } from "@/features/contracts/components/contracts-list-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Contratos de Gestão" };

export default async function ContratosPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "contracts.read")) {
    redirect("/dashboard");
  }
  return <ContractsListClient />;
}
