"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { DataTableCard } from "@/components/shared/data-table-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  FilterToolbar,
  ResultCount,
  SearchField,
} from "@/components/shared/filter-toolbar";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGovernance } from "@/features/governance/store";
import {
  evaluationBand,
  evaluationBandTone,
  evaluationTone,
} from "@/lib/domain/governance";
import {
  EVALUATION_STATUS_LABELS,
  type AnnualEvaluation,
} from "@/types/governance";

export function EvaluationsClient() {
  const { evaluations, upsertEvaluation } = useGovernance();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AnnualEvaluation | null>(null);
  const [segovScore, setSegovScore] = useState("");
  const [plan, setPlan] = useState("");

  const current = useMemo(
    () => evaluations.find((item) => item.year === 2026 && item.code === "AVL-SED-2026"),
    [evaluations],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return evaluations;
    return evaluations.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.contractLabel.toLowerCase().includes(q) ||
        item.organizationAcronym.toLowerCase().includes(q) ||
        String(item.year).includes(q),
    );
  }, [evaluations, query]);

  function openEval(item: AnnualEvaluation) {
    setSelected(item);
    setSegovScore(item.segovScore?.toString() ?? "");
    setPlan(item.improvementPlan);
  }

  function submitSelf() {
    if (!selected) return;
    upsertEvaluation({
      ...selected,
      status: "enviada_segov",
      submittedAt: new Date().toISOString().slice(0, 10),
      improvementPlan: plan.trim() || selected.improvementPlan,
    });
    setSelected(null);
    toast.success("Autoavaliação enviada à SEGOV.");
  }

  function concludeSegov() {
    if (!selected) return;
    const score = Number(segovScore);
    if (Number.isNaN(score) || score < 0 || score > 100) {
      toast.error("Informe a nota SEGOV entre 0 e 100.");
      return;
    }
    upsertEvaluation({
      ...selected,
      segovScore: score,
      improvementPlan: plan.trim() || selected.improvementPlan,
      status: score < 70 ? "com_plano_melhoria" : "concluida",
      evaluatorName: "Fernanda Oliveira Costa",
      evaluatedAt: new Date().toISOString().slice(0, 10),
    });
    setSelected(null);
    toast.success("Avaliação SEGOV registrada.");
  }

  return (
    <div>
      <PageHeader
        title="Avaliações anuais"
        breadcrumbs={[
          { label: "Governança", href: "/avaliacoes" },
          { label: "Avaliações" },
        ]}
      />

      {current && (
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <MetricCard title="Autoavaliação 2026" value={`${current.selfScore}`} />
          <MetricCard
            title="Execução física"
            value={`${current.physicalExecution}%`}
          />
          <MetricCard
            title="Execução financeira"
            value={`${current.financialExecution}%`}
          />
          <MetricCard
            title="Indicadores"
            value={`${current.indicatorsAchievement}%`}
          />
        </div>
      )}

      <FilterToolbar
        trailing={
          <ResultCount
            filtered={filtered.length}
            total={evaluations.length}
            label="avaliação"
          />
        }
      >
        <SearchField
          placeholder="Buscar avaliação..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar avaliação"
        />
      </FilterToolbar>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma avaliação encontrada"
          description="Ajuste a busca para visualizar resultados."
        />
      ) : (
        <DataTableCard>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Contrato / ciclo</TableHead>
                <TableHead>Auto</TableHead>
                <TableHead>SEGOV</TableHead>
                <TableHead>Faixa</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const score = item.segovScore ?? item.selfScore;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.code}</TableCell>
                    <TableCell>
                      <p>{item.contractLabel}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.year} · {item.organizationAcronym}
                      </p>
                    </TableCell>
                    <TableCell>{item.selfScore}</TableCell>
                    <TableCell>{item.segovScore ?? "—"}</TableCell>
                    <TableCell>
                      <StatusBadge
                        label={evaluationBand(score)}
                        tone={evaluationBandTone(score)}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={EVALUATION_STATUS_LABELS[item.status]}
                        tone={evaluationTone(item.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openEval(item)}
                      >
                        Abrir
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DataTableCard>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selected?.code} — avaliação {selected?.year}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid gap-2 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs text-muted-foreground">
                      Física
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-lg font-semibold">
                    {selected.physicalExecution}%
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs text-muted-foreground">
                      Financeira
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-lg font-semibold">
                    {selected.financialExecution}%
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs text-muted-foreground">
                      Indicadores
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-lg font-semibold">
                    {selected.indicatorsAchievement}%
                  </CardContent>
                </Card>
              </div>
              <p>
                <strong>Pontos fortes:</strong> {selected.strengths}
              </p>
              <p>
                <strong>Pontos fracos:</strong> {selected.weaknesses}
              </p>
              <div className="space-y-2">
                <Label htmlFor="plan">Plano de melhoria</Label>
                <textarea
                  id="plan"
                  className="min-h-20 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                />
              </div>
              {(selected.status === "enviada_segov" ||
                selected.status === "em_analise_segov") && (
                <div className="space-y-2">
                  <Label htmlFor="segov-score">Nota SEGOV</Label>
                  <Input
                    id="segov-score"
                    type="number"
                    min={0}
                    max={100}
                    value={segovScore}
                    onChange={(e) => setSegovScore(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelected(null)}
            >
              Fechar
            </Button>
            {selected?.status === "em_autoavaliacao" && (
              <Button type="button" onClick={submitSelf}>
                Enviar à SEGOV
              </Button>
            )}
            {selected &&
              (selected.status === "enviada_segov" ||
                selected.status === "em_analise_segov") && (
                <Button type="button" onClick={concludeSegov}>
                  Concluir análise SEGOV
                </Button>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
