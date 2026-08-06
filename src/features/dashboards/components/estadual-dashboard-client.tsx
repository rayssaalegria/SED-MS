"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  FileText,
  Package,
  TimerReset,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEMO_ATTENTION_ITEMS,
  DEMO_MONTHLY_SERIES,
  DEMO_ORG_EXECUTION,
} from "@/lib/data/demo-analytics";
import { useGovernance } from "@/features/governance/store";
import { useManagement } from "@/features/management/store";
import { useMonitoring } from "@/features/monitoring/store";
import { isOpenApproval } from "@/lib/domain/governance";
import { riskCriticality } from "@/lib/domain/monitoring";

export function EstadualDashboardClient() {
  const { contracts, projects, deliverables } = useManagement();
  const { evidences, risks, indicators } = useMonitoring();
  const { approvals } = useGovernance();

  const metrics = useMemo(() => {
    const avgExecution =
      contracts.length === 0
        ? 0
        : Math.round(
            contracts.reduce((s, c) => s + c.executionPercent, 0) /
              contracts.length,
          );
    const delayedDeliverables = deliverables.filter(
      (d) => d.status === "atrasada",
    ).length;
    const pendingEvidences = evidences.filter(
      (e) =>
        e.status === "enviada" ||
        e.status === "em_analise" ||
        e.status === "complementacao_solicitada",
    ).length;
    const criticalRisks = risks.filter(
      (r) => riskCriticality(r.probability, r.impact) >= 12,
    ).length;
    const metasOk = indicators.filter((i) => {
      if (i.annualTarget === 0) return false;
      return i.currentResult >= i.annualTarget * 0.9;
    }).length;
    const openApprovals = approvals.filter((a) =>
      isOpenApproval(a.status),
    ).length;

    return {
      avgExecution,
      contracts: contracts.length,
      projects: projects.length,
      delayedDeliverables,
      pendingEvidences,
      criticalRisks,
      metasOk,
      openApprovals,
    };
  }, [approvals, contracts, deliverables, evidences, indicators, projects, risks]);

  return (
    <div>
      <PageHeader
        title="Visão consolidada da SED"
        description="Painel executivo do Contrato de Gestão e portfólio da Secretaria de Estado de Educação."
        breadcrumbs={[
          { label: "Início", href: "/dashboard" },
          { label: "Visão consolidada" },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Execução geral"
          value={`${metrics.avgExecution}%`}
          description="Média do Contrato de Gestão SED 2026"
          icon={CheckCircle2}
          trend="up"
        />
        <MetricCard
          title="Contratos ativos"
          value={metrics.contracts}
          description="Ciclo 2026 em execução"
          icon={FileText}
        />
        <MetricCard
          title="Projetos"
          value={metrics.projects}
          description="Portfólio estratégico da SED"
          icon={Package}
        />
        <MetricCard
          title="Entregas atrasadas"
          value={metrics.delayedDeliverables}
          description="Requer atenção da gestão"
          icon={TimerReset}
          trend="down"
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Metas no esperado"
          value={metrics.metasOk}
          description="Indicadores ≥ 90% da meta"
        />
        <MetricCard
          title="Aprovações abertas"
          value={metrics.openApprovals}
          description="Fila interna e validação SEGOV"
        />
        <MetricCard
          title="Evidências em validação"
          value={metrics.pendingEvidences}
          description="Aguardando avaliadores"
          icon={ClipboardList}
        />
        <MetricCard
          title="Riscos críticos"
          value={metrics.criticalRisks}
          description="Probabilidade × impacto ≥ 12"
          icon={AlertTriangle}
          trend="down"
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Execução por unidade da SED
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEMO_ORG_EXECUTION}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="org" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="execution"
                  name="Execução %"
                  fill="#1b2030"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="delayed"
                  name="Projetos atrasados"
                  fill="#7d141d"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Evolução física × financeira × metas
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DEMO_MONTHLY_SERIES}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="fisica"
                  name="Física"
                  stroke="#1b2030"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="financeira"
                  name="Financeira"
                  stroke="#7d141d"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="metas"
                  name="Metas"
                  stroke="#1d4ed8"
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Atenção da gestão</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {DEMO_ATTENTION_ITEMS.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-md border border-border bg-muted/30 p-3"
            >
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.org}</p>
              </div>
              <StatusBadge label={item.label} tone={item.tone} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
