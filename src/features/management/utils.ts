import type {
  ContractStatus,
  DeliverableStatus,
  ProjectStatus,
} from "@/types/management";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

export function contractTone(status: ContractStatus): Tone {
  if (status === "em_execucao" || status === "pactuado") return "info";
  if (status === "concluido") return "success";
  if (status === "suspenso" || status === "cancelado") return "danger";
  if (status === "aguardando_ajustes" || status === "em_revisao") return "warning";
  return "neutral";
}

export function projectTone(status: ProjectStatus): Tone {
  if (status === "concluido") return "success";
  if (status === "atrasado" || status === "cancelado") return "danger";
  if (status === "em_atencao" || status === "paralisado") return "warning";
  if (status === "em_andamento" || status === "em_validacao") return "info";
  return "neutral";
}

export function deliverableTone(status: DeliverableStatus): Tone {
  if (status === "concluida") return "success";
  if (
    status === "atrasada" ||
    status === "nao_executada" ||
    status === "cancelada"
  ) {
    return "danger";
  }
  if (status === "em_atencao" || status === "ajustes_solicitados") return "warning";
  if (status === "em_andamento" || status === "em_validacao") return "info";
  return "neutral";
}

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
}
