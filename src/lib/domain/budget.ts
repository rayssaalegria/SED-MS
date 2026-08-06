import type {
  BudgetComparison,
  BudgetForecast,
  ContractExecution,
  ProcurementProcess,
} from "@/types/budget";

export function compareBudgetExecution(input: {
  plannedValue: number;
  contractedValue: number;
  executedValue: number;
}): BudgetComparison {
  const planned = input.plannedValue || 0;
  const contracted = input.contractedValue || 0;
  const executed = input.executedValue || 0;
  const utilizationPercent =
    planned > 0 ? Math.round((executed / planned) * 1000) / 10 : 0;

  return {
    plannedValue: planned,
    contractedValue: contracted,
    executedValue: executed,
    difference: planned - contracted,
    remainingBalance: planned - executed,
    utilizationPercent,
    overContracted: contracted > planned,
    overExecuted: executed > planned,
  };
}

export function sumBy<T>(items: T[], pick: (item: T) => number) {
  return items.reduce((sum, item) => sum + pick(item), 0);
}

export function aggregatesForBudget(
  budget: BudgetForecast,
  processes: ProcurementProcess[],
  executions: ContractExecution[],
) {
  const relatedProcesses = processes.filter((p) => p.budgetId === budget.id);
  const relatedExecutions = executions.filter((e) => e.budgetId === budget.id);
  const contractedValue = sumBy(relatedExecutions, (e) => e.contractedValue);
  const executedValue = sumBy(relatedExecutions, (e) => e.executedValue);
  const comparison = compareBudgetExecution({
    plannedValue: budget.plannedValue,
    contractedValue,
    executedValue,
  });

  return {
    relatedProcesses,
    relatedExecutions,
    comparison,
  };
}

export function moduleIndicators(
  budgets: BudgetForecast[],
  processes: ProcurementProcess[],
  executions: ContractExecution[],
) {
  const planned = sumBy(budgets, (b) => b.plannedValue);
  const contracted = sumBy(executions, (e) => e.contractedValue);
  const executed = sumBy(executions, (e) => e.executedValue);
  const inExecution = executions.filter(
    (e) => e.status === "em_execucao" || e.status === "vigente",
  ).length;

  return {
    totalPlanned: planned,
    totalContracted: contracted,
    totalExecuted: executed,
    availableBalance: planned - executed,
    budgetsCount: budgets.length,
    processesCount: processes.length,
    contractsInExecution: inExecution,
  };
}
