import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEMO_ACCOUNTS } from "@/lib/auth/demo-users";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";
import { ROLE_LABELS } from "@/types/domain";

export const metadata = { title: "Usuários" };

export default async function UsuariosPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "users.manage")) {
    redirect("/dashboard");
  }

  return (
    <div>
      <PageHeader
        title="Usuários"
        description="Usuários fictícios de demonstração para testes de autenticação e perfis."
        breadcrumbs={[
          { label: "Administração", href: "/usuarios" },
          { label: "Usuários" },
        ]}
      />
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Órgãos</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_ACCOUNTS.map((account) => (
                <TableRow key={account.email}>
                  <TableCell className="font-medium">
                    {account.fullName}
                  </TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>{ROLE_LABELS[account.role]}</TableCell>
                  <TableCell>
                    {account.organizations.map((o) => o.acronym).join(", ")}
                  </TableCell>
                  <TableCell>
                    <StatusBadge label="Ativo" tone="success" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
