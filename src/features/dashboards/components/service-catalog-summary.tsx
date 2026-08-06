"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBudgetModule } from "@/features/budgets/store";
import { useGovernance } from "@/features/governance/store";
import { useManagement } from "@/features/management/store";
import { useMonitoring } from "@/features/monitoring/store";
import { MENU_GROUPS, type MenuItem } from "@/lib/constants/menu";
import {
  DEMO_AGENDA_EVENTS,
  DEMO_REPORT_DEFINITIONS,
} from "@/lib/data/demo-analytics";
import { DEMO_NOTIFICATIONS } from "@/lib/data/demo-notifications";
import { DEMO_ORGANIZATIONS } from "@/lib/data/demo-organizations";
import { DEMO_ORG_UNITS } from "@/lib/data/demo-units";
import { MUNICIPALITIES } from "@/lib/data/municipalities";
import { DEMO_ACCOUNTS } from "@/lib/auth/demo-users";
import { isOpenApproval } from "@/lib/domain/governance";
import { riskCriticality } from "@/lib/domain/monitoring";
import { hasPermission, ROLE_PERMISSIONS } from "@/lib/rbac/permissions";
import type { SessionUser } from "@/types/domain";
import { cn } from "@/lib/utils";

type ServiceSnapshot = {
  value: string;
  detail: string;
  tone?: "neutral" | "attention" | "ok";
};

function ServiceTile({
  title,
  href,
  icon: Icon,
  snapshot,
}: {
  title: string;
  href: string;
  icon: LucideIcon;
  snapshot: ServiceSnapshot;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-start gap-3 rounded-lg border border-border/80 bg-background px-3 py-3 transition-colors",
        "hover:border-[var(--ms-primary)]/35 hover:bg-[var(--ms-primary)]/[0.03]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ms-primary)]/40",
      )}
    >
      <div className="mt-0.5 rounded-md bg-[var(--ms-primary)]/10 p-2 text-[var(--ms-primary)]">
        <Icon className="size-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-[#1b2030]">{title}</p>
          <ChevronRight
            className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--ms-primary)]"
            aria-hidden
          />
        </div>
        <p className="mt-1 text-lg font-semibold tabular-nums leading-none text-foreground">
          {snapshot.value}
        </p>
        <p
          className={cn(
            "mt-1 text-xs",
            snapshot.tone === "attention" && "text-[var(--ms-danger)]",
            snapshot.tone === "ok" && "text-[var(--ms-success)]",
            (!snapshot.tone || snapshot.tone === "neutral") &&
              "text-muted-foreground",
          )}
        >
          {snapshot.detail}
        </p>
      </div>
    </Link>
  );
}

