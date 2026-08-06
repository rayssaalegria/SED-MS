"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { formatCurrency, projectTone } from "@/features/management/utils";
import { PROJECT_STATUS_LABELS } from "@/types/management";

export function ProjectsListClient() {
  const { projects } = useManagement();
  const [query, setQuery] = useState("");

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

  return (
    <div>
      <PageHeader
        title="Projetos"
        description="Projetos estratégicos do ciclo, com execução calculada pelas entregas."
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
    </div>
  );
}
