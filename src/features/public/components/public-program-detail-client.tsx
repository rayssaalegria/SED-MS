"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, projectTone } from "@/features/management/utils";
import {
  getPublicPrograms,
  getPublicProjects,
} from "@/lib/domain/public-portal";
import { PROJECT_STATUS_LABELS } from "@/types/management";

export function PublicProgramDetailClient({ id }: { id: string }) {
  const program = getPublicPrograms().find((item) => item.id === id);
  if (!program) notFound();

  const projects = getPublicProjects().filter(
    (project) => project.programId === program.id,
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {program.code} · {program.organizationAcronym} · {program.year}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[#1b2030]">
          {program.name}
        </h1>
        <p className="max-w-3xl text-muted-foreground">{program.description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Projetos públicos
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {program.projectsCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Execução média
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {program.executionPercent}%
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Investimento dos projetos
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(
              projects.reduce((sum, p) => sum + p.budgetPlanned, 0),
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sobre o programa</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <p>
            <strong>Objetivo:</strong> {program.objective}
          </p>
          <p>
            <strong>Abrangência:</strong> {program.scope}
          </p>
          <p>
            <strong>Pilar:</strong> {program.pillarCode}
          </p>
          <p>
            <strong>ODS:</strong> {program.ods.join(", ")}
          </p>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1b2030]">
          Projetos públicos do programa
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  <StatusBadge
                    label={PROJECT_STATUS_LABELS[project.status]}
                    tone={projectTone(project.status)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
                <p>
                  <strong>Execução:</strong> {project.executionPercent}%
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  render={<Link href={`/publico/projetos/${project.id}`} />}
                >
                  Abrir projeto
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Button variant="outline" render={<Link href="/publico" />}>
        Voltar ao portal
      </Button>
    </div>
  );
}
