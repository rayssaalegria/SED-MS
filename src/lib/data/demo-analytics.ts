import { MUNICIPALITIES } from "@/lib/data/municipalities";
import type {
  AgendaEvent,
  AttentionItem,
  ExportJob,
  MapStatus,
  MonthlySeriesPoint,
  MunicipalityMetric,
  OrgExecutionPoint,
  ReportDefinition,
} from "@/types/analytics";

/** Execução por unidade da SED (escopo exclusivo da secretaria). */
export const DEMO_ORG_EXECUTION: OrgExecutionPoint[] = [
  { org: "Gabinete", execution: 78, projects: 1, delayed: 0 },
  { org: "SIE", execution: 68, projects: 2, delayed: 1 },
  { org: "SPP", execution: 74, projects: 2, delayed: 0 },
  { org: "CTE", execution: 71, projects: 1, delayed: 0 },
];

export const DEMO_MONTHLY_SERIES: MonthlySeriesPoint[] = [
  { month: "Jan", fisica: 18, financeira: 12, metas: 20 },
  { month: "Fev", fisica: 26, financeira: 19, metas: 28 },
  { month: "Mar", fisica: 34, financeira: 27, metas: 35 },
  { month: "Abr", fisica: 41, financeira: 33, metas: 42 },
  { month: "Mai", fisica: 49, financeira: 40, metas: 50 },
  { month: "Jun", fisica: 55, financeira: 46, metas: 57 },
  { month: "Jul", fisica: 62, financeira: 52, metas: 64 },
  { month: "Ago", fisica: 68, financeira: 58, metas: 71 },
];

export const DEMO_ATTENTION_ITEMS: AttentionItem[] = [
  {
    id: "att-01",
    title: "Projeto conectividade escolar com atraso",
    org: "SIE",
    tone: "danger",
    label: "Atrasado",
    category: "projeto",
  },
  {
    id: "att-02",
    title: "Metas do CG-SED-2026 próximas do vencimento",
    org: "Gabinete",
    tone: "warning",
    label: "Atenção",
    category: "meta",
  },
  {
    id: "att-03",
    title: "Formação continuada — polo Dourados sem atualização",
    org: "SPP",
    tone: "warning",
    label: "Sem atualização",
    category: "atualizacao",
  },
  {
    id: "att-04",
    title: "Risco crítico de aquisição de equipamentos",
    org: "SIE",
    tone: "danger",
    label: "Risco crítico",
    category: "risco",
  },
  {
    id: "att-05",
    title: "Evidências rejeitadas aguardando complementação",
    org: "CTE",
    tone: "info",
    label: "Pendência",
    category: "evidencia",
  },
];

const PRIORITY_MUNICIPALITIES: Record<
  string,
  Partial<MunicipalityMetric> & { status: MapStatus }
> = {
  "Campo Grande": {
    projects: 4,
    deliverables: 8,
    investment: 18500000,
    executionPercent: 74,
    status: "em_andamento",
  },
  Dourados: {
    projects: 2,
    deliverables: 3,
    investment: 6200000,
    executionPercent: 46,
    status: "atrasado",
  },
  Três: {
    projects: 1,
    deliverables: 2,
    investment: 2100000,
    executionPercent: 58,
    status: "em_atencao",
  },
  Aquidauana: {
    projects: 1,
    deliverables: 1,
    investment: 980000,
    executionPercent: 25,
    status: "em_atencao",
  },
  Corumbá: {
    projects: 1,
    deliverables: 2,
    investment: 1500000,
    executionPercent: 80,
    status: "em_andamento",
  },
  Ponta: {
    projects: 1,
    deliverables: 1,
    investment: 870000,
    executionPercent: 100,
    status: "concluido",
  },
};

