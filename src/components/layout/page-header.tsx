import type { ReactNode } from "react";
import { AppBreadcrumb, type BreadcrumbCrumb } from "@/components/layout/app-breadcrumb";

interface PageHeaderProps {
  title: string;
  /** Mantido por compatibilidade; não é exibido na interface. */
  description?: string;
  breadcrumbs?: BreadcrumbCrumb[];
  actions?: ReactNode;
}

export function PageHeader({
  title,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-6 space-y-3">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <AppBreadcrumb items={breadcrumbs} />
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1b2030]">
            {title}
          </h1>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
