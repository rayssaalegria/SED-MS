"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useManagement } from "@/features/management/store";
import { formatDate } from "@/features/management/utils";
import {
  ACTIVITY_STATUS_LABELS,
  type ActivityStatus,
} from "@/types/management";

const KANBAN_COLUMNS: ActivityStatus[] = [
  "nao_iniciada",
  "em_andamento",
  "bloqueada",
  "em_validacao",
  "concluida",
];

export function ActivitiesClient() {
  const { activities, deliverables } = useManagement();
  const [view, setView] = useState("lista");

  const enriched = useMemo(
    () =>
      activities.map((activity) => ({
        ...activity,
        deliverable: deliverables.find((d) => d.id === activity.deliverableId),
      })),
    [activities, deliverables],
  );

  return (
    <div>
      <PageHeader
        title="Atividades"
        description="Visualizações em lista, kanban e linha do tempo das atividades das entregas."
        breadcrumbs={[
          { label: "Execução", href: "/atividades" },
          { label: "Atividades" },
        ]}
      />

      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="lista">Lista</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="timeline">Linha do tempo</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Atividade</TableHead>
                    <TableHead>Entrega</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Execução</TableHead>
                    <TableHead>Situação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enriched.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">
                        {activity.name}
                      </TableCell>
                      <TableCell>
                        {activity.deliverable?.code ?? "—"}
                      </TableCell>
                      <TableCell>{activity.ownerName}</TableCell>
                      <TableCell className="capitalize">
                        {activity.priority}
                      </TableCell>
                      <TableCell>{formatDate(activity.endDate)}</TableCell>
                      <TableCell>{activity.executionPercent}%</TableCell>
                      <TableCell>
                        <StatusBadge
                          label={ACTIVITY_STATUS_LABELS[activity.status]}
                          tone={
                            activity.status === "concluida"
                              ? "success"
                              : activity.status === "bloqueada"
                                ? "danger"
                                : "info"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kanban" className="mt-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {KANBAN_COLUMNS.map((column) => (
              <Card key={column}>
                <CardContent className="space-y-2 pt-4">
                  <p className="text-sm font-semibold">
                    {ACTIVITY_STATUS_LABELS[column]}
                  </p>
                  {enriched
                    .filter((item) => item.status === column)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-border bg-muted/30 p-3 text-sm"
                      >
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.deliverable?.code} · {item.executionPercent}%
                        </p>
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardContent className="space-y-3 pt-6">
              {[...enriched]
                .sort((a, b) => a.startDate.localeCompare(b.startDate))
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 border-l-2 border-[#7d141d]/40 pl-4"
                  >
                    <div className="min-w-28 text-xs text-muted-foreground">
                      {formatDate(item.startDate)}
                      <br />
                      {formatDate(item.endDate)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {ACTIVITY_STATUS_LABELS[item.status]} ·{" "}
                        {item.ownerName}
                      </p>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
