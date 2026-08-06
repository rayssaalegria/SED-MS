import type { Organization, SessionUser, UserRole } from "@/types/domain";
import { ROLE_PERMISSIONS } from "@/lib/rbac/permissions";

export const DEMO_PASSWORD = "SidMS@2026";
export const DEMO_COOKIE = "sid-ms-demo-session";

const ORG_GOV: Organization = {
  id: "11111111-1111-1111-1111-111111111001",
  name: "Governo do Estado de Mato Grosso do Sul",
  acronym: "GOV-MS",
  type: "governo",
  status: "ativo",
};

const ORG_SEGOV: Organization = {
  id: "11111111-1111-1111-1111-111111111010",
  name: "Secretaria de Estado de Governo e Gestão Estratégica",
  acronym: "SEGOV",
  type: "secretaria",
  parent_id: ORG_GOV.id,
  status: "ativo",
};

const ORG_SED: Organization = {
  id: "11111111-1111-1111-1111-111111111008",
  name: "Secretaria de Estado de Educação",
  acronym: "SED",
  type: "secretaria",
  parent_id: ORG_GOV.id,
  status: "ativo",
};

export interface DemoAccount {
  email: string;
  fullName: string;
  jobTitle: string;
  role: UserRole;
  organizations: Organization[];
  mustChangePassword?: boolean;
  firstAccessCompleted?: boolean;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "admin@sige.ms.gov.br",
    fullName: "Ana Paula Ribeiro",
    jobTitle: "Administradora do sistema",
    role: "admin",
    organizations: [ORG_GOV, ORG_SEGOV, ORG_SED],
  },
  {
    email: "governador@sige.ms.gov.br",
    fullName: "Carlos Eduardo Mendes",
    jobTitle: "Governador do Estado",
    role: "governador",
    organizations: [ORG_GOV],
  },
  {
    email: "segov@sige.ms.gov.br",
    fullName: "Fernanda Oliveira Costa",
    jobTitle: "Gestora da SEGOV",
    role: "segov",
    organizations: [ORG_SEGOV, ORG_GOV],
  },
  {
    email: "secretario.sed@sige.ms.gov.br",
    fullName: "Marcos Antônio Silva",
    jobTitle: "Secretário de Estado de Educação",
    role: "secretario",
    organizations: [ORG_SED],
  },
  {
    email: "gestor.sed@sige.ms.gov.br",
    fullName: "Juliana Ferreira Santos",
    jobTitle: "Gestora de projetos — SED",
    role: "gestor_projeto",
    organizations: [ORG_SED],
  },
  {
    email: "entrega.sed@sige.ms.gov.br",
    fullName: "Pedro Henrique Almeida",
    jobTitle: "Responsável por entregas — SED",
    role: "responsavel_entrega",
    organizations: [ORG_SED],
  },
  {
    email: "avaliador@sige.ms.gov.br",
    fullName: "Camila Rodrigues Lima",
    jobTitle: "Avaliadora institucional",
    role: "avaliador",
    organizations: [ORG_SEGOV, ORG_SED],
  },
];

export function buildDemoSession(
  account: DemoAccount,
  activeOrganizationId?: string | null,
): SessionUser {
  const primaryOrg = account.organizations[0];
  const activeId =
    activeOrganizationId &&
    account.organizations.some((o) => o.id === activeOrganizationId)
      ? activeOrganizationId
      : primaryOrg.id;

  return {
    profile: {
      id: `demo-${account.role}`,
      full_name: account.fullName,
      email: account.email,
      job_title: account.jobTitle,
      must_change_password: account.mustChangePassword ?? false,
      first_access_completed: account.firstAccessCompleted ?? true,
      status: "ativo",
    },
    roles: account.organizations.map((org, index) => ({
      id: `demo-role-${account.role}-${org.acronym}`,
      user_id: `demo-${account.role}`,
      organization_id: org.id,
      role: account.role,
      is_primary: index === 0,
      organization: org,
    })),
    permissions: ROLE_PERMISSIONS[account.role],
    activeOrganizationId: activeId,
    activeRole: account.role,
  };
}

export function findDemoAccount(email: string): DemoAccount | undefined {
  return DEMO_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.toLowerCase(),
  );
}

export function isDemoMode(): boolean {
  return (
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
