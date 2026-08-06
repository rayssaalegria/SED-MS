"use client";

import type { ComponentProps, ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Campo de filtro alinhado ao padrão visual SED/MS (Orçamento). */
export const filterFieldClass =
  "h-8 rounded-lg border border-[var(--ms-border)] bg-[var(--ms-bg)] px-3 py-0 text-sm text-foreground shadow-none placeholder:text-muted-foreground data-placeholder:text-muted-foreground focus-visible:border-[var(--ms-focus)] focus-visible:ring-0 focus-visible:shadow-none dark:bg-[var(--ms-bg)] dark:hover:bg-[var(--ms-bg)]";

interface FilterToolbarProps {
  children: ReactNode;
  /** Conteúdo alinhado à direita (contagem, tabs, ações secundárias). */
  trailing?: ReactNode;
  className?: string;
}

/** Barra de filtros flat — sem Card wrapper. */
export function FilterToolbar({
  children,
  trailing,
  className,
}: FilterToolbarProps) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-center gap-2",
        className,
      )}
    >
      {children}
      {trailing ? (
        <div className="ml-auto flex flex-wrap items-center gap-2">{trailing}</div>
      ) : null}
    </div>
  );
}

interface SearchFieldProps
  extends Omit<ComponentProps<typeof Input>, "type" | "className"> {
  className?: string;
  inputClassName?: string;
}

/** Busca com ícone, altura e borda padronizadas. */
export function SearchField({
  className,
  inputClassName,
  placeholder = "Buscar...",
  "aria-label": ariaLabel = "Buscar",
  ...props
}: SearchFieldProps) {
  return (
    <div className={cn("relative min-w-[200px] max-w-md flex-1", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(filterFieldClass, "w-full pl-9", inputClassName)}
        {...props}
      />
    </div>
  );
}

interface ResultCountProps {
  filtered: number;
  total: number;
  label?: string;
}

/** Contagem de resultados filtrados. */
export function ResultCount({
  filtered,
  total,
  label = "resultado",
}: ResultCountProps) {
  const plural = filtered === 1 ? label : `${label}s`;
  return (
    <p className="shrink-0 text-sm text-muted-foreground tabular-nums">
      {filtered === total
        ? `${total} ${plural}`
        : `${filtered} de ${total} ${plural}`}
    </p>
  );
}
