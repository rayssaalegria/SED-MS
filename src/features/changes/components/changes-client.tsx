"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGovernance } from "@/features/governance/store";
import { changeTone } from "@/lib/domain/governance";
import {
  CHANGE_STATUS_LABELS,
  CHANGE_TYPE_LABELS,
  type ChangeRequest,
} from "@/types/governance";

export function ChangesClient() {
  const { changeRequests, reviewChangeRequest } = useGovernance();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ChangeRequest | null>(null);
  const [note, setNote] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return changeRequests;
    return changeRequests.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.entityLabel.toLowerCase().includes(q),
    );
  }, [changeRequests, query]);

  function review(status: "aprovada" | "reprovada") {
    if (!selected) return;
    if (!note.trim()) {
      toast.error("Informe o parecer da análise.");
      return;
    }
    reviewChangeRequest(selected.id, status, note.trim());
    setSelected(null);
    toast.success(
      status === "aprovada"
        ? "Alteração aprovada (versão preservada)."
        : "Alteração reprovada.",
    );
  }

  return (
    <div>
      <PageHeader
        title="Solicitações de alteração"
        breadcrumbs={[
          { label: "Governança", href: "/alteracoes" },
          { label: "Alterações" },
        ]}
      />

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar alteração..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Objeto</TableHead>
                <TableHead>De → Para</TableHead>
                <TableHead>Impacto</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.code}</TableCell>
                  <TableCell>{CHANGE_TYPE_LABELS[item.type]}</TableCell>
                  <TableCell>
                    <p>{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.entityLabel}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-56 text-sm">
                    <span className="text-muted-foreground">
                      {item.previousValue}
                    </span>
                    <span className="mx-1">→</span>
                    <span className="font-medium">{item.newValue}</span>
                  </TableCell>
                  <TableCell className="capitalize">{item.impact}</TableCell>
                  <TableCell>
                    <StatusBadge
                      label={CHANGE_STATUS_LABELS[item.status]}
                      tone={changeTone(item.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelected(item);
                        setNote(item.reviewNote ?? "");
                      }}
                    >
                      Detalhar
                    </Button>
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
            <DialogTitle>
              {selected?.code} — {selected?.title}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <p>
                <strong>Motivo:</strong> {selected.reason}
              </p>
              <p>
                <strong>Justificativa técnica:</strong>{" "}
                {selected.technicalJustification}
              </p>
              <div className="grid gap-2 rounded-lg border border-border p-3 md:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Valor anterior</p>
                  <p className="font-medium">{selected.previousValue}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valor novo</p>
                  <p className="font-medium">{selected.newValue}</p>
                </div>
              </div>
              <p>
                <strong>Autor:</strong> {selected.requestedBy} em{" "}
                {selected.requestedAt}
              </p>
              {selected.reviewerName && (
                <p>
                  <strong>Análise:</strong> {selected.reviewerName} —{" "}
                  {selected.reviewNote}
                </p>
              )}
              {(selected.status === "enviada" ||
                selected.status === "em_analise") && (
                <div className="space-y-2">
                  <Label htmlFor="review-note">Parecer</Label>
                  <textarea
                    id="review-note"
                    className="min-h-20 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
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
            {selected &&
              (selected.status === "enviada" ||
                selected.status === "em_analise") && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => review("reprovada")}
                  >
                    Reprovar
                  </Button>
                  <Button type="button" onClick={() => review("aprovada")}>
                    Aprovar
                  </Button>
                </>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
