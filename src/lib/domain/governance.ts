import type {
  ApprovalDecision,
  ApprovalItem,
  ApprovalStatus,
  ApprovalStep,
  AuditAction,
  ChangeRequestStatus,
  EvaluationStatus,
} from "@/types/governance";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

export function approvalTone(status: ApprovalStatus): Tone {
  if (status === "aprovado") return "success";
  if (status === "reprovado" || status === "cancelado") return "danger";
  if (status === "ajustes_solicitados") return "warning";
  if (status === "em_analise" || status === "pendente") return "info";
  return "neutral";
}

export function changeTone(status: ChangeRequestStatus): Tone {
  if (status === "aprovada" || status === "aplicada") return "success";
  if (status === "reprovada" || status === "cancelada") return "danger";
  if (status === "em_analise" || status === "enviada") return "info";
  if (status === "rascunho") return "neutral";
  return "warning";
}

export function evaluationTone(status: EvaluationStatus): Tone {
  if (status === "concluida") return "success";
  if (status === "com_plano_melhoria") return "warning";
  if (status === "em_analise_segov" || status === "enviada_segov") return "info";
  return "neutral";
}

export function auditActionTone(action: AuditAction): Tone {
  if (action === "approve" || action === "login") return "success";
  if (action === "reject" || action === "soft_delete") return "danger";
  if (action === "permission_change" || action === "view_restricted") {
    return "warning";
  }
  if (action === "export" || action === "download") return "info";
  return "neutral";
}

export function evaluationBand(score: number) {
  if (score >= 90) return "Excelente";
  if (score >= 75) return "Satisfatório";
  if (score >= 60) return "Regular";
  return "Insuficiente";
}

export function evaluationBandTone(score: number): Tone {
  if (score >= 90) return "success";
  if (score >= 75) return "info";
  if (score >= 60) return "warning";
  return "danger";
}

/** Fluxo institucional: planejamento → secretário → SEGOV. */
export function nextApprovalStep(
  step: ApprovalStep,
): ApprovalStep | null {
  if (step === "planejamento") return "secretario";
  if (step === "secretario") return "segov";
  if (step === "avaliador") return "segov";
  return null;
}

export function applyApprovalDecision(
  item: ApprovalItem,
  decision: ApprovalDecision,
  actor: string,
  note: string,
  at = new Date().toISOString().slice(0, 16).replace("T", " "),
): ApprovalItem {
  const historyEntry = {
    id: crypto.randomUUID(),
    step: item.currentStep,
    actor,
    decision,
    note,
    at,
  };

  if (decision === "aprovar") {
    const next = nextApprovalStep(item.currentStep);
    if (next) {
      return {
        ...item,
        status: "em_analise",
        currentStep: next,
        decision: null,
        decisionNote: null,
        decidedBy: null,
        decidedAt: null,
        history: [...item.history, historyEntry],
      };
    }
    return {
      ...item,
      status: "aprovado",
      decision,
      decisionNote: note,
      decidedBy: actor,
      decidedAt: at,
      history: [...item.history, historyEntry],
    };
  }

  if (decision === "solicitar_ajustes" || decision === "devolver") {
    return {
      ...item,
      status: "ajustes_solicitados",
      currentStep: "planejamento",
      decision,
      decisionNote: note,
      decidedBy: actor,
      decidedAt: at,
      history: [...item.history, historyEntry],
    };
  }

  if (decision === "cancelar") {
    return {
      ...item,
      status: "cancelado",
      decision,
      decisionNote: note,
      decidedBy: actor,
      decidedAt: at,
      history: [...item.history, historyEntry],
    };
  }

  return {
    ...item,
    status: "reprovado",
    decision,
    decisionNote: note,
    decidedBy: actor,
    decidedAt: at,
    history: [...item.history, historyEntry],
  };
}

export function isOpenApproval(status: ApprovalStatus) {
  return status === "pendente" || status === "em_analise";
}

export function daysUntil(dueDate: string, today = "2026-08-04") {
  const due = new Date(dueDate).getTime();
  const now = new Date(today).getTime();
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
}
