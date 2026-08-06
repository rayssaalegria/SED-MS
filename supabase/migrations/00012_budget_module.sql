-- SID-SED — Orçamento: previsões, processos de contratação e execução contratual

CREATE TABLE IF NOT EXISTS public.budget_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  project_id UUID REFERENCES public.projects(id),
  project_name TEXT NOT NULL,
  project_type TEXT NOT NULL DEFAULT 'outro',
  description TEXT,
  planned_value NUMERIC(16,2) NOT NULL DEFAULT 0,
  forecast_date DATE NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  source_file_name TEXT,
  status TEXT NOT NULL DEFAULT 'rascunho',
  observations TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_budget_forecasts_project
  ON public.budget_forecasts(project_id);

CREATE TABLE IF NOT EXISTS public.procurement_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_number TEXT NOT NULL,
  process_type TEXT NOT NULL DEFAULT 'licitacao',
  budget_id UUID NOT NULL REFERENCES public.budget_forecasts(id),
  project_id UUID REFERENCES public.projects(id),
  planned_value NUMERIC(16,2) NOT NULL DEFAULT 0,
  process_value NUMERIC(16,2) NOT NULL DEFAULT 0,
  opened_at DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'rascunho',
  observations TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  UNIQUE (process_number)
);

CREATE INDEX IF NOT EXISTS idx_procurement_budget
  ON public.procurement_processes(budget_id);

CREATE TABLE IF NOT EXISTS public.contract_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES public.budget_forecasts(id),
  project_id UUID REFERENCES public.projects(id),
  procurement_id UUID NOT NULL REFERENCES public.procurement_processes(id),
  contract_number TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  planned_value NUMERIC(16,2) NOT NULL DEFAULT 0,
  contracted_value NUMERIC(16,2) NOT NULL DEFAULT 0,
  executed_value NUMERIC(16,2) NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'rascunho',
  observations TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  UNIQUE (contract_number)
);

CREATE INDEX IF NOT EXISTS idx_contract_exec_budget
  ON public.contract_executions(budget_id);

CREATE INDEX IF NOT EXISTS idx_contract_exec_procurement
  ON public.contract_executions(procurement_id);

DROP TRIGGER IF EXISTS trg_budget_forecasts_updated_at ON public.budget_forecasts;
CREATE TRIGGER trg_budget_forecasts_updated_at
  BEFORE UPDATE ON public.budget_forecasts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_procurement_processes_updated_at ON public.procurement_processes;
CREATE TRIGGER trg_procurement_processes_updated_at
  BEFORE UPDATE ON public.procurement_processes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_contract_executions_updated_at ON public.contract_executions;
CREATE TRIGGER trg_contract_executions_updated_at
  BEFORE UPDATE ON public.contract_executions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.budget_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY budget_forecasts_select_auth ON public.budget_forecasts
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY procurement_processes_select_auth ON public.procurement_processes
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY contract_executions_select_auth ON public.contract_executions
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL);
