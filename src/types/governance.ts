export type ApprovalEntityType =
  | "contrato"
  | "projeto"
  | "entrega"
  | "evidencia"
  | "alteracao"
  | "aditivo"
  | "avaliacao"
  | "indicador";

export type ApprovalStep =
  | "planejamento"
  | "secretario"
  | "segov"
  | "avaliador";

export type ApprovalStatus =
  | "pendente"
  | "em_analise"
  | "aprovado"
  | "reprovado"
  | "ajustes_solicitados"
  | "cancelado";

export type ApprovalDecision =
  | "aprovar"
  | "reprovar"
  | "solicitar_ajustes"
  | "devolver"
  | "cancelar";

export type ChangeRequestType =
  | "prazo"
  | "meta"
  | "orcamento"
  | "escopo"
  | "responsavel"
  | "indicador"
  | "entrega";

export type ChangeRequestStatus =
  | "rascunho"
  | "enviada"
  | "em_analise"
  | "aprovada"
  | "reprovada"
  | "aplicada"
  | "cancelada";

export type AmendmentType =
  | "prazo"
  | "valor"
  | "escopo"
  | "metas"
  | "clausulas"
  | "misto";

export type AmendmentStatus =
  | "rascunho"
  | "em_elaboracao"
  | "em_analise"
  | "aguardando_assinatura"
  | "vigente"
  | "rejeitado"
  | "cancelado";

export type EvaluationStatus =
  | "nao_iniciada"
  | "em_autoavaliacao"
  | "enviada_segov"
  | "em_analise_segov"
  | "concluida"
  | "com_plano_melhoria";

export type AuditAction =
  | "login"
  | "logout"
  | "create"
  | "update"
  | "soft_delete"
  | "status_change"
  | "approve"
  | "reject"
  | "upload"
  | "download"
  | "view_restricted"
  | "permission_change"
  | "export";

export interface ApprovalItem {
  id: string;
  title: string;
  description: string;
  entityType: ApprovalEntityType;
  entityId: string;
  entityLabel: string;
  organizationAcronym: string;
  currentStep: ApprovalStep;
  status: ApprovalStatus;
  requestedBy: string;
  requestedAt: string;
  dueDate: string;
  priority: "baixa" | "media" | "alta" | "critica";
  decision?: ApprovalDecision | null;
  decisionNote?: string | null;
  decidedBy?: string | null;
  decidedAt?: string | null;
  history: ApprovalHistoryEntry[];
}

export interface ApprovalHistoryEntry {
  id: string;
  step: ApprovalStep;
  actor: string;
  decision: ApprovalDecision | "encaminhar";
  note: string;
  at: string;
}

export interface ChangeRequest {
  id: string;
  code: string;
  title: string;
  type: ChangeRequestType;
  entityType: ApprovalEntityType;
  entityId: string;
  entityLabel: string;
  previousValue: string;
  newValue: string;
  reason: string;
  technicalJustification: string;
  impact: "baixo" | "medio" | "alto" | "critico";
  requestedBy: string;
  requestedAt: string;
  status: ChangeRequestStatus;
  reviewerName?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  contractId?: string;
  projectId?: string;
}

export interface ContractAmendment {
  id: string;
  code: string;
  contractId: string;
  contractLabel: string;
  version: number;
  type: AmendmentType;
  title: string;
  summary: string;
  previousClause: string;
  newClause: string;
  valueImpact: number;
  daysImpact: number;
  status: AmendmentStatus;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  effectiveDate?: string | null;
}

export interface AnnualEvaluation {
  id: string;
  code: string;
  contractId: string;
  contractLabel: string;
  year: number;
  organizationAcronym: string;
  status: EvaluationStatus;
  selfScore: number;
  segovScore: number | null;
  physicalExecution: number;
  financialExecution: number;
  indicatorsAchievement: number;
  strengths: string;
  weaknesses: string;
  improvementPlan: string;
  evaluatorName?: string | null;
  evaluatedAt?: string | null;
  submittedAt?: string | null;
}

export interface AuditLogEntry {
  id: string;
  at: string;
  userName: string;
  userEmail: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  organizationAcronym: string;
  summary: string;
  ipAddress?: string;
  previousValue?: string;
  newValue?: string;
}

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pendente: "Pendente",
  em_analise: "Em análise",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
  ajustes_solicitados: "Ajustes solicitados",
  cancelado: "Cancelado",
};

export const APPROVAL_STEP_LABELS: Record<ApprovalStep, string> = {
  planejamento: "Planejamento",
  secretario: "Secretário",
  segov: "SEGOV",
  avaliador: "Avaliador",
};

export const APPROVAL_DECISION_LABELS: Record<ApprovalDecision, string> = {
  aprovar: "Aprovar",
  reprovar: "Reprovar",
  solicitar_ajustes: "Solicitar ajustes",
  devolver: "Devolver",
  cancelar: "Cancelar",
};

export const APPROVAL_ENTITY_LABELS: Record<ApprovalEntityType, string> = {
  contrato: "Contrato",
  projeto: "Projeto",
  entrega: "Entrega",
  evidencia: "Evidência",
  alteracao: "Alteração",
  aditivo: "Aditivo",
  avaliacao: "Avaliação",
  indicador: "Indicador",
};

export const CHANGE_TYPE_LABELS: Record<ChangeRequestType, string> = {
  prazo: "Prazo",
  meta: "Meta",
  orcamento: "Orçamento",
  escopo: "Escopo",
  responsavel: "Responsável",
  indicador: "Indicador",
  entrega: "Entrega",
};

export const CHANGE_STATUS_LABELS: Record<ChangeRequestStatus, string> = {
  rascunho: "Rascunho",
  enviada: "Enviada",
  em_analise: "Em análise",
  aprovada: "Aprovada",
  reprovada: "Reprovada",
  aplicada: "Aplicada",
  cancelada: "Cancelada",
};

export const AMENDMENT_TYPE_LABELS: Record<AmendmentType, string> = {
  prazo: "Prazo",
  valor: "Valor",
  escopo: "Escopo",
  metas: "Metas",
  clausulas: "Cláusulas",
  misto: "Misto",
};

export const AMENDMENT_STATUS_LABELS: Record<AmendmentStatus, string> = {
  rascunho: "Rascunho",
  em_elaboracao: "Em elaboração",
  em_analise: "Em análise",
  aguardando_assinatura: "Aguardando assinatura",
  vigente: "Vigente",
  rejeitado: "Rejeitado",
  cancelado: "Cancelado",
};

export const EVALUATION_STATUS_LABELS: Record<EvaluationStatus, string> = {
  nao_iniciada: "Não iniciada",
  em_autoavaliacao: "Em autoavaliação",
  enviada_segov: "Enviada à SEGOV",
  em_analise_segov: "Em análise SEGOV",
  concluida: "Concluída",
  com_plano_melhoria: "Com plano de melhoria",
};

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  login: "Login",
  logout: "Logout",
  create: "Criação",
  update: "Atualização",
  soft_delete: "Exclusão lógica",
  status_change: "Mudança de situação",
  approve: "Aprovação",
  reject: "Reprovação",
  upload: "Upload",
  download: "Download",
  view_restricted: "Acesso restrito",
  permission_change: "Permissão",
  export: "Exportação",
};
