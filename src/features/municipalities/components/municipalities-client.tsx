"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTableCard } from "@/components/shared/data-table-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  FilterToolbar,
  ResultCount,
  SearchField,
  filterFieldClass,
} from "@/components/shared/filter-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
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
import {
  MUNICIPALITIES,
  type MunicipalityRegion,
} from "@/lib/data/municipalities";
import { cn } from "@/lib/utils";

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

      <FilterToolbar
        trailing={
          <ResultCount
            filtered={filtered.length}
            total={MUNICIPALITIES.length}
            label="município"
          />
        }
      >
        <SearchField
          placeholder="Buscar por município ou código IBGE..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Buscar município"
        />
        <Select
          value={region}
          onValueChange={(value) =>
            setRegion((value as MunicipalityRegion | "Todas") ?? "Todas")
          }
        >
          <SelectTrigger
            className={cn(filterFieldClass, "w-[180px]")}
            aria-label="Filtrar por região"
          >
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
      </FilterToolbar>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum município encontrado"
          description="Ajuste a busca ou o filtro de região para visualizar resultados."
        />
      ) : (
        <DataTableCard>
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
        </DataTableCard>
      )}
    </div>
  );
}
