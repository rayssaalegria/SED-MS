-- SED - MS — Analytics: agenda, exportações e métricas territoriais (Etapa 6)

CREATE TABLE IF NOT EXISTS public.agenda_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  location TEXT,
  related_label TEXT,
  status TEXT NOT NULL DEFAULT 'agendado',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.report_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  audience TEXT,
  formats TEXT[] NOT NULL DEFAULT ARRAY['csv'],
  default_filters TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_code TEXT NOT NULL,
  report_name TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'csv',
  requested_by TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'disponivel',
  row_count INTEGER DEFAULT 0,
  file_name TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.municipality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipality_id UUID,
  municipality_name TEXT NOT NULL,
  region TEXT,
  latitude NUMERIC(10,6),
  longitude NUMERIC(10,6),
  projects INTEGER DEFAULT 0,
  deliverables INTEGER DEFAULT 0,
  investment NUMERIC(16,2) DEFAULT 0,
  execution_percent NUMERIC(5,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'sem_projeto',
  cycle_year INTEGER DEFAULT 2026,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agenda_events_date ON public.agenda_events(event_date);
CREATE INDEX IF NOT EXISTS idx_export_jobs_requested ON public.export_jobs(requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_municipality_metrics_status ON public.municipality_metrics(status);

DROP TRIGGER IF EXISTS trg_agenda_events_updated_at ON public.agenda_events;
CREATE TRIGGER trg_agenda_events_updated_at
  BEFORE UPDATE ON public.agenda_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipality_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agenda_select ON public.agenda_events;
CREATE POLICY agenda_select ON public.agenda_events
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS agenda_write ON public.agenda_events;
CREATE POLICY agenda_write ON public.agenda_events
  FOR ALL TO authenticated
  USING (
    public.user_has_role(ARRAY['admin', 'segov', 'secretario', 'planejamento']::public.user_role[])
  )
  WITH CHECK (
    public.user_has_role(ARRAY['admin', 'segov', 'secretario', 'planejamento']::public.user_role[])
  );

DROP POLICY IF EXISTS reports_select ON public.report_definitions;
CREATE POLICY reports_select ON public.report_definitions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS export_jobs_select ON public.export_jobs;
CREATE POLICY export_jobs_select ON public.export_jobs
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS export_jobs_insert ON public.export_jobs;
CREATE POLICY export_jobs_insert ON public.export_jobs
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS municipality_metrics_select ON public.municipality_metrics;
CREATE POLICY municipality_metrics_select ON public.municipality_metrics
  FOR SELECT TO authenticated USING (true);
