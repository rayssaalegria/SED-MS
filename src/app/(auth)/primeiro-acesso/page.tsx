import { AuthShell } from "@/components/layout/auth-shell";
import { FirstAccessForm } from "@/features/auth/components/first-access-form";

export const metadata = {
  title: "Primeiro acesso",
};

export default function FirstAccessPage() {
  return (
    <AuthShell>
      <FirstAccessForm />
    </AuthShell>
  );
}
