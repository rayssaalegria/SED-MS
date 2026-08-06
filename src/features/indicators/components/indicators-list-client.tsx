"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTableCard } from "@/components/shared/data-table-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  FilterToolbar,
  ResultCount,
  SearchField,
} from "@/components/shared/filter-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
import { DetailSheet } from "@/components/shared/detail-sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMonitoring } from "@/features/monitoring/store";
import { useManagement } from "@/features/management/store";
import { indicatorTone } from "@/features/monitoring/utils";
import { formatDate } from "@/features/management/utils";
import {
  calcAchievementPercent,
  resolveIndicatorStatus,
  resolveTrend,
} from "@/lib/domain/monitoring";
import { INDICATOR_STATUS_LABELS, type Indicator } from "@/types/monitoring";

export function IndicatorsListClient() {
  const { indicators } = useMonitoring();
  const { projects } = useManagement();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Indicator | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return indicators;
    return indicators.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.ownerName.toLowerCase().includes(q),
    );
  }, [indicators, query]);

  const selectedProject = selected?.projectId
    ? projects.find((p) => p.id === selected.projectId)
    : undefined;

  return (
    <div>
      <PageHeader
        title="Indicadores"
        description="Clique em uma linha para ver todos os campos do indicador."
        breadcrumbs={[
          { label: "Gestão estratégica", href: "/indicadores" },
          { label: "Indicadores" },
        ]}
      />

      <FilterToolbar
        trailing={
          <ResultCount
            filtered={filtered.length}
            total={indicators.length}
            label="indicador"
          />
        }
      >
        <SearchField
          placeholder="Buscar indicador..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar indicador"
        />
      </FilterToolbar>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum indicador encontrado"
          description="Ajuste a busca para visualizar resultados."
        />
      ) : (
        <DataTableCard>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Indicador</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Meta</TableHead>
                <TableHead>Atingimento</TableHead>
                <TableHead>Tendência</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((indicator) => {
                const status = resolveIndicatorStatus(indicator);
                const percent = calcAchievementPercent(
                  indicator.currentResult,
                  indicator.annualTarget,
                  indicator.polarity,
                );
                const trend = resolveTrend(
                  indicator.currentResult,
                  indicator.previousResult,
                  indicator.polarity,
                );
                const TrendIcon =
                  trend === "alta"
                    ? ArrowUpRight
                    : trend === "baixa"
                      ? ArrowDownRight
                      : Minus;
                return (
                  <TableRow
                    key={indicator.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelected(indicator)}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelected(indicator);
                      }
                    }}
                    aria-label={`Detalhes do indicador ${indicator.code}`}
                  >
                    <TableCell className="font-medium text-[#7d141d]">
                      {indicator.code}
                    </TableCell>
                    <TableCell>{indicator.name}</TableCell>
                    <TableCell>
                      {indicator.currentResult} {indicator.unitOfMeasure}
                    </TableCell>
                    <TableCell>
                      {indicator.annualTarget} {indicator.unitOfMeasure}
                    </TableCell>
                    <TableCell>{percent}%</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm">
                        <TrendIcon className="size-4" aria-hidden />
                        {trend === "alta"
                          ? "Em alta"
                          : trend === "baixa"
                            ? "Em baixa"
                            : "Estável"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={INDICATOR_STATUS_LABELS[status]}
                        tone={indicatorTone(status)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DataTableCard>
      )}

      <DetailSheet
        open={!!selected}
        onOpenChange={(isOpen) => !isOpen && setSelected(null)}
        contextLabel="Indicador"
        title={selected?.name ?? "Indicador"}
        description={selected?.periodicity}
        metaLabel="Código"
        metaValue={selected?.code}
        metaSubtext={
          selected ? `Atualizado em ${formatDate(selected.updatedAt)}` : undefined
        }
        fields={
          selected
            ? (() => {
                const status = resolveIndicatorStatus(selected);
                const percent = calcAchievementPercent(
                  selected.currentResult,
                  selected.annualTarget,
                  selected.polarity,
                );
                const trend = resolveTrend(
                  selected.currentResult,
                  selected.previousResult,
                  selected.polarity,
                );
                return [
                  { label: "Código", value: selected.code },
                  { label: "Nome", value: selected.name },
                  { label: "Descrição", value: selected.description },
                  { label: "Fórmula", value: selected.formula },
                  {
                    label: "Unidade de medida",
                    value: selected.unitOfMeasure,
                  },
                  { label: "Fonte de dados", value: selected.dataSource },
                  { label: "Periodicidade", value: selected.periodicity },
                  {
                    label: "Linha de base",
                    value: `${selected.baseline} (${selected.baselineYear})`,
                  },
                  {
                    label: "Meta anual",
                    value: `${selected.annualTarget} ${selected.unitOfMeasure}`,
                  },
                  {
                    label: "Resultado atual",
                    value: `${selected.currentResult} ${selected.unitOfMeasure}`,
                  },
                  {
                    label: "Resultado anterior",
                    value: `${selected.previousResult} ${selected.unitOfMeasure}`,
                  },
                  { label: "Atingimento", value: `${percent}%` },
                  {
                    label: "Tendência",
                    value:
                      trend === "alta"
                        ? "Em alta"
                        : trend === "baixa"
                          ? "Em baixa"
                          : "Estável",
                  },
                  { label: "Polaridade", value: selected.polarity },
                  { label: "Responsável", value: selected.ownerName },
                  { label: "Validador", value: selected.validatorName },
                  {
                    label: "Projeto",
                    value: selectedProject
                      ? `${selectedProject.code} — ${selectedProject.name}`
                      : "—",
                  },
                  { label: "Pilar", value: selected.pillarCode },
                  { label: "ODS", value: selected.ods.join(", ") },
                  {
                    label: "Status",
                    value: (
                      <StatusBadge
                        label={INDICATOR_STATUS_LABELS[status]}
                        tone={indicatorTone(status)}
                      />
                    ),
                  },
                  {
                    label: "Observação",
                    value: selected.observation ?? "—",
                  },
                  {
                    label: "Atualizado em",
                    value: formatDate(selected.updatedAt),
                  },
                ];
              })()
            : []
        }
        footerHref={selected ? `/indicadores/${selected.id}` : undefined}
      />
    </div>
  );
}
