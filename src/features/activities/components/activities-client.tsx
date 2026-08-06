"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTableCard } from "@/components/shared/data-table-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  FilterToolbar,
  ResultCount,
  SearchField,
  filterFieldClass,
} from "@/components/shared/filter-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { cn } from "@/lib/utils";
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
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const enriched = useMemo(
    () =>
      activities.map((activity) => ({
        ...activity,
        deliverable: deliverables.find((d) => d.id === activity.deliverableId),
      })),
    [activities, deliverables],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enriched.filter((activity) => {
      if (statusFilter !== "todos" && activity.status !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        activity.name.toLowerCase().includes(q) ||
        activity.ownerName.toLowerCase().includes(q) ||
        (activity.deliverable?.code.toLowerCase().includes(q) ?? false)
      );
    });
  }, [enriched, query, statusFilter]);

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

      <FilterToolbar
        trailing={
          <>
            <ResultCount
              filtered={filtered.length}
              total={activities.length}
              label="atividade"
            />
            <Tabs value={view} onValueChange={setView}>
              <TabsList>
                <TabsTrigger value="lista">Lista</TabsTrigger>
                <TabsTrigger value="kanban">Kanban</TabsTrigger>
                <TabsTrigger value="timeline">Linha do tempo</TabsTrigger>
              </TabsList>
            </Tabs>
          </>
        }
      >
        <SearchField
          placeholder="Buscar por atividade, entrega ou responsável..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar atividade"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value ?? "todos")}
        >
          <SelectTrigger
            className={cn(filterFieldClass, "w-[180px]")}
            aria-label="Filtrar situação"
          >
            <SelectValue placeholder="Situação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as situações</SelectItem>
            {(Object.keys(ACTIVITY_STATUS_LABELS) as ActivityStatus[]).map(
              (status) => (
                <SelectItem key={status} value={status}>
                  {ACTIVITY_STATUS_LABELS[status]}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </FilterToolbar>

      <Tabs value={view} onValueChange={setView}>
        <TabsContent value="lista" className="mt-0">
          {filtered.length === 0 ? (
            <EmptyState
              title="Nenhuma atividade encontrada"
              description="Ajuste a busca ou o filtro de situação."
            />
          ) : (
            <DataTableCard>
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
                  {filtered.map((activity) => (
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
            </DataTableCard>
          )}
        </TabsContent>

        <TabsContent value="kanban" className="mt-0">
          {filtered.length === 0 ? (
            <EmptyState
              title="Nenhuma atividade encontrada"
              description="Ajuste a busca ou o filtro de situação."
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {KANBAN_COLUMNS.map((column) => {
                const columnItems = filtered.filter(
                  (item) => item.status === column,
                );
                return (
                  <Card key={column} className="gap-0 py-0">
                    <CardContent className="space-y-2 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">
                          {ACTIVITY_STATUS_LABELS[column]}
                        </p>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {columnItems.length}
                        </span>
                      </div>
                      {columnItems.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
                          Vazio
                        </p>
                      ) : (
                        columnItems.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-lg border border-border bg-[var(--ms-bg)] p-3 text-sm"
                          >
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.deliverable?.code} · {item.executionPercent}
                              %
                            </p>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="mt-0">
          {filtered.length === 0 ? (
            <EmptyState
              title="Nenhuma atividade encontrada"
              description="Ajuste a busca ou o filtro de situação."
            />
          ) : (
            <Card className="gap-0 py-0">
              <CardContent className="space-y-3 p-4">
                {[...filtered]
                  .sort((a, b) => a.startDate.localeCompare(b.startDate))
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 border-l-2 border-[var(--ms-accent)]/40 pl-4"
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
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
