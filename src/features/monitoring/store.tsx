"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEMO_BUDGETS,
  DEMO_EVIDENCES,
  DEMO_IMPEDIMENTS,
  DEMO_INDICATOR_RESULTS,
  DEMO_INDICATORS,
  DEMO_RISKS,
} from "@/lib/data/demo-monitoring";
import type {
  BudgetItem,
  Evidence,
  Impediment,
  Indicator,
  IndicatorResult,
  Risk,
} from "@/types/monitoring";

interface MonitoringStore {
  indicators: Indicator[];
  indicatorResults: IndicatorResult[];
  evidences: Evidence[];
  budgets: BudgetItem[];
  risks: Risk[];
  impediments: Impediment[];
  upsertIndicator: (indicator: Indicator) => void;
  addIndicatorResult: (result: IndicatorResult) => void;
  upsertEvidence: (evidence: Evidence) => void;
  upsertBudget: (budget: BudgetItem) => void;
  upsertRisk: (risk: Risk) => void;
  upsertImpediment: (impediment: Impediment) => void;
}

const MonitoringContext = createContext<MonitoringStore | null>(null);

export function MonitoringProvider({ children }: { children: ReactNode }) {
  const [indicators, setIndicators] = useState(DEMO_INDICATORS);
  const [indicatorResults, setIndicatorResults] = useState(
    DEMO_INDICATOR_RESULTS,
  );
  const [evidences, setEvidences] = useState(DEMO_EVIDENCES);
  const [budgets, setBudgets] = useState(DEMO_BUDGETS);
  const [risks, setRisks] = useState(DEMO_RISKS);
  const [impediments, setImpediments] = useState(DEMO_IMPEDIMENTS);

  const value = useMemo<MonitoringStore>(
    () => ({
      indicators,
      indicatorResults,
      evidences,
      budgets,
      risks,
      impediments,
      upsertIndicator: (indicator) => {
        setIndicators((prev) => {
          const exists = prev.some((item) => item.id === indicator.id);
          return exists
            ? prev.map((item) =>
                item.id === indicator.id ? indicator : item,
              )
            : [...prev, indicator];
        });
      },
      addIndicatorResult: (result) => {
        setIndicatorResults((prev) => [...prev, result]);
        setIndicators((prev) =>
          prev.map((indicator) =>
            indicator.id === result.indicatorId
              ? {
                  ...indicator,
                  previousResult: indicator.currentResult,
                  currentResult: result.value,
                  updatedAt: result.recordedAt,
                }
              : indicator,
          ),
        );
      },
      upsertEvidence: (evidence) => {
        setEvidences((prev) => {
          const exists = prev.some((item) => item.id === evidence.id);
          return exists
            ? prev.map((item) => (item.id === evidence.id ? evidence : item))
            : [...prev, evidence];
        });
      },
      upsertBudget: (budget) => {
        setBudgets((prev) => {
          const exists = prev.some((item) => item.id === budget.id);
          return exists
            ? prev.map((item) => (item.id === budget.id ? budget : item))
            : [...prev, budget];
        });
      },
      upsertRisk: (risk) => {
        setRisks((prev) => {
          const exists = prev.some((item) => item.id === risk.id);
          return exists
            ? prev.map((item) => (item.id === risk.id ? risk : item))
            : [...prev, risk];
        });
      },
      upsertImpediment: (impediment) => {
        setImpediments((prev) => {
          const exists = prev.some((item) => item.id === impediment.id);
          return exists
            ? prev.map((item) =>
                item.id === impediment.id ? impediment : item,
              )
            : [...prev, impediment];
        });
      },
    }),
    [budgets, evidences, impediments, indicatorResults, indicators, risks],
  );

  return (
    <MonitoringContext.Provider value={value}>
      {children}
    </MonitoringContext.Provider>
  );
}

export function useMonitoring() {
  const ctx = useContext(MonitoringContext);
  if (!ctx) {
    throw new Error(
      "useMonitoring deve ser usado dentro de MonitoringProvider",
    );
  }
  return ctx;
}
