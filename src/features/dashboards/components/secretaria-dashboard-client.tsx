"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  FileText,
  ListTodo,
  Paperclip,
  Target,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useManagement } from "@/features/management/store";
import { useMonitoring } from "@/features/monitoring/store";
import {
  deliverableTone,
  projectTone,
} from "@/features/management/utils";
import { riskCriticality } from "@/lib/domain/monitoring";
import {
  DELIVERABLE_STATUS_LABELS,
  PROJECT_STATUS_LABELS,
} from "@/types/management";

export function SecretariaDashboardClient({
  organizationAcronym,
}: {
  organizationAcronym: string;
}) {
  const { contracts, projects, deliverables } = useManagement();
  const { evidences, risks, indicators } = useMonitoring();
  const [projectFilter, setProjectFilter] = useState<string>("todos");

  const contract = contracts[0];
  const filteredProjects = useMemo(() => {
    if (projectFilter === "todos") return projects;
    return projects.filter((p) => p.id === projectFilter);
  }, [projectFilter, projects]);

  const projectIds = new Set(filteredProjects.map((p) => p.id));
  const filteredDeliverables = deliverables.filter((d) =>
    projectIds.has(d.projectId),
  );

  const delayed = filteredDeliverables.filter((d) => d.status === "atrasada");
  const pendingEvidences = evidences.filter(
    (e) =>
      e.status === "enviada" ||
      e.status === "em_analise" ||
      e.status === "complementacao_solicitada",
  );
  const criticalRisks = risks.filter(
    (r) =>
      projectIds.has(r.projectId) &&
      riskCriticality(r.probability, r.impact) >= 12,
  );
  const staleIndicators = indicators.filter((i) => {
    if (!i.projectId || !projectIds.has(i.projectId)) return false;
    return i.updatedAt < "2026-07-01";
  });

  const upcoming = [...filteredDeliverables]
    .filter((d) => d.status !== "concluida" && d.status !== "cancelada")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 6);

  const chartData = filteredProjects.map((p) => ({
    name: p.code.replace("PRJ-SED-2026-", "P"),
    execucao: p.executionPercent,
  }));

  return (
    <div>
      <PageHeader
        title={`Dashboard — ${organizationAcronym}`}
        breadcrumbs={[
          { label: "Início", href: "/dashboard" },
          { label: "Dashboard da SED" },
        ]}
        actions={
          <Select
            value={projectFilter}
            onValueChange={(value) => setProjectFilter(value ?? "todos")}
          >
            <SelectTrigger className="w-56" aria-label="Filtrar projeto">
              <SelectValue placeholder="Filtrar projeto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os projetos</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {contract && (
        <Card className="mb-4 gap-0 py-3">
          <CardHeader className="px-4 pb-1 pt-0">
            <CardTitle className="text-base">
              Contrato de Gestão {contract.year}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3 px-4 text-sm">
            <StatusBadge label="Em execução" tone="info" />
            <span className="text-muted-foreground">
              Código {contract.code} · Execução atual{" "}
              {contract.executionPercent}%
            </span>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Execução da SED"
          value={`${contract?.executionPercent ?? 0}%`}
          description="Baseada no peso dos projetos"
          icon={FileText}
          trend="up"
        />
        <MetricCard
          title="Projetos no filtro"
          value={filteredProjects.length}
          description="Ciclo demonstrativo SED 2026"
          icon={Target}
        />
        <MetricCard
          title="Entregas atrasadas"
          value={delayed.length}
          description="Com justificativa ou pendência"
          icon={ListTodo}
          trend="down"
        />
        <MetricCard
          title="Evidências pendentes"
          value={pendingEvidences.length}
          description="Aguardando envio ou validação"
          icon={Paperclip}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title="Entregas próximas do prazo"
          value={upcoming.length}
          description="Ordenadas por vencimento"
          icon={CalendarClock}
        />
        <MetricCard
          title="Indicadores sem atualização"
          value={staleIndicators.length}
          description="Atualização anterior a jul/2026"
        />
        <MetricCard
          title="Riscos críticos"
          value={criticalRisks.length}
          description="No recorte de projetos"
          icon={AlertTriangle}
          trend="down"
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Execução por projeto</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar
                  dataKey="execucao"
                  name="Execução %"
                  fill="#1b2030"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Situação dos projetos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>%</TableHead>
                  <TableHead>Situação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.code}</TableCell>
                    <TableCell className="max-w-48 truncate">
                      {project.name}
                    </TableCell>
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
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">
            Cronograma das próximas entregas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Entrega</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcoming.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.code}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.dueDate}</TableCell>
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
    </div>
  );
}
