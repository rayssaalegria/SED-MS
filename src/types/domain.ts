export type UserRole =
  | "admin"
  | "governador"
  | "segov"
  | "secretario"
  | "planejamento"
  | "gestor_projeto"
  | "responsavel_entrega"
  | "avaliador"
  | "auditor"
  | "publico";

export type EntityStatus = "ativo" | "inativo" | "suspenso";

export type OrgUnitType =
  | "governo"
  | "orgao"
  | "secretaria"
  | "secretaria_executiva"
  | "superintendencia"
  | "coordenadoria"
  | "unidade"
  | "setor";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  job_title?: string | null;
  avatar_url?: string | null;
  must_change_password: boolean;
  first_access_completed: boolean;
  status: EntityStatus;
  last_login_at?: string | null;
}

export interface Organization {
  id: string;
  name: string;
  acronym: string;
  type: OrgUnitType;
  parent_id?: string | null;
  status: EntityStatus;
  email?: string | null;
  phone?: string | null;
}

export interface UserOrganizationRole {
  id: string;
  user_id: string;
  organization_id: string;
  organization_unit_id?: string | null;
  role: UserRole;
  is_primary: boolean;
  organization?: Organization;
}

export interface SessionUser {
  profile: Profile;
  roles: UserOrganizationRole[];
  permissions: string[];
  activeOrganizationId: string | null;
  activeRole: UserRole;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador do sistema",
  governador: "Governador / Vice-governador",
  segov: "SEGOV / Gestão estratégica",
  secretario: "Secretário / Secretário-adjunto",
  planejamento: "Unidade de planejamento",
  gestor_projeto: "Gestor de projeto",
  responsavel_entrega: "Responsável por entrega",
  avaliador: "Avaliador",
  auditor: "Auditor / Controle",
  publico: "Consulta pública",
};
