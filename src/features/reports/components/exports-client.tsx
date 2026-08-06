"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DEMO_EXPORT_JOBS,
  DEMO_MUNICIPALITY_METRICS,
  DEMO_ORG_EXECUTION,
  DEMO_REPORT_DEFINITIONS,
} from "@/lib/data/demo-analytics";
import { downloadCsv, rowsToCsv } from "@/lib/domain/analytics";
import { MAP_STATUS_LABELS, type ExportJob } from "@/types/analytics";

function exportTone(status: ExportJob["status"]) {
  if (status === "disponivel") return "success" as const;
  if (status === "erro") return "danger" as const;
  return "info" as const;
}

/** Painel de histórico de exportações (usado dentro da aba Relatórios). */
export function ExportsPanel() {
  const [jobs, setJobs] = useState(DEMO_EXPORT_JOBS);

  function regenerate(job: ExportJob) {
    if (job.reportCode === "REL-MUN") {
      const csv = rowsToCsv(
        ["Município", "Região", "Status", "Execução %", "Investimento"],
        DEMO_MUNICIPALITY_METRICS.map((m) => [
          m.name,
          m.region,
          MAP_STATUS_LABELS[m.status],
          m.executionPercent,
          m.investment,
        ]),
      );
      downloadCsv(job.fileName.replace(/\.\w+$/, ".csv"), csv);
    } else {
      const csv = rowsToCsv(
        ["Órgão", "Execução %", "Projetos", "Atrasados"],
        DEMO_ORG_EXECUTION.map((row) => [
          row.org,
          row.execution,
          row.projects,
          row.delayed,
        ]),
      );
      downloadCsv(job.fileName.replace(/\.\w+$/, ".csv"), csv);
    }

    const next: ExportJob = {
      ...job,
      id: crypto.randomUUID(),
      requestedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      status: "disponivel",
      format: "csv",
      fileName: job.fileName.replace(/\.\w+$/, `-${Date.now()}.csv`),
    };
    setJobs((prev) => [next, ...prev]);
    toast.success("Exportação regenerada em CSV.");
  }

  function createFromCatalog(code: string) {
    const report = DEMO_REPORT_DEFINITIONS.find((item) => item.code === code);
    if (!report) return;
    const job: ExportJob = {
      id: crypto.randomUUID(),
      reportCode: report.code,
      reportName: report.name,
      format: "csv",
      requestedBy: "Usuário autenticado",
      requestedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      status: "disponivel",
      rowCount:
        code === "REL-MUN"
          ? DEMO_MUNICIPALITY_METRICS.length
          : DEMO_ORG_EXECUTION.length,
      fileName: `${report.code.toLowerCase()}-${Date.now()}.csv`,
    };
    regenerate(job);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={() => createFromCatalog("REL-EXEC-EST")}>
          Nova exportação CSV
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="mb-4 text-sm text-muted-foreground">
            Histórico de exportações. No modo demo, PDF/XLSX são registrados e o
            download disponível é CSV.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Relatório</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Linhas</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="whitespace-nowrap">
                    {job.requestedAt}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{job.reportName}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.reportCode} · {job.fileName}
                    </p>
                  </TableCell>
                  <TableCell className="uppercase">{job.format}</TableCell>
                  <TableCell>{job.requestedBy}</TableCell>
                  <TableCell>{job.rowCount}</TableCell>
                  <TableCell>
                    <StatusBadge
                      label={
                        job.status === "disponivel"
                          ? "Disponível"
                          : job.status === "gerando"
                            ? "Gerando"
                            : "Erro"
                      }
                      tone={exportTone(job.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => regenerate(job)}
                    >
                      <Download className="size-3.5" />
                      Baixar CSV
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
