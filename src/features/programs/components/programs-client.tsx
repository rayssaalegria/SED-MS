"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
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
        description="Programas vinculados aos Contratos de Gestão."
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

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar programa..."
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
                  <TableRow key={program.id}>
                    <TableCell className="font-medium">{program.code}</TableCell>
                    <TableCell>{program.name}</TableCell>
                    <TableCell>
                      {contract ? (
                        <Link
                          href={`/contratos/${contract.id}`}
                          className="text-[#7d141d] hover:underline"
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
        </CardContent>
      </Card>

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
