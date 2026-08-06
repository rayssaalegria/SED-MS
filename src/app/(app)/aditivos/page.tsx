import { redirect } from "next/navigation";
import { AmendmentsClient } from "@/features/amendments/components/amendments-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Aditivos" };

export default async function AditivosPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "contracts.write")) {
    redirect("/dashboard");
  }
  return <AmendmentsClient />;
}
