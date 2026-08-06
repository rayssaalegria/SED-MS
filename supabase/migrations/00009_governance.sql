-- SED - MS — Governança: aprovações, alterações, aditivos, avaliações (Etapa 5)
-- audit_logs já existe em 00004; esta migration amplia o domínio de governança.

CREATE TABLE IF NOT EXISTS public.approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_label TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  current_step TEXT NOT NULL DEFAULT 'planejamento',
  status TEXT NOT NULL DEFAULT 'pendente',
  priority TEXT NOT NULL DEFAULT 'media',
  requested_by TEXT,
  requested_at DATE,
  due_date DATE,
  decision public.approval_decision,
  decision_note TEXT,
  decided_by TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.approval_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_id UUID NOT NULL REFERENCES public.approvals(id) ON DELETE CASCADE,
  step TEXT NOT NULL,
  actor TEXT NOT NULL,
  decision TEXT NOT NULL,
  note TEXT,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  change_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_label TEXT,
  previous_value TEXT NOT NULL,
  new_value TEXT NOT NULL,
  reason TEXT NOT NULL,
  technical_justification TEXT,
  impact TEXT NOT NULL DEFAULT 'medio',
  status TEXT NOT NULL DEFAULT 'rascunho',
  requested_by TEXT,
  requested_at DATE,
  reviewer_name TEXT,
  reviewed_at DATE,
  review_note TEXT,
  contract_id UUID REFERENCES public.management_contracts(id),
  project_id UUID REFERENCES public.projects(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.contract_amendments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  contract_id UUID NOT NULL REFERENCES public.management_contracts(id),
  version INTEGER NOT NULL DEFAULT 1,
  amendment_type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  previous_clause TEXT,
  new_clause TEXT,
  value_impact NUMERIC(16,2) DEFAULT 0,
  days_impact INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'rascunho',
  requested_by TEXT,
  requested_at DATE,
  approved_by TEXT,
  approved_at DATE,
  effective_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.annual_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  contract_id UUID NOT NULL REFERENCES public.management_contracts(id),
  year INTEGER NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  status TEXT NOT NULL DEFAULT 'nao_iniciada',
  self_score NUMERIC(5,2),
  segov_score NUMERIC(5,2),
  physical_execution NUMERIC(5,2),
  financial_execution NUMERIC(5,2),
  indicators_achievement NUMERIC(5,2),
  strengths TEXT,
  weaknesses TEXT,
  improvement_plan TEXT,
  evaluator_name TEXT,
  evaluated_at DATE,
  submitted_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  UNIQUE (contract_id, year, code)
);

CREATE INDEX IF NOT EXISTS idx_approvals_status ON public.approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_due ON public.approvals(due_date);
CREATE INDEX IF NOT EXISTS idx_change_requests_status ON public.change_requests(status);
CREATE INDEX IF NOT EXISTS idx_amendments_contract ON public.contract_amendments(contract_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_year ON public.annual_evaluations(year);

DROP TRIGGER IF EXISTS trg_approvals_updated_at ON public.approvals;
CREATE TRIGGER trg_approvals_updated_at
  BEFORE UPDATE ON public.approvals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_change_requests_updated_at ON public.change_requests;
CREATE TRIGGER trg_change_requests_updated_at
  BEFORE UPDATE ON public.change_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_amendments_updated_at ON public.contract_amendments;
CREATE TRIGGER trg_amendments_updated_at
  BEFORE UPDATE ON public.contract_amendments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_evaluations_updated_at ON public.annual_evaluations;
CREATE TRIGGER trg_evaluations_updated_at
  BEFORE UPDATE ON public.annual_evaluations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annual_evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS approvals_select ON public.approvals;
CREATE POLICY approvals_select ON public.approvals
  FOR SELECT TO authenticated
  USING (
    public.can_view_all_organizations()
    OR organization_id IN (SELECT public.user_organization_ids())
  );

DROP POLICY IF EXISTS approvals_write ON public.approvals;
CREATE POLICY approvals_write ON public.approvals
  FOR ALL TO authenticated
  USING (
    public.user_has_role(ARRAY['admin', 'segov', 'secretario', 'avaliador', 'planejamento']::public.user_role[])
  )
  WITH CHECK (
    public.user_has_role(ARRAY['admin', 'segov', 'secretario', 'avaliador', 'planejamento']::public.user_role[])
  );

DROP POLICY IF EXISTS approval_history_select ON public.approval_history;
CREATE POLICY approval_history_select ON public.approval_history
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS approval_history_insert ON public.approval_history;
CREATE POLICY approval_history_insert ON public.approval_history
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS change_requests_select ON public.change_requests;
CREATE POLICY change_requests_select ON public.change_requests
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS change_requests_write ON public.change_requests;
CREATE POLICY change_requests_write ON public.change_requests
  FOR ALL TO authenticated
  USING (
    public.user_has_role(ARRAY['admin', 'segov', 'secretario', 'planejamento', 'gestor_projeto']::public.user_role[])
  )
  WITH CHECK (
    public.user_has_role(ARRAY['admin', 'segov', 'secretario', 'planejamento', 'gestor_projeto']::public.user_role[])
  );

DROP POLICY IF EXISTS amendments_select ON public.contract_amendments;
CREATE POLICY amendments_select ON public.contract_amendments
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS amendments_write ON public.contract_amendments;
CREATE POLICY amendments_write ON public.contract_amendments
  FOR ALL TO authenticated
  USING (
    public.user_has_role(ARRAY['admin', 'segov', 'secretario', 'planejamento']::public.user_role[])
  )
  WITH CHECK (
    public.user_has_role(ARRAY['admin', 'segov', 'secretario', 'planejamento']::public.user_role[])
  );

DROP POLICY IF EXISTS evaluations_select ON public.annual_evaluations;
CREATE POLICY evaluations_select ON public.annual_evaluations
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS evaluations_write ON public.annual_evaluations;
CREATE POLICY evaluations_write ON public.annual_evaluations
  FOR ALL TO authenticated
  USING (
    public.user_has_role(ARRAY['admin', 'segov', 'secretario', 'avaliador', 'planejamento']::public.user_role[])
  )
  WITH CHECK (
    public.user_has_role(ARRAY['admin', 'segov', 'secretario', 'avaliador', 'planejamento']::public.user_role[])
  );
