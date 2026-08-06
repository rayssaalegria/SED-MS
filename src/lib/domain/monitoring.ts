import type {
  Indicator,
  IndicatorPolarity,
  IndicatorStatus,
  BudgetItem,
  Risk,
} from "@/types/monitoring";

export function calcAchievementPercent(
  result: number,
  target: number,
  polarity: IndicatorPolarity,
): number {
  if (target === 0) return 0;
  if (polarity === "menor_melhor") {
    if (result <= 0) return 100;
    return Math.round((target / result) * 1000) / 10;
  }
  if (polarity === "binaria") {
    return result >= target ? 100 : 0;
  }
  return Math.round((result / target) * 1000) / 10;
}

export function resolveIndicatorStatus(indicator: Indicator): IndicatorStatus {
  if (indicator.currentResult == null || Number.isNaN(indicator.currentResult)) {
    return "sem_informacao";
  }

  const percent = calcAchievementPercent(
    indicator.currentResult,
    indicator.annualTarget,
    indicator.polarity,
  );

  if (indicator.polarity === "binaria") {
    return percent >= 100 ? "meta_atingida" : "abaixo_meta";
  }

  if (percent >= 100) return "meta_atingida";
  if (percent >= 90) return "dentro_esperado";
  if (percent >= 70) return "em_atencao";
  return "abaixo_meta";
}

export function resolveTrend(current: number, previous: number, polarity: IndicatorPolarity) {
  if (current === previous) return "estavel" as const;
  const improved =
    polarity === "menor_melhor" ? current < previous : current > previous;
  return improved ? ("alta" as const) : ("baixa" as const);
}

export function budgetBalance(item: BudgetItem) {
  return item.updated - item.paid;
}

export function physicalFinancialGap(
  physicalPercent: number,
  financialPercent: number,
) {
  return Math.round((financialPercent - physicalPercent) * 10) / 10;
}

export function getBudgetAlerts(
  item: BudgetItem,
  physicalPercent: number,
): string[] {
  const alerts: string[] = [];
  const financialPercent =
    item.updated > 0 ? (item.paid / item.updated) * 100 : 0;

  if (financialPercent - physicalPercent >= 20) {
    alerts.push("Execução financeira muito acima da execução física.");
  }
  if (item.updated > 0 && item.paid / item.updated >= 0.9) {
    alerts.push("Orçamento próximo de ser totalmente utilizado.");
  }
  if (item.planned === 0 && item.updated === 0) {
    alerts.push("Projeto sem informação financeira.");
  }
  if (item.paid > item.planned && item.planned > 0) {
    alerts.push("Valor pago ultrapassou o previsto.");
  }
  return alerts;
}

export function riskCriticality(probability: number, impact: number) {
  return probability * impact;
}

export function riskCriticalityLabel(score: number) {
  if (score >= 20) return "Crítica";
  if (score >= 12) return "Alta";
  if (score >= 6) return "Média";
  return "Baixa";
}

export function riskTone(score: number): "danger" | "warning" | "info" | "success" {
  if (score >= 20) return "danger";
  if (score >= 12) return "warning";
  if (score >= 6) return "info";
  return "success";
}

export function sortRisksByCriticality(risks: Risk[]) {
  return [...risks].sort(
    (a, b) =>
      riskCriticality(b.probability, b.impact) -
      riskCriticality(a.probability, a.impact),
  );
}
