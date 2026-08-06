import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Construction } from "lucide-react";

interface ModulePlaceholderProps {
  title: string;
  description: string;
  stage: string;
  breadcrumbs: { label: string; href?: string }[];
}

export function ModulePlaceholder({
  title,
  description,
  stage,
  breadcrumbs,
}: ModulePlaceholderProps) {
  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
      />
      <EmptyState
        title={`Módulo previsto para ${stage}`}
        description="A estrutura de navegação, permissões e identidade visual já está preparada. O CRUD completo será entregue na próxima etapa."
        icon={Construction}
      />
    </div>
  );
}
