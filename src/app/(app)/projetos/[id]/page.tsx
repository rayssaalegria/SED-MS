import { redirect } from "next/navigation";
import { ProjectDetailClient } from "@/features/projects/components/project-detail-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Detalhe do projeto" };

export default async function ProjetoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "projects.read")) {
    redirect("/dashboard");
  }
  const { id } = await params;
  return <ProjectDetailClient id={id} />;
}
