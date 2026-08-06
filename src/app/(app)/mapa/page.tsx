import { redirect } from "next/navigation";
import { MapClient } from "@/features/map/components/map-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Mapa estadual" };

export default async function MapaPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (
    !hasPermission(user.permissions, [
      "dashboard.estadual",
      "dashboard.secretaria",
    ])
  ) {
    redirect("/dashboard");
  }
  return <MapClient />;
}
