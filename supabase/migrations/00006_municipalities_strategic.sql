-- SED - MS — Municípios e cadastros estratégicos (Etapa 2)

CREATE TABLE IF NOT EXISTS public.municipalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ibge_code TEXT NOT NULL UNIQUE,
  region TEXT NOT NULL,
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  estimated_population INTEGER,
  status public.entity_status NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_municipalities_name ON public.municipalities(name);
CREATE INDEX IF NOT EXISTS idx_municipalities_region ON public.municipalities(region);

CREATE TABLE IF NOT EXISTS public.strategic_pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  status public.entity_status NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.ods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status public.entity_status NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.ppa_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  axis TEXT,
  status public.entity_status NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.strategic_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  pillar_id UUID REFERENCES public.strategic_pillars(id),
  status public.entity_status NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ
);

DROP TRIGGER IF EXISTS trg_municipalities_updated_at ON public.municipalities;
CREATE TRIGGER trg_municipalities_updated_at
  BEFORE UPDATE ON public.municipalities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_strategic_pillars_updated_at ON public.strategic_pillars;
CREATE TRIGGER trg_strategic_pillars_updated_at
  BEFORE UPDATE ON public.strategic_pillars
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppa_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_objectives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS municipalities_select_auth ON public.municipalities;
CREATE POLICY municipalities_select_auth ON public.municipalities
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

DROP POLICY IF EXISTS municipalities_write_admin ON public.municipalities;
CREATE POLICY municipalities_write_admin ON public.municipalities
  FOR ALL TO authenticated
  USING (public.user_has_role(ARRAY['admin', 'segov']::public.user_role[]))
  WITH CHECK (public.user_has_role(ARRAY['admin', 'segov']::public.user_role[]));

DROP POLICY IF EXISTS strategic_select_auth ON public.strategic_pillars;
CREATE POLICY strategic_select_auth ON public.strategic_pillars
  FOR SELECT TO authenticated USING (deleted_at IS NULL);

DROP POLICY IF EXISTS strategic_write_admin ON public.strategic_pillars;
CREATE POLICY strategic_write_admin ON public.strategic_pillars
  FOR ALL TO authenticated
  USING (public.user_has_role(ARRAY['admin', 'segov']::public.user_role[]))
  WITH CHECK (public.user_has_role(ARRAY['admin', 'segov']::public.user_role[]));

DROP POLICY IF EXISTS ods_select_auth ON public.ods;
CREATE POLICY ods_select_auth ON public.ods
  FOR SELECT TO authenticated USING (deleted_at IS NULL);

DROP POLICY IF EXISTS ods_write_admin ON public.ods;
CREATE POLICY ods_write_admin ON public.ods
  FOR ALL TO authenticated
  USING (public.user_has_role(ARRAY['admin', 'segov']::public.user_role[]))
  WITH CHECK (public.user_has_role(ARRAY['admin', 'segov']::public.user_role[]));

DROP POLICY IF EXISTS ppa_select_auth ON public.ppa_programs;
CREATE POLICY ppa_select_auth ON public.ppa_programs
  FOR SELECT TO authenticated USING (deleted_at IS NULL);

DROP POLICY IF EXISTS ppa_write_admin ON public.ppa_programs;
CREATE POLICY ppa_write_admin ON public.ppa_programs
  FOR ALL TO authenticated
  USING (public.user_has_role(ARRAY['admin', 'segov']::public.user_role[]))
  WITH CHECK (public.user_has_role(ARRAY['admin', 'segov']::public.user_role[]));
