"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useManagement } from "@/features/management/store";
import { deliverableTone, formatDate } from "@/features/management/utils";
import {
  ACTIVITY_STATUS_LABELS,
  DELIVERABLE_STATUS_LABELS,
  type DeliverableStatus,
} from "@/types/management";
import {
  VALIDATION_MESSAGES,
  validateDeliverableCompletion,
} from "@/lib/domain/progress";

export function DeliverableDetailClient({ id }: { id: string }) {
  const { deliverables, projects, activities, upsertDeliverable } =
    useManagement();
  const found = deliverables.find((item) => item.id === id);
  if (!found) notFound();
  const deliverable = found;

  const project = projects.find((p) => p.id === deliverable.projectId);
  const relatedActivities = activities.filter(
    (a) => a.deliverableId === deliverable.id,
  );

  const [status, setStatus] = useState(deliverable.status);
  const [executionPercent, setExecutionPercent] = useState(
    String(deliverable.executionPercent),
  );
  const [hasEvidence, setHasEvidence] = useState(deliverable.hasEvidence);
  const [delayJustification, setDelayJustification] = useState(
    deliverable.delayJustification ?? "",
  );
  const [partialJustification, setPartialJustification] = useState(
    deliverable.partialJustification ?? "",
  );

  function handleSave() {
    const next = {
      ...deliverable,
      status,
      executionPercent: Number(executionPercent) || 0,
      hasEvidence,
      delayJustification,
      partialJustification,
      updatedAt: new Date().toISOString().slice(0, 10),
      completedAt:
        status === "concluida" || status === "concluida_parcialmente"
          ? new Date().toISOString().slice(0, 10)
          : deliverable.completedAt,
    } as const;

    const error = validateDeliverableCompletion(next);
    if (error) {
      toast.error(VALIDATION_MESSAGES[error]);
      return;
    }

    upsertDeliverable({ ...next });
    toast.success("Entrega atualizada. Percentual do projeto recalculado.");
  }

  return (
    <div>
      <PageHeader
        title={deliverable.title}
        description={`${deliverable.code} · ${deliverable.ownerName}`}
        breadcrumbs={[
          { label: "Entregas", href: "/entregas" },
          { label: deliverable.code },
        ]}
        actions={
          <StatusBadge
            label={DELIVERABLE_STATUS_LABELS[deliverable.status]}
            tone={deliverableTone(deliverable.status)}
          />
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Execução"
          value={`${deliverable.executionPercent}%`}
        />
        <MetricCard title="Peso" value={deliverable.weight} />
        <MetricCard
          title="Meta"
          value={`${deliverable.achievedResult}/${deliverable.plannedTarget} ${deliverable.unitOfMeasure}`}
        />
        <MetricCard title="Prazo" value={formatDate(deliverable.dueDate)} />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Atualizar entrega</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Situação</Label>
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus((value as DeliverableStatus) ?? status)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.keys(DELIVERABLE_STATUS_LABELS) as DeliverableStatus[]
                  ).map((item) => (
                    <SelectItem key={item} value={item}>
                      {DELIVERABLE_STATUS_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="percent">Percentual de execução</Label>
              <Input
                id="percent"
                type="number"
                min={0}
                max={100}
                value={executionPercent}
                onChange={(e) => setExecutionPercent(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={hasEvidence}
                onChange={(e) => setHasEvidence(e.target.checked)}
              />
              Evidência anexada
              {deliverable.evidenceRequired && (
                <span className="text-muted-foreground">(obrigatória)</span>
              )}
            </label>
            <div className="space-y-2">
              <Label htmlFor="delay">Justificativa de atraso</Label>
              <Input
                id="delay"
                value={delayJustification}
                onChange={(e) => setDelayJustification(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partial">Justificativa de conclusão parcial</Label>
              <Input
                id="partial"
                value={partialJustification}
                onChange={(e) => setPartialJustification(e.target.value)}
              />
            </div>
            <Button type="button" onClick={handleSave}>
              Salvar atualização
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalhes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Projeto:</strong>{" "}
              {project ? (
                <Link
                  href={`/projetos/${project.id}`}
                  className="text-[#7d141d] hover:underline"
                >
                  {project.code} — {project.name}
                </Link>
              ) : (
                "—"
              )}
            </p>
            <p>
              <strong>Unidade:</strong> {deliverable.unitName}
            </p>
            <p>
              <strong>Município:</strong>{" "}
              {deliverable.municipalityName ?? "—"}
            </p>
            <p>
              <strong>Descrição:</strong> {deliverable.description}
            </p>
            <p>
              <strong>Última atualização:</strong>{" "}
              {formatDate(deliverable.updatedAt)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          {relatedActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma atividade cadastrada para esta entrega.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Atividade</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Execução</TableHead>
                  <TableHead>Situação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{activity.name}</TableCell>
                    <TableCell>{activity.ownerName}</TableCell>
                    <TableCell>{formatDate(activity.endDate)}</TableCell>
                    <TableCell>{activity.executionPercent}%</TableCell>
                    <TableCell>
                      {ACTIVITY_STATUS_LABELS[activity.status]}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="mt-4">
        <Button variant="outline" render={<Link href="/entregas" />}>
          Voltar
        </Button>
      </div>
    </div>
  );
}
