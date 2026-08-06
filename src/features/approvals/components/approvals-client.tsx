"use client";

import { useMemo, useState } from "react";
import { Clock3 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { DataTableCard } from "@/components/shared/data-table-card";
import {
  FilterToolbar,
  ResultCount,
  SearchField,
} from "@/components/shared/filter-toolbar";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGovernance } from "@/features/governance/store";
import {
  approvalTone,
  daysUntil,
  isOpenApproval,
} from "@/lib/domain/governance";
import {
  APPROVAL_DECISION_LABELS,
  APPROVAL_ENTITY_LABELS,
  APPROVAL_STATUS_LABELS,
  APPROVAL_STEP_LABELS,
  type ApprovalDecision,
  type ApprovalItem,
} from "@/types/governance";

export function ApprovalsClient() {
  const { approvals, decideApproval } = useGovernance();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("abertas");
  const [selected, setSelected] = useState<ApprovalItem | null>(null);
  const [decision, setDecision] = useState<ApprovalDecision>("aprovar");
  const [note, setNote] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return approvals.filter((item) => {
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.entityLabel.toLowerCase().includes(q) ||
        item.requestedBy.toLowerCase().includes(q);
      const open = isOpenApproval(item.status);
      const matchesTab =
        tab === "todas" ||
        (tab === "abertas" && open) ||
        (tab === "concluidas" && !open);
      return matchesQuery && matchesTab;
    });
  }, [approvals, query, tab]);

  const openCount = approvals.filter((a) => isOpenApproval(a.status)).length;
  const overdue = approvals.filter(
    (a) => isOpenApproval(a.status) && daysUntil(a.dueDate) < 0,
  ).length;
  const dueSoon = approvals.filter(
    (a) => isOpenApproval(a.status) && daysUntil(a.dueDate) <= 3 && daysUntil(a.dueDate) >= 0,
  ).length;

  function openDecide(item: ApprovalItem) {
    setSelected(item);
    setDecision("aprovar");
    setNote("");
  }

  function handleDecide() {
    if (!selected) return;
    if (!note.trim() && decision !== "aprovar") {
      toast.error("Informe a justificativa da decisão.");
      return;
    }
    decideApproval(
      selected.id,
      decision,
      note.trim() || "Aprovado sem ressalvas.",
      "Decisor autenticado",
    );
    setSelected(null);
    toast.success(`Decisão registrada: ${APPROVAL_DECISION_LABELS[decision]}.`);
  }

  return (
    <div>
      <PageHeader
        title="Minhas aprovações"
        breadcrumbs={[
          { label: "Governança", href: "/aprovacoes" },
          { label: "Aprovações" },
        ]}
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <MetricCard title="Pendências abertas" value={openCount} />
        <MetricCard title="Vencendo em 3 dias" value={dueSoon} />
        <MetricCard title="Atrasadas" value={overdue} />
      </div>

      <FilterToolbar
        trailing={
          <>
            <ResultCount
              filtered={filtered.length}
              total={approvals.length}
              label="aprovação"
            />
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="abertas">Abertas</TabsTrigger>
                <TabsTrigger value="concluidas">Concluídas</TabsTrigger>
                <TabsTrigger value="todas">Todas</TabsTrigger>
              </TabsList>
            </Tabs>
          </>
        }
      >
        <SearchField
          placeholder="Buscar aprovação..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar aprovação"
        />
      </FilterToolbar>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <DataTableCard>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Solicitação</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const days = daysUntil(item.dueDate);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {APPROVAL_ENTITY_LABELS[item.entityType]} ·{" "}
                        {item.entityLabel} · {item.organizationAcronym}
                      </p>
                    </TableCell>
                    <TableCell>
                      {APPROVAL_STEP_LABELS[item.currentStep]}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm">
                        <Clock3 className="size-3.5" aria-hidden />
                        {item.dueDate}
                        {isOpenApproval(item.status) && (
                          <span className="text-xs text-muted-foreground">
                            ({days < 0 ? `${Math.abs(days)}d atraso` : `${days}d`})
                          </span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={APPROVAL_STATUS_LABELS[item.status]}
                        tone={approvalTone(item.status)}
                      />
                    </TableCell>
                    <TableCell>
                      {isOpenApproval(item.status) ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => openDecide(item)}
                        >
                          Decidir
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setSelected(item)}
                        >
                          Histórico
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DataTableCard>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fluxo institucional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. Planejamento elabora e encaminha</p>
            <p>2. Secretário valida na secretaria</p>
            <p>3. SEGOV decide a pactuação / alteração</p>
            <p>4. Avaliador atua em evidências e avaliações</p>
            <p className="rounded-lg border border-border bg-muted/30 p-3 text-foreground">
              Cada decisão gera trilha no histórico e no log de auditoria.
            </p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {selected.description}
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Solicitante:</strong> {selected.requestedBy}
                </p>
                <p>
                  <strong>Etapa atual:</strong>{" "}
                  {APPROVAL_STEP_LABELS[selected.currentStep]}
                </p>
              </div>

              {selected.history.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Histórico</p>
                  <ul className="space-y-2 text-sm">
                    {selected.history.map((entry) => (
                      <li
                        key={entry.id}
                        className="rounded-md border border-border px-3 py-2"
                      >
                        <p className="font-medium">
                          {APPROVAL_STEP_LABELS[entry.step]} · {entry.actor}
                        </p>
                        <p className="text-muted-foreground">
                          {entry.at} — {entry.note}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isOpenApproval(selected.status) && (
                <>
                  <div className="space-y-2">
                    <Label>Decisão</Label>
                    <Select
                      value={decision}
                      onValueChange={(value) =>
                        setDecision((value as ApprovalDecision) ?? decision)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          Object.keys(
                            APPROVAL_DECISION_LABELS,
                          ) as ApprovalDecision[]
                        ).map((item) => (
                          <SelectItem key={item} value={item}>
                            {APPROVAL_DECISION_LABELS[item]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note">Parecer / justificativa</Label>
                    <textarea
                      id="note"
                      className="min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </>
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
            {selected && isOpenApproval(selected.status) && (
              <Button type="button" onClick={handleDecide}>
                Registrar decisão
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
