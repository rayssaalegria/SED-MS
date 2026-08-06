"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Globe, Loader2, Sun } from "lucide-react";
import { loginAction, type ActionResult } from "@/features/auth/actions";
import { DEMO_ACCOUNTS, DEMO_PASSWORD, isDemoMode } from "@/lib/auth/demo-users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const initialState: ActionResult | null = null;

const fieldClassName = cn(
  "h-12 rounded-lg border-[rgba(195,201,232,0.6)] bg-[rgba(195,201,232,0.2)] px-4 text-sm font-medium text-[#232d64]",
  "placeholder:text-[#394aa5]/70",
  "focus-visible:border-[#394aa5] focus-visible:ring-[#394aa5]/25",
);

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const demo = isDemoMode();

  return (
    <div className="flex min-h-screen flex-col bg-[#e4e7f8]">
      <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-[rgba(195,201,232,0.6)] px-4 md:px-8">
        <div className="flex items-end gap-2">
          <div
            className="relative flex size-6 items-center justify-center overflow-hidden rounded-full"
            style={{
              backgroundImage:
                "linear-gradient(137deg, #111733 4.5%, #394aa5 100%)",
            }}
          >
            <Image
              src="/brand/login/sasi-logo.svg"
              alt=""
              width={16}
              height={16}
              className="size-4"
              unoptimized
            />
          </div>
          <p className="text-xl font-bold leading-none text-[#232d64]">
            Sistema SASI
          </p>
        </div>

        <div className="flex items-center gap-3 text-[#576175]">
          <div className="hidden items-center gap-2 text-sm md:flex">
            <Globe className="size-4" aria-hidden />
            <span>Português (BR)</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 text-[#576175] hover:bg-white/40 hover:text-[#232d64]"
            aria-label="Alternar tema"
          >
            <Sun className="size-5" />
          </Button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 md:px-10 lg:px-20">
        <div className="flex w-full max-w-[1286px] flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-20">
          <section className="w-full max-w-[540px] shrink-0">
            <div className="mb-4 space-y-1">
              <h1 className="text-[28px] font-bold leading-tight text-[#394aa5] md:text-[32px]">
                Bem-vindo ao Sistema SASI
              </h1>
              <p className="text-base font-medium leading-6 text-[#6c7993]">
                Mantenha-se atualizado em mensagens e alertas.
              </p>
            </div>

            <form action={formAction} className="space-y-4">
              <div className="space-y-1">
                <Label
                  htmlFor="email"
                  className="gap-0 text-sm font-medium text-[#232d64]"
                >
                  E-mail
                  <span className="text-[#ba2612]" aria-hidden>
                    *
                  </span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="Digite seu e-mail"
                  required
                  className={fieldClassName}
                  aria-invalid={Boolean(state?.errors?.email)}
                  aria-describedby={
                    state?.errors?.email ? "email-error" : undefined
                  }
                />
                {state?.errors?.email && (
                  <p id="email-error" className="text-sm text-[#ba2612]">
                    {state.errors.email[0]}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="password"
                  className="gap-0 text-sm font-medium text-[#232d64]"
                >
                  Senha
                  <span className="text-[#ba2612]" aria-hidden>
                    *
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Digite sua senha"
                    required
                    className={cn(fieldClassName, "pr-12")}
                    aria-invalid={Boolean(state?.errors?.password)}
                    aria-describedby={
                      state?.errors?.password ? "password-error" : undefined
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-[#576175] transition-colors hover:text-[#232d64]"
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                  >
                    {showPassword ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4" />
                    )}
                  </button>
                </div>
                {state?.errors?.password && (
                  <p id="password-error" className="text-sm text-[#ba2612]">
                    {state.errors.password[0]}
                  </p>
                )}
                <div className="flex justify-end pt-1">
                  <Link
                    href="/recuperar-senha"
                    className="text-sm font-medium text-[#0f69bd] underline-offset-2 hover:underline"
                  >
                    Esqueci a senha
                  </Link>
                </div>
              </div>

              {state?.message && !state.success && (
                <Alert variant="destructive">
                  <AlertTitle>Falha no acesso</AlertTitle>
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={pending}
                className="h-14 w-full rounded-lg bg-[#394aa5] text-base font-medium text-white hover:bg-[#2f3d8a]"
              >
                {pending && <Loader2 className="size-4 animate-spin" />}
                Entrar
              </Button>
            </form>

            <p className="mt-4 text-center text-base text-[#576175]">
              Não tem uma conta?{" "}
              <Link
                href="/primeiro-acesso"
                className="font-medium text-[#0f69bd] underline underline-offset-2"
              >
                Ative sua conta
              </Link>
            </p>

            {demo && (
              <div className="mt-6 rounded-lg border border-dashed border-[rgba(195,201,232,0.8)] bg-white/40 p-3 text-xs text-[#576175]">
                <p className="font-medium text-[#232d64]">
                  Usuários de demonstração
                </p>
                <p className="mt-1">Senha: {DEMO_PASSWORD}</p>
                <ul className="mt-2 space-y-1">
                  {DEMO_ACCOUNTS.slice(0, 3).map((account) => (
                    <li key={account.email}>
                      {account.fullName} — {account.email}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <aside
            className="relative hidden min-h-[520px] w-full max-w-[666px] flex-1 items-center justify-center overflow-hidden rounded-[72px] bg-[rgba(195,201,232,0.2)] lg:flex xl:min-h-[765px] xl:rounded-[91px]"
            aria-hidden
          >
            <Image
              src="/brand/login/illustration.png"
              alt=""
              width={666}
              height={765}
              priority
              className="h-full w-full object-contain p-8 xl:p-16"
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
