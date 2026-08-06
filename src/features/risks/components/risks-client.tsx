"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTableCard } from "@/components/shared/data-table-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  FilterToolbar,
  ResultCount,
  SearchField,
} from "@/components/shared/filter-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { useMonitoring } from "@/features/monitoring/store";
import {
  riskCriticality,
  riskCriticalityLabel,
  riskTone,
  sortRisksByCriticality,
} from "@/lib/domain/monitoring";
import {
  RISK_CATEGORY_LABELS,
  RISK_STATUS_LABELS,
} from "@/types/monitoring";
import { cn } from "@/lib/utils";

export function RisksClient() {
  const { risks } = useMonitoring();
  const { projects } = useManagement();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(risks[0]?.id ?? null);

  const sorted = useMemo(() => sortRisksByCriticality(risks), [risks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((risk) => {
      const project = projects.find((p) => p.id === risk.projectId);
      return (
        risk.title.toLowerCase().includes(q) ||
        risk.ownerName.toLowerCase().includes(q) ||
        RISK_CATEGORY_LABELS[risk.category].toLowerCase().includes(q) ||
        (project?.code.toLowerCase().includes(q) ?? false)
      );
    });
  }, [projects, query, sorted]);

  const selectedRisk =
    filtered.find((item) => item.id === selected) ??
    sorted.find((item) => item.id === selected) ??
    filtered[0] ??
    sorted[0];

  return (
    <div>
      <PageHeader
        title="Riscos"
        breadcrumbs={[
          { label: "Execução", href: "/riscos" },
          { label: "Riscos" },
        ]}
      />

      <div className="mb-6 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Matriz probabilidade × impacto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-1 text-center text-xs">
              <div />
              {[1, 2, 3, 4, 5].map((impact) => (
                <div key={impact} className="font-medium text-muted-foreground">
                  I{impact}
                </div>
              ))}
              {[5, 4, 3, 2, 1].map((probability) => (
                <div key={probability} className="contents">
                  <div className="flex items-center justify-center font-medium text-muted-foreground">
                    P{probability}
                  </div>
                  {[1, 2, 3, 4, 5].map((impact) => {
                    const cellRisks = risks.filter(
                      (r) =>
                        r.probability === probability && r.impact === impact,
                    );
                    const score = probability * impact;
                    return (
                      <button
                        key={`${probability}-${impact}`}
                        type="button"
                        className={cn(
                          "min-h-14 rounded-md border p-1",
                          score >= 20
                            ? "bg-red-100 border-red-200"
                            : score >= 12
                              ? "bg-amber-100 border-amber-200"
                              : score >= 6
                                ? "bg-sky-50 border-sky-100"
                                : "bg-emerald-50 border-emerald-100",
                        )}
                        onClick={() => {
                          if (cellRisks[0]) setSelected(cellRisks[0].id);
                        }}
                        aria-label={`Probabilidade ${probability}, impacto ${impact}, ${cellRisks.length} riscos`}
                      >
                        {cellRisks.length > 0 ? (
                          <span className="font-semibold">
                            {cellRisks.length}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">·</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalhe do risco</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {selectedRisk ? (
              <>
                <p className="font-medium">{selectedRisk.title}</p>
                <StatusBadge
                  label={riskCriticalityLabel(
                    riskCriticality(
                      selectedRisk.probability,
                      selectedRisk.impact,
                    ),
                  )}
                  tone={riskTone(
                    riskCriticality(
                      selectedRisk.probability,
                      selectedRisk.impact,
                    ),
                  )}
                />
                <p>{selectedRisk.description}</p>
                <p>
                  <strong>Categoria:</strong>{" "}
                  {RISK_CATEGORY_LABELS[selectedRisk.category]}
                </p>
                <p>
                  <strong>Causa:</strong> {selectedRisk.cause}
                </p>
                <p>
                  <strong>Consequência:</strong> {selectedRisk.consequence}
                </p>
                <p>
                  <strong>Preventivo:</strong> {selectedRisk.preventivePlan}
                </p>
                <p>
                  <strong>Contingência:</strong>{" "}
                  {selectedRisk.contingencyPlan}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">Selecione um risco.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <FilterToolbar
        trailing={
          <ResultCount
            filtered={filtered.length}
            total={risks.length}
            label="risco"
          />
        }
      >
        <SearchField
          placeholder="Buscar risco..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar risco"
        />
      </FilterToolbar>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum risco encontrado"
          description="Ajuste a busca para visualizar resultados."
        />
      ) : (
        <DataTableCard>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Risco</TableHead>
                <TableHead>Projeto</TableHead>
                <TableHead>P×I</TableHead>
                <TableHead>Criticidade</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((risk) => {
                const project = projects.find((p) => p.id === risk.projectId);
                const score = riskCriticality(risk.probability, risk.impact);
                return (
                  <TableRow
                    key={risk.id}
                    className="cursor-pointer"
                    onClick={() => setSelected(risk.id)}
                  >
                    <TableCell className="font-medium">{risk.title}</TableCell>
                    <TableCell>{project?.code ?? "—"}</TableCell>
                    <TableCell>
                      {risk.probability}×{risk.impact} = {score}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={riskCriticalityLabel(score)}
                        tone={riskTone(score)}
                      />
                    </TableCell>
                    <TableCell>{risk.ownerName}</TableCell>
                    <TableCell>{RISK_STATUS_LABELS[risk.status]}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DataTableCard>
      )}
    </div>
  );
}
