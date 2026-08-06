"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  changePasswordAction,
  type ActionResult,
} from "@/features/auth/actions";
import { APP_NAME } from "@/lib/constants/menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const initialState: ActionResult | null = null;

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    initialState,
  );

  return (
    <Card className="w-full max-w-md border-border/80 shadow-md">
      <CardHeader>
        <CardTitle className="text-[var(--ms-primary)]">Alterar senha</CardTitle>
        <CardDescription>
          Atualize sua senha de acesso ao {APP_NAME}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input id="newPassword" name="newPassword" type="password" required />
            {state?.errors?.newPassword && (
              <p className="text-sm text-destructive">
                {state.errors.newPassword[0]}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
            />
            {state?.errors?.confirmPassword && (
              <p className="text-sm text-destructive">
                {state.errors.confirmPassword[0]}
              </p>
            )}
          </div>

          {state?.message && (
            <Alert variant={state.success ? "default" : "destructive"}>
              <AlertTitle>
                {state.success ? "Senha atualizada" : "Falha na alteração"}
              </AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Salvar nova senha
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Link
          href="/dashboard"
          className="text-sm text-[var(--ms-secondary)] hover:underline"
        >
          Voltar ao painel
        </Link>
      </CardFooter>
    </Card>
  );
}
