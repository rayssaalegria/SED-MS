"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
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
import { useManagement } from "@/features/management/store";
import {
  CONTRACT_STATUS_LABELS,
  type ManagementContract,
} from "@/types/management";
import { contractTone, formatDate } from "@/features/management/utils";

export function ContractsListClient() {
  const { contracts, softDeleteContract } = useManagement();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ManagementContract | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contracts;
    return contracts.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.organizationAcronym.toLowerCase().includes(q),
    );
  }, [contracts, query]);

  return (
    <div>
      <PageHeader
        title="Contratos de Gestão"
        description="Clique em uma linha para ver todos os campos do contrato."
        breadcrumbs={[
          { label: "Gestão estratégica", href: "/contratos" },
          { label: "Contratos de Gestão" },
        ]}
        actions={
          <Button nativeButton={false} render={<Link href="/contratos/novo" />}>
            <Plus className="size-4" />
            Novo contrato
          </Button>
        }
      />

      <Card className="mb-4 border-border/80 shadow-sm">
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por código, nome ou órgão..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Buscar contrato"
            />
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum contrato encontrado"
          description="Cadastre um novo Contrato de Gestão para iniciar o ciclo."
          actionLabel="Novo contrato"
          actionHref="/contratos/novo"
        />
      ) : (
        <Card className="border-border/80 shadow-sm">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Órgão</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Execução</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Vigência</TableHead>
                  <TableHead className="w-20">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((contract) => (
                  <TableRow
                    key={contract.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelected(contract)}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelected(contract);
                      }
                    }}
                    aria-label={`Detalhes do contrato ${contract.code}`}
                  >
                    <TableCell className="font-medium text-[#7d141d]">
                      {contract.code}
                    </TableCell>
                    <TableCell>{contract.name}</TableCell>
                    <TableCell>{contract.organizationAcronym}</TableCell>
                    <TableCell>{contract.year}</TableCell>
                    <TableCell>{contract.executionPercent}%</TableCell>
                    <TableCell>
                      <StatusBadge
                        label={CONTRACT_STATUS_LABELS[contract.status]}
                        tone={contractTone(contract.status)}
                      />
                    </TableCell>
                    <TableCell>
                      {formatDate(contract.startDate)} —{" "}
                      {formatDate(contract.endDate)}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Excluir ${contract.code}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          softDeleteContract(contract.id);
                          toast.success(
                            "Contrato arquivado (exclusão lógica).",
                          );
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <DetailSheet
        open={!!selected}
        onOpenChange={(isOpen) => !isOpen && setSelected(null)}
        contextLabel="Contrato de Gestão"
        title={selected?.name ?? "Contrato"}
        description={
          selected
            ? `${selected.organizationAcronym} · ${CONTRACT_STATUS_LABELS[selected.status]}`
            : undefined
        }
        metaLabel="Código"
        metaValue={selected?.code}
        metaSubtext={
          selected ? `Ciclo ${selected.year}` : undefined
        }
        fields={
          selected
            ? [
                { label: "Código", value: selected.code },
                { label: "Nome", value: selected.name },
                { label: "Ano", value: selected.year },
                { label: "Órgão", value: selected.organizationAcronym },
                { label: "Objetivo", value: selected.objective },
                { label: "Governador", value: selected.governorName },
                { label: "Secretário", value: selected.secretaryName },
                { label: "Gestor", value: selected.managerName },
                {
                  label: "Elaborado em",
                  value: formatDate(selected.draftedAt),
                },
                {
                  label: "Pactuado em",
                  value: selected.pactuatedAt
                    ? formatDate(selected.pactuatedAt)
                    : "—",
                },
                {
                  label: "Assinado em",
                  value: selected.signedAt
                    ? formatDate(selected.signedAt)
                    : "—",
                },
                {
                  label: "Vigência",
                  value: `${formatDate(selected.startDate)} — ${formatDate(selected.endDate)}`,
                },
                { label: "Versão", value: selected.version },
                {
                  label: "Execução",
                  value: `${selected.executionPercent}%`,
                },
                {
                  label: "Nota final",
                  value: selected.finalScore ?? "—",
                },
                {
                  label: "Situação",
                  value: (
                    <StatusBadge
                      label={CONTRACT_STATUS_LABELS[selected.status]}
                      tone={contractTone(selected.status)}
                    />
                  ),
                },
                {
                  label: "Observações",
                  value: selected.observations ?? "—",
                },
                {
                  label: "Público",
                  value: selected.isPublic ? "Sim" : "Não",
                },
              ]
            : []
        }
        footerHref={selected ? `/contratos/${selected.id}` : undefined}
      />
    </div>
  );
}
