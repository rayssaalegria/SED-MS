import { cookies } from "next/headers";
import {
  DEMO_COOKIE,
  buildDemoSession,
  findDemoAccount,
  isDemoMode,
} from "@/lib/auth/demo-users";
import { ROLE_PERMISSIONS } from "@/lib/rbac/permissions";
import type { SessionUser, UserRole } from "@/types/domain";

interface DemoCookiePayload {
  email: string;
  activeOrganizationId?: string | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (isDemoMode()) {
    return getDemoSessionUser();
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile || profile.deleted_at) return null;

    const { data: roles } = await supabase
      .from("user_organization_roles")
      .select("*, organization:organizations(*)")
      .eq("user_id", user.id)
      .is("deleted_at", null);

    const cookieStore = await cookies();
    const activeOrgCookie = cookieStore.get("sid-ms-active-org")?.value;

    const roleList = roles ?? [];
    const primary =
      roleList.find((r) => r.is_primary) ?? roleList[0] ?? null;
    const activeOrganizationId =
      activeOrgCookie &&
      roleList.some((r) => r.organization_id === activeOrgCookie)
        ? activeOrgCookie
        : (primary?.organization_id ?? null);

    const activeRole = (roleList.find(
      (r) => r.organization_id === activeOrganizationId,
    )?.role ??
      primary?.role ??
      "publico") as UserRole;

    return {
      profile: {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        job_title: profile.job_title,
        avatar_url: profile.avatar_url,
        must_change_password: profile.must_change_password,
        first_access_completed: profile.first_access_completed,
        status: profile.status,
        last_login_at: profile.last_login_at,
      },
      roles: roleList.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        organization_id: r.organization_id,
        organization_unit_id: r.organization_unit_id,
        role: r.role as UserRole,
        is_primary: r.is_primary,
        organization: r.organization ?? undefined,
      })),
      permissions: ROLE_PERMISSIONS[activeRole] ?? [],
      activeOrganizationId,
      activeRole,
    };
  } catch {
    return getDemoSessionUser();
  }
}

async function getDemoSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(DEMO_COOKIE)?.value;
  if (!raw) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8"),
    ) as DemoCookiePayload;
    const account = findDemoAccount(payload.email);
    if (!account) return null;
    return buildDemoSession(account, payload.activeOrganizationId);
  } catch {
    return null;
  }
}

export function encodeDemoCookie(payload: DemoCookiePayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}
