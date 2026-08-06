"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DetailSheet } from "@/components/shared/detail-sheet";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useManagement } from "@/features/management/store";
import { deliverableTone, formatDate } from "@/features/management/utils";
import {
  DELIVERABLE_STATUS_LABELS,
  type Deliverable,
} from "@/types/management";
import { isDueSoon, isDeliverableOverdue } from "@/lib/domain/progress";

export function DeliverablesListClient() {
  const { deliverables, projects } = useManagement();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Deliverable | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return deliverables;
    return deliverables.filter(
      (d) =>
        d.code.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.ownerName.toLowerCase().includes(q),
    );
  }, [deliverables, query]);

  const selectedProject = selected
    ? projects.find((p) => p.id === selected.projectId)
    : undefined;

  return (
    <div>
      <PageHeader
        title="Entregas"
        description="Entregas mensuráveis. Clique em uma linha para ver todos os campos."
        breadcrumbs={[
          { label: "Gestão estratégica", href: "/entregas" },
          { label: "Entregas" },
        ]}
      />

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar entrega..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Execução</TableHead>
                <TableHead>Alerta</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelected(item)}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelected(item);
                    }
                  }}
                  aria-label={`Detalhes da entrega ${item.code}`}
                >
                  <TableCell className="font-medium text-[#7d141d]">
                    {item.code}
                  </TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.ownerName}</TableCell>
                  <TableCell>{formatDate(item.dueDate)}</TableCell>
                  <TableCell>{item.executionPercent}%</TableCell>
                  <TableCell>
                    {isDeliverableOverdue(item) ? (
                      <StatusBadge label="Atrasada" tone="danger" />
                    ) : isDueSoon(item) ? (
                      <StatusBadge label="Prazo próximo" tone="warning" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={DELIVERABLE_STATUS_LABELS[item.status]}
                      tone={deliverableTone(item.status)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DetailSheet
        open={!!selected}
        onOpenChange={(isOpen) => !isOpen && setSelected(null)}
        contextLabel="Entrega"
        title={selected?.title ?? "Entrega"}
        description={
          selected ? DELIVERABLE_STATUS_LABELS[selected.status] : undefined
        }
        metaLabel="Código"
        metaValue={selected?.code}
        metaSubtext={
          selected ? `Prazo ${formatDate(selected.dueDate)}` : undefined
        }
        fields={
          selected
            ? [
                { label: "Código", value: selected.code },
                { label: "Título", value: selected.title },
                { label: "Descrição", value: selected.description },
                {
                  label: "Projeto",
                  value: selectedProject
                    ? `${selectedProject.code} — ${selectedProject.name}`
                    : selected.projectId,
                },
                { label: "Unidade", value: selected.unitName },
                { label: "Responsável", value: selected.ownerName },
                {
                  label: "Colaboradores",
                  value: selected.collaborators.join(", ") || "—",
                },
                {
                  label: "Início",
                  value: formatDate(selected.startDate),
                },
                { label: "Prazo", value: formatDate(selected.dueDate) },
                {
                  label: "Conclusão",
                  value: selected.completedAt
                    ? formatDate(selected.completedAt)
                    : "—",
                },
                { label: "Peso", value: selected.weight },
                {
                  label: "Meta planejada",
                  value: `${selected.plannedTarget} ${selected.unitOfMeasure}`,
                },
                {
                  label: "Resultado alcançado",
                  value: `${selected.achievedResult} ${selected.unitOfMeasure}`,
                },
                {
                  label: "Execução",
                  value: `${selected.executionPercent}%`,
                },
                {
                  label: "Município",
                  value: selected.municipalityName ?? "—",
                },
                {
                  label: "Evidência obrigatória",
                  value: selected.evidenceRequired ? "Sim" : "Não",
                },
                {
                  label: "Possui evidência",
                  value: selected.hasEvidence ? "Sim" : "Não",
                },
                {
                  label: "Situação",
                  value: (
                    <StatusBadge
                      label={DELIVERABLE_STATUS_LABELS[selected.status]}
                      tone={deliverableTone(selected.status)}
                    />
                  ),
                },
                {
                  label: "Justificativa de atraso",
                  value: selected.delayJustification ?? "—",
                },
                {
                  label: "Justificativa parcial",
                  value: selected.partialJustification ?? "—",
                },
                {
                  label: "Observação",
                  value: selected.observation ?? "—",
                },
                {
                  label: "Atualizado em",
                  value: formatDate(selected.updatedAt),
                },
              ]
            : []
        }
        footerHref={selected ? `/entregas/${selected.id}` : undefined}
      />
    </div>
  );
}
