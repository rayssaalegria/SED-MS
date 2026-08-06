import { redirect } from "next/navigation";
import { BudgetDetailClient } from "@/features/budgets/components/budget-detail-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Detalhe do orçamento" };

export default async function OrcamentoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "projects.read")) {
    redirect("/dashboard");
  }
  const { id } = await params;
  return <BudgetDetailClient id={id} />;
}
