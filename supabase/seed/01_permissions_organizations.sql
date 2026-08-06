-- SID-MS — Seed: permissões, órgãos iniciais e papéis (Etapa 1)
-- Usuários Auth devem ser criados via script scripts/seed-demo-users.mjs

INSERT INTO public.permissions (code, name, description, module) VALUES
  ('dashboard.estadual', 'Dashboard estadual', 'Visualizar dashboard consolidado', 'dashboard'),
  ('dashboard.secretaria', 'Dashboard secretaria', 'Visualizar dashboard da secretaria', 'dashboard'),
  ('organizations.manage', 'Gerenciar órgãos', 'CRUD de órgãos e unidades', 'admin'),
  ('users.manage', 'Gerenciar usuários', 'CRUD de usuários e perfis', 'admin'),
  ('permissions.manage', 'Gerenciar permissões', 'Definir papéis e permissões', 'admin'),
  ('contracts.read', 'Consultar contratos', 'Listar e detalhar contratos', 'contracts'),
  ('contracts.write', 'Editar contratos', 'Criar e editar contratos', 'contracts'),
  ('projects.read', 'Consultar projetos', 'Listar e detalhar projetos', 'projects'),
  ('projects.write', 'Editar projetos', 'Criar e editar projetos', 'projects'),
  ('deliverables.read', 'Consultar entregas', 'Listar e detalhar entregas', 'deliverables'),
  ('deliverables.write', 'Editar entregas', 'Atualizar entregas e evidências', 'deliverables'),
  ('indicators.read', 'Consultar indicadores', 'Visualizar indicadores', 'indicators'),
  ('indicators.write', 'Editar indicadores', 'Atualizar indicadores', 'indicators'),
  ('evidences.validate', 'Validar evidências', 'Aprovar ou rejeitar evidências', 'evidences'),
  ('approvals.act', 'Atuar em aprovações', 'Decidir fluxos de aprovação', 'approvals'),
  ('reports.export', 'Exportar relatórios', 'Gerar e exportar relatórios', 'reports'),
  ('audit.read', 'Consultar auditoria', 'Visualizar logs de auditoria', 'audit'),
  ('settings.manage', 'Configurações', 'Administrar configurações do sistema', 'admin')
ON CONFLICT (code) DO NOTHING;

-- Mapeamento papel → permissões
INSERT INTO public.role_permissions (role, permission_id)
SELECT r.role, p.id
FROM (
  VALUES
    ('admin'::public.user_role, 'dashboard.estadual'),
    ('admin', 'dashboard.secretaria'),
    ('admin', 'organizations.manage'),
    ('admin', 'users.manage'),
    ('admin', 'permissions.manage'),
    ('admin', 'contracts.read'),
    ('admin', 'contracts.write'),
    ('admin', 'projects.read'),
    ('admin', 'projects.write'),
    ('admin', 'deliverables.read'),
    ('admin', 'deliverables.write'),
    ('admin', 'indicators.read'),
    ('admin', 'indicators.write'),
    ('admin', 'evidences.validate'),
    ('admin', 'approvals.act'),
    ('admin', 'reports.export'),
    ('admin', 'audit.read'),
    ('admin', 'settings.manage'),
    ('governador', 'dashboard.estadual'),
    ('governador', 'contracts.read'),
    ('governador', 'projects.read'),
    ('governador', 'deliverables.read'),
    ('governador', 'indicators.read'),
    ('governador', 'reports.export'),
    ('segov', 'dashboard.estadual'),
    ('segov', 'dashboard.secretaria'),
    ('segov', 'organizations.manage'),
    ('segov', 'contracts.read'),
    ('segov', 'contracts.write'),
    ('segov', 'projects.read'),
    ('segov', 'projects.write'),
    ('segov', 'deliverables.read'),
    ('segov', 'indicators.read'),
    ('segov', 'approvals.act'),
    ('segov', 'reports.export'),
    ('segov', 'audit.read'),
    ('secretario', 'dashboard.secretaria'),
    ('secretario', 'contracts.read'),
    ('secretario', 'contracts.write'),
    ('secretario', 'projects.read'),
    ('secretario', 'projects.write'),
    ('secretario', 'deliverables.read'),
    ('secretario', 'indicators.read'),
    ('secretario', 'approvals.act'),
    ('secretario', 'reports.export'),
    ('planejamento', 'dashboard.secretaria'),
    ('planejamento', 'contracts.read'),
    ('planejamento', 'contracts.write'),
    ('planejamento', 'projects.read'),
    ('planejamento', 'projects.write'),
    ('planejamento', 'deliverables.read'),
    ('planejamento', 'deliverables.write'),
    ('planejamento', 'indicators.read'),
    ('planejamento', 'indicators.write'),
    ('planejamento', 'reports.export'),
    ('gestor_projeto', 'dashboard.secretaria'),
    ('gestor_projeto', 'projects.read'),
    ('gestor_projeto', 'projects.write'),
    ('gestor_projeto', 'deliverables.read'),
    ('gestor_projeto', 'deliverables.write'),
    ('gestor_projeto', 'indicators.read'),
    ('gestor_projeto', 'indicators.write'),
    ('responsavel_entrega', 'dashboard.secretaria'),
    ('responsavel_entrega', 'deliverables.read'),
    ('responsavel_entrega', 'deliverables.write'),
    ('avaliador', 'dashboard.secretaria'),
    ('avaliador', 'projects.read'),
    ('avaliador', 'deliverables.read'),
    ('avaliador', 'evidences.validate'),
    ('avaliador', 'approvals.act'),
    ('auditor', 'dashboard.estadual'),
    ('auditor', 'contracts.read'),
    ('auditor', 'projects.read'),
    ('auditor', 'deliverables.read'),
    ('auditor', 'indicators.read'),
    ('auditor', 'audit.read'),
    ('auditor', 'reports.export')
) AS r(role, permission_code)
JOIN public.permissions p ON p.code = r.permission_code
ON CONFLICT (role, permission_id) DO NOTHING;

