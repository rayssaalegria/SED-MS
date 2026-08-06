import { redirect } from "next/navigation";
import { ProgramsClient } from "@/features/programs/components/programs-client";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";

export const metadata = { title: "Programas" };

export default async function ProgramasPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.permissions, "projects.read")) {
    redirect("/dashboard");
  }
  return <ProgramsClient />;
}
