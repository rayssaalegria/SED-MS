export interface OrganizationUnitDemo {
  id: string;
  organizationId: string;
  name: string;
  acronym: string;
  type: string;
  parentUnitId?: string | null;
  managerName: string;
  municipalityName: string;
  status: "ativo" | "inativo";
}

export const DEMO_ORG_UNITS: OrganizationUnitDemo[] = [
  {
    id: "unit-sed-exec",
    organizationId: "11111111-1111-1111-1111-111111111008",
    name: "Secretaria-Executiva",
    acronym: "SE-SED",
    type: "secretaria_executiva",
    managerName: "Renata Campos Dias",
    municipalityName: "Campo Grande",
    status: "ativo",
  },
  {
    id: "unit-sed-sup-infra",
    organizationId: "11111111-1111-1111-1111-111111111008",
    name: "Superintendência de Infraestrutura Escolar",
    acronym: "SIE",
    type: "superintendencia",
    parentUnitId: "unit-sed-exec",
    managerName: "Bruno Martins Lopes",
    municipalityName: "Campo Grande",
    status: "ativo",
  },
  {
    id: "unit-sed-coord-ti",
    organizationId: "11111111-1111-1111-1111-111111111008",
    name: "Coordenadoria de Tecnologia Educacional",
    acronym: "CTE",
    type: "coordenadoria",
    parentUnitId: "unit-sed-sup-infra",
    managerName: "Larissa Nogueira Prado",
    municipalityName: "Campo Grande",
    status: "ativo",
  },
  {
    id: "unit-sed-sup-ped",
    organizationId: "11111111-1111-1111-1111-111111111008",
    name: "Superintendência de Políticas Pedagógicas",
    acronym: "SPP",
    type: "superintendencia",
    parentUnitId: "unit-sed-exec",
    managerName: "Helena Duarte Ramos",
    municipalityName: "Campo Grande",
    status: "ativo",
  },
];
