import { redirect } from "next/navigation";
import { OrganizationsClient } from "@/features/organizations/components/organizations-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Órgãos" };

export default async function OrgaosPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "organizations.manage")) {
    redirect("/dashboard");
  }

  return <OrganizationsClient />;
}
