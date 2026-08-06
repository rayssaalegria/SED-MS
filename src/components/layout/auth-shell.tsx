import type { ReactNode } from "react";
import { Landmark } from "lucide-react";
import { APP_FULL_NAME, APP_NAME } from "@/lib/constants/menu";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[var(--ms-bg)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(46,122,184,0.18), transparent 40%), radial-gradient(circle at 80% 0%, rgba(11,58,102,0.16), transparent 35%)",
        }}
      />
      <header className="relative z-10 border-b border-border/70 bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[var(--ms-primary)] text-white">
            <Landmark className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--ms-primary)]">
              {APP_NAME}
            </p>
            <p className="text-xs text-muted-foreground">{APP_FULL_NAME}</p>
          </div>
        </div>
      </header>
      <main className="relative z-10 flex flex-1 items-center justify-center p-4">
        {children}
      </main>
      <footer className="relative z-10 border-t border-border/70 bg-card/80 py-4 text-center text-xs text-muted-foreground">
        Governo do Estado de Mato Grosso do Sul — uso institucional
      </footer>
    </div>
  );
}
