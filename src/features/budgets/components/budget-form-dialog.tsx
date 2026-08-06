"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { useManagement } from "@/features/management/store";
import { useBudgetModule } from "@/features/budgets/store";
import {
  importedRowToForecast,
  parseBudgetFile,
  type BudgetImportResult,
  type ImportedBudgetRow,
} from "@/lib/domain/budget-import";
import { formatCurrency } from "@/features/management/utils";
import {
  PROJECT_BUDGET_TYPE_LABELS,
  type BudgetForecast,
  type ProjectBudgetType,
} from "@/types/budget";

interface BudgetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: BudgetForecast | null;
}

const emptyForm = {
  projectId: "",
  projectName: "",
  projectType: "infraestrutura" as ProjectBudgetType,
  description: "",
  plannedValue: "",
  forecastDate: new Date().toISOString().slice(0, 10),
  observations: "",
  code: "",
};

export function BudgetFormDialog({
  open,
  onOpenChange,
  editing = null,
}: BudgetFormDialogProps) {
  const { projects } = useManagement();
  const { upsertBudget } = useBudgetModule();
  const [mode, setMode] = useState<"manual" | "arquivo">(
    editing?.source === "arquivo" ? "arquivo" : "manual",
  );
  const [form, setForm] = useState(emptyForm);
  const [importResult, setImportResult] = useState<BudgetImportResult | null>(
    null,
  );
  const [previewRows, setPreviewRows] = useState<ImportedBudgetRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);

  const projectOptions = useMemo(() => projects, [projects]);

  function reset() {
    setForm(emptyForm);
    setImportResult(null);
    setPreviewRows([]);
    setFileName("");
    setMode("manual");
  }

  function hydrateFromEditing() {
    if (!editing) {
      reset();
      return;
    }
    setMode(editing.source);
    setForm({
      projectId: editing.projectId,
      projectName: editing.projectName,
      projectType: editing.projectType,
      description: editing.description,
      plannedValue: String(editing.plannedValue),
      forecastDate: editing.forecastDate,
      observations: editing.observations ?? "",
      code: editing.code,
    });
  }

  function handleOpenChange(next: boolean) {
    if (next) hydrateFromEditing();
    else reset();
    onOpenChange(next);
  }

  function saveManual() {
    if (!form.projectName.trim() || !form.plannedValue || !form.forecastDate) {
      toast.error("Preencha projeto, valor previsto e data.");
      return;
    }
    const plannedValue = Number(
      String(form.plannedValue).replace(/\./g, "").replace(",", "."),
    );
    if (!Number.isFinite(plannedValue) || plannedValue <= 0) {
      toast.error("Informe um valor previsto válido.");
      return;
    }

    const project =
      projectOptions.find((p) => p.id === form.projectId) ??
      projectOptions.find(
        (p) =>
          p.name.toLowerCase() === form.projectName.trim().toLowerCase(),
      );

    const item: BudgetForecast = {
      id: editing?.id ?? crypto.randomUUID(),
      code:
        form.code.trim() ||
        editing?.code ||
        `ORC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      projectId: project?.id ?? (form.projectId || `manual-${crypto.randomUUID()}`),
      projectName: form.projectName.trim(),
      projectType: form.projectType,
      description: form.description.trim(),
      plannedValue,
      forecastDate: form.forecastDate,
      createdAt: editing?.createdAt ?? new Date().toISOString().slice(0, 10),
      source: "manual",
      status: editing?.status ?? "rascunho",
      observations: form.observations.trim() || undefined,
    };

    upsertBudget(item);
    toast.success(editing ? "Orçamento atualizado." : "Orçamento cadastrado.");
    handleOpenChange(false);
  }

  async function handleFile(file: File | null) {
    if (!file) return;
    setBusy(true);
    try {
      const result = await parseBudgetFile(file);
      setFileName(file.name);
      setImportResult(result);
      setPreviewRows(result.rows);
      if (result.errors.length) {
        toast.error(result.errors[0]);
      } else if (result.rows.length === 0) {
        toast.error("Nenhuma linha válida encontrada no arquivo.");
      } else {
        toast.success(`${result.rows.length} linha(s) prontas para revisão.`);
      }
    } catch {
      toast.error("Falha ao ler o arquivo.");
    } finally {
      setBusy(false);
    }
  }

  function updatePreviewRow(index: number, patch: Partial<ImportedBudgetRow>) {
    setPreviewRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  function saveImport() {
    if (!previewRows.length) {
      toast.error("Não há linhas para salvar.");
      return;
    }

    let saved = 0;
    previewRows.forEach((row) => {
      const project = projectOptions.find(
        (p) =>
          p.name.toLowerCase() === row.projectName.toLowerCase() ||
          p.code.toLowerCase() === row.projectName.toLowerCase(),
      );
      const draft = importedRowToForecast(
        row,
        project?.id ?? `imported-${crypto.randomUUID()}`,
        fileName || "importacao.csv",
      );
      upsertBudget({
        id: crypto.randomUUID(),
        ...draft,
        projectName: project?.name ?? row.projectName,
      });
      saved += 1;
    });

    toast.success(`${saved} orçamento(s) importado(s).`);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar orçamento" : "Adicionar novo orçamento"}
          </DialogTitle>
        </DialogHeader>

        {!editing ? (
          <Tabs
            value={mode}
            onValueChange={(value) =>
              setMode((value as "manual" | "arquivo") ?? "manual")
            }
          >
            <TabsList className="mb-4">
              <TabsTrigger value="manual">Cadastro manual</TabsTrigger>
              <TabsTrigger value="arquivo">Importar arquivo</TabsTrigger>
            </TabsList>
            <TabsContent value="manual">{null}</TabsContent>
            <TabsContent value="arquivo">{null}</TabsContent>
          </Tabs>
        ) : null}

        {mode === "manual" || editing ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Projeto *</Label>
              <Select
                value={form.projectId || undefined}
                onValueChange={(value) => {
                  const project = projectOptions.find((p) => p.id === value);
                  setForm((prev) => ({
                    ...prev,
                    projectId: value ?? "",
                    projectName: project?.name ?? prev.projectName,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projectOptions.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.code} — {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                className="mt-2"
                placeholder="Ou digite o nome do projeto"
                value={form.projectName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, projectName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de projeto *</Label>
              <Select
                value={form.projectType}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    projectType: (value as ProjectBudgetType) ?? prev.projectType,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROJECT_BUDGET_TYPE_LABELS).map(
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
              <Label>Código</Label>
              <Input
                value={form.code}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, code: e.target.value }))
                }
                placeholder="Gerado automaticamente se vazio"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Descrição</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Valor previsto *</Label>
              <Input
                inputMode="decimal"
                value={form.plannedValue}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, plannedValue: e.target.value }))
                }
                placeholder="Ex.: 1500000"
              />
            </div>
            <div className="space-y-2">
              <Label>Data da previsão *</Label>
              <Input
                type="date"
                value={form.forecastDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, forecastDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
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
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Arquivo CSV ou XLSX *</Label>
              <Input
                type="file"
                accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                disabled={busy}
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-muted-foreground">
                Colunas sugeridas: Projeto, Tipo, Descrição, Valor previsto,
                Data, Observações.
              </p>
            </div>

            {importResult ? (
              <div className="space-y-3 rounded-lg border border-border p-3">
                <p className="text-sm font-medium">Mapeamento de colunas</p>
                <div className="flex flex-wrap gap-2">
                  {importResult.mappings.map((mapping) => (
                    <StatusBadge
                      key={mapping.field}
                      label={`${mapping.field}: ${mapping.header ?? "não identificada"}`}
                      tone={mapping.identified ? "success" : "warning"}
                    />
                  ))}
                </div>
                {importResult.unidentifiedHeaders.length > 0 ? (
                  <p className="text-xs text-amber-700">
                    Colunas não identificadas:{" "}
                    {importResult.unidentifiedHeaders.join(", ")}
                  </p>
                ) : null}
                {importResult.errors.map((error) => (
                  <p key={error} className="text-xs text-destructive">
                    {error}
                  </p>
                ))}
              </div>
            ) : null}

            {previewRows.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  Prévia ({previewRows.length}) — revise antes de salvar
                </p>
                {previewRows.map((row, index) => (
                  <div
                    key={`${row.projectName}-${index}`}
                    className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-2"
                  >
                    <Input
                      value={row.projectName}
                      onChange={(e) =>
                        updatePreviewRow(index, {
                          projectName: e.target.value,
                        })
                      }
                      placeholder="Projeto"
                    />
                    <Input
                      value={String(row.plannedValue)}
                      onChange={(e) =>
                        updatePreviewRow(index, {
                          plannedValue: Number(e.target.value) || 0,
                        })
                      }
                      placeholder="Valor"
                    />
                    <Input
                      type="date"
                      value={row.forecastDate}
                      onChange={(e) =>
                        updatePreviewRow(index, {
                          forecastDate: e.target.value,
                        })
                      }
                    />
                    <Input
                      value={row.description}
                      onChange={(e) =>
                        updatePreviewRow(index, {
                          description: e.target.value,
                        })
                      }
                      placeholder="Descrição"
                    />
                    <p className="text-xs text-muted-foreground sm:col-span-2">
                      {formatCurrency(row.plannedValue)} ·{" "}
                      {PROJECT_BUDGET_TYPE_LABELS[row.projectType]}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={busy}
            onClick={mode === "arquivo" && !editing ? saveImport : saveManual}
          >
            {mode === "arquivo" && !editing ? "Salvar importação" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
