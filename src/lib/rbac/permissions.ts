import type { UserRole } from "@/types/domain";

/** Permissões padrão por papel (espelha seed SQL; usada no modo demo e fallback). */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    "dashboard.estadual",
    "dashboard.secretaria",
    "organizations.manage",
    "users.manage",
    "permissions.manage",
    "contracts.read",
    "contracts.write",
    "projects.read",
    "projects.write",
    "deliverables.read",
    "deliverables.write",
    "indicators.read",
    "indicators.write",
    "evidences.validate",
    "approvals.act",
    "reports.export",
    "audit.read",
    "settings.manage",
  ],
  governador: [
    "dashboard.estadual",
    "contracts.read",
    "projects.read",
    "deliverables.read",
    "indicators.read",
    "reports.export",
  ],
  segov: [
    "dashboard.estadual",
    "dashboard.secretaria",
    "organizations.manage",
    "contracts.read",
    "contracts.write",
    "projects.read",
    "projects.write",
    "deliverables.read",
    "indicators.read",
    "approvals.act",
    "reports.export",
    "audit.read",
  ],
  secretario: [
    "dashboard.secretaria",
    "contracts.read",
    "contracts.write",
    "projects.read",
    "projects.write",
    "deliverables.read",
    "indicators.read",
    "approvals.act",
    "reports.export",
  ],
  planejamento: [
    "dashboard.secretaria",
    "contracts.read",
    "contracts.write",
    "projects.read",
    "projects.write",
    "deliverables.read",
    "deliverables.write",
    "indicators.read",
    "indicators.write",
    "reports.export",
  ],
  gestor_projeto: [
    "dashboard.secretaria",
    "projects.read",
    "projects.write",
    "deliverables.read",
    "deliverables.write",
    "indicators.read",
    "indicators.write",
  ],
  responsavel_entrega: [
    "dashboard.secretaria",
    "deliverables.read",
    "deliverables.write",
  ],
  avaliador: [
    "dashboard.secretaria",
    "projects.read",
    "deliverables.read",
    "evidences.validate",
    "approvals.act",
  ],
  auditor: [
    "dashboard.estadual",
    "contracts.read",
    "projects.read",
    "deliverables.read",
    "indicators.read",
    "audit.read",
    "reports.export",
  ],
  publico: [],
};

export function hasPermission(
  permissions: string[],
  required?: string | string[],
): boolean {
  if (!required || (Array.isArray(required) && required.length === 0)) {
    return true;
  }
  const list = Array.isArray(required) ? required : [required];
  return list.some((code) => permissions.includes(code));
}

export function hasAnyRole(activeRole: UserRole, roles?: UserRole[]): boolean {
  if (!roles || roles.length === 0) return true;
  return roles.includes(activeRole);
}

export function getDefaultDashboardPath(role: UserRole): string {
  if (
    role === "admin" ||
    role === "governador" ||
    role === "segov" ||
    role === "auditor"
  ) {
    return "/dashboard/estadual";
  }
  return "/dashboard/secretaria";
}

export function canViewAllOrganizations(role: UserRole): boolean {
  return ["admin", "governador", "segov", "auditor"].includes(role);
}
