"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/shared/status-badge";
import { DetailSheet } from "@/components/shared/detail-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BudgetFormDialog } from "@/features/budgets/components/budget-form-dialog";
import { useBudgetModule } from "@/features/budgets/store";
import { formatCurrency, formatDate } from "@/features/management/utils";
import {
  BUDGET_SOURCE_LABELS,
  BUDGET_STATUS_LABELS,
  PROJECT_BUDGET_TYPE_LABELS,
  type BudgetForecast,
} from "@/types/budget";

function statusTone(status: BudgetForecast["status"]) {
  if (status === "aprovado" || status === "em_execucao") return "success";
  if (status === "em_analise") return "warning";
  if (status === "cancelado") return "danger";
  return "info";
}

export function BudgetsTab({ items }: { items?: BudgetForecast[] }) {
  const { budgets, softDeleteBudget } = useBudgetModule();
  const source = items ?? budgets;
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetForecast | null>(null);
  const [selected, setSelected] = useState<BudgetForecast | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.projectName.toLowerCase().includes(q) ||
        item.projectType.toLowerCase().includes(q),
    );
  }, [source, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar orçamento ou projeto..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          Adicionar novo orçamento
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projeto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor previsto</TableHead>
                <TableHead>Criação</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-36">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelected(item)}
                >
                  <TableCell>
                    <div className="font-medium">{item.projectName}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.code}
                    </div>
                  </TableCell>
                  <TableCell>
                    {PROJECT_BUDGET_TYPE_LABELS[item.projectType]}
                  </TableCell>
                  <TableCell>{formatCurrency(item.plannedValue)}</TableCell>
                  <TableCell>{formatDate(item.createdAt)}</TableCell>
                  <TableCell>{BUDGET_SOURCE_LABELS[item.source]}</TableCell>
                  <TableCell>
                    <StatusBadge
                      label={BUDGET_STATUS_LABELS[item.status]}
                      tone={statusTone(item.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Visualizar"
                        nativeButton={false}
                        render={<Link href={`/orcamento/${item.id}`} />}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Editar"
                        onClick={() => {
                          setEditing(item);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Excluir"
                        onClick={() => {
                          if (
                            !window.confirm(
                              `Excluir o orçamento ${item.code}?`,
                            )
                          ) {
                            return;
                          }
                          softDeleteBudget(item.id);
                          toast.success("Orçamento excluído.");
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum orçamento encontrado.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <BudgetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
      />

      <DetailSheet
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        contextLabel="Orçamento"
        title={selected?.projectName ?? "Orçamento"}
        description={
          selected
            ? `${PROJECT_BUDGET_TYPE_LABELS[selected.projectType]} · ${BUDGET_STATUS_LABELS[selected.status]}`
            : undefined
        }
        metaLabel="Código"
        metaValue={selected?.code}
        metaSubtext={
          selected ? `Criado em ${formatDate(selected.createdAt)}` : undefined
        }
        fields={
          selected
            ? [
                { label: "Código", value: selected.code },
                { label: "Projeto", value: selected.projectName },
                {
                  label: "Tipo",
                  value: PROJECT_BUDGET_TYPE_LABELS[selected.projectType],
                },
                { label: "Descrição", value: selected.description || "—" },
                {
                  label: "Valor previsto",
                  value: formatCurrency(selected.plannedValue),
                },
                {
                  label: "Data da previsão",
                  value: formatDate(selected.forecastDate),
                },
                {
                  label: "Data de criação",
                  value: formatDate(selected.createdAt),
                },
                {
                  label: "Forma de cadastro",
                  value: BUDGET_SOURCE_LABELS[selected.source],
                },
                {
                  label: "Arquivo",
                  value: selected.sourceFileName ?? "—",
                },
                {
                  label: "Status",
                  value: (
                    <StatusBadge
                      label={BUDGET_STATUS_LABELS[selected.status]}
                      tone={statusTone(selected.status)}
                    />
                  ),
                },
                {
                  label: "Observações",
                  value: selected.observations ?? "—",
                },
              ]
            : []
        }
        footerHref={selected ? `/orcamento/${selected.id}` : undefined}
        footerLabel="Abrir detalhe completo"
      />
    </div>
  );
}
