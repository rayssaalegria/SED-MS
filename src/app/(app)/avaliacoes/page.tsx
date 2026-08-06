import { redirect } from "next/navigation";
import { EvaluationsClient } from "@/features/evaluations/components/evaluations-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Avaliações" };

export default async function AvaliacoesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (
    !hasPermission(user.permissions, [
      "approvals.act",
      "evidences.validate",
    ])
  ) {
    redirect("/dashboard");
  }
  return <EvaluationsClient />;
}
