import { redirect } from "next/navigation";
import { EvidencesClient } from "@/features/evidences/components/evidences-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Evidências" };

export default async function EvidenciasPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (
    !hasPermission(user.permissions, [
      "deliverables.read",
      "evidences.validate",
    ])
  ) {
    redirect("/dashboard");
  }
  return <EvidencesClient />;
}
