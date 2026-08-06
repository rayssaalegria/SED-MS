import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { OrganizationTree } from "@/features/organizations/components/organization-tree";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Estrutura organizacional" };

export default async function EstruturaPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "organizations.manage")) {
    redirect("/dashboard");
  }

  return (
    <div>
      <PageHeader
        title="Estrutura organizacional"
        description="Organograma navegável dos órgãos estaduais. Expanda e recolha os níveis da hierarquia."
        breadcrumbs={[
          { label: "Administração", href: "/orgaos" },
          { label: "Estrutura organizacional" },
        ]}
      />
      <OrganizationTree />
    </div>
  );
}
