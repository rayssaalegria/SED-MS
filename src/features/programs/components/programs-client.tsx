"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
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
import { useManagement } from "@/features/management/store";
import { SED_ORG_ID } from "@/lib/data/demo-management";
import type { Program } from "@/types/management";

export function ProgramsClient() {
  const { programs, contracts, upsertProgram } = useManagement();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Program | null>(null);
  const [form, setForm] = useState({
    code: "",
    name: "",
    contractId: contracts[0]?.id ?? "",
    objective: "",
    pillarCode: "MS-INC",
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return programs;
    return programs.filter(
      (p) =>
        p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q),
    );
  }, [programs, query]);

  const selectedContract = selected
    ? contracts.find((c) => c.id === selected.contractId)
    : undefined;

  function handleCreate() {
    if (!form.code || !form.name || !form.contractId) {
      toast.error("Preencha código, nome e contrato.");
      return;
    }
    const program: Program = {
      id: crypto.randomUUID(),
      contractId: form.contractId,
      code: form.code.toUpperCase(),
      name: form.name,
      description: form.objective,
      objective: form.objective,
      organizationId: SED_ORG_ID,
      managingUnit: "Unidade de planejamento",
      targetAudience: "Rede estadual",
      scope: "Estadual",
      pillarCode: form.pillarCode,
      ods: ["4"],
      ppaProgramCode: "PPA-EDU-01",
      status: "ativo",
      isPublic: false,
    };
    upsertProgram(program);
    setOpen(false);
    toast.success("Programa cadastrado.");
  }

  return (
    <div>
      <PageHeader
        title="Programas"
        description="Programas vinculados aos Contratos de Gestão. Clique em uma linha para ver todos os campos."
        breadcrumbs={[
          { label: "Gestão estratégica", href: "/programas" },
          { label: "Programas" },
        ]}
        actions={
          <Button type="button" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Novo programa
          </Button>
        }
      />

      <FilterToolbar
        trailing={
          <ResultCount
            filtered={filtered.length}
            total={programs.length}
            label="programa"
          />
        }
      >
        <SearchField
          placeholder="Buscar programa..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar programa"
        />
      </FilterToolbar>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum programa encontrado"
          description="Ajuste a busca ou cadastre um novo programa."
        />
      ) : (
        <DataTableCard>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Pilar</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((program) => {
                const contract = contracts.find(
                  (c) => c.id === program.contractId,
                );
                return (
                  <TableRow
                    key={program.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelected(program)}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelected(program);
                      }
                    }}
                    aria-label={`Detalhes do programa ${program.code}`}
                  >
                    <TableCell className="font-medium">{program.code}</TableCell>
                    <TableCell>{program.name}</TableCell>
                    <TableCell>
                      {contract ? (
                        <Link
                          href={`/contratos/${contract.id}`}
                          className="text-[#7d141d] hover:underline"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {contract.code}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{program.pillarCode}</TableCell>
                    <TableCell>
                      <StatusBadge label="Ativo" tone="success" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DataTableCard>
      )}

      <DetailSheet
        open={!!selected}
        onOpenChange={(isOpen) => !isOpen && setSelected(null)}
        contextLabel="Programa"
        title={selected?.name ?? "Programa"}
        description={selected?.pillarCode}
        metaLabel="Código"
        metaValue={selected?.code}
        fields={
          selected
            ? [
                { label: "Código", value: selected.code },
                { label: "Nome", value: selected.name },
                { label: "Descrição", value: selected.description },
                { label: "Objetivo", value: selected.objective },
                {
                  label: "Contrato",
                  value: selectedContract?.code ?? "—",
                },
                { label: "Unidade gestora", value: selected.managingUnit },
                { label: "Público-alvo", value: selected.targetAudience },
                { label: "Abrangência", value: selected.scope },
                { label: "Pilar", value: selected.pillarCode },
                { label: "ODS", value: selected.ods.join(", ") },
                { label: "Programa PPA", value: selected.ppaProgramCode },
                {
                  label: "Situação",
                  value: (
                    <StatusBadge
                      label={
                        selected.status === "ativo"
                          ? "Ativo"
                          : selected.status.replaceAll("_", " ")
                      }
                      tone="success"
                    />
                  ),
                },
                {
                  label: "Público",
                  value: selected.isPublic ? "Sim" : "Não",
                },
              ]
            : []
        }
        footerHref={
          selectedContract ? `/contratos/${selectedContract.id}` : undefined
        }
        footerLabel="Ver contrato vinculado"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo programa</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Código</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Contrato</Label>
              <Select
                value={form.contractId}
                onValueChange={(value) =>
                  setForm({ ...form, contractId: value ?? form.contractId })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contracts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Objetivo</Label>
              <Input
                value={form.objective}
                onChange={(e) =>
                  setForm({ ...form, objective: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleCreate}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
