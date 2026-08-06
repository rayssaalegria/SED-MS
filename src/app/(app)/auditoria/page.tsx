import { redirect } from "next/navigation";
import { AuditClient } from "@/features/audit/components/audit-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Auditoria" };

export default async function AuditoriaPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "audit.read")) {
    redirect("/dashboard");
  }
  return <AuditClient />;
}
