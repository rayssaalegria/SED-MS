-- SID-MS — Órgãos e unidades organizacionais

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  acronym TEXT NOT NULL UNIQUE,
  type public.org_unit_type NOT NULL DEFAULT 'secretaria',
  parent_id UUID REFERENCES public.organizations(id),
  email TEXT,
  phone TEXT,
  municipality_name TEXT,
  address TEXT,
  area_of_activity TEXT,
  competencies TEXT,
  legal_basis TEXT,
  founded_at DATE,
  status public.entity_status NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_organizations_parent ON public.organizations(parent_id);
CREATE INDEX IF NOT EXISTS idx_organizations_acronym ON public.organizations(acronym);
CREATE INDEX IF NOT EXISTS idx_organizations_active ON public.organizations(deleted_at) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.organization_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  acronym TEXT NOT NULL,
  type public.org_unit_type NOT NULL DEFAULT 'unidade',
  parent_unit_id UUID REFERENCES public.organization_units(id),
  manager_name TEXT,
  deputy_manager_name TEXT,
  email TEXT,
  phone TEXT,
  municipality_name TEXT,
  address TEXT,
  area_of_activity TEXT,
  competencies TEXT,
  legal_basis TEXT,
  founded_at DATE,
  status public.entity_status NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  UNIQUE (organization_id, acronym)
);

CREATE INDEX IF NOT EXISTS idx_org_units_org ON public.organization_units(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_units_parent ON public.organization_units(parent_unit_id);

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON public.organizations;
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_organization_units_updated_at ON public.organization_units;
CREATE TRIGGER trg_organization_units_updated_at
  BEFORE UPDATE ON public.organization_units
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
