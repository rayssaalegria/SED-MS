export type IndicatorPolarity =
  | "maior_melhor"
  | "menor_melhor"
  | "faixa_ideal"
  | "binaria";

export type IndicatorStatus =
  | "meta_atingida"
  | "dentro_esperado"
  | "em_atencao"
  | "abaixo_meta"
  | "sem_informacao";

export type EvidenceType =
  | "relatorio"
  | "fotografia"
  | "video"
  | "planilha"
  | "ata"
  | "oficio"
  | "processo"
  | "ordem_servico"
  | "contrato"
  | "termo"
  | "publicacao"
  | "lista_presenca"
  | "certificado"
  | "nota_fiscal"
  | "link"
  | "documento_tecnico"
  | "georreferenciado";

export type EvidenceStatus =
  | "enviada"
  | "em_analise"
  | "aprovada"
  | "rejeitada"
  | "complementacao_solicitada"
  | "substituida";

export type RiskCategory =
  | "orcamentario"
  | "juridico"
  | "operacional"
  | "tecnologico"
  | "ambiental"
  | "politico"
  | "contratual"
  | "recursos_humanos"
  | "aquisicao"
  | "prazo"
  | "comunicacao"
  | "dependencia_municipal"
  | "dependencia_outro_orgao";

export type RiskStatus =
  | "identificado"
  | "em_tratamento"
  | "monitorado"
  | "mitigado"
  | "materializado"
  | "encerrado";

export type ImpedimentStatus =
  | "aberto"
  | "em_analise"
  | "em_tratamento"
  | "dependencia_externa"
  | "resolvido"
  | "cancelado";

export interface Indicator {
  id: string;
  code: string;
  name: string;
  description: string;
  formula: string;
  unitOfMeasure: string;
  dataSource: string;
  periodicity: "mensal" | "trimestral" | "anual";
  baseline: number;
  baselineYear: number;
  annualTarget: number;
  monthlyTarget?: number;
  quarterlyTarget?: number;
  currentResult: number;
  previousResult: number;
  polarity: IndicatorPolarity;
  ownerName: string;
  validatorName: string;
  updatedAt: string;
  projectId?: string;
  pillarCode: string;
  ods: string[];
  observation?: string;
}

export interface IndicatorResult {
  id: string;
  indicatorId: string;
  period: string;
  value: number;
  target: number;
  recordedAt: string;
  recordedBy: string;
}

export interface Evidence {
  id: string;
  name: string;
  type: EvidenceType;
  description: string;
  fileName?: string;
  fileSize?: string;
  externalLink?: string;
  evidenceDate: string;
  ownerName: string;
  deliverableId?: string;
  projectId?: string;
  version: number;
  accessLevel: "publico" | "interno" | "restrito";
  status: EvidenceStatus;
  reviewNote?: string;
  submittedAt: string;
  validatedAt?: string | null;
  reviewerName?: string | null;
}

export interface BudgetItem {
  id: string;
  projectId: string;
  year: number;
  budgetUnit: string;
  budgetProgram: string;
  budgetAction: string;
  fundingSource: string;
  expenseNature: string;
  planned: number;
  updated: number;
  committed: number;
  settled: number;
  paid: number;
  counterpart: number;
  agreement?: string;
  resourceType: "tesouro" | "convenio" | "fundo" | "outro";
  observation?: string;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  projectId: string;
  category: RiskCategory;
  probability: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  cause: string;
  consequence: string;
  ownerName: string;
  preventivePlan: string;
  contingencyPlan: string;
  treatmentDueDate: string;
  status: RiskStatus;
  reviewedAt: string;
}

export interface Impediment {
  id: string;
  title: string;
  description: string;
  projectId: string;
  deliverableId?: string;
  solverName: string;
  involvedOrg: string;
  identifiedAt: string;
  dueDate: string;
  impact: "baixo" | "medio" | "alto" | "critico";
  priority: "baixa" | "media" | "alta" | "critica";
  status: ImpedimentStatus;
  solution?: string;
}

export const INDICATOR_STATUS_LABELS: Record<IndicatorStatus, string> = {
  meta_atingida: "Meta atingida",
  dentro_esperado: "Dentro do esperado",
  em_atencao: "Em atenção",
  abaixo_meta: "Abaixo da meta",
  sem_informacao: "Sem informação",
};

export const EVIDENCE_STATUS_LABELS: Record<EvidenceStatus, string> = {
  enviada: "Enviada",
  em_analise: "Em análise",
  aprovada: "Aprovada",
  rejeitada: "Rejeitada",
  complementacao_solicitada: "Complementação solicitada",
  substituida: "Substituída",
};

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  relatorio: "Relatório",
  fotografia: "Fotografia",
  video: "Vídeo",
  planilha: "Planilha",
  ata: "Ata",
  oficio: "Ofício",
  processo: "Processo administrativo",
  ordem_servico: "Ordem de serviço",
  contrato: "Contrato",
  termo: "Termo",
  publicacao: "Publicação oficial",
  lista_presenca: "Lista de presença",
  certificado: "Certificado",
  nota_fiscal: "Nota fiscal",
  link: "Link",
  documento_tecnico: "Documento técnico",
  georreferenciado: "Arquivo georreferenciado",
};

export const RISK_STATUS_LABELS: Record<RiskStatus, string> = {
  identificado: "Identificado",
  em_tratamento: "Em tratamento",
  monitorado: "Monitorado",
  mitigado: "Mitigado",
  materializado: "Materializado",
  encerrado: "Encerrado",
};

export const RISK_CATEGORY_LABELS: Record<RiskCategory, string> = {
  orcamentario: "Orçamentário",
  juridico: "Jurídico",
  operacional: "Operacional",
  tecnologico: "Tecnológico",
  ambiental: "Ambiental",
  politico: "Político",
  contratual: "Contratual",
  recursos_humanos: "Recursos humanos",
  aquisicao: "Aquisição",
  prazo: "Prazo",
  comunicacao: "Comunicação",
  dependencia_municipal: "Dependência municipal",
  dependencia_outro_orgao: "Dependência de outro órgão",
};

export const IMPEDIMENT_STATUS_LABELS: Record<ImpedimentStatus, string> = {
  aberto: "Aberto",
  em_analise: "Em análise",
  em_tratamento: "Em tratamento",
  dependencia_externa: "Dependência externa",
  resolvido: "Resolvido",
  cancelado: "Cancelado",
};
