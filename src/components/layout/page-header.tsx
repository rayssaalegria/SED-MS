import type { ReactNode } from "react";
import type { BreadcrumbCrumb } from "@/components/layout/app-breadcrumb";

interface PageHeaderProps {
  /** Mantido por compatibilidade; título não é mais exibido. */
  title?: string;
  /** Mantido por compatibilidade; não é exibido na interface. */
  description?: string;
  /** Mantido por compatibilidade; breadcrumbs não são mais exibidos. */
  breadcrumbs?: BreadcrumbCrumb[];
  actions?: ReactNode;
}

/** Barra de ações da página. Título e breadcrumbs foram removidos do layout. */
export function PageHeader({ actions }: PageHeaderProps) {
  if (!actions) return null;

  return (
    <div className="mb-4 flex flex-wrap justify-end gap-2">{actions}</div>
  );
}
