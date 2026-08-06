/** Módulo Orçamento e Previsão — SED/MS */

export type BudgetEntrySource = "manual" | "arquivo";

export type BudgetForecastStatus =
  | "rascunho"
  | "em_analise"
  | "aprovado"
  | "em_execucao"
  | "encerrado"
  | "cancelado";

export type ProjectBudgetType =
  | "infraestrutura"
  | "tecnologia"
  | "pedagogico"
  | "formacao"
  | "inclusao"
  | "outro";

export type ProcurementProcessType =
  | "licitacao"
  | "pregao"
  | "dispensa"
  | "inexigibilidade"
  | "contratacao_direta"
  | "outro";

export type ProcurementProcessStatus =
  | "rascunho"
  | "aberto"
  | "em_andamento"
  | "homologado"
  | "deserto"
  | "fracassado"
  | "cancelado";

export type ContractExecutionStatus =
  | "rascunho"
  | "vigente"
  | "em_execucao"
  | "paralisado"
  | "encerrado"
  | "rescindido";

export interface BudgetForecast {
  id: string;
  code: string;
  projectId: string;
  projectName: string;
  projectType: ProjectBudgetType;
  description: string;
  plannedValue: number;
  forecastDate: string;
  createdAt: string;
  source: BudgetEntrySource;
  sourceFileName?: string;
  status: BudgetForecastStatus;
  observations?: string;
}

export interface ProcurementProcess {
  id: string;
  processNumber: string;
  processType: ProcurementProcessType;
  budgetId: string;
  projectId: string;
  plannedValue: number;
  processValue: number;
  openedAt: string;
  status: ProcurementProcessStatus;
  observations?: string;
}

export interface ContractExecution {
  id: string;
  budgetId: string;
  projectId: string;
  procurementId: string;
  contractNumber: string;
  supplierName: string;
  plannedValue: number;
  contractedValue: number;
  executedValue: number;
  startDate: string;
  endDate: string;
  status: ContractExecutionStatus;
  observations?: string;
}

export interface BudgetComparison {
  plannedValue: number;
  contractedValue: number;
  executedValue: number;
  difference: number;
  remainingBalance: number;
  utilizationPercent: number;
  overContracted: boolean;
  overExecuted: boolean;
}

export const BUDGET_STATUS_LABELS: Record<BudgetForecastStatus, string> = {
  rascunho: "Rascunho",
  em_analise: "Em análise",
  aprovado: "Aprovado",
  em_execucao: "Em execução",
  encerrado: "Encerrado",
  cancelado: "Cancelado",
};

export const PROJECT_BUDGET_TYPE_LABELS: Record<ProjectBudgetType, string> = {
  infraestrutura: "Infraestrutura",
  tecnologia: "Tecnologia",
  pedagogico: "Pedagógico",
  formacao: "Formação",
  inclusao: "Inclusão",
  outro: "Outro",
};

export const BUDGET_SOURCE_LABELS: Record<BudgetEntrySource, string> = {
  manual: "Manual",
  arquivo: "Arquivo",
};

export const PROCUREMENT_TYPE_LABELS: Record<ProcurementProcessType, string> = {
  licitacao: "Licitação",
  pregao: "Pregão",
  dispensa: "Dispensa",
  inexigibilidade: "Inexigibilidade",
  contratacao_direta: "Contratação direta",
  outro: "Outro",
};

export const PROCUREMENT_STATUS_LABELS: Record<
  ProcurementProcessStatus,
  string
> = {
  rascunho: "Rascunho",
  aberto: "Aberto",
  em_andamento: "Em andamento",
  homologado: "Homologado",
  deserto: "Deserto",
  fracassado: "Fracassado",
  cancelado: "Cancelado",
};

export const CONTRACT_EXECUTION_STATUS_LABELS: Record<
  ContractExecutionStatus,
  string
> = {
  rascunho: "Rascunho",
  vigente: "Vigente",
  em_execucao: "Em execução",
  paralisado: "Paralisado",
  encerrado: "Encerrado",
  rescindido: "Rescindido",
};
