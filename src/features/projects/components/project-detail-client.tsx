"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useManagement } from "@/features/management/store";
import {
  deliverableTone,
  formatCurrency,
  formatDate,
  projectTone,
} from "@/features/management/utils";
import {
  DELIVERABLE_STATUS_LABELS,
  PROJECT_STATUS_LABELS,
} from "@/types/management";
import { isDueSoon, isDeliverableOverdue } from "@/lib/domain/progress";

export function ProjectDetailClient({ id }: { id: string }) {
  const { projects, programs, deliverables } = useManagement();
  const project = projects.find((item) => item.id === id);
  if (!project) notFound();

  const program = programs.find((p) => p.id === project.programId);
  const items = deliverables.filter((d) => d.projectId === project.id);

  return (
    <div>
      <PageHeader
        title={project.name}
        description={`${project.code} · Gestor: ${project.managerName}`}
        breadcrumbs={[
          { label: "Projetos", href: "/projetos" },
          { label: project.code },
        ]}
        actions={
          <StatusBadge
            label={PROJECT_STATUS_LABELS[project.status]}
            tone={projectTone(project.status)}
          />
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricCard title="Execução" value={`${project.executionPercent}%`} />
        <MetricCard title="Peso" value={project.weight} />
        <MetricCard
          title="Orçamento"
          value={formatCurrency(project.budgetPlanned)}
        />
        <MetricCard
          title="Beneficiários"
          value={`${project.beneficiariesReached.toLocaleString("pt-BR")} / ${project.beneficiariesPlanned.toLocaleString("pt-BR")}`}
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Responsáveis e escopo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Programa:</strong> {program?.name ?? "—"}
            </p>
            <p>
              <strong>Objetivo:</strong> {project.objective}
            </p>
            <p>
              <strong>Pilar:</strong> {project.pillarCode}
            </p>
            <p>
              <strong>ODS:</strong> {project.ods.join(", ")}
            </p>
            <p>
              <strong>Participantes:</strong>{" "}
              {project.participantOrgs.length
                ? project.participantOrgs.join(", ")
                : "Somente SED"}
            </p>
            <p>
              <strong>Municípios:</strong> {project.municipalities.join(", ")}
            </p>
            <p>
              <strong>Cronograma:</strong> {formatDate(project.startDate)} —{" "}
              {formatDate(project.endDate)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alertas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {items.filter((d) => isDeliverableOverdue(d)).length === 0 &&
            items.filter((d) => isDueSoon(d)).length === 0 ? (
              <p className="text-muted-foreground">
                Nenhuma entrega atrasada ou próxima do prazo.
              </p>
            ) : (
              <>
                {items.filter((d) => isDeliverableOverdue(d)).map((d) => (
                  <p key={d.id} className="text-[var(--ms-danger)]">
                    Atrasada: {d.code} — {d.title}
                  </p>
                ))}
                {items.filter((d) => isDueSoon(d)).map((d) => (
                  <p key={d.id} className="text-[#8A6D00]">
                    Prazo próximo: {d.code} — {d.title}
                  </p>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Entregas do projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>Execução</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Link
                      href={`/entregas/${item.id}`}
                      className="font-medium text-[#7d141d] hover:underline"
                    >
                      {item.code}
                    </Link>
                  </TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{formatDate(item.dueDate)}</TableCell>
                  <TableCell>{item.weight}</TableCell>
                  <TableCell>{item.executionPercent}%</TableCell>
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

      <div className="mt-4">
        <Button variant="outline" render={<Link href="/projetos" />}>
          Voltar
        </Button>
      </div>
    </div>
  );
}
