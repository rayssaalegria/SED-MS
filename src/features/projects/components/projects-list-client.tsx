"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTableCard } from "@/components/shared/data-table-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  FilterToolbar,
  ResultCount,
  SearchField,
} from "@/components/shared/filter-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
import { DetailSheet } from "@/components/shared/detail-sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useManagement } from "@/features/management/store";
import { formatCurrency, formatDate, projectTone } from "@/features/management/utils";
import {
  PROJECT_STATUS_LABELS,
  type Project,
} from "@/types/management";

export function ProjectsListClient() {
  const { projects, programs } = useManagement();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.code.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.managerName.toLowerCase().includes(q),
    );
  }, [projects, query]);

  const selectedProgram = selected
    ? programs.find((p) => p.id === selected.programId)
    : undefined;

  return (
    <div>
      <PageHeader
        title="Projetos"
        description="Projetos estratégicos do ciclo. Clique em uma linha para ver todos os campos."
        breadcrumbs={[
          { label: "Gestão estratégica", href: "/projetos" },
          { label: "Projetos" },
        ]}
      />

      <FilterToolbar
        trailing={
          <ResultCount
            filtered={filtered.length}
            total={projects.length}
            label="projeto"
          />
        }
      >
        <SearchField
          placeholder="Buscar por código, nome ou gestor..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar projeto"
        />
      </FilterToolbar>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum projeto encontrado"
          description="Ajuste a busca para visualizar resultados."
        />
      ) : (
        <DataTableCard>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Projeto</TableHead>
                <TableHead>Gestor</TableHead>
                <TableHead>Orçamento</TableHead>
                <TableHead>Execução</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((project) => (
                <TableRow
                  key={project.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelected(project)}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelected(project);
                    }
                  }}
                  aria-label={`Detalhes do projeto ${project.code}`}
                >
                  <TableCell className="font-medium text-[var(--ms-accent)]">
                    {project.code}
                  </TableCell>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.managerName}</TableCell>
                  <TableCell>{formatCurrency(project.budgetPlanned)}</TableCell>
                  <TableCell>{project.executionPercent}%</TableCell>
                  <TableCell>
                    <StatusBadge
                      label={PROJECT_STATUS_LABELS[project.status]}
                      tone={projectTone(project.status)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTableCard>
      )}

      <DetailSheet
        open={!!selected}
        onOpenChange={(isOpen) => !isOpen && setSelected(null)}
        contextLabel="Projeto"
        title={selected?.name ?? "Projeto"}
        description={
          selected ? PROJECT_STATUS_LABELS[selected.status] : undefined
        }
        metaLabel="Código"
        metaValue={selected?.code}
        metaSubtext={
          selected
            ? `${formatDate(selected.startDate)} — ${formatDate(selected.endDate)}`
            : undefined
        }
        fields={
          selected
            ? [
                { label: "Código", value: selected.code },
                { label: "Nome", value: selected.name },
                { label: "Descrição", value: selected.description },
                { label: "Objetivo", value: selected.objective },
                { label: "Gestor", value: selected.managerName },
                {
                  label: "Programa",
                  value: selectedProgram?.name ?? selected.programId,
                },
                {
                  label: "Unidades participantes",
                  value: selected.participantOrgs.join(", ") || "—",
                },
                {
                  label: "Início",
                  value: formatDate(selected.startDate),
                },
                { label: "Fim", value: formatDate(selected.endDate) },
                {
                  label: "Orçamento previsto",
                  value: formatCurrency(selected.budgetPlanned),
                },
                {
                  label: "Execução",
                  value: `${selected.executionPercent}%`,
                },
                { label: "Peso", value: selected.weight },
                { label: "Prioridade", value: selected.priority },
                {
                  label: "Municípios",
                  value: selected.municipalities.join(", "),
                },
                {
                  label: "Beneficiários planejados",
                  value: selected.beneficiariesPlanned.toLocaleString("pt-BR"),
                },
                {
                  label: "Beneficiários alcançados",
                  value: selected.beneficiariesReached.toLocaleString("pt-BR"),
                },
                { label: "Pilar", value: selected.pillarCode },
                { label: "ODS", value: selected.ods.join(", ") },
                {
                  label: "Situação",
                  value: (
                    <StatusBadge
                      label={PROJECT_STATUS_LABELS[selected.status]}
                      tone={projectTone(selected.status)}
                    />
                  ),
                },
                {
                  label: "Público",
                  value: selected.isPublic ? "Sim" : "Não",
                },
                {
                  label: "Observações",
                  value: selected.observations ?? "—",
                },
              ]
            : []
        }
        footerHref={selected ? `/projetos/${selected.id}` : undefined}
      />
    </div>
  );
}
