"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BudgetsTab } from "@/features/budgets/components/budgets-tab";
import { ProcurementTab } from "@/features/budgets/components/procurement-tab";
import { ContractExecutionTab } from "@/features/budgets/components/contract-execution-tab";
import { FinancialExecutionTab } from "@/features/budgets/components/financial-execution-tab";
import { useBudgetModule } from "@/features/budgets/store";
import { moduleIndicators } from "@/lib/domain/budget";
import { formatCurrency } from "@/features/management/utils";
import {
  BUDGET_SOURCE_LABELS,
  BUDGET_STATUS_LABELS,
  PROJECT_BUDGET_TYPE_LABELS,
} from "@/types/budget";

type BudgetTab =
  | "orcamentos"
  | "processos"
  | "execucao"
  | "financeiro";

const TAB_VALUES: BudgetTab[] = [
  "orcamentos",
  "processos",
  "execucao",
  "financeiro",
];

function parseTab(value: string | null): BudgetTab {
  if (value && TAB_VALUES.includes(value as BudgetTab)) {
    return value as BudgetTab;
  }
  return "orcamentos";
}

export function BudgetModuleClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("aba"));
  const { budgets, processes, executions } = useBudgetModule();

  const [projectFilter, setProjectFilter] = useState("todos");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [sourceFilter, setSourceFilter] = useState("todos");
  const [processFilter, setProcessFilter] = useState("todos");
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");

  const filteredBudgets = useMemo(() => {
    return budgets.filter((budget) => {
      if (projectFilter !== "todos" && budget.projectId !== projectFilter) {
        return false;
      }
      if (typeFilter !== "todos" && budget.projectType !== typeFilter) {
        return false;
      }
      if (statusFilter !== "todos" && budget.status !== statusFilter) {
        return false;
      }
      if (sourceFilter !== "todos" && budget.source !== sourceFilter) {
        return false;
      }
      if (periodFrom && budget.forecastDate < periodFrom) return false;
      if (periodTo && budget.forecastDate > periodTo) return false;
      if (processFilter !== "todos") {
        const hasProcess = processes.some(
          (p) => p.budgetId === budget.id && p.id === processFilter,
        );
        if (!hasProcess) return false;
      }
      return true;
    });
  }, [
    budgets,
    processes,
    projectFilter,
    typeFilter,
    statusFilter,
    sourceFilter,
    periodFrom,
    periodTo,
    processFilter,
  ]);

  const filteredBudgetIds = useMemo(
    () => new Set(filteredBudgets.map((b) => b.id)),
    [filteredBudgets],
  );

  const filteredProcesses = useMemo(
    () => processes.filter((p) => filteredBudgetIds.has(p.budgetId)),
    [processes, filteredBudgetIds],
  );

  const filteredExecutions = useMemo(
    () => executions.filter((e) => filteredBudgetIds.has(e.budgetId)),
    [executions, filteredBudgetIds],
  );

  const indicators = moduleIndicators(
    filteredBudgets,
    filteredProcesses,
    filteredExecutions,
  );

  const projectOptions = useMemo(() => {
    const map = new Map<string, string>();
    budgets.forEach((b) => map.set(b.projectId, b.projectName));
    return [...map.entries()];
  }, [budgets]);

  function setTab(next: BudgetTab) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "orcamentos") params.delete("aba");
    else params.set("aba", next);
    const query = params.toString();
    router.replace(query ? `/orcamento?${query}` : "/orcamento");
  }

  return (
    <div>
      <PageHeader
        title="Orçamento e previsão"
        description="Fluxo: previsão de gastos → processo de contratação → execução contratual."
        breadcrumbs={[
          { label: "Execução", href: "/orcamento" },
          { label: "Orçamento" },
        ]}
      />

      <div className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total previsto"
          value={formatCurrency(indicators.totalPlanned)}
        />
        <MetricCard
          title="Total contratado"
          value={formatCurrency(indicators.totalContracted)}
        />
        <MetricCard
          title="Total executado"
          value={formatCurrency(indicators.totalExecuted)}
        />
        <MetricCard
          title="Saldo disponível"
          value={formatCurrency(indicators.availableBalance)}
        />
      </div>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Orçamentos"
          value={indicators.budgetsCount}
        />
        <MetricCard
          title="Processos"
          value={indicators.processesCount}
        />
        <MetricCard
          title="Contratos em execução"
          value={indicators.contractsInExecution}
        />
      </div>

      <Card className="mb-6">
        <CardContent className="grid gap-3 pt-6 md:grid-cols-2 xl:grid-cols-3">
          <Select
            value={projectFilter}
            onValueChange={(value) => setProjectFilter(value ?? "todos")}
          >
            <SelectTrigger aria-label="Filtrar projeto">
              <SelectValue placeholder="Projeto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os projetos</SelectItem>
              {projectOptions.map(([id, name]) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value ?? "todos")}
          >
            <SelectTrigger aria-label="Filtrar tipo">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              {Object.entries(PROJECT_BUDGET_TYPE_LABELS).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value ?? "todos")}
          >
            <SelectTrigger aria-label="Filtrar status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {Object.entries(BUDGET_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sourceFilter}
            onValueChange={(value) => setSourceFilter(value ?? "todos")}
          >
            <SelectTrigger aria-label="Filtrar forma de cadastro">
              <SelectValue placeholder="Cadastro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as formas</SelectItem>
              {Object.entries(BUDGET_SOURCE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={processFilter}
            onValueChange={(value) => setProcessFilter(value ?? "todos")}
          >
            <SelectTrigger aria-label="Filtrar processo">
              <SelectValue placeholder="Processo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os processos</SelectItem>
              {processes.map((process) => (
                <SelectItem key={process.id} value={process.id}>
                  {process.processNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              aria-label="Período inicial"
              value={periodFrom}
              onChange={(e) => setPeriodFrom(e.target.value)}
            />
            <Input
              type="date"
              aria-label="Período final"
              value={periodTo}
              onChange={(e) => setPeriodTo(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(parseTab(value))}
      >
        <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="orcamentos">
            Orçamentos / Previsão
          </TabsTrigger>
          <TabsTrigger value="processos">Processos de Contratação</TabsTrigger>
          <TabsTrigger value="execucao">Execução Contratual</TabsTrigger>
          <TabsTrigger value="financeiro">Execução financeira</TabsTrigger>
        </TabsList>

        <TabsContent value="orcamentos">
          <BudgetsTab items={filteredBudgets} />
        </TabsContent>
        <TabsContent value="processos">
          <ProcurementTab
            budgets={filteredBudgets}
            processes={filteredProcesses}
          />
        </TabsContent>
        <TabsContent value="execucao">
          <ContractExecutionTab
            budgets={filteredBudgets}
            processes={filteredProcesses}
            executions={filteredExecutions}
          />
        </TabsContent>
        <TabsContent value="financeiro">
          <FinancialExecutionTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
