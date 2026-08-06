"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useMonitoring } from "@/features/monitoring/store";
import {
  IMPEDIMENT_STATUS_LABELS,
  type Impediment,
  type ImpedimentStatus,
} from "@/types/monitoring";
import { cn } from "@/lib/utils";

export function ImpedimentsClient() {
  const { impediments, upsertImpediment } = useMonitoring();
  const { projects, deliverables } = useManagement();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Impediment | null>(null);
  const [solution, setSolution] = useState("");
  const [status, setStatus] = useState<ImpedimentStatus>("resolvido");

  const rows = useMemo(
    () =>
      impediments.map((item) => ({
        item,
        project: projects.find((p) => p.id === item.projectId),
        deliverable: deliverables.find((d) => d.id === item.deliverableId),
      })),
    [deliverables, impediments, projects],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(({ item, project, deliverable }) => {
      const matchesStatus =
        statusFilter === "todos" || item.status === statusFilter;
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.involvedOrg.toLowerCase().includes(q) ||
        (project?.code.toLowerCase().includes(q) ?? false) ||
        (deliverable?.code.toLowerCase().includes(q) ?? false);
      return matchesStatus && matchesQuery;
    });
  }, [query, rows, statusFilter]);

  function openResolve(item: Impediment) {
    setEditing(item);
    setSolution(item.solution ?? "");
    setStatus(item.status === "resolvido" ? "resolvido" : "em_tratamento");
    setOpen(true);
  }

  function handleSave() {
    if (!editing) return;
    if (
      (status === "resolvido" || status === "em_tratamento") &&
      !solution.trim()
    ) {
      toast.error("Registre a solução ou andamento do impedimento.");
      return;
    }
    upsertImpediment({
      ...editing,
      status,
      solution: solution.trim(),
    });
    setOpen(false);
    toast.success("Impedimento atualizado.");
  }

  return (
    <div>
      <PageHeader
        title="Impedimentos"
        breadcrumbs={[
          { label: "Execução", href: "/impedimentos" },
          { label: "Impedimentos" },
        ]}
      />

      <FilterToolbar
        trailing={
          <ResultCount
            filtered={filtered.length}
            total={impediments.length}
            label="impedimento"
          />
        }
      >
        <SearchField
          placeholder="Buscar impedimento..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar impedimento"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value ?? "todos")}
        >
          <SelectTrigger
            className={cn(filterFieldClass, "w-[180px]")}
            aria-label="Filtrar por situação"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as situações</SelectItem>
            {(Object.keys(IMPEDIMENT_STATUS_LABELS) as ImpedimentStatus[]).map(
              (item) => (
                <SelectItem key={item} value={item}>
                  {IMPEDIMENT_STATUS_LABELS[item]}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </FilterToolbar>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum impedimento encontrado"
          description="Ajuste a busca ou o filtro de situação para visualizar resultados."
        />
      ) : (
        <DataTableCard>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Impedimento</TableHead>
                <TableHead>Projeto</TableHead>
                <TableHead>Entrega</TableHead>
                <TableHead>Órgão envolvido</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(({ item, project, deliverable }) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </TableCell>
                  <TableCell>{project?.code ?? "—"}</TableCell>
                  <TableCell>{deliverable?.code ?? "—"}</TableCell>
                  <TableCell>{item.involvedOrg}</TableCell>
                  <TableCell className="capitalize">{item.priority}</TableCell>
                  <TableCell>
                    <StatusBadge
                      label={IMPEDIMENT_STATUS_LABELS[item.status]}
                      tone={
                        item.status === "resolvido"
                          ? "success"
                          : item.status === "aberto" ||
                              item.status === "dependencia_externa"
                            ? "danger"
                            : "warning"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => openResolve(item)}
                    >
                      Atualizar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTableCard>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar impedimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm font-medium">{editing?.title}</p>
            <div className="space-y-2">
              <Label>Situação</Label>
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus((value as ImpedimentStatus) ?? status)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.keys(IMPEDIMENT_STATUS_LABELS) as ImpedimentStatus[]
                  ).map((item) => (
                    <SelectItem key={item} value={item}>
                      {IMPEDIMENT_STATUS_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="solution">Solução / andamento</Label>
              <Input
                id="solution"
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
