"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  contractTone,
  deliverableTone,
  formatDate,
  projectTone,
} from "@/features/management/utils";
import {
  CONTRACT_STATUS_LABELS,
  DELIVERABLE_STATUS_LABELS,
  PROJECT_STATUS_LABELS,
} from "@/types/management";

export function ContractDetailClient({ id }: { id: string }) {
  const { contracts, programs, projects, deliverables } = useManagement();
  const contract = contracts.find((item) => item.id === id);
  if (!contract) notFound();

  const contractPrograms = programs.filter((p) => p.contractId === id);
  const contractProjects = projects.filter((p) => p.contractId === id);
  const projectIds = new Set(contractProjects.map((p) => p.id));
  const contractDeliverables = deliverables.filter((d) =>
    projectIds.has(d.projectId),
  );

  return (
    <div>
      <PageHeader
        title={contract.name}
        description={`${contract.code} · ${contract.organizationAcronym} · v${contract.version}`}
        breadcrumbs={[
          { label: "Contratos", href: "/contratos" },
          { label: contract.code },
        ]}
        actions={
          <StatusBadge
            label={CONTRACT_STATUS_LABELS[contract.status]}
            tone={contractTone(contract.status)}
          />
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricCard title="Execução" value={`${contract.executionPercent}%`} />
        <MetricCard title="Programas" value={contractPrograms.length} />
        <MetricCard title="Projetos" value={contractProjects.length} />
        <MetricCard title="Entregas" value={contractDeliverables.length} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4 flex h-auto flex-wrap">
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="programs">Programas</TabsTrigger>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="deliverables">Entregas</TabsTrigger>
          <TabsTrigger value="budget">Orçamento</TabsTrigger>
          <TabsTrigger value="docs">Documentos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
              <Info label="Objetivo geral" value={contract.objective} />
              <Info label="Governador" value={contract.governorName} />
              <Info label="Secretário" value={contract.secretaryName} />
              <Info label="Gestor" value={contract.managerName} />
              <Info label="Elaboração" value={formatDate(contract.draftedAt)} />
              <Info label="Pactuação" value={formatDate(contract.pactuatedAt)} />
              <Info label="Assinatura" value={formatDate(contract.signedAt)} />
              <Info
                label="Vigência"
                value={`${formatDate(contract.startDate)} — ${formatDate(contract.endDate)}`}
              />
              <Info label="Observações" value={contract.observations || "—"} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs">
          <EntityTable
            empty="Nenhum programa vinculado."
            href="/programas"
            rows={contractPrograms.map((p) => [
              p.code,
              p.name,
              p.pillarCode,
              p.status,
            ])}
            headers={["Código", "Nome", "Pilar", "Situação"]}
          />
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Gestor</TableHead>
                    <TableHead>Execução</TableHead>
                    <TableHead>Situação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contractProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <Link
                          href={`/projetos/${project.id}`}
                          className="font-medium text-[#7d141d] hover:underline"
                        >
                          {project.code}
                        </Link>
                      </TableCell>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{project.managerName}</TableCell>
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
        </TabsContent>

        <TabsContent value="deliverables">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Entrega</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Execução</TableHead>
                    <TableHead>Situação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contractDeliverables.map((item) => (
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
        </TabsContent>

        <TabsContent value="budget">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Orçamento previsto</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Soma dos orçamentos dos projetos:{" "}
              <strong className="text-foreground">
                {contractProjects
                  .reduce((sum, p) => sum + p.budgetPlanned, 0)
                  .toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    maximumFractionDigits: 0,
                  })}
              </strong>
              . Detalhamento financeiro completo na Etapa 4.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs">
          <EmptyState
            title="Documentos do contrato"
            description="O documento principal e anexos serão gerenciados no módulo de evidências/documentos."
          />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="space-y-3 pt-6 text-sm">
              <HistoryItem
                date="12/01/2026"
                text="Contrato assinado e iniciado em execução."
              />
              <HistoryItem
                date="08/01/2026"
                text="Pactuação concluída com a SEGOV."
              />
              <HistoryItem
                date="10/11/2025"
                text="Elaboração inicial do Contrato de Gestão 2026."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-4">
        <Button variant="outline" render={<Link href="/contratos" />}>
          Voltar à lista
        </Button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}

function HistoryItem({ date, text }: { date: string; text: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{date}</p>
      <p>{text}</p>
    </div>
  );
}

function EntityTable({
  headers,
  rows,
  empty,
  href,
}: {
  headers: string[];
  rows: string[][];
  empty: string;
  href: string;
}) {
  if (rows.length === 0) {
    return <EmptyState title={empty} description="" actionHref={href} actionLabel="Ver módulo" />;
  }
  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.join("-")}>
                {row.map((cell) => (
                  <TableCell key={cell}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
