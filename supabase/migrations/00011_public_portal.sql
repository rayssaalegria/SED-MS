-- SID-MS — Portal público: flags de publicação (Etapa 7)

ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_programs_public ON public.programs(is_public)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_public ON public.projects(is_public)
  WHERE deleted_at IS NULL;

-- Leitura anônima apenas de registros públicos (portal)
DROP POLICY IF EXISTS programs_public_select ON public.programs;
CREATE POLICY programs_public_select ON public.programs
  FOR SELECT TO anon
  USING (is_public = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS projects_public_select ON public.projects;
CREATE POLICY projects_public_select ON public.projects
  FOR SELECT TO anon
  USING (is_public = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS contracts_public_select ON public.management_contracts;
CREATE POLICY contracts_public_select ON public.management_contracts
  FOR SELECT TO anon
  USING (is_public = true AND deleted_at IS NULL);
