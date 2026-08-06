"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGovernance } from "@/features/governance/store";
import { formatCurrency } from "@/features/management/utils";
import {
  AMENDMENT_STATUS_LABELS,
  AMENDMENT_TYPE_LABELS,
  type ContractAmendment,
} from "@/types/governance";

function amendmentTone(status: ContractAmendment["status"]) {
  if (status === "vigente") return "success" as const;
  if (status === "rejeitado" || status === "cancelado") return "danger" as const;
  if (status === "em_analise" || status === "aguardando_assinatura") {
    return "info" as const;
  }
  if (status === "em_elaboracao") return "warning" as const;
  return "neutral" as const;
}

export function AmendmentsClient() {
  const { amendments, upsertAmendment } = useGovernance();
  const [selected, setSelected] = useState<ContractAmendment | null>(null);

  const totals = useMemo(() => {
    const vigente = amendments.filter((a) => a.status === "vigente").length;
    const emAnalise = amendments.filter(
      (a) => a.status === "em_analise" || a.status === "aguardando_assinatura",
    ).length;
    const valor = amendments
      .filter((a) => a.status !== "rejeitado" && a.status !== "cancelado")
      .reduce((sum, a) => sum + a.valueImpact, 0);
    return { vigente, emAnalise, valor };
  }, [amendments]);

  function advance(item: ContractAmendment) {
    const flow: ContractAmendment["status"][] = [
      "rascunho",
      "em_elaboracao",
      "em_analise",
      "aguardando_assinatura",
      "vigente",
    ];
    const idx = flow.indexOf(item.status);
    if (idx < 0 || idx >= flow.length - 1) {
      toast.info("Aditivo já está na etapa final ou fora do fluxo.");
      return;
    }
    const next = flow[idx + 1];
    upsertAmendment({
      ...item,
      status: next,
      approvedBy:
        next === "vigente" ? "Fernanda Oliveira Costa" : item.approvedBy,
      approvedAt:
        next === "vigente"
          ? new Date().toISOString().slice(0, 10)
          : item.approvedAt,
      effectiveDate:
        next === "vigente"
          ? new Date().toISOString().slice(0, 10)
          : item.effectiveDate,
    });
    toast.success(`Aditivo avançou para ${AMENDMENT_STATUS_LABELS[next]}.`);
  }

  return (
    <div>
      <PageHeader
        title="Aditivos contratuais"
        breadcrumbs={[
          { label: "Governança", href: "/aditivos" },
          { label: "Aditivos" },
        ]}
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <MetricCard title="Vigentes" value={totals.vigente} />
        <MetricCard title="Em análise / assinatura" value={totals.emAnalise} />
        <MetricCard
          title="Impacto financeiro acumulado"
          value={formatCurrency(totals.valor)}
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Impacto</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {amendments.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.code}</TableCell>
                  <TableCell>{item.contractLabel}</TableCell>
                  <TableCell>{AMENDMENT_TYPE_LABELS[item.type]}</TableCell>
                  <TableCell>v{item.version}</TableCell>
                  <TableCell className="text-sm">
                    {formatCurrency(item.valueImpact)}
                    {item.daysImpact > 0 ? ` · +${item.daysImpact}d` : ""}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={AMENDMENT_STATUS_LABELS[item.status]}
                      tone={amendmentTone(item.status)}
                    />
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setSelected(item)}
                    >
                      Ver
                    </Button>
                    {item.status !== "vigente" &&
                      item.status !== "rejeitado" &&
                      item.status !== "cancelado" && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => advance(item)}
                        >
                          Avançar
                        </Button>
                      )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <p>{selected.summary}</p>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Cláusula anterior</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  {selected.previousClause}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Cláusula nova</CardTitle>
                </CardHeader>
                <CardContent>{selected.newClause}</CardContent>
              </Card>
              <p>
                <strong>Solicitante:</strong> {selected.requestedBy} em{" "}
                {selected.requestedAt}
              </p>
              {selected.approvedBy && (
                <p>
                  <strong>Aprovado por:</strong> {selected.approvedBy} em{" "}
                  {selected.approvedAt}
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelected(null)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
