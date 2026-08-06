"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/shared/status-badge";
import { DetailSheet } from "@/components/shared/detail-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
import { compareBudgetExecution } from "@/lib/domain/budget";
import { formatCurrency, formatDate } from "@/features/management/utils";
import {
  CONTRACT_EXECUTION_STATUS_LABELS,
  type ContractExecution,
  type ContractExecutionStatus,
} from "@/types/budget";
import { cn } from "@/lib/utils";

function tone(status: ContractExecutionStatus) {
  if (status === "em_execucao" || status === "vigente") return "success";
  if (status === "paralisado") return "warning";
  if (status === "rescindido") return "danger";
  return "info";
}

const emptyForm = {
  budgetId: "",
  procurementId: "",
  contractNumber: "",
  supplierName: "",
  contractedValue: "",
  executedValue: "",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  status: "em_execucao" as ContractExecutionStatus,
  observations: "",
};

export function ContractExecutionTab({
  budgets: budgetsProp,
  processes: processesProp,
  executions: executionsProp,
}: {
  budgets?: import("@/types/budget").BudgetForecast[];
  processes?: import("@/types/budget").ProcurementProcess[];
  executions?: ContractExecution[];
} = {}) {
  const {
    budgets: allBudgets,
    processes: allProcesses,
    executions: allExecutions,
    upsertExecution,
    softDeleteExecution,
  } = useBudgetModule();
  const budgets = budgetsProp ?? allBudgets;
  const processes = processesProp ?? allProcesses;
  const executions = executionsProp ?? allExecutions;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ContractExecution | null>(null);
  const [selected, setSelected] = useState<ContractExecution | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return executions;
    return executions.filter((item) => {
      const budget = budgets.find((b) => b.id === item.budgetId);
      return (
        item.contractNumber.toLowerCase().includes(q) ||
        item.supplierName.toLowerCase().includes(q) ||
        budget?.projectName.toLowerCase().includes(q)
      );
    });
  }, [budgets, executions, query]);

  const processesForBudget = allProcesses.filter(
    (p) => p.budgetId === form.budgetId,
  );

  function openCreate() {
    setEditing(null);
    const firstBudget = allBudgets[0];
    const firstProcess = allProcesses.find((p) => p.budgetId === firstBudget?.id);
    setForm({
      ...emptyForm,
      budgetId: firstBudget?.id ?? "",
      procurementId: firstProcess?.id ?? "",
    });
    setOpen(true);
  }

  function openEdit(item: ContractExecution) {
    setEditing(item);
    setForm({
      budgetId: item.budgetId,
      procurementId: item.procurementId,
      contractNumber: item.contractNumber,
      supplierName: item.supplierName,
      contractedValue: String(item.contractedValue),
      executedValue: String(item.executedValue),
      startDate: item.startDate,
      endDate: item.endDate,
      status: item.status,
      observations: item.observations ?? "",
    });
    setOpen(true);
  }

  function save() {
    const budget = allBudgets.find((b) => b.id === form.budgetId);
    const process = allProcesses.find((p) => p.id === form.procurementId);
    if (
      !budget ||
      !process ||
      !form.contractNumber.trim() ||
      !form.supplierName.trim()
    ) {
      toast.error("Preencha contrato, fornecedor, orçamento e processo.");
      return;
    }
    const contractedValue = Number(form.contractedValue);
    const executedValue = Number(form.executedValue);
    if (!Number.isFinite(contractedValue) || contractedValue < 0) {
      toast.error("Valor contratado inválido.");
      return;
    }
    if (!Number.isFinite(executedValue) || executedValue < 0) {
      toast.error("Valor executado inválido.");
      return;
    }

    upsertExecution({
      id: editing?.id ?? crypto.randomUUID(),
      budgetId: budget.id,
      projectId: budget.projectId,
      procurementId: process.id,
      contractNumber: form.contractNumber.trim(),
      supplierName: form.supplierName.trim(),
      plannedValue: budget.plannedValue,
      contractedValue,
      executedValue,
      startDate: form.startDate,
      endDate: form.endDate || form.startDate,
      status: form.status,
      observations: form.observations.trim() || undefined,
    });
    toast.success(editing ? "Contrato atualizado." : "Contrato cadastrado.");
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar contrato ou fornecedor..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button
          type="button"
          onClick={openCreate}
          disabled={allBudgets.length === 0 || allProcesses.length === 0}
        >
          <Plus className="size-4" />
          Nova execução contratual
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projeto</TableHead>
                <TableHead>Processo</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Contratado</TableHead>
                <TableHead>Previsto</TableHead>
                <TableHead>Contratado R$</TableHead>
                <TableHead>Executado</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>%</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const budget = budgets.find((b) => b.id === item.budgetId);
                const process = processes.find(
                  (p) => p.id === item.procurementId,
                );
                const comparison = compareBudgetExecution(item);
                return (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelected(item)}
                  >
                    <TableCell>{budget?.projectName ?? "—"}</TableCell>
                    <TableCell>{process?.processNumber ?? "—"}</TableCell>
                    <TableCell className="font-medium">
                      {item.contractNumber}
                    </TableCell>
                    <TableCell>{item.supplierName}</TableCell>
                    <TableCell>{formatCurrency(item.plannedValue)}</TableCell>
                    <TableCell
                      className={cn(
                        comparison.overContracted && "text-destructive font-medium",
                      )}
                    >
                      {formatCurrency(item.contractedValue)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        comparison.overExecuted && "text-destructive font-medium",
                      )}
                    >
                      {formatCurrency(item.executedValue)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(comparison.remainingBalance)}
                    </TableCell>
                    <TableCell>{comparison.utilizationPercent}%</TableCell>
                    <TableCell>
                      <StatusBadge
                        label={CONTRACT_EXECUTION_STATUS_LABELS[item.status]}
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
                                `Excluir o contrato ${item.contractNumber}?`,
                              )
                            ) {
                              return;
                            }
                            softDeleteExecution(item.id);
                            toast.success("Execução excluída.");
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
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma execução contratual. Cadastre orçamento e processo antes.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar execução" : "Nova execução contratual"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-2">
              <Label>Orçamento *</Label>
              <Select
                value={form.budgetId}
                onValueChange={(value) => {
                  const nextProcesses = allProcesses.filter(
                    (p) => p.budgetId === value,
                  );
                  setForm((prev) => ({
                    ...prev,
                    budgetId: value ?? "",
                    procurementId: nextProcesses[0]?.id ?? "",
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allBudgets.map((budget) => (
                    <SelectItem key={budget.id} value={budget.id}>
                      {budget.code} — {budget.projectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Processo de contratação *</Label>
              <Select
                value={form.procurementId}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    procurementId: value ?? "",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {processesForBudget.map((process) => (
                    <SelectItem key={process.id} value={process.id}>
                      {process.processNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nº do contrato *</Label>
                <Input
                  value={form.contractNumber}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      contractNumber: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Contratado / fornecedor *</Label>
                <Input
                  value={form.supplierName}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      supplierName: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Valor contratado *</Label>
                <Input
                  value={form.contractedValue}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      contractedValue: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Valor executado *</Label>
                <Input
                  value={form.executedValue}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      executedValue: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Início *</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Término</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    status:
                      (value as ContractExecutionStatus) ?? prev.status,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONTRACT_EXECUTION_STATUS_LABELS).map(
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
        contextLabel="Execução contratual"
        title={selected?.contractNumber ?? "Contrato"}
        description={
          selected
            ? CONTRACT_EXECUTION_STATUS_LABELS[selected.status]
            : undefined
        }
        metaLabel="Contrato"
        metaValue={selected?.contractNumber}
        metaSubtext={selected?.supplierName}
        fields={
          selected
            ? (() => {
                const comparison = compareBudgetExecution(selected);
                const budget = budgets.find((b) => b.id === selected.budgetId);
                const process = processes.find(
                  (p) => p.id === selected.procurementId,
                );
                return [
                  { label: "Projeto", value: budget?.projectName ?? "—" },
                  {
                    label: "Processo",
                    value: process?.processNumber ?? "—",
                  },
                  { label: "Fornecedor", value: selected.supplierName },
                  {
                    label: "Valor previsto",
                    value: formatCurrency(comparison.plannedValue),
                  },
                  {
                    label: "Valor contratado",
                    value: formatCurrency(comparison.contractedValue),
                  },
                  {
                    label: "Valor executado",
                    value: formatCurrency(comparison.executedValue),
                  },
                  {
                    label: "Diferença (previsto − contratado)",
                    value: formatCurrency(comparison.difference),
                  },
                  {
                    label: "Saldo restante",
                    value: formatCurrency(comparison.remainingBalance),
                  },
                  {
                    label: "% orçamento utilizado",
                    value: `${comparison.utilizationPercent}%`,
                  },
                  {
                    label: "Alertas",
                    value:
                      comparison.overContracted || comparison.overExecuted ? (
                        <span className="inline-flex items-center gap-1 text-destructive">
                          <AlertTriangle className="size-4" />
                          {comparison.overContracted
                            ? "Contratado acima do previsto. "
                            : ""}
                          {comparison.overExecuted
                            ? "Executado acima do previsto."
                            : ""}
                        </span>
                      ) : (
                        "Sem estouro orçamentário"
                      ),
                  },
                  {
                    label: "Vigência",
                    value: `${formatDate(selected.startDate)} — ${formatDate(selected.endDate)}`,
                  },
                  {
                    label: "Status",
                    value: CONTRACT_EXECUTION_STATUS_LABELS[selected.status],
                  },
                  {
                    label: "Observações",
                    value: selected.observations ?? "—",
                  },
                ];
              })()
            : []
        }
      />
    </div>
  );
}
