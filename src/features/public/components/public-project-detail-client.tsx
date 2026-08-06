"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
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
import { formatCurrency, projectTone } from "@/features/management/utils";
import {
  getPublicDeliverables,
  getPublicDocuments,
  getPublicIndicators,
  getPublicProjects,
} from "@/lib/domain/public-portal";
import { PROJECT_STATUS_LABELS } from "@/types/management";
import { EVIDENCE_TYPE_LABELS } from "@/types/monitoring";

export function PublicProjectDetailClient({ id }: { id: string }) {
  const project = getPublicProjects().find((item) => item.id === id);
  if (!project) notFound();

  const deliverables = getPublicDeliverables(project.id);
  const indicators = getPublicIndicators(project.id);
  const documents = getPublicDocuments(project.id);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {project.code} · {project.organizationAcronym} · {project.year}
        </p>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-[#1b2030]">
            {project.name}
          </h1>
          <StatusBadge
            label={PROJECT_STATUS_LABELS[project.status]}
            tone={projectTone(project.status)}
          />
        </div>
        <p className="max-w-3xl text-muted-foreground">{project.description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Execução
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {project.executionPercent}%
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Investimento
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(project.budgetPlanned)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Beneficiários
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {project.beneficiariesReached.toLocaleString("pt-BR")}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              / {project.beneficiariesPlanned.toLocaleString("pt-BR")}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Vigência
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-medium">
            {project.startDate} a {project.endDate}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações gerais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <p>
            <strong>Objetivo:</strong> {project.objective}
          </p>
          <p>
            <strong>Programa:</strong> {project.programCode} —{" "}
            {project.programName}
          </p>
          <p>
            <strong>Pilar:</strong> {project.pillarCode}
          </p>
          <p>
            <strong>ODS:</strong> {project.ods.join(", ")}
          </p>
          <p className="md:col-span-2">
            <strong>Municípios atendidos:</strong>{" "}
            {project.municipalities.join(", ")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Entregas concluídas</CardTitle>
        </CardHeader>
        <CardContent>
          {deliverables.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma entrega concluída publicada.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Entrega</TableHead>
                  <TableHead>Município</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Conclusão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliverables.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.code}</TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.municipalityName ?? "—"}</TableCell>
                    <TableCell>
                      {item.achievedResult} {item.unitOfMeasure}
                    </TableCell>
                    <TableCell>{item.completedAt ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Indicadores</CardTitle>
        </CardHeader>
        <CardContent>
          {indicators.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum indicador público vinculado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Indicador</TableHead>
                  <TableHead>Meta</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Atingimento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {indicators.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.code}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      {item.annualTarget} {item.unitOfMeasure}
                    </TableCell>
                    <TableCell>
                      {item.currentResult} {item.unitOfMeasure}
                    </TableCell>
                    <TableCell>{item.achievementPercent}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documentos públicos</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum documento público disponível.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="rounded-lg border border-border px-3 py-2"
                >
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {EVIDENCE_TYPE_LABELS[
                      doc.type as keyof typeof EVIDENCE_TYPE_LABELS
                    ] ?? doc.type}{" "}
                    · publicado em {doc.publishedAt}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Button variant="outline" render={<Link href="/publico" />}>
        Voltar ao portal
      </Button>
    </div>
  );
}