export function ServiceCatalogSummary({ user }: { user: SessionUser }) {
  const { contracts, programs, projects, deliverables, activities } =
    useManagement();
  const { evidences, risks, impediments, indicators } = useMonitoring();
  const { approvals, changeRequests, amendments, evaluations, auditLogs } =
    useGovernance();
  const {
    budgets: budgetForecasts,
    processes,
    executions,
  } = useBudgetModule();

  const snapshots = useMemo(() => {
    const avgExecution =
      contracts.length === 0
        ? 0
        : Math.round(
            contracts.reduce((sum, item) => sum + item.executionPercent, 0) /
              contracts.length,
          );
    const delayedDeliverables = deliverables.filter(
      (item) => item.status === "atrasada",
    ).length;
    const openActivities = activities.filter(
      (item) =>
        item.status === "nao_iniciada" ||
        item.status === "em_andamento" ||
        item.status === "bloqueada" ||
        item.status === "em_validacao",
    ).length;
    const pendingEvidences = evidences.filter(
      (item) =>
        item.status === "enviada" ||
        item.status === "em_analise" ||
        item.status === "complementacao_solicitada",
    ).length;
    const criticalRisks = risks.filter(
      (item) => riskCriticality(item.probability, item.impact) >= 12,
    ).length;
    const openImpediments = impediments.filter(
      (item) =>
        item.status === "aberto" ||
        item.status === "em_analise" ||
        item.status === "em_tratamento" ||
        item.status === "dependencia_externa",
    ).length;
    const metasOk = indicators.filter((item) => {
      if (item.annualTarget === 0) return false;
      return item.currentResult >= item.annualTarget * 0.9;
    }).length;
    const openApprovals = approvals.filter((item) =>
      isOpenApproval(item.status),
    ).length;
    const openChanges = changeRequests.filter(
      (item) =>
        item.status === "rascunho" ||
        item.status === "enviada" ||
        item.status === "em_analise",
    ).length;
    const openAmendments = amendments.filter(
      (item) =>
        item.status === "rascunho" ||
        item.status === "em_elaboracao" ||
        item.status === "em_analise" ||
        item.status === "aguardando_assinatura",
    ).length;
    const openEvaluations = evaluations.filter(
      (item) =>
        item.status === "em_autoavaliacao" ||
        item.status === "enviada_segov" ||
        item.status === "em_analise_segov" ||
        item.status === "com_plano_melhoria",
    ).length;
    const unreadNotifications = DEMO_NOTIFICATIONS.filter(
      (item) => !item.read,
    ).length;
    const upcomingAgenda = DEMO_AGENDA_EVENTS.filter(
      (item) => item.status === "agendado",
    ).length;
    const activeMunicipalities = MUNICIPALITIES.filter(
      (item) => item.status === "ativo",
    ).length;
    const budgetTotal = budgetForecasts.reduce(
      (sum, item) => sum + item.plannedValue,
      0,
    );
    const openProcesses = processes.filter(
      (item) =>
        item.status === "rascunho" ||
        item.status === "aberto" ||
        item.status === "em_andamento",
    ).length;
    const roleCount = Object.keys(ROLE_PERMISSIONS).filter(
      (role) => role !== "publico",
    ).length;
    const activeExecutions = executions.filter(
      (item) =>
        item.status === "em_execucao" || item.status === "vigente",
    ).length;

    const map: Record<string, ServiceSnapshot> = {
      "/dashboard": {
        value: `${avgExecution}%`,
        detail: "Execução média do CG da SED",
        tone: avgExecution >= 70 ? "ok" : "attention",
      },
      "/agenda": {
        value: String(upcomingAgenda),
        detail: "Compromissos estratégicos agendados",
      },
      "/notificacoes": {
        value: String(unreadNotifications),
        detail: "Alertas não lidos",
        tone: unreadNotifications > 0 ? "attention" : "ok",
      },
      "/contratos": {
        value: String(contracts.length),
        detail: `Contratos · média ${avgExecution}%`,
      },
      "/programas": {
        value: String(programs.length),
        detail: "Programas estratégicos",
      },
      "/projetos": {
        value: String(projects.length),
        detail: "Projetos no portfólio",
      },
      "/entregas": {
        value: String(delayedDeliverables),
        detail:
          delayedDeliverables === 0
            ? `${deliverables.length} entregas no ciclo`
            : `atrasadas de ${deliverables.length}`,
        tone: delayedDeliverables > 0 ? "attention" : "ok",
      },
      "/indicadores": {
        value: String(metasOk),
        detail: `metas no esperado de ${indicators.length}`,
        tone: metasOk >= Math.ceil(indicators.length * 0.6) ? "ok" : "attention",
      },
      "/atividades": {
        value: String(openActivities),
        detail: `em aberto de ${activities.length}`,
      },
      "/evidencias": {
        value: String(pendingEvidences),
        detail: "em validação",
        tone: pendingEvidences > 0 ? "attention" : "ok",
      },
      "/orcamento": {
        value:
          budgetTotal >= 1_000_000
            ? `R$ ${(budgetTotal / 1_000_000).toFixed(1)} mi`
            : `R$ ${Math.round(budgetTotal / 1000)} mil`,
        detail: `${budgetForecasts.length} previsões cadastradas`,
      },
      "/orcamento?aba=execucao": {
        value: String(activeExecutions),
        detail: `contratos em execução de ${executions.length}`,
      },
      "/orcamento?aba=financeiro": {
        value: String(openProcesses),
        detail: "processos com recurso em acompanhamento",
      },
      "/riscos": {
        value: String(criticalRisks),
        detail: `críticos de ${risks.length}`,
        tone: criticalRisks > 0 ? "attention" : "ok",
      },
      "/impedimentos": {
        value: String(openImpediments),
        detail: `abertos de ${impediments.length}`,
        tone: openImpediments > 0 ? "attention" : "ok",
      },
      "/aprovacoes": {
        value: String(openApprovals),
        detail: "aguardando decisão",
        tone: openApprovals > 0 ? "attention" : "ok",
      },
      "/alteracoes": {
        value: String(openChanges),
        detail: "solicitações em tramitação",
      },
      "/aditivos": {
        value: String(openAmendments),
        detail: "aditivos em análise",
      },
      "/avaliacoes": {
        value: String(openEvaluations),
        detail: `ciclos em andamento de ${evaluations.length}`,
      },
      "/municipios": {
        value: String(activeMunicipalities),
        detail: "municípios da rede",
      },
      "/mapa": {
        value: String(activeMunicipalities),
        detail: "visão territorial da educação",
      },
      "/relatorios": {
        value: String(DEMO_REPORT_DEFINITIONS.length),
        detail: "relatórios disponíveis",
      },
      "/orgaos": {
        value: String(DEMO_ORGANIZATIONS.length),
        detail: "órgãos no escopo SED/SEGOV",
      },
      "/estrutura": {
        value: String(DEMO_ORG_UNITS.length),
        detail: "unidades organizacionais",
      },
      "/usuarios": {
        value: String(DEMO_ACCOUNTS.length),
        detail: "contas de acesso (demo)",
      },
      "/perfis": {
        value: String(roleCount),
        detail: "papéis e permissões",
      },
      "/configuracoes": {
        value: "Ativo",
        detail: "parâmetros do sistema",
      },
      "/auditoria": {
        value: String(auditLogs.length),
        detail: "registros recentes",
      },
    };

    return map;
  }, [
    activities,
    amendments,
    approvals,
    auditLogs,
    budgetForecasts,
    changeRequests,
    contracts,
    deliverables,
    evaluations,
    evidences,
    executions,
    impediments,
    indicators,
    processes,
    programs,
    projects,
    risks,
  ]);

  const groups = useMemo(
    () =>
      MENU_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            hasPermission(user.permissions, item.permissions) &&
            (!item.roles || item.roles.includes(user.activeRole)),
        ),
      })).filter((group) => group.items.length > 0),
    [user.activeRole, user.permissions],
  );

  const resolveSnapshot = (item: MenuItem): ServiceSnapshot =>
    snapshots[item.href] ?? {
      value: "—",
      detail: "Acessar módulo",
    };

  return (
    <section className="space-y-4" aria-labelledby="service-catalog-title">
      <div>
        <h2
          id="service-catalog-title"
          className="text-lg font-semibold tracking-tight text-[#1b2030]"
        >
          Mapa de serviços
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumo de todas as pastas do menu lateral para visão executiva do
          secretário.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {groups.map((group) => (
          <Card key={group.title} className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{group.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {group.items.map((item) => (
                <ServiceTile
                  key={item.href}
                  title={item.title}
                  href={item.href}
                  icon={item.icon}
                  snapshot={resolveSnapshot(item)}
                />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
