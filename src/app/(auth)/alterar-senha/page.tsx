import { AuthShell } from "@/components/layout/auth-shell";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";

export const metadata = {
  title: "Alterar senha",
};

export default function ChangePasswordPage() {
  return (
    <AuthShell>
      <ChangePasswordForm />
    </AuthShell>
  );
}
