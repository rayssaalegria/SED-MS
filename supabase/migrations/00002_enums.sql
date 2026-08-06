-- SID-MS — Enums institucionais e de domínio (Etapa 1+)

DO $$ BEGIN
  CREATE TYPE public.org_unit_type AS ENUM (
    'governo',
    'orgao',
    'secretaria',
    'secretaria_executiva',
    'superintendencia',
    'coordenadoria',
    'unidade',
    'setor'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM (
    'admin',
    'governador',
    'segov',
    'secretario',
    'planejamento',
    'gestor_projeto',
    'responsavel_entrega',
    'avaliador',
    'auditor',
    'publico'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.entity_status AS ENUM (
    'ativo',
    'inativo',
    'suspenso'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.contract_status AS ENUM (
    'rascunho',
    'em_elaboracao',
    'em_validacao_interna',
    'em_analise_segov',
    'aguardando_ajustes',
    'aguardando_assinatura',
    'pactuado',
    'em_execucao',
    'em_revisao',
    'com_aditivo',
    'em_avaliacao',
    'concluido',
    'suspenso',
    'cancelado'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.project_status AS ENUM (
    'planejado',
    'nao_iniciado',
    'em_andamento',
    'em_atencao',
    'atrasado',
    'paralisado',
    'em_validacao',
    'concluido',
    'concluido_parcialmente',
    'cancelado'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.deliverable_status AS ENUM (
    'nao_iniciada',
    'planejada',
    'em_andamento',
    'em_atencao',
    'atrasada',
    'aguardando_evidencia',
    'em_validacao',
    'ajustes_solicitados',
    'concluida',
    'concluida_parcialmente',
    'nao_executada',
    'cancelada'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.evidence_status AS ENUM (
    'enviada',
    'em_analise',
    'aprovada',
    'rejeitada',
    'complementacao_solicitada',
    'substituida'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.risk_status AS ENUM (
    'identificado',
    'em_tratamento',
    'monitorado',
    'mitigado',
    'materializado',
    'encerrado'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.approval_decision AS ENUM (
    'aprovar',
    'reprovar',
    'solicitar_ajustes',
    'devolver',
    'cancelar'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.audit_action AS ENUM (
    'login',
    'logout',
    'create',
    'update',
    'soft_delete',
    'status_change',
    'approve',
    'reject',
    'upload',
    'download',
    'view_restricted',
    'permission_change',
    'export'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
