import { redirect } from "next/navigation";
import { RisksClient } from "@/features/risks/components/risks-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Riscos" };

export default async function RiscosPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "projects.read")) {
    redirect("/dashboard");
  }
  return <RisksClient />;
}
