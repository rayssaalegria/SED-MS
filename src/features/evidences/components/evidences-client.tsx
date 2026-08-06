"use client";

import { useMemo, useState } from "react";
import {
  Check,
  FileText,
  ImageIcon,
  Link2,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useMonitoring } from "@/features/monitoring/store";
import { evidenceTone } from "@/features/monitoring/utils";
import {
  EVIDENCE_STATUS_LABELS,
  EVIDENCE_TYPE_LABELS,
  type Evidence,
  type EvidenceStatus,
} from "@/types/monitoring";

export function EvidencesClient() {
  const { evidences, upsertEvidence } = useMonitoring();
  const [query, setQuery] = useState("");
  const [view, setView] = useState("cards");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return evidences;
    return evidences.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.ownerName.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q),
    );
  }, [evidences, query]);

  function review(evidence: Evidence, status: EvidenceStatus, note?: string) {
    upsertEvidence({
      ...evidence,
      status,
      reviewNote: note,
      validatedAt: new Date().toISOString().slice(0, 10),
      reviewerName: "Camila Rodrigues Lima",
    });
    toast.success(
      status === "aprovada"
        ? "Evidência aprovada."
        : status === "rejeitada"
          ? "Evidência rejeitada."
          : "Complementação solicitada.",
    );
  }

  return (
    <div>
      <PageHeader
        title="Evidências"
        breadcrumbs={[
          { label: "Execução", href: "/evidencias" },
          { label: "Evidências" },
        ]}
      />

      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar evidência..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Tabs value={view} onValueChange={setView}>
            <TabsList>
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="table">Tabela</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma evidência encontrada"
          description="Ajuste a busca ou registre novas evidências nas entregas."
        />
      ) : view === "cards" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <Card key={item.id} className="border-border/80 shadow-sm">
              <CardContent className="space-y-3 pt-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    {item.type === "fotografia" ? (
                      <ImageIcon className="size-5" />
                    ) : item.type === "link" || item.externalLink ? (
                      <Link2 className="size-5" />
                    ) : (
                      <FileText className="size-5" />
                    )}
                  </div>
                  <StatusBadge
                    label={EVIDENCE_STATUS_LABELS[item.status]}
                    tone={evidenceTone(item.status)}
                  />
                </div>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {EVIDENCE_TYPE_LABELS[item.type]} · {item.ownerName}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <div className="text-xs text-muted-foreground">
                  {item.fileName ? (
                    <p>
                      {item.fileName} ({item.fileSize})
                    </p>
                  ) : item.externalLink ? (
                    <p className="truncate">{item.externalLink}</p>
                  ) : null}
                  <p>Acesso: {item.accessLevel}</p>
                </div>
                {(item.status === "enviada" || item.status === "em_analise") && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => review(item, "aprovada")}
                    >
                      <Check className="size-4" />
                      Aprovar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        review(
                          item,
                          "complementacao_solicitada",
                          "Complementar documentação.",
                        )
                      }
                    >
                      Complementar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        review(item, "rejeitada", "Evidência insuficiente.")
                      }
                    >
                      <X className="size-4" />
                      Rejeitar
                    </Button>
                  </div>
                )}
                {item.reviewNote && (
                  <p className="rounded-md bg-muted/50 p-2 text-xs">
                    Parecer: {item.reviewNote}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Situação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{EVIDENCE_TYPE_LABELS[item.type]}</TableCell>
                    <TableCell>
                      {item.fileName ?? item.externalLink ?? "—"}
                    </TableCell>
                    <TableCell>{item.ownerName}</TableCell>
                    <TableCell>
                      <StatusBadge
                        label={EVIDENCE_STATUS_LABELS[item.status]}
                        tone={evidenceTone(item.status)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
