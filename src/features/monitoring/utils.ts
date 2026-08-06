import type { IndicatorStatus } from "@/types/monitoring";

export function indicatorTone(
  status: IndicatorStatus,
): "success" | "warning" | "danger" | "info" | "neutral" {
  if (status === "meta_atingida") return "success";
  if (status === "dentro_esperado") return "info";
  if (status === "em_atencao") return "warning";
  if (status === "abaixo_meta") return "danger";
  return "neutral";
}

export function evidenceTone(
  status: string,
): "success" | "warning" | "danger" | "info" | "neutral" {
  if (status === "aprovada") return "success";
  if (status === "em_analise" || status === "enviada") return "info";
  if (status === "complementacao_solicitada") return "warning";
  if (status === "rejeitada") return "danger";
  return "neutral";
}
