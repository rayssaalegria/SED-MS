-- SID-MS — Helpers RBAC e Row Level Security (Etapa 1)

CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.user_has_role(target_roles public.user_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_organization_roles uor
    WHERE uor.user_id = auth.uid()
      AND uor.deleted_at IS NULL
      AND uor.role = ANY (target_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.user_organization_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT organization_id
  FROM public.user_organization_roles
  WHERE user_id = auth.uid()
    AND deleted_at IS NULL;
$$;

CREATE OR REPLACE FUNCTION public.can_view_all_organizations()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.user_has_role(ARRAY['admin', 'governador', 'segov', 'auditor']::public.user_role[]);
$$;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_organization_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS profiles_select_own_or_admin ON public.profiles;
CREATE POLICY profiles_select_own_or_admin ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.user_has_role(ARRAY['admin', 'segov']::public.user_role[])
  );

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.user_has_role(ARRAY['admin']::public.user_role[]))
  WITH CHECK (id = auth.uid() OR public.user_has_role(ARRAY['admin']::public.user_role[]));

-- Organizations
DROP POLICY IF EXISTS organizations_select_scoped ON public.organizations;
CREATE POLICY organizations_select_scoped ON public.organizations
  FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      public.can_view_all_organizations()
      OR id IN (SELECT public.user_organization_ids())
    )
  );

DROP POLICY IF EXISTS organizations_write_admin ON public.organizations;
CREATE POLICY organizations_write_admin ON public.organizations
  FOR ALL TO authenticated
  USING (public.user_has_role(ARRAY['admin', 'segov']::public.user_role[]))
  WITH CHECK (public.user_has_role(ARRAY['admin', 'segov']::public.user_role[]));

-- Organization units
DROP POLICY IF EXISTS org_units_select_scoped ON public.organization_units;
CREATE POLICY org_units_select_scoped ON public.organization_units
  FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      public.can_view_all_organizations()
      OR organization_id IN (SELECT public.user_organization_ids())
    )
  );

DROP POLICY IF EXISTS org_units_write_admin ON public.organization_units;
CREATE POLICY org_units_write_admin ON public.organization_units
  FOR ALL TO authenticated
  USING (public.user_has_role(ARRAY['admin', 'segov']::public.user_role[]))
  WITH CHECK (public.user_has_role(ARRAY['admin', 'segov']::public.user_role[]));

-- Permissions catalog (read for authenticated)
DROP POLICY IF EXISTS permissions_select_auth ON public.permissions;
CREATE POLICY permissions_select_auth ON public.permissions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS role_permissions_select_auth ON public.role_permissions;
CREATE POLICY role_permissions_select_auth ON public.role_permissions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS user_permissions_select_own ON public.user_permissions;
CREATE POLICY user_permissions_select_own ON public.user_permissions
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.user_has_role(ARRAY['admin']::public.user_role[])
  );

DROP POLICY IF EXISTS user_org_roles_select_own ON public.user_organization_roles;
CREATE POLICY user_org_roles_select_own ON public.user_organization_roles
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.user_has_role(ARRAY['admin', 'segov']::public.user_role[])
  );

DROP POLICY IF EXISTS user_org_roles_admin_write ON public.user_organization_roles;
CREATE POLICY user_org_roles_admin_write ON public.user_organization_roles
  FOR ALL TO authenticated
  USING (public.user_has_role(ARRAY['admin']::public.user_role[]))
  WITH CHECK (public.user_has_role(ARRAY['admin']::public.user_role[]));

-- Audit logs: readable by admin/auditor/segov; insert by authenticated; no delete
DROP POLICY IF EXISTS audit_logs_select_control ON public.audit_logs;
CREATE POLICY audit_logs_select_control ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.user_has_role(ARRAY['admin', 'auditor', 'segov']::public.user_role[]));

DROP POLICY IF EXISTS audit_logs_insert_auth ON public.audit_logs;
CREATE POLICY audit_logs_insert_auth ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.user_has_role(ARRAY['admin']::public.user_role[]));
