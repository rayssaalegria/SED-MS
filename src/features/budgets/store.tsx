"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEMO_BUDGET_FORECASTS,
  DEMO_CONTRACT_EXECUTIONS,
  DEMO_PROCUREMENT_PROCESSES,
} from "@/lib/data/demo-budgets";
import type {
  BudgetForecast,
  ContractExecution,
  ProcurementProcess,
} from "@/types/budget";

interface BudgetModuleContextValue {
  budgets: BudgetForecast[];
  processes: ProcurementProcess[];
  executions: ContractExecution[];
  upsertBudget: (item: BudgetForecast) => void;
  softDeleteBudget: (id: string) => void;
  upsertProcess: (item: ProcurementProcess) => void;
  softDeleteProcess: (id: string) => void;
  upsertExecution: (item: ContractExecution) => void;
  softDeleteExecution: (id: string) => void;
  getBudgetById: (id: string) => BudgetForecast | undefined;
}

const BudgetModuleContext = createContext<BudgetModuleContextValue | null>(
  null,
);

export function BudgetModuleProvider({ children }: { children: ReactNode }) {
  const [budgets, setBudgets] = useState(DEMO_BUDGET_FORECASTS);
  const [processes, setProcesses] = useState(DEMO_PROCUREMENT_PROCESSES);
  const [executions, setExecutions] = useState(DEMO_CONTRACT_EXECUTIONS);
  const [deletedBudgetIds, setDeletedBudgetIds] = useState<string[]>([]);
  const [deletedProcessIds, setDeletedProcessIds] = useState<string[]>([]);
  const [deletedExecutionIds, setDeletedExecutionIds] = useState<string[]>([]);

  const visibleBudgets = useMemo(
    () => budgets.filter((b) => !deletedBudgetIds.includes(b.id)),
    [budgets, deletedBudgetIds],
  );
  const visibleProcesses = useMemo(
    () => processes.filter((p) => !deletedProcessIds.includes(p.id)),
    [processes, deletedProcessIds],
  );
  const visibleExecutions = useMemo(
    () => executions.filter((e) => !deletedExecutionIds.includes(e.id)),
    [executions, deletedExecutionIds],
  );

  const upsertBudget = useCallback((item: BudgetForecast) => {
    setBudgets((prev) => {
      const index = prev.findIndex((b) => b.id === item.id);
      if (index === -1) return [...prev, item];
      const next = [...prev];
      next[index] = item;
      return next;
    });
    setDeletedBudgetIds((prev) => prev.filter((id) => id !== item.id));
  }, []);

  const softDeleteBudget = useCallback((id: string) => {
    setDeletedBudgetIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const upsertProcess = useCallback((item: ProcurementProcess) => {
    setProcesses((prev) => {
      const index = prev.findIndex((p) => p.id === item.id);
      if (index === -1) return [...prev, item];
      const next = [...prev];
      next[index] = item;
      return next;
    });
    setDeletedProcessIds((prev) => prev.filter((id) => id !== item.id));
  }, []);

  const softDeleteProcess = useCallback((id: string) => {
    setDeletedProcessIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const upsertExecution = useCallback((item: ContractExecution) => {
    setExecutions((prev) => {
      const index = prev.findIndex((e) => e.id === item.id);
      if (index === -1) return [...prev, item];
      const next = [...prev];
      next[index] = item;
      return next;
    });
    setDeletedExecutionIds((prev) => prev.filter((id) => id !== item.id));
  }, []);

  const softDeleteExecution = useCallback((id: string) => {
    setDeletedExecutionIds((prev) =>
      prev.includes(id) ? prev : [...prev, id],
    );
  }, []);

  const getBudgetById = useCallback(
    (id: string) => visibleBudgets.find((b) => b.id === id),
    [visibleBudgets],
  );

  const value = useMemo(
    () => ({
      budgets: visibleBudgets,
      processes: visibleProcesses,
      executions: visibleExecutions,
      upsertBudget,
      softDeleteBudget,
      upsertProcess,
      softDeleteProcess,
      upsertExecution,
      softDeleteExecution,
      getBudgetById,
    }),
    [
      visibleBudgets,
      visibleProcesses,
      visibleExecutions,
      upsertBudget,
      softDeleteBudget,
      upsertProcess,
      softDeleteProcess,
      upsertExecution,
      softDeleteExecution,
      getBudgetById,
    ],
  );

  return (
    <BudgetModuleContext.Provider value={value}>
      {children}
    </BudgetModuleContext.Provider>
  );
}

export function useBudgetModule() {
  const ctx = useContext(BudgetModuleContext);
  if (!ctx) {
    throw new Error("useBudgetModule must be used within BudgetModuleProvider");
  }
  return ctx;
}
