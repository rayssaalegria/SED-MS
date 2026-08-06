import { AuthShell } from "@/components/layout/auth-shell";
import { RecoverPasswordForm } from "@/features/auth/components/recover-password-form";

export const metadata = {
  title: "Recuperar senha",
};

export default function RecoverPasswordPage() {
  return (
    <AuthShell>
      <RecoverPasswordForm />
    </AuthShell>
  );
}
