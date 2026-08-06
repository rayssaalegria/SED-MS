import { redirect } from "next/navigation";
import { ProjectsListClient } from "@/features/projects/components/projects-list-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Projetos" };

export default async function ProjetosPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "projects.read")) {
    redirect("/dashboard");
  }
  return <ProjectsListClient />;
}
