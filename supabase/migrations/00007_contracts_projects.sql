-- SID-MS — Contratos, programas, projetos, entregas e atividades (Etapa 3)

CREATE TABLE IF NOT EXISTS public.management_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.management_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  year INTEGER NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  objective TEXT,
  governor_name TEXT,
  secretary_name TEXT,
  manager_name TEXT,
  drafted_at DATE,
  pactuated_at DATE,
  signed_at DATE,
  start_date DATE,
  end_date DATE,
  version INTEGER NOT NULL DEFAULT 1,
  status public.contract_status NOT NULL DEFAULT 'rascunho',
  execution_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  final_score NUMERIC(5,2),
  observations TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.contract_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.management_contracts(id),
  version INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  change_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE (contract_id, version)
);

CREATE TABLE IF NOT EXISTS public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.management_contracts(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  objective TEXT,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  managing_unit TEXT,
  target_audience TEXT,
  scope TEXT,
  pillar_code TEXT,
  ods TEXT[] DEFAULT '{}',
  ppa_program_code TEXT,
  status TEXT NOT NULL DEFAULT 'em_elaboracao',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  UNIQUE (contract_id, code)
);

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id),
  contract_id UUID NOT NULL REFERENCES public.management_contracts(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  objective TEXT,
  manager_name TEXT,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  participant_orgs TEXT[] DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  execution_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  weight NUMERIC(8,2) NOT NULL DEFAULT 1,
  priority TEXT NOT NULL DEFAULT 'media',
  budget_planned NUMERIC(14,2) DEFAULT 0,
  beneficiaries_planned INTEGER DEFAULT 0,
  beneficiaries_reached INTEGER DEFAULT 0,
  pillar_code TEXT,
  ods TEXT[] DEFAULT '{}',
  status public.project_status NOT NULL DEFAULT 'planejado',
  justification TEXT,
  observations TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  UNIQUE (contract_id, code)
);

CREATE TABLE IF NOT EXISTS public.project_municipalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  municipality_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, municipality_name)
);

CREATE TABLE IF NOT EXISTS public.deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id),
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  unit_name TEXT,
  owner_name TEXT,
  collaborators TEXT[] DEFAULT '{}',
  start_date DATE,
  due_date DATE,
  completed_at DATE,
  weight NUMERIC(8,2) NOT NULL DEFAULT 1,
  planned_target NUMERIC(14,2) DEFAULT 0,
  achieved_result NUMERIC(14,2) DEFAULT 0,
  unit_of_measure TEXT,
  execution_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  municipality_name TEXT,
  evidence_required BOOLEAN NOT NULL DEFAULT true,
  has_evidence BOOLEAN NOT NULL DEFAULT false,
  status public.deliverable_status NOT NULL DEFAULT 'planejada',
  delay_justification TEXT,
  partial_justification TEXT,
  observation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  UNIQUE (project_id, code)
);

CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id UUID NOT NULL REFERENCES public.deliverables(id),
  name TEXT NOT NULL,
  description TEXT,
  owner_name TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'nao_iniciada',
  priority TEXT NOT NULL DEFAULT 'media',
  depends_on_id UUID REFERENCES public.activities(id),
  observation TEXT,
  execution_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_contracts_org ON public.management_contracts(organization_id);
CREATE INDEX IF NOT EXISTS idx_programs_contract ON public.programs(contract_id);
CREATE INDEX IF NOT EXISTS idx_projects_program ON public.projects(program_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_project ON public.deliverables(project_id);
CREATE INDEX IF NOT EXISTS idx_activities_deliverable ON public.activities(deliverable_id);

DROP TRIGGER IF EXISTS trg_contracts_updated_at ON public.management_contracts;
CREATE TRIGGER trg_contracts_updated_at
  BEFORE UPDATE ON public.management_contracts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_programs_updated_at ON public.programs;
CREATE TRIGGER trg_programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_deliverables_updated_at ON public.deliverables;
CREATE TRIGGER trg_deliverables_updated_at
  BEFORE UPDATE ON public.deliverables
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_activities_updated_at ON public.activities;
CREATE TRIGGER trg_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.management_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.management_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY contracts_select_scoped ON public.management_contracts
  FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL AND (
      public.can_view_all_organizations()
      OR organization_id IN (SELECT public.user_organization_ids())
    )
  );

CREATE POLICY contracts_write_managers ON public.management_contracts
  FOR ALL TO authenticated
  USING (
    public.user_has_role(ARRAY['admin','segov','secretario','planejamento']::public.user_role[])
  )
  WITH CHECK (
    public.user_has_role(ARRAY['admin','segov','secretario','planejamento']::public.user_role[])
  );

CREATE POLICY programs_select_auth ON public.programs
  FOR SELECT TO authenticated USING (deleted_at IS NULL);

CREATE POLICY projects_select_auth ON public.projects
  FOR SELECT TO authenticated USING (deleted_at IS NULL);

CREATE POLICY deliverables_select_auth ON public.deliverables
  FOR SELECT TO authenticated USING (deleted_at IS NULL);

CREATE POLICY activities_select_auth ON public.activities
  FOR SELECT TO authenticated USING (deleted_at IS NULL);
