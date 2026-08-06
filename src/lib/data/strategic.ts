export interface StrategicPillar {
  id: string;
  code: string;
  name: string;
  description: string;
  status: "ativo" | "inativo";
}

export interface OdsItem {
  id: string;
  number: number;
  name: string;
  status: "ativo" | "inativo";
}

export interface PpaProgram {
  id: string;
  code: string;
  name: string;
  axis: string;
  status: "ativo" | "inativo";
}

export const STRATEGIC_PILLARS: StrategicPillar[] = [
  {
    id: "pillar-inclusivo",
    code: "MS-INC",
    name: "MS Inclusivo",
    description: "Políticas de inclusão social, cidadania e redução de desigualdades.",
    status: "ativo",
  },
  {
    id: "pillar-prospero",
    code: "MS-PRO",
    name: "MS Próspero",
    description: "Desenvolvimento econômico, emprego, renda e competitividade.",
    status: "ativo",
  },
  {
    id: "pillar-verde",
    code: "MS-VER",
    name: "MS Verde",
    description: "Sustentabilidade ambiental, bioeconomia e transição ecológica.",
    status: "ativo",
  },
  {
    id: "pillar-digital",
    code: "MS-DIG",
    name: "MS Digital",
    description: "Transformação digital, conectividade e inovação na gestão pública.",
    status: "ativo",
  },
];

export const ODS_ITEMS: OdsItem[] = [
  { id: "ods-4", number: 4, name: "Educação de qualidade", status: "ativo" },
  { id: "ods-3", number: 3, name: "Saúde e bem-estar", status: "ativo" },
  { id: "ods-8", number: 8, name: "Trabalho decente e crescimento econômico", status: "ativo" },
  { id: "ods-9", number: 9, name: "Indústria, inovação e infraestrutura", status: "ativo" },
  { id: "ods-10", number: 10, name: "Redução das desigualdades", status: "ativo" },
  { id: "ods-11", number: 11, name: "Cidades e comunidades sustentáveis", status: "ativo" },
  { id: "ods-13", number: 13, name: "Ação contra a mudança global do clima", status: "ativo" },
  { id: "ods-16", number: 16, name: "Paz, justiça e instituições eficazes", status: "ativo" },
];

export const PPA_PROGRAMS: PpaProgram[] = [
  {
    id: "ppa-edu-01",
    code: "PPA-EDU-01",
    name: "Educação básica com qualidade",
    axis: "Desenvolvimento humano",
    status: "ativo",
  },
  {
    id: "ppa-edu-02",
    code: "PPA-EDU-02",
    name: "Infraestrutura e conectividade escolar",
    axis: "Desenvolvimento humano",
    status: "ativo",
  },
  {
    id: "ppa-gov-01",
    code: "PPA-GOV-01",
    name: "Gestão estratégica e governança",
    axis: "Gestão pública",
    status: "ativo",
  },
  {
    id: "ppa-sau-01",
    code: "PPA-SAU-01",
    name: "Atenção à saúde da população",
    axis: "Desenvolvimento humano",
    status: "ativo",
  },
];
