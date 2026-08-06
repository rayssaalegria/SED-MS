import { redirect } from "next/navigation";
import { ActivitiesClient } from "@/features/activities/components/activities-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Atividades" };

export default async function AtividadesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "deliverables.read")) {
    redirect("/dashboard");
  }
  return <ActivitiesClient />;
}
