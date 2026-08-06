"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, projectTone } from "@/features/management/utils";
import {
  filterPublicProjects,
  getPublicPrograms,
  getPublicProjects,
  publicSummary,
} from "@/lib/domain/public-portal";
import { STRATEGIC_PILLARS } from "@/lib/data/strategic";
import { PROJECT_STATUS_LABELS } from "@/types/management";
import type { PublicFilters } from "@/types/public";

const initialFilters: PublicFilters = {
  query: "",
  organizationAcronym: "todas",
  municipality: "todos",
  year: "todos",
  programId: "todos",
  pillarCode: "todos",
  status: "todos",
};

export function PublicPortalClient() {
  const programs = useMemo(() => getPublicPrograms(), []);
  const allProjects = useMemo(() => getPublicProjects(), []);
  const [filters, setFilters] = useState<PublicFilters>(initialFilters);
  const [tab, setTab] = useState("projetos");

  const municipalities = useMemo(() => {
    const set = new Set<string>();
    allProjects.forEach((p) => p.municipalities.forEach((m) => set.add(m)));
    return [...set].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [allProjects]);

  const years = useMemo(() => {
    const set = new Set(allProjects.map((p) => String(p.year)));
    return [...set].sort();
  }, [allProjects]);

  const projects = useMemo(
    () => filterPublicProjects(allProjects, filters),
    [allProjects, filters],
  );

  const filteredPrograms = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return programs.filter((program) => {
      const matchesQuery =
        !q ||
        program.name.toLowerCase().includes(q) ||
        program.code.toLowerCase().includes(q);
      const matchesOrg =
        filters.organizationAcronym === "todas" ||
        program.organizationAcronym === filters.organizationAcronym;
      const matchesYear =
        filters.year === "todos" || String(program.year) === filters.year;
      const matchesPillar =
        filters.pillarCode === "todos" ||
        program.pillarCode === filters.pillarCode;
      const matchesProgram =
        filters.programId === "todos" || program.id === filters.programId;
      return (
        matchesQuery &&
        matchesOrg &&
        matchesYear &&
        matchesPillar &&
        matchesProgram
      );
    });
  }, [filters, programs]);

  const summary = publicSummary(projects);

  function update<K extends keyof PublicFilters>(key: K, value: PublicFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-[#1b2030]">
          Transparência da SED/MS
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          Consulte programas, projetos e resultados públicos autorizados da
          Secretaria de Estado de Educação de Mato Grosso do Sul.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Programas públicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{programs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Projetos publicados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{summary.projects}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Execução média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{summary.execution}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Investimento previsto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatCurrency(summary.investment)}
            </p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardContent className="grid gap-3 pt-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative md:col-span-2 xl:col-span-2">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Pesquisar projetos ou programas..."
              value={filters.query}
              onChange={(e) => update("query", e.target.value)}
              aria-label="Pesquisar"
            />
          </div>
          <Select
            value={filters.municipality}
            onValueChange={(value) => update("municipality", value ?? "todos")}
          >
            <SelectTrigger aria-label="Município">
              <SelectValue placeholder="Município" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os municípios</SelectItem>
              {municipalities.map((mun) => (
                <SelectItem key={mun} value={mun}>
                  {mun}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.year}
            onValueChange={(value) => update("year", value ?? "todos")}
          >
            <SelectTrigger aria-label="Ano">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os anos</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.programId}
            onValueChange={(value) => update("programId", value ?? "todos")}
          >
            <SelectTrigger aria-label="Programa">
              <SelectValue placeholder="Programa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os programas</SelectItem>
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.id}>
                  {program.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.pillarCode}
            onValueChange={(value) => update("pillarCode", value ?? "todos")}
          >
            <SelectTrigger aria-label="Pilar">
              <SelectValue placeholder="Pilar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os pilares</SelectItem>
              {STRATEGIC_PILLARS.map((pillar) => (
                <SelectItem key={pillar.code} value={pillar.code}>
                  {pillar.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(value) => update("status", value ?? "todos")}
          >
            <SelectTrigger aria-label="Situação">
              <SelectValue placeholder="Situação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as situações</SelectItem>
              {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            onClick={() => setFilters(initialFilters)}
          >
            Limpar filtros
          </Button>
        </CardContent>
      </Card>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value ?? "projetos")}
      >
        <TabsList>
          <TabsTrigger value="projetos">
            Projetos ({projects.length})
          </TabsTrigger>
          <TabsTrigger value="programas">
            Programas ({filteredPrograms.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projetos" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <Card key={project.id} className="border-border/80 shadow-sm">
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {project.code} · {project.organizationAcronym} ·{" "}
                        {project.year}
                      </p>
                      <CardTitle className="text-base">{project.name}</CardTitle>
                    </div>
                    <StatusBadge
                      label={PROJECT_STATUS_LABELS[project.status]}
                      tone={projectTone(project.status)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                  <p>
                    <strong>Programa:</strong> {project.programCode}
                  </p>
                  <p>
                    <strong>Execução:</strong> {project.executionPercent}%
                  </p>
                  <p>
                    <strong>Investimento:</strong>{" "}
                    {formatCurrency(project.budgetPlanned)}
                  </p>
                  <p>
                    <strong>Municípios:</strong>{" "}
                    {project.municipalities.slice(0, 3).join(", ")}
                    {project.municipalities.length > 3
                      ? ` +${project.municipalities.length - 3}`
                      : ""}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    render={<Link href={`/publico/projetos/${project.id}`} />}
                  >
                    Ver detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
            {projects.length === 0 && (
              <Card className="md:col-span-2">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum projeto público encontrado com os filtros atuais.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="programas" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPrograms.map((program) => (
              <Card key={program.id} className="border-border/80 shadow-sm">
                <CardHeader>
                  <p className="text-xs text-muted-foreground">
                    {program.code} · {program.organizationAcronym} ·{" "}
                    {program.year}
                  </p>
                  <CardTitle className="text-base">{program.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-muted-foreground line-clamp-2">
                    {program.description}
                  </p>
                  <p>
                    <strong>Projetos públicos:</strong> {program.projectsCount}
                  </p>
                  <p>
                    <strong>Execução média:</strong> {program.executionPercent}%
                  </p>
                  <p>
                    <strong>Pilar:</strong> {program.pillarCode}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    render={<Link href={`/publico/programas/${program.id}`} />}
                  >
                    Ver programa
                  </Button>
                </CardContent>
              </Card>
            ))}
            {filteredPrograms.length === 0 && (
              <Card className="md:col-span-2">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum programa público encontrado com os filtros atuais.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
