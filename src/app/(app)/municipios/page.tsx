import { redirect } from "next/navigation";
import { MunicipalitiesClient } from "@/features/municipalities/components/municipalities-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Municípios" };

export default async function MunicipiosPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (
    !hasPermission(user.permissions, [
      "dashboard.estadual",
      "dashboard.secretaria",
      "organizations.manage",
    ])
  ) {
    redirect("/dashboard");
  }

  return <MunicipalitiesClient />;
}
