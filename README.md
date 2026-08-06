# SID-SED

**Sistema Integrado de Dados — Secretaria de Estado de Educação de Mato Grosso do Sul**

Plataforma da SED/MS para gestão do Contrato de Gestão, projetos estratégicos, metas, indicadores, entregas, evidências, riscos e resultados da educação estadual.

> Escopo exclusivo da Secretaria de Estado de Educação. A SEGOV permanece apenas como vínculo de validação do Contrato de Gestão.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + shadcn/ui
- React Hook Form + Zod
- Lucide Icons
- Supabase (PostgreSQL, Auth, Storage, RLS)
- Modo demo local (sem Supabase) para navegação imediata

## Pré-requisitos

- Node.js 20+
- Conta Supabase (opcional — use o modo demo)

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
| Administrador SED | `admin@sed.ms.gov.br` |
| SEGOV (validação CG) | `segov@sid.ms.gov.br` |
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
  app/(public)/        # portal público da SED
  components/layout/   # AppShell, Sidebar, Header...
  components/shared/   # MetricCard, StatusBadge, EmptyState...
  features/auth/       # actions e formulários
  lib/auth|rbac|supabase|integrations/
supabase/migrations/   # schema + RLS
supabase/seed/         # dados iniciais (SED + SEGOV)
```

## Deploy

Pronto para Vercel + Supabase Cloud. Configure as variáveis de ambiente no provedor e desative o modo demo em produção.

## Identidade visual

Azul institucional (`#0B3A66`), azul secundário, verde (sucesso), amarelo (atenção), vermelho (risco/atraso), fundo cinza-claro e cards brancos — alinhado à identidade SED/SASI.
