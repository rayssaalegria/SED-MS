# SID-MS

**Sistema Integrado de Dados de Mato Grosso do Sul**

Plataforma estadual para gestão de Contratos de Gestão, projetos estratégicos, metas, indicadores, entregas, evidências, riscos e resultados das secretarias.

> Etapas 1–7 concluídas: auth, cadastros, gestão, monitoramento, governança, dashboards/mapa/relatórios e portal público.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + shadcn/ui
- React Hook Form + Zod
- Lucide Icons
- Supabase (PostgreSQL, Auth, Storage, RLS)
- Modo demo local (sem Supabase) para navegação imediata

## Pré-requisitos

- Node.js 20+
- Conta Supabase (opcional na Etapa 1 — use o modo demo)

## Instalação

```bash
npm install
cp .env.example .env.local
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Modo demonstração

Com `NEXT_PUBLIC_DEMO_MODE=true` (padrão no `.env.example`), o login funciona sem Supabase.

**Senha de todos os usuários de teste:** `SidMS@2026`

| Perfil | E-mail |
|--------|--------|
| Administrador | `admin@sid.ms.gov.br` |
| Governador | `governador@sid.ms.gov.br` |
| SEGOV | `segov@sid.ms.gov.br` |
| Secretário SED | `secretario.sed@sid.ms.gov.br` |
| Gestor de projeto | `gestor.sed@sid.ms.gov.br` |
| Responsável por entrega | `entrega.sed@sid.ms.gov.br` |
| Avaliador | `avaliador@sid.ms.gov.br` |

## Configurar Supabase (produção / integração real)

1. Crie um projeto no Supabase.
2. Aplique as migrations em `supabase/migrations/` (SQL Editor ou CLI).
3. Execute o seed `supabase/seed/01_permissions_organizations.sql`.
4. Preencha no `.env.local`:

```env
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

5. Crie os usuários:

```bash
npm run seed:users
```

## Scripts

```bash
npm run dev          # desenvolvimento
npm run build        # build de produção
npm run start        # servidor de produção
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm run seed:users   # usuários no Supabase Auth
```

## Estrutura principal

```text
src/
  app/(auth)/          # login, recuperação, primeiro acesso, senha
  app/(app)/           # área autenticada
  app/(public)/        # portal público
  components/layout/   # AppShell, Sidebar, Header...
  components/shared/   # MetricCard, StatusBadge, EmptyState...
  features/auth/       # actions e formulários
  lib/auth|rbac|supabase|integrations/
supabase/migrations/   # schema + RLS
supabase/seed/         # dados iniciais
```

## O que a Etapa 1 entrega

- Autenticação (login, recuperar senha, primeiro acesso, alterar senha)
- Sessão protegida + middleware + redirect por perfil
- Menu lateral recolhível filtrado por permissões
- Seleção de órgão quando o usuário tem mais de um vínculo
- Dashboards estadual e da secretaria (dados demonstrativos)
- Cadastro demonstrativo de órgãos + organograma navegável
- Usuários, perfis/permissões, notificações e logs de auditoria (demo)
- Portal público mínimo em `/publico`
- Migrations SQL + RLS + seed institucional
- Abstrações para integrações governamentais futuras

## O que a Etapa 2 entrega

- Layout alinhado ao design Figma (sidebar escura, header, logo SED, rodapé SASI)
- CRUD demonstrativo de órgãos (criar + listar + buscar)
- Organograma com unidades da SED
- Cadastro dos 79 municípios de MS (busca e filtro por região)
- Configurações estratégicas: pilares, ODS e programas do PPA
- Migration `00006_municipalities_strategic.sql`

## O que a Etapa 3 entrega

- Contrato de Gestão SED 2026 (lista, novo, detalhe com abas)
- 3 programas, 6 projetos, 15 entregas e atividades demonstrativas
- Regras: evidência obrigatória, justificativa de atraso/parcial, exclusão lógica
- Cálculo automático de % do projeto (entregas) e do contrato (projetos)
- Atividades com visualizações Lista, Kanban e Linha do tempo
- Migration `00007_contracts_projects.sql`

## O que a Etapa 4 entrega

- Indicadores com status automático, tendência e detalhe com série histórica (Recharts)
- Evidências com validação (aprovar / rejeitar / solicitar complementação)
- Orçamento: previsto × pago, gap físico×financeiro e alertas
- Riscos com matriz probabilidade × impacto e planos de tratamento
- Impedimentos com atualização de status e solução
- Migration `00008_monitoring.sql`

## O que a Etapa 5 entrega

- Fila de aprovações com fluxo planejamento → secretário → SEGOV/avaliador
- Solicitações de alteração com versionamento (valor anterior/novo, motivo e parecer)
- Aditivos contratuais com avanço de etapas e comparação de cláusulas
- Avaliações anuais (autoavaliação, nota SEGOV e plano de melhoria)
- Auditoria completa com filtros por ação e trilha gerada pelas decisões
- Migration `00009_governance.sql`

## O que a Etapa 6 entrega

- Dashboard estadual com gráficos Recharts e painel “Atenção da gestão”
- Dashboard da secretaria com filtro por projeto e métricas do store demo
- Agenda estratégica (prazos, comitês, entregas e avaliações)
- Mapa estadual dos 79 municípios (status, investimento e detalhe)
- Central de relatórios + histórico de exportações com download CSV
  (tudo na aba Relatórios do menu)
- Migration `00010_analytics.sql`

## O que a Etapa 7 entrega

- Portal público em `/publico` (sem autenticação)
- Listagem de programas e projetos marcados como públicos
- Filtros: secretaria, município, ano, programa, pilar e situação
- Detalhe público com execução, investimento, entregas concluídas, indicadores e documentos públicos
- Sem dados pessoais, riscos sigilosos ou documentos restritos
- Migration `00011_public_portal.sql`

## Deploy

Pronto para Vercel + Supabase Cloud. Configure as variáveis de ambiente no provedor e desative o modo demo em produção.

## Identidade visual

Azul institucional (`#0B3A66`), azul secundário, verde (sucesso), amarelo (atenção), vermelho (risco/atraso), fundo cinza-claro e cards brancos.
