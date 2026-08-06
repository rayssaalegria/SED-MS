export type ContractStatus =
  | "rascunho"
  | "em_elaboracao"
  | "em_validacao_interna"
  | "em_analise_segov"
  | "aguardando_ajustes"
  | "aguardando_assinatura"
  | "pactuado"
  | "em_execucao"
  | "em_revisao"
  | "com_aditivo"
  | "em_avaliacao"
  | "concluido"
  | "suspenso"
  | "cancelado";

export type ProjectStatus =
  | "planejado"
  | "nao_iniciado"
  | "em_andamento"
  | "em_atencao"
  | "atrasado"
  | "paralisado"
  | "em_validacao"
  | "concluido"
  | "concluido_parcialmente"
  | "cancelado";

export type DeliverableStatus =
  | "nao_iniciada"
  | "planejada"
  | "em_andamento"
  | "em_atencao"
  | "atrasada"
  | "aguardando_evidencia"
  | "em_validacao"
  | "ajustes_solicitados"
  | "concluida"
  | "concluida_parcialmente"
  | "nao_executada"
  | "cancelada";

export type ActivityStatus =
  | "nao_iniciada"
  | "em_andamento"
  | "bloqueada"
  | "em_validacao"
  | "concluida";

export type ActivityPriority = "baixa" | "media" | "alta" | "critica";

export interface ManagementCycle {
  id: string;
  year: number;
  name: string;
  status: "ativo" | "encerrado";
}

export interface ManagementContract {
  id: string;
  code: string;
  year: number;
  organizationId: string;
  organizationAcronym: string;
  name: string;
  objective: string;
  governorName: string;
  secretaryName: string;
  managerName: string;
  draftedAt: string;
  pactuatedAt?: string | null;
  signedAt?: string | null;
  startDate: string;
  endDate: string;
  version: number;
  status: ContractStatus;
  executionPercent: number;
  finalScore?: number | null;
  observations?: string;
  isPublic: boolean;
}

export interface Program {
  id: string;
  contractId: string;
  code: string;
  name: string;
  description: string;
  objective: string;
  organizationId: string;
  managingUnit: string;
  targetAudience: string;
  scope: string;
  pillarCode: string;
  ods: string[];
  ppaProgramCode: string;
  status: "ativo" | "em_elaboracao" | "concluido" | "suspenso";
  isPublic: boolean;
}

export interface Project {
  id: string;
  programId: string;
  contractId: string;
  code: string;
  name: string;
  description: string;
  objective: string;
  managerName: string;
  organizationId: string;
  participantOrgs: string[];
  startDate: string;
  endDate: string;
  executionPercent: number;
  weight: number;
  priority: ActivityPriority;
  budgetPlanned: number;
  municipalities: string[];
  beneficiariesPlanned: number;
  beneficiariesReached: number;
  pillarCode: string;
  ods: string[];
  status: ProjectStatus;
  justification?: string;
  observations?: string;
  isPublic: boolean;
}

export interface Deliverable {
  id: string;
  projectId: string;
  code: string;
  title: string;
  description: string;
  unitName: string;
  ownerName: string;
  collaborators: string[];
  startDate: string;
  dueDate: string;
  completedAt?: string | null;
  weight: number;
  plannedTarget: number;
  achievedResult: number;
  unitOfMeasure: string;
  executionPercent: number;
  municipalityName?: string;
  evidenceRequired: boolean;
  hasEvidence: boolean;
  status: DeliverableStatus;
  delayJustification?: string;
  partialJustification?: string;
  observation?: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  deliverableId: string;
  name: string;
  description: string;
  ownerName: string;
  startDate: string;
  endDate: string;
  status: ActivityStatus;
  priority: ActivityPriority;
  dependsOnId?: string | null;
  observation?: string;
  executionPercent: number;
}

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  rascunho: "Rascunho",
  em_elaboracao: "Em elaboração",
  em_validacao_interna: "Em validação interna",
  em_analise_segov: "Em análise pela SEGOV",
  aguardando_ajustes: "Aguardando ajustes",
  aguardando_assinatura: "Aguardando assinatura",
  pactuado: "Pactuado",
  em_execucao: "Em execução",
  em_revisao: "Em revisão",
  com_aditivo: "Com aditivo",
  em_avaliacao: "Em avaliação",
  concluido: "Concluído",
  suspenso: "Suspenso",
  cancelado: "Cancelado",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planejado: "Planejado",
  nao_iniciado: "Não iniciado",
  em_andamento: "Em andamento",
  em_atencao: "Em atenção",
  atrasado: "Atrasado",
  paralisado: "Paralisado",
  em_validacao: "Em validação",
  concluido: "Concluído",
  concluido_parcialmente: "Concluído parcialmente",
  cancelado: "Cancelado",
};

export const DELIVERABLE_STATUS_LABELS: Record<DeliverableStatus, string> = {
  nao_iniciada: "Não iniciada",
  planejada: "Planejada",
  em_andamento: "Em andamento",
  em_atencao: "Em atenção",
  atrasada: "Atrasada",
  aguardando_evidencia: "Aguardando evidência",
  em_validacao: "Em validação",
  ajustes_solicitados: "Ajustes solicitados",
  concluida: "Concluída",
  concluida_parcialmente: "Concluída parcialmente",
  nao_executada: "Não executada",
  cancelada: "Cancelada",
};

export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  nao_iniciada: "Não iniciada",
  em_andamento: "Em andamento",
  bloqueada: "Bloqueada",
  em_validacao: "Em validação",
  concluida: "Concluída",
};
