"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
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
} from "@/types/management";
import { contractTone, formatDate } from "@/features/management/utils";

export function ContractsListClient() {
  const { contracts, softDeleteContract } = useManagement();
  const [query, setQuery] = useState("");

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
        description="Elaboração, pactuação e acompanhamento dos contratos anuais das secretarias."
        breadcrumbs={[
          { label: "Gestão estratégica", href: "/contratos" },
          { label: "Contratos de Gestão" },
        ]}
        actions={
          <Button render={<Link href="/contratos/novo" />}>
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
                  <TableRow key={contract.id}>
                    <TableCell>
                      <Link
                        href={`/contratos/${contract.id}`}
                        className="font-medium text-[#7d141d] hover:underline"
                      >
                        {contract.code}
                      </Link>
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
                        onClick={() => {
                          softDeleteContract(contract.id);
                          toast.success("Contrato arquivado (exclusão lógica).");
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
    </div>
  );
}
