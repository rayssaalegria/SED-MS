"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTableCard } from "@/components/shared/data-table-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  FilterToolbar,
  ResultCount,
  SearchField,
} from "@/components/shared/filter-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
import { DetailSheet } from "@/components/shared/detail-sheet";
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
import { useBudgetModule } from "@/features/budgets/store";
import { formatCurrency, formatDate } from "@/features/management/utils";
import {
  PROCUREMENT_STATUS_LABELS,
  PROCUREMENT_TYPE_LABELS,
  type ProcurementProcess,
  type ProcurementProcessStatus,
  type ProcurementProcessType,
} from "@/types/budget";

function tone(status: ProcurementProcessStatus) {
  if (status === "homologado") return "success";
  if (status === "em_andamento" || status === "aberto") return "info";
  if (status === "deserto" || status === "fracassado" || status === "cancelado")
    return "danger";
  return "warning";
}

const emptyForm = {
  processNumber: "",
  processType: "pregao" as ProcurementProcessType,
  budgetId: "",
  processValue: "",
  openedAt: new Date().toISOString().slice(0, 10),
  status: "aberto" as ProcurementProcessStatus,
  observations: "",
};

export function ProcurementTab({
  budgets: budgetsProp,
  processes: processesProp,
}: {
  budgets?: import("@/types/budget").BudgetForecast[];
  processes?: ProcurementProcess[];
} = {}) {
  const {
    budgets: allBudgets,
    processes: allProcesses,
    upsertProcess,
    softDeleteProcess,
  } = useBudgetModule();
  const budgets = budgetsProp ?? allBudgets;
  const processes = processesProp ?? allProcesses;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProcurementProcess | null>(null);
  const [selected, setSelected] = useState<ProcurementProcess | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return processes;
    return processes.filter((item) => {
      const budget = budgets.find((b) => b.id === item.budgetId);
      return (
        item.processNumber.toLowerCase().includes(q) ||
        budget?.projectName.toLowerCase().includes(q) ||
        item.processType.toLowerCase().includes(q)
      );
    });
  }, [budgets, processes, query]);

  // Forms always use full budgets list for relation integrity
  const budgetOptions = allBudgets;

  function openCreate() {
    setEditing(null);
    setForm({
      ...emptyForm,
      budgetId: budgetOptions[0]?.id ?? "",
    });
    setOpen(true);
  }

  function openEdit(item: ProcurementProcess) {
    setEditing(item);
    setForm({
      processNumber: item.processNumber,
      processType: item.processType,
      budgetId: item.budgetId,
      processValue: String(item.processValue),
      openedAt: item.openedAt,
      status: item.status,
      observations: item.observations ?? "",
    });
    setOpen(true);
  }

  function save() {
    const budget = budgetOptions.find((b) => b.id === form.budgetId);
    if (!form.processNumber.trim() || !budget) {
      toast.error("Informe o número do processo e o orçamento relacionado.");
      return;
    }
    const processValue = Number(form.processValue);
    if (!Number.isFinite(processValue) || processValue <= 0) {
      toast.error("Informe um valor do processo válido.");
      return;
    }

    upsertProcess({
      id: editing?.id ?? crypto.randomUUID(),
      processNumber: form.processNumber.trim(),
      processType: form.processType,
      budgetId: budget.id,
      projectId: budget.projectId,
      plannedValue: budget.plannedValue,
      processValue,
      openedAt: form.openedAt,
      status: form.status,
      observations: form.observations.trim() || undefined,
    });
    toast.success(editing ? "Processo atualizado." : "Processo cadastrado.");
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <FilterToolbar
        trailing={
          <>
            <ResultCount
              filtered={filtered.length}
              total={processes.length}
              label="processo"
            />
            <Button type="button" onClick={openCreate} disabled={budgetOptions.length === 0}>
              <Plus className="size-4" />
              Novo processo
            </Button>
          </>
        }
      >
        <SearchField
          placeholder="Buscar processo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar processo"
        />
      </FilterToolbar>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum processo encontrado"
          description="Ajuste a busca ou cadastre um novo processo."
        />
      ) : (
      <DataTableCard>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº processo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Projeto</TableHead>
                <TableHead>Orçamento</TableHead>
                <TableHead>Previsto</TableHead>
                <TableHead>Valor do processo</TableHead>
                <TableHead>Abertura</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const budget = budgets.find((b) => b.id === item.budgetId);
                return (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelected(item)}
                  >
                    <TableCell className="font-medium">
                      {item.processNumber}
                    </TableCell>
                    <TableCell>
                      {PROCUREMENT_TYPE_LABELS[item.processType]}
                    </TableCell>
                    <TableCell>{budget?.projectName ?? "—"}</TableCell>
                    <TableCell>{budget?.code ?? "—"}</TableCell>
                    <TableCell>{formatCurrency(item.plannedValue)}</TableCell>
                    <TableCell>{formatCurrency(item.processValue)}</TableCell>
                    <TableCell>{formatDate(item.openedAt)}</TableCell>
                    <TableCell>
                      <StatusBadge
                        label={PROCUREMENT_STATUS_LABELS[item.status]}
                        tone={tone(item.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => openEdit(item)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (
                              !window.confirm(
                                `Excluir o processo ${item.processNumber}?`,
                              )
                            ) {
                              return;
                            }
                            softDeleteProcess(item.id);
                            toast.success("Processo excluído.");
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DataTableCard>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar processo" : "Novo processo de contratação"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-2">
              <Label>Orçamento relacionado *</Label>
              <Select
                value={form.budgetId}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, budgetId: value ?? "" }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {budgetOptions.map((budget) => (
                    <SelectItem key={budget.id} value={budget.id}>
                      {budget.code} — {budget.projectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Número do processo *</Label>
              <Input
                value={form.processNumber}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    processNumber: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select
                  value={form.processType}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      processType:
                        (value as ProcurementProcessType) ?? prev.processType,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROCUREMENT_TYPE_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      status:
                        (value as ProcurementProcessStatus) ?? prev.status,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROCUREMENT_STATUS_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Valor do processo *</Label>
                <Input
                  value={form.processValue}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      processValue: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Data de abertura *</Label>
                <Input
                  type="date"
                  value={form.openedAt}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, openedAt: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Input
                value={form.observations}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    observations: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={save}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        contextLabel="Processo de contratação"
        title={selected?.processNumber ?? "Processo"}
        description={
          selected
            ? PROCUREMENT_STATUS_LABELS[selected.status]
            : undefined
        }
        metaLabel="Processo"
        metaValue={selected?.processNumber}
        metaSubtext={
          selected ? `Abertura ${formatDate(selected.openedAt)}` : undefined
        }
        fields={
          selected
            ? [
                {
                  label: "Tipo",
                  value: PROCUREMENT_TYPE_LABELS[selected.processType],
                },
                {
                  label: "Projeto",
                  value:
                    budgets.find((b) => b.id === selected.budgetId)
                      ?.projectName ?? "—",
                },
                {
                  label: "Orçamento",
                  value:
                    budgets.find((b) => b.id === selected.budgetId)?.code ??
                    "—",
                },
                {
                  label: "Valor previsto",
                  value: formatCurrency(selected.plannedValue),
                },
                {
                  label: "Valor do processo",
                  value: formatCurrency(selected.processValue),
                },
                {
                  label: "Abertura",
                  value: formatDate(selected.openedAt),
                },
                {
                  label: "Status",
                  value: PROCUREMENT_STATUS_LABELS[selected.status],
                },
                {
                  label: "Observações",
                  value: selected.observations ?? "—",
                },
              ]
            : []
        }
      />
    </div>
  );
}