function hashName(name: string) {
  return name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

function metricFor(name: string): Partial<MunicipalityMetric> & {
  status: MapStatus;
} {
  for (const [key, value] of Object.entries(PRIORITY_MUNICIPALITIES)) {
    if (name.startsWith(key) || name.includes(key)) return value;
  }
  const h = hashName(name);
  const bucket = h % 5;
  if (bucket === 0) {
    return {
      projects: 1,
      deliverables: 1 + (h % 2),
      investment: 400000 + (h % 7) * 120000,
      executionPercent: 70 + (h % 25),
      status: "em_andamento",
    };
  }
  if (bucket === 1) {
    return {
      projects: 1,
      deliverables: 1,
      investment: 250000 + (h % 5) * 80000,
      executionPercent: 45 + (h % 20),
      status: "em_atencao",
    };
  }
  if (bucket === 2) {
    return {
      projects: 1,
      deliverables: 1,
      investment: 300000,
      executionPercent: 100,
      status: "concluido",
    };
  }
  if (bucket === 3) {
    return {
      projects: 1,
      deliverables: 1,
      investment: 500000,
      executionPercent: 30 + (h % 15),
      status: "atrasado",
    };
  }
  return {
    projects: 0,
    deliverables: 0,
    investment: 0,
    executionPercent: 0,
    status: "sem_projeto",
  };
}

export const DEMO_MUNICIPALITY_METRICS: MunicipalityMetric[] =
  MUNICIPALITIES.map((mun) => {
    const extra = metricFor(mun.name);
    return {
      municipalityId: mun.id,
      name: mun.name,
      region: mun.region,
      latitude: mun.latitude,
      longitude: mun.longitude,
      projects: extra.projects ?? 0,
      deliverables: extra.deliverables ?? 0,
      investment: extra.investment ?? 0,
      executionPercent: extra.executionPercent ?? 0,
      status: extra.status,
    };
  });

export const DEMO_AGENDA_EVENTS: AgendaEvent[] = [
  {
    id: "ag-01",
    title: "Comitê estadual de Contratos de Gestão",
    type: "comitê",
    date: "2026-08-06",
    time: "09:00",
    organizationAcronym: "SEGOV",
    location: "Palácio do Governo — Campo Grande",
    relatedLabel: "Ciclo 2026",
    status: "agendado",
  },
  {
    id: "ag-02",
    title: "Prazo — validação SEGOV do CG-SED-2026",
    type: "prazo",
    date: "2026-08-08",
    organizationAcronym: "SEGOV",
    location: "Sistema SID-SED",
    relatedLabel: "CG-SED-2026",
    status: "agendado",
  },
  {
    id: "ag-03",
    title: "Entrega de kits de conectividade — Campo Grande",
    type: "entrega",
    date: "2026-08-12",
    time: "14:00",
    organizationAcronym: "SED",
    location: "CRE Centro",
    relatedLabel: "ENT-2026-004",
    status: "agendado",
  },
  {
    id: "ag-04",
    title: "Reunião de mitigação — risco de aquisição",
    type: "reuniao",
    date: "2026-08-14",
    time: "10:30",
    organizationAcronym: "SED",
    location: "SIE — SED",
    relatedLabel: "PRJ-SED-2026-02",
    status: "agendado",
  },
  {
    id: "ag-05",
    title: "Avaliação parcial SED — plano de melhoria",
    type: "avaliacao",
    date: "2026-08-20",
    time: "15:00",
    organizationAcronym: "SED",
    location: "Gabinete do Secretário",
    relatedLabel: "AVL-SED-2026-SEM",
    status: "agendado",
  },
  {
    id: "ag-06",
    title: "Auditoria amostral de evidências",
    type: "auditoria",
    date: "2026-08-25",
    time: "09:30",
    organizationAcronym: "SEGOV",
    location: "Remoto",
    relatedLabel: "Evidências Q3",
    status: "agendado",
  },
  {
    id: "ag-07",
    title: "Formação continuada — turma 2",
    type: "entrega",
    date: "2026-08-18",
    organizationAcronym: "SED",
    location: "Polo Dourados",
    relatedLabel: "ENT-2026-007",
    status: "agendado",
  },
  {
    id: "ag-08",
    title: "Comitê de julho — registro concluído",
    type: "comitê",
    date: "2026-07-10",
    time: "09:00",
    organizationAcronym: "SEGOV",
    location: "Palácio do Governo",
    status: "concluido",
  },
];

export const DEMO_REPORT_DEFINITIONS: ReportDefinition[] = [
  {
    id: "rep-01",
    code: "REL-EXEC-EST",
    name: "Execução consolidada da SED",
    description:
      "Resumo de contratos, projetos, entregas e alertas da Secretaria de Educação.",
    audience: "Secretário / SEGOV",
    formats: ["csv", "pdf"],
    defaultFilters: ["ciclo=2026", "org=SED"],
  },
  {
    id: "rep-02",
    code: "REL-SED-DET",
    name: "Detalhamento da SED",
    description:
      "Projetos, indicadores, orçamento e pendências por unidade da SED.",
    audience: "Secretário / Planejamento",
    formats: ["csv", "xlsx"],
    defaultFilters: ["org=SED", "ciclo=2026"],
  },
  {
    id: "rep-03",
    code: "REL-MUN",
    name: "Painel municipal da educação",
    description: "Investimento, projetos e status por município da rede SED.",
    audience: "Gabinete / Territorial",
    formats: ["csv"],
    defaultFilters: ["ano=2026"],
  },
  {
    id: "rep-04",
    code: "REL-RISCOS",
    name: "Matriz de riscos críticos",
    description: "Riscos com criticidade alta/crítica e planos de tratamento.",
    audience: "Gestores SED",
    formats: ["csv", "pdf"],
    defaultFilters: ["criticidade>=12"],
  },
  {
    id: "rep-05",
    code: "REL-APROV",
    name: "Fila de aprovações e prazos",
    description: "Pendências abertas, vencimentos e histórico recente.",
    audience: "Aprovadores",
    formats: ["csv"],
    defaultFilters: ["status=abertas"],
  },
];

export const DEMO_EXPORT_JOBS: ExportJob[] = [
  {
    id: "exp-01",
    reportCode: "REL-EXEC-EST",
    reportName: "Execução consolidada da SED",
    format: "csv",
    requestedBy: "Fernanda Oliveira Costa",
    requestedAt: "2026-08-03 16:40",
    status: "disponivel",
    rowCount: 4,
    fileName: "execucao-sed-2026-08-03.csv",
  },
  {
    id: "exp-02",
    reportCode: "REL-MUN",
    reportName: "Painel municipal da educação",
    format: "csv",
    requestedBy: "Ana Paula Ribeiro",
    requestedAt: "2026-08-02 11:15",
    status: "disponivel",
    rowCount: 79,
    fileName: "painel-municipal-educacao-2026-08-02.csv",
  },
  {
    id: "exp-03",
    reportCode: "REL-SED-DET",
    reportName: "Detalhamento da SED",
    format: "xlsx",
    requestedBy: "Juliana Ferreira Santos",
    requestedAt: "2026-08-01 09:05",
    status: "disponivel",
    rowCount: 28,
    fileName: "sed-detalhe-2026-08-01.xlsx",
  },
];
