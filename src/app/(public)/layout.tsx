import Link from "next/link";
import Image from "next/image";
import { Landmark } from "lucide-react";
import { APP_FULL_NAME, APP_NAME } from "@/lib/constants/menu";
import { Button } from "@/components/ui/button";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f4f5ff]">
      <header className="border-b border-white/10 bg-[#1b2030] text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/publico" className="flex min-w-0 items-center gap-3">
            <div className="relative hidden h-10 w-28 sm:block">
              <Image
                src="/brand/sed-logo-branco.png"
                alt="Governo de Mato Grosso do Sul"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-white/15 sm:hidden">
              <Landmark className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {APP_NAME} — Portal público
              </p>
              <p className="truncate text-xs text-white/70">{APP_FULL_NAME}</p>
            </div>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 hover:text-white"
              render={<Link href="/publico" />}
            >
              Início
            </Button>
            <Button
              variant="secondary"
              size="sm"
              render={<Link href="/login" />}
            >
              Área restrita
            </Button>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-12 border-t border-border bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Exibe apenas informações marcadas como públicas. Dados pessoais,
            documentos restritos e riscos sigilosos não são divulgados.
          </p>
          <p>© 2026 Governo do Estado de Mato Grosso do Sul</p>
        </div>
      </footer>
    </div>
  );
}
