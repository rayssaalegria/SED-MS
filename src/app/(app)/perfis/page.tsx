import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSessionUser } from "@/lib/auth/session";
import { ROLE_PERMISSIONS, hasPermission } from "@/lib/rbac/permissions";
import { ROLE_LABELS, type UserRole } from "@/types/domain";

export const metadata = { title: "Perfis e permissões" };

const roles = Object.keys(ROLE_PERMISSIONS) as UserRole[];

export default async function PerfisPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "permissions.manage")) {
    redirect("/dashboard");
  }

  return (
    <div>
      <PageHeader
        title="Perfis e permissões"
        description="Matriz de acesso por perfil. O menu e as rotas respeitam essas permissões."
        breadcrumbs={[
          { label: "Administração", href: "/perfis" },
          { label: "Perfis e permissões" },
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {roles
          .filter((role) => role !== "publico")
          .map((role) => (
            <Card key={role}>
              <CardHeader>
                <CardTitle className="text-base">{ROLE_LABELS[role]}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {ROLE_PERMISSIONS[role].map((permission) => (
                  <Badge key={permission} variant="secondary">
                    {permission}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
