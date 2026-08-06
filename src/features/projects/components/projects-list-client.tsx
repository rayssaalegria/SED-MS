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

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por código, nome ou gestor..."
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
                  <TableCell className="font-medium text-[#7d141d]">
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
        </CardContent>
      </Card>

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
