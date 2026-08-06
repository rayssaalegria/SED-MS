import type { Organization } from "@/types/domain";

/** Escopo institucional do SED - MS: apenas a SED/MS e vínculos de governança do CG. */
export const DEMO_ORGANIZATIONS: Organization[] = [
  {
    id: "11111111-1111-1111-1111-111111111001",
    name: "Governo do Estado de Mato Grosso do Sul",
    acronym: "GOV-MS",
    type: "governo",
    status: "ativo",
  },
  {
    id: "11111111-1111-1111-1111-111111111008",
    name: "Secretaria de Estado de Educação",
    acronym: "SED",
    type: "secretaria",
    parent_id: "11111111-1111-1111-1111-111111111001",
    status: "ativo",
  },
  {
    id: "11111111-1111-1111-1111-111111111010",
    name: "Secretaria de Estado de Governo e Gestão Estratégica",
    acronym: "SEGOV",
    type: "secretaria",
    parent_id: "11111111-1111-1111-1111-111111111001",
    status: "ativo",
  },
];

export const SED_ORGANIZATION_ID = "11111111-1111-1111-1111-111111111008";
