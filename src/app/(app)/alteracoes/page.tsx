import { redirect } from "next/navigation";
import { ChangesClient } from "@/features/changes/components/changes-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Alterações" };

export default async function AlteracoesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (
    !hasPermission(user.permissions, ["approvals.act", "contracts.write"])
  ) {
    redirect("/dashboard");
  }
  return <ChangesClient />;
}
