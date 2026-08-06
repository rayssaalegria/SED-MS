"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MUNICIPALITIES,
  type MunicipalityRegion,
} from "@/lib/data/municipalities";

const regions: Array<MunicipalityRegion | "Todas"> = [
  "Todas",
  "Centro",
  "Norte",
  "Sul",
  "Leste",
  "Pantanal",
];

export function MunicipalitiesClient() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<MunicipalityRegion | "Todas">("Todas");

  const filtered = useMemo(() => {
    return MUNICIPALITIES.filter((item) => {
      const matchesRegion = region === "Todas" || item.region === region;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.ibgeCode.includes(q);
      return matchesRegion && matchesQuery;
    });
  }, [query, region]);

  return (
    <div>
      <PageHeader
        title="Municípios"
        description="Cadastro dos 79 municípios de Mato Grosso do Sul para gestão territorial e vinculação a projetos."
        breadcrumbs={[
          { label: "Gestão territorial", href: "/municipios" },
          { label: "Municípios" },
        ]}
      />

      <Card className="mb-4 border-border/80 shadow-sm">
        <CardContent className="flex flex-col gap-3 pt-6 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por município ou código IBGE..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Buscar município"
            />
          </div>
          <Select
            value={region}
            onValueChange={(value) =>
              setRegion((value as MunicipalityRegion | "Todas") ?? "Todas")
            }
          >
            <SelectTrigger className="w-full md:w-[200px]" aria-label="Filtrar por região">
              <SelectValue placeholder="Região" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item === "Todas" ? "Todas as regiões" : item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground whitespace-nowrap">
            {filtered.length} municípios encontrados
          </p>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum município encontrado"
          description="Ajuste a busca ou o filtro de região para visualizar resultados."
        />
      ) : (
        <Card className="border-border/80 shadow-sm">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Município</TableHead>
                  <TableHead>IBGE</TableHead>
                  <TableHead>Região</TableHead>
                  <TableHead>População estimada</TableHead>
                  <TableHead>Situação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.ibgeCode}</TableCell>
                    <TableCell>{item.region}</TableCell>
                    <TableCell>
                      {item.estimatedPopulation.toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <StatusBadge label="Ativo" tone="success" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
