"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/shared/metric-card";
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
import { useBudgetModule } from "@/features/budgets/store";
import { aggregatesForBudget } from "@/lib/domain/budget";
import { formatCurrency, formatDate } from "@/features/management/utils";
import {
  BUDGET_SOURCE_LABELS,
  BUDGET_STATUS_LABELS,
  CONTRACT_EXECUTION_STATUS_LABELS,
  PROCUREMENT_STATUS_LABELS,
  PROCUREMENT_TYPE_LABELS,
  PROJECT_BUDGET_TYPE_LABELS,
} from "@/types/budget";
import { cn } from "@/lib/utils";

export function BudgetDetailClient({ id }: { id: string }) {
  const { getBudgetById, processes, executions } = useBudgetModule();
  const budget = getBudgetById(id);

  if (!budget) {
    return (
      <div>
        <PageHeader
          title="Orçamento não encontrado"
          breadcrumbs={[
            { label: "Orçamento", href: "/orcamento" },
            { label: "Detalhe" },
          ]}
        />
        <Card>
          <CardContent className="space-y-3 pt-6">
            <p className="text-sm text-muted-foreground">
              O orçamento solicitado não existe ou foi excluído.
            </p>
            <Button nativeButton={false} render={<Link href="/orcamento" />}>
              Voltar ao módulo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { relatedProcesses, relatedExecutions, comparison } =
    aggregatesForBudget(budget, processes, executions);

  return (
    <div>
      <PageHeader
        title={budget.projectName}
        description={`${budget.code} · ciclo de previsão → contratação → execução`}
        breadcrumbs={[
          { label: "Orçamento", href: "/orcamento" },
          { label: budget.code },
        ]}
        actions={
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href="/orcamento" />}
          >
            Voltar
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Valor previsto"
          value={formatCurrency(comparison.plannedValue)}
        />
        <MetricCard
          title="Valor contratado"
          value={formatCurrency(comparison.contractedValue)}
        />
        <MetricCard
          title="Valor executado"
          value={formatCurrency(comparison.executedValue)}
        />
        <MetricCard
          title="Saldo restante"
          value={formatCurrency(comparison.remainingBalance)}
        />
      </div>

      {(comparison.overContracted || comparison.overExecuted) && (
        <Card className="mb-6 border-destructive/40 bg-destructive/5">
          <CardContent className="flex items-start gap-2 pt-6 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div>
              {comparison.overContracted
                ? "Valor contratado ultrapassou o previsto. "
                : null}
              {comparison.overExecuted
                ? "Valor executado ultrapassou o previsto."
                : null}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Tipo:</strong>{" "}
              {PROJECT_BUDGET_TYPE_LABELS[budget.projectType]}
            </p>
            <p>
              <strong>Descrição:</strong> {budget.description || "—"}
            </p>
            <p>
              <strong>Previsão:</strong> {formatDate(budget.forecastDate)}
            </p>
            <p>
              <strong>Criação:</strong> {formatDate(budget.createdAt)}
            </p>
            <p>
              <strong>Cadastro:</strong> {BUDGET_SOURCE_LABELS[budget.source]}
              {budget.sourceFileName ? ` (${budget.sourceFileName})` : ""}
            </p>
            <p className="flex items-center gap-2">
              <strong>Status:</strong>
              <StatusBadge
                label={BUDGET_STATUS_LABELS[budget.status]}
                tone="info"
              />
            </p>
            <p>
              <strong>Observações:</strong> {budget.observations ?? "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Indicadores de execução</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Diferença (previsto − contratado):</strong>{" "}
              <span
                className={cn(
                  comparison.overContracted && "font-medium text-destructive",
                )}
              >
                {formatCurrency(comparison.difference)}
              </span>
            </p>
            <p>
              <strong>Saldo restante:</strong>{" "}
              {formatCurrency(comparison.remainingBalance)}
            </p>
            <p>
              <strong>% orçamento utilizado:</strong>{" "}
              {comparison.utilizationPercent}%
            </p>
            <p>
              <strong>Processos vinculados:</strong> {relatedProcesses.length}
            </p>
            <p>
              <strong>Contratos vinculados:</strong> {relatedExecutions.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">
            Processos de contratação relacionados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor do processo</TableHead>
                <TableHead>Abertura</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatedProcesses.map((process) => (
                <TableRow key={process.id}>
                  <TableCell className="font-medium">
                    {process.processNumber}
                  </TableCell>
                  <TableCell>
                    {PROCUREMENT_TYPE_LABELS[process.processType]}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(process.processValue)}
                  </TableCell>
                  <TableCell>{formatDate(process.openedAt)}</TableCell>
                  <TableCell>
                    {PROCUREMENT_STATUS_LABELS[process.status]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {relatedProcesses.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum processo vinculado a este orçamento.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contratos relacionados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contrato</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Contratado</TableHead>
                <TableHead>Executado</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>%</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatedExecutions.map((item) => {
                const remaining = item.plannedValue - item.executedValue;
                const percent =
                  item.plannedValue > 0
                    ? Math.round(
                        (item.executedValue / item.plannedValue) * 1000,
                      ) / 10
                    : 0;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.contractNumber}
                    </TableCell>
                    <TableCell>{item.supplierName}</TableCell>
                    <TableCell>
                      {formatCurrency(item.contractedValue)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(item.executedValue)}
                    </TableCell>
                    <TableCell>{formatCurrency(remaining)}</TableCell>
                    <TableCell>{percent}%</TableCell>
                    <TableCell>
                      {CONTRACT_EXECUTION_STATUS_LABELS[item.status]}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {relatedExecutions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum contrato vinculado a este orçamento.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
