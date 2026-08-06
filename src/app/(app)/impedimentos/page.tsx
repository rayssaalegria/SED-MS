import { redirect } from "next/navigation";
import { ImpedimentsClient } from "@/features/impediments/components/impediments-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Impedimentos" };

export default async function ImpedimentosPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "projects.read")) {
    redirect("/dashboard");
  }
  return <ImpedimentsClient />;
}
