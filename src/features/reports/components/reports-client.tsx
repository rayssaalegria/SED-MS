"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, FileSpreadsheet } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DEMO_MUNICIPALITY_METRICS,
  DEMO_ORG_EXECUTION,
  DEMO_REPORT_DEFINITIONS,
} from "@/lib/data/demo-analytics";
import { downloadCsv, rowsToCsv } from "@/lib/domain/analytics";
import { useManagement } from "@/features/management/store";
import { useMonitoring } from "@/features/monitoring/store";
import { useGovernance } from "@/features/governance/store";
import { riskCriticality } from "@/lib/domain/monitoring";
import { MAP_STATUS_LABELS } from "@/types/analytics";
import { ExportsPanel } from "@/features/reports/components/exports-client";

export function ReportsClient({
  initialTab = "catalogo",
}: {
  initialTab?: "catalogo" | "exportacoes";
}) {
  const [tab, setTab] = useState(initialTab);
  const { projects, deliverables, contracts } = useManagement();
  const { risks } = useMonitoring();
  const { approvals } = useGovernance();

  function exportReport(code: string) {
    if (code === "REL-EXEC-EST") {
      const csv = rowsToCsv(
        ["Unidade", "Execução %", "Projetos", "Atrasados"],
        DEMO_ORG_EXECUTION.map((row) => [
          row.org,
          row.execution,
          row.projects,
          row.delayed,
        ]),
      );
      downloadCsv(`execucao-estadual-${Date.now()}.csv`, csv);
    } else if (code === "REL-SED-DET") {
      const csv = rowsToCsv(
        ["Tipo", "Código", "Nome", "Execução/Status"],
        [
          ...contracts.map((c) => [
            "Contrato",
            c.code,
            c.name,
            `${c.executionPercent}%`,
          ]),
          ...projects.map((p) => [
            "Projeto",
            p.code,
            p.name,
            `${p.executionPercent}%`,
          ]),
          ...deliverables.map((d) => ["Entrega", d.code, d.title, d.status]),
        ],
      );
      downloadCsv(`sed-detalhe-${Date.now()}.csv`, csv);
    } else if (code === "REL-MUN") {
      const csv = rowsToCsv(
        [
          "Município",
          "Região",
          "Status",
          "Projetos",
          "Entregas",
          "Execução %",
          "Investimento",
        ],
        DEMO_MUNICIPALITY_METRICS.map((m) => [
          m.name,
          m.region,
          MAP_STATUS_LABELS[m.status],
          m.projects,
          m.deliverables,
          m.executionPercent,
          m.investment,
        ]),
      );
      downloadCsv(`painel-municipal-${Date.now()}.csv`, csv);
    } else if (code === "REL-RISCOS") {
      const csv = rowsToCsv(
        ["Título", "Projeto", "P", "I", "Criticidade", "Status"],
        risks
          .filter((r) => riskCriticality(r.probability, r.impact) >= 12)
          .map((r) => [
            r.title,
            r.projectId,
            r.probability,
            r.impact,
            riskCriticality(r.probability, r.impact),
            r.status,
          ]),
      );
      downloadCsv(`riscos-criticos-${Date.now()}.csv`, csv);
    } else {
      const csv = rowsToCsv(
        ["Título", "Entidade", "Etapa", "Prazo", "Situação"],
        approvals.map((a) => [
          a.title,
          a.entityLabel,
          a.currentStep,
          a.dueDate,
          a.status,
        ]),
      );
      downloadCsv(`aprovacoes-${Date.now()}.csv`, csv);
    }
    toast.success("CSV gerado e baixado.");
  }

  return (
    <div>
      <PageHeader
        title="Relatórios"
        breadcrumbs={[{ label: "Relatórios", href: "/relatorios" }]}
      />

      <Tabs
        value={tab}
        onValueChange={(value) =>
          setTab((value as "catalogo" | "exportacoes") ?? "catalogo")
        }
      >
        <TabsList className="mb-4">
          <TabsTrigger value="catalogo">Catálogo</TabsTrigger>
          <TabsTrigger value="exportacoes">Exportações</TabsTrigger>
        </TabsList>

        <TabsContent value="catalogo">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {DEMO_REPORT_DEFINITIONS.map((report) => (
              <Card key={report.id} className="border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-start gap-2 text-base">
                    <FileSpreadsheet className="mt-0.5 size-4 shrink-0" />
                    {report.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-muted-foreground">{report.description}</p>
                  <p>
                    <strong>Código:</strong> {report.code}
                  </p>
                  <p>
                    <strong>Público:</strong> {report.audience}
                  </p>
                  <p>
                    <strong>Formatos:</strong>{" "}
                    {report.formats.join(", ").toUpperCase()}
                  </p>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => exportReport(report.code)}
                  >
                    <Download className="size-4" />
                    Exportar CSV
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="exportacoes">
          <ExportsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
