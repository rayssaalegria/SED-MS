import { redirect } from "next/navigation";
import { AppProviders } from "@/components/layout/app-providers";
import { getSessionUser } from "@/lib/auth/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  if (user.profile.must_change_password) {
    redirect("/alterar-senha");
  }

  return <AppProviders user={user}>{children}</AppProviders>;
}
