import type { Deliverable, Project } from "@/types/management";

/** % do projeto = média ponderada das entregas ativas (não canceladas). */
export function calcProjectExecution(deliverables: Deliverable[]): number {
  const active = deliverables.filter((d) => d.status !== "cancelada");
  const totalWeight = active.reduce((sum, d) => sum + d.weight, 0);
  if (totalWeight <= 0) return 0;
  const weighted = active.reduce(
    (sum, d) => sum + d.executionPercent * d.weight,
    0,
  );
  return Math.round((weighted / totalWeight) * 10) / 10;
}

/** % do contrato = média ponderada dos projetos ativos. */
export function calcContractExecution(projects: Project[]): number {
  const active = projects.filter((p) => p.status !== "cancelado");
  const totalWeight = active.reduce((sum, p) => sum + p.weight, 0);
  if (totalWeight <= 0) return 0;
  const weighted = active.reduce(
    (sum, p) => sum + p.executionPercent * p.weight,
    0,
  );
  return Math.round((weighted / totalWeight) * 10) / 10;
}

export function isDeliverableOverdue(deliverable: Deliverable, today = new Date()): boolean {
  if (
    deliverable.status === "concluida" ||
    deliverable.status === "concluida_parcialmente" ||
    deliverable.status === "cancelada"
  ) {
    return false;
  }
  const due = new Date(deliverable.dueDate);
  return due < today;
}

export function isDueSoon(deliverable: Deliverable, days = 15, today = new Date()): boolean {
  if (
    deliverable.status === "concluida" ||
    deliverable.status === "concluida_parcialmente" ||
    deliverable.status === "cancelada"
  ) {
    return false;
  }
  const due = new Date(deliverable.dueDate);
  const limit = new Date(today);
  limit.setDate(limit.getDate() + days);
  return due >= today && due <= limit;
}

export type DeliverableValidationError =
  | "evidence_required"
  | "delay_justification_required"
  | "partial_justification_required";

export function validateDeliverableCompletion(
  deliverable: Pick<
    Deliverable,
    | "status"
    | "evidenceRequired"
    | "hasEvidence"
    | "delayJustification"
    | "partialJustification"
    | "dueDate"
  >,
  options: { completedAt?: string | null } = {},
): DeliverableValidationError | null {
  const completedAt = options.completedAt
    ? new Date(options.completedAt)
    : new Date();
  const due = new Date(deliverable.dueDate);
  const late = completedAt > due;

  if (
    (deliverable.status === "concluida" ||
      deliverable.status === "concluida_parcialmente") &&
    deliverable.evidenceRequired &&
    !deliverable.hasEvidence
  ) {
    return "evidence_required";
  }

  if (
    (deliverable.status === "atrasada" || late) &&
    !deliverable.delayJustification?.trim() &&
    deliverable.status !== "cancelada" &&
    deliverable.status !== "nao_iniciada" &&
    deliverable.status !== "planejada"
  ) {
    if (
      deliverable.status === "atrasada" ||
      deliverable.status === "concluida" ||
      deliverable.status === "concluida_parcialmente"
    ) {
      return "delay_justification_required";
    }
  }

  if (
    deliverable.status === "concluida_parcialmente" &&
    !deliverable.partialJustification?.trim()
  ) {
    return "partial_justification_required";
  }

  return null;
}

export const VALIDATION_MESSAGES: Record<DeliverableValidationError, string> = {
  evidence_required:
    "Não é possível concluir a entrega sem evidência obrigatória anexada.",
  delay_justification_required:
    "Entregas atrasadas exigem justificativa de atraso.",
  partial_justification_required:
    "Conclusão parcial exige justificativa.",
};
