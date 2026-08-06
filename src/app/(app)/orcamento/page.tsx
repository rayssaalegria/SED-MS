import { Suspense } from "react";
import { redirect } from "next/navigation";
import { BudgetModuleClient } from "@/features/budgets/components/budget-module-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export const metadata = { title: "Orçamento e previsão" };

export default async function OrcamentoPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "projects.read")) {
    redirect("/dashboard");
  }
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <BudgetModuleClient />
    </Suspense>
  );
}
