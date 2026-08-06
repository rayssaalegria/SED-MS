-- SID-MS — Monitoramento: indicadores, evidências, orçamento, riscos e impedimentos (Etapa 4)

CREATE TABLE IF NOT EXISTS public.indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  formula TEXT,
  unit_of_measure TEXT,
  data_source TEXT,
  periodicity TEXT NOT NULL DEFAULT 'mensal',
  baseline NUMERIC(14,2),
  baseline_year INTEGER,
  annual_target NUMERIC(14,2),
  monthly_target NUMERIC(14,2),
  quarterly_target NUMERIC(14,2),
  current_result NUMERIC(14,2),
  previous_result NUMERIC(14,2),
  polarity TEXT NOT NULL DEFAULT 'maior_melhor',
  owner_name TEXT,
  validator_name TEXT,
  project_id UUID REFERENCES public.projects(id),
  pillar_code TEXT,
  ods TEXT[] DEFAULT '{}',
  observation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.indicator_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id UUID NOT NULL REFERENCES public.indicators(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  target NUMERIC(14,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (indicator_id, period)
);

CREATE TABLE IF NOT EXISTS public.indicator_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id UUID NOT NULL REFERENCES public.indicators(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  value NUMERIC(14,2) NOT NULL,
  target NUMERIC(14,2),
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  recorded_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

CREATE TABLE IF NOT EXISTS public.evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  file_name TEXT,
  file_size TEXT,
  external_link TEXT,
  evidence_date DATE,
  owner_name TEXT,
  deliverable_id UUID REFERENCES public.deliverables(id),
  project_id UUID REFERENCES public.projects(id),
  version INTEGER NOT NULL DEFAULT 1,
  access_level TEXT NOT NULL DEFAULT 'interno',
  status public.evidence_status NOT NULL DEFAULT 'enviada',
  review_note TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  validated_at TIMESTAMPTZ,
  reviewer_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.evidence_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id UUID NOT NULL REFERENCES public.evidences(id) ON DELETE CASCADE,
  decision public.evidence_status NOT NULL,
  note TEXT,
  reviewer_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id),
  year INTEGER NOT NULL,
  budget_unit TEXT,
  budget_program TEXT,
  budget_action TEXT,
  funding_source TEXT,
  expense_nature TEXT,
  planned NUMERIC(14,2) NOT NULL DEFAULT 0,
  updated NUMERIC(14,2) NOT NULL DEFAULT 0,
  committed NUMERIC(14,2) NOT NULL DEFAULT 0,
  settled NUMERIC(14,2) NOT NULL DEFAULT 0,
  paid NUMERIC(14,2) NOT NULL DEFAULT 0,
  counterpart NUMERIC(14,2) NOT NULL DEFAULT 0,
  agreement TEXT,
  resource_type TEXT NOT NULL DEFAULT 'tesouro',
  observation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID NOT NULL REFERENCES public.projects(id),
  category TEXT NOT NULL,
  probability INTEGER NOT NULL CHECK (probability BETWEEN 1 AND 5),
  impact INTEGER NOT NULL CHECK (impact BETWEEN 1 AND 5),
  cause TEXT,
  consequence TEXT,
  owner_name TEXT,
  preventive_plan TEXT,
  contingency_plan TEXT,
  treatment_due_date DATE,
  status public.risk_status NOT NULL DEFAULT 'identificado',
  reviewed_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.impediments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID NOT NULL REFERENCES public.projects(id),
  deliverable_id UUID REFERENCES public.deliverables(id),
  solver_name TEXT,
  involved_org TEXT,
  identified_at DATE,
  due_date DATE,
  impact TEXT NOT NULL DEFAULT 'medio',
  priority TEXT NOT NULL DEFAULT 'media',
  status TEXT NOT NULL DEFAULT 'aberto',
  solution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_indicators_project ON public.indicators(project_id);
CREATE INDEX IF NOT EXISTS idx_evidences_deliverable ON public.evidences(deliverable_id);
CREATE INDEX IF NOT EXISTS idx_budgets_project ON public.budgets(project_id);
CREATE INDEX IF NOT EXISTS idx_risks_project ON public.risks(project_id);
CREATE INDEX IF NOT EXISTS idx_impediments_project ON public.impediments(project_id);

DROP TRIGGER IF EXISTS trg_indicators_updated_at ON public.indicators;
CREATE TRIGGER trg_indicators_updated_at
  BEFORE UPDATE ON public.indicators
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_evidences_updated_at ON public.evidences;
CREATE TRIGGER trg_evidences_updated_at
  BEFORE UPDATE ON public.evidences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_budgets_updated_at ON public.budgets;
CREATE TRIGGER trg_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_risks_updated_at ON public.risks;
CREATE TRIGGER trg_risks_updated_at
  BEFORE UPDATE ON public.risks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_impediments_updated_at ON public.impediments;
CREATE TRIGGER trg_impediments_updated_at
  BEFORE UPDATE ON public.impediments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicator_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicator_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impediments ENABLE ROW LEVEL SECURITY;

CREATE POLICY indicators_select_auth ON public.indicators
  FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY evidences_select_auth ON public.evidences
  FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY budgets_select_auth ON public.budgets
  FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY risks_select_auth ON public.risks
  FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY impediments_select_auth ON public.impediments
  FOR SELECT TO authenticated USING (deleted_at IS NULL);