-- Governo + órgãos iniciais
INSERT INTO public.organizations (id, name, acronym, type, status, area_of_activity)
VALUES
  ('11111111-1111-1111-1111-111111111001', 'Governo do Estado de Mato Grosso do Sul', 'GOV-MS', 'governo', 'ativo', 'Administração estadual'),
  ('11111111-1111-1111-1111-111111111002', 'Controladoria-Geral do Estado', 'CGE', 'orgao', 'ativo', 'Controle interno'),
  ('11111111-1111-1111-1111-111111111003', 'Procuradoria-Geral do Estado', 'PGE', 'orgao', 'ativo', 'Consultoria jurídica'),
  ('11111111-1111-1111-1111-111111111004', 'Secretaria de Estado da Casa Civil', 'CASA CIVIL', 'secretaria', 'ativo', 'Coordenação governamental'),
  ('11111111-1111-1111-1111-111111111005', 'Secretaria de Estado de Administração', 'SAD', 'secretaria', 'ativo', 'Gestão administrativa'),
  ('11111111-1111-1111-1111-111111111006', 'Secretaria de Estado de Assistência Social e dos Direitos Humanos', 'SEAD', 'secretaria', 'ativo', 'Assistência social'),
  ('11111111-1111-1111-1111-111111111007', 'Secretaria de Estado da Cidadania', 'SEC', 'secretaria', 'ativo', 'Cidadania'),
  ('11111111-1111-1111-1111-111111111008', 'Secretaria de Estado de Educação', 'SED', 'secretaria', 'ativo', 'Educação'),
  ('11111111-1111-1111-1111-111111111009', 'Secretaria de Estado de Fazenda', 'SEFAZ', 'secretaria', 'ativo', 'Finanças públicas'),
  ('11111111-1111-1111-1111-111111111010', 'Secretaria de Estado de Governo e Gestão Estratégica', 'SEGOV', 'secretaria', 'ativo', 'Gestão estratégica'),
  ('11111111-1111-1111-1111-111111111011', 'Secretaria de Estado de Infraestrutura e Logística', 'SEILOG', 'secretaria', 'ativo', 'Infraestrutura'),
  ('11111111-1111-1111-1111-111111111012', 'Secretaria de Estado de Justiça e Segurança Pública', 'SEJUSP', 'secretaria', 'ativo', 'Segurança pública'),
  ('11111111-1111-1111-1111-111111111013', 'Secretaria de Estado de Meio Ambiente, Desenvolvimento, Ciência, Tecnologia e Inovação', 'SEMADESC', 'secretaria', 'ativo', 'Meio ambiente e inovação'),
  ('11111111-1111-1111-1111-111111111014', 'Secretaria de Estado de Saúde', 'SES', 'secretaria', 'ativo', 'Saúde'),
  ('11111111-1111-1111-1111-111111111015', 'Secretaria de Estado de Turismo, Esporte e Cultura', 'SETESC', 'secretaria', 'ativo', 'Turismo, esporte e cultura')
ON CONFLICT (acronym) DO NOTHING;

UPDATE public.organizations o
SET parent_id = '11111111-1111-1111-1111-111111111001'
WHERE o.acronym <> 'GOV-MS'
  AND o.parent_id IS NULL
  AND o.id IN (
    SELECT id FROM public.organizations
    WHERE acronym IN (
      'CGE','PGE','CASA CIVIL','SAD','SEAD','SEC','SED','SEFAZ',
      'SEGOV','SEILOG','SEJUSP','SEMADESC','SES','SETESC'
    )
  );
