export type MapStatus =
  | "sem_projeto"
  | "em_andamento"
  | "em_atencao"
  | "atrasado"
  | "concluido";

export type AgendaEventType =
  | "prazo"
  | "reuniao"
  | "avaliacao"
  | "entrega"
  | "comitê"
  | "auditoria";

export type ReportFormat = "csv" | "pdf" | "xlsx";

export type ReportStatus = "disponivel" | "gerando" | "erro";

export interface OrgExecutionPoint {
  org: string;
  execution: number;
  projects: number;
  delayed: number;
}

export interface MonthlySeriesPoint {
  month: string;
  fisica: number;
  financeira: number;
  metas: number;
}

export interface MunicipalityMetric {
  municipalityId: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  projects: number;
  deliverables: number;
  investment: number;
  executionPercent: number;
  status: MapStatus;
}

export interface AttentionItem {
  id: string;
  title: string;
  org: string;
  label: string;
  tone: "danger" | "warning" | "info" | "success" | "neutral";
  category: "projeto" | "meta" | "risco" | "evidencia" | "atualizacao";
}

export interface AgendaEvent {
  id: string;
  title: string;
  type: AgendaEventType;
  date: string;
  time?: string;
  organizationAcronym: string;
  location: string;
  relatedLabel?: string;
  status: "agendado" | "concluido" | "cancelado";
}

export interface ReportDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  audience: string;
  formats: ReportFormat[];
  defaultFilters: string[];
}

export interface ExportJob {
  id: string;
  reportCode: string;
  reportName: string;
  format: ReportFormat;
  requestedBy: string;
  requestedAt: string;
  status: ReportStatus;
  rowCount: number;
  fileName: string;
}

export const MAP_STATUS_LABELS: Record<MapStatus, string> = {
  sem_projeto: "Sem projeto",
  em_andamento: "Em andamento",
  em_atencao: "Em atenção",
  atrasado: "Atrasado",
  concluido: "Concluído",
};

export const AGENDA_TYPE_LABELS: Record<AgendaEventType, string> = {
  prazo: "Prazo",
  reuniao: "Reunião",
  avaliacao: "Avaliação",
  entrega: "Entrega",
  comitê: "Comitê",
  auditoria: "Auditoria",
};
