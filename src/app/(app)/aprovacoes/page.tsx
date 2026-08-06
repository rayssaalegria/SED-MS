import { redirect } from "next/navigation";
import { ApprovalsClient } from "@/features/approvals/components/approvals-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Aprovações" };

export default async function AprovacoesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "approvals.act")) {
    redirect("/dashboard");
  }
  return <ApprovalsClient />;
}
