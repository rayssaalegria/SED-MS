import { redirect } from "next/navigation";
import { DeliverablesListClient } from "@/features/deliverables/components/deliverables-list-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Entregas" };

export default async function EntregasPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "deliverables.read")) {
    redirect("/dashboard");
  }
  return <DeliverablesListClient />;
}
