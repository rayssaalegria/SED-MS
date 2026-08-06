"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MetricCard } from "@/components/shared/metric-card";
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
import { formatCurrency } from "@/features/management/utils";
import {
  budgetBalance,
  getBudgetAlerts,
  physicalFinancialGap,
} from "@/lib/domain/monitoring";

/** Visão legada de execução financeira por projeto (mantida no módulo). */
export function FinancialExecutionTab() {
  const { budgets } = useMonitoring();
  const { projects } = useManagement();

  const rows = useMemo(
    () =>
      budgets.map((budget) => {
        const project = projects.find((p) => p.id === budget.projectId);
        const physical = project?.executionPercent ?? 0;
        const financial =
          budget.updated > 0 ? (budget.paid / budget.updated) * 100 : 0;
        return {
          budget,
          project,
          physical,
          financial: Math.round(financial * 10) / 10,
          gap: physicalFinancialGap(physical, financial),
          balance: budgetBalance(budget),
          alerts: getBudgetAlerts(budget, physical),
        };
      }),
    [budgets, projects],
  );

  const totals = rows.reduce(
    (acc, row) => {
      acc.planned += row.budget.planned;
      acc.paid += row.budget.paid;
      acc.updated += row.budget.updated;
      return acc;
    },
    { planned: 0, paid: 0, updated: 0 },
  );

  const chartData = rows.map((row) => ({
    name: row.project?.code ?? row.budget.id,
    previsto: row.budget.planned,
    pago: row.budget.paid,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Previsto" value={formatCurrency(totals.planned)} />
        <MetricCard title="Atualizado" value={formatCurrency(totals.updated)} />
        <MetricCard title="Pago" value={formatCurrency(totals.paid)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Previsto versus pago</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) =>
                  formatCurrency(
                    typeof value === "number" ? value : Number(value),
                  )
                }
              />
              <Legend />
              <Bar dataKey="previsto" name="Previsto" fill="#1b2030" />
              <Bar dataKey="pago" name="Pago" fill="#7d141d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projeto</TableHead>
                <TableHead>Físico</TableHead>
                <TableHead>Financeiro</TableHead>
                <TableHead>Diferença</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Alertas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.budget.id}>
                  <TableCell className="font-medium">
                    {row.project?.code ?? "—"}
                    <div className="text-xs text-muted-foreground">
                      {row.project?.name}
                    </div>
                  </TableCell>
                  <TableCell>{row.physical}%</TableCell>
                  <TableCell>{row.financial}%</TableCell>
                  <TableCell>
                    <StatusBadge
                      label={`${row.gap > 0 ? "+" : ""}${row.gap} pp`}
                      tone={
                        row.gap >= 20
                          ? "danger"
                          : row.gap >= 10
                            ? "warning"
                            : "info"
                      }
                    />
                  </TableCell>
                  <TableCell>{formatCurrency(row.budget.paid)}</TableCell>
                  <TableCell>{formatCurrency(row.balance)}</TableCell>
                  <TableCell className="max-w-xs text-xs text-muted-foreground">
                    {row.alerts.length === 0
                      ? "Sem alertas"
                      : row.alerts.join(" ")}
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
