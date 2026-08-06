import { redirect } from "next/navigation";
import { BudgetClient } from "@/features/budgets/components/budget-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Orçamento" };

export default async function OrcamentoPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "projects.read")) {
    redirect("/dashboard");
  }
  return <BudgetClient />;
}
