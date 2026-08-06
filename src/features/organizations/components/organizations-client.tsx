"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEMO_ORGANIZATIONS } from "@/lib/data/demo-organizations";
import type { Organization, OrgUnitType } from "@/types/domain";

const typeLabels: Record<string, string> = {
  governo: "Governo",
  orgao: "Órgão",
  secretaria: "Secretaria",
  secretaria_executiva: "Secretaria-Executiva",
  superintendencia: "Superintendência",
  coordenadoria: "Coordenadoria",
  unidade: "Unidade",
  setor: "Setor",
};

export function OrganizationsClient() {
  const [orgs, setOrgs] = useState<Organization[]>(DEMO_ORGANIZATIONS);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [acronym, setAcronym] = useState("");
  const [type, setType] = useState<OrgUnitType>("secretaria");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orgs;
    return orgs.filter(
      (org) =>
        org.name.toLowerCase().includes(q) ||
        org.acronym.toLowerCase().includes(q),
    );
  }, [orgs, query]);

  function handleCreate() {
    if (!name.trim() || !acronym.trim()) {
      toast.error("Informe nome e sigla do órgão.");
      return;
    }
    const exists = orgs.some(
      (org) => org.acronym.toLowerCase() === acronym.trim().toLowerCase(),
    );
    if (exists) {
      toast.error("Já existe um órgão com essa sigla.");
      return;
    }

    const created: Organization = {
      id: crypto.randomUUID(),
      name: name.trim(),
      acronym: acronym.trim().toUpperCase(),
      type,
      parent_id: "11111111-1111-1111-1111-111111111001",
      status: "ativo",
    };
    setOrgs((prev) => [...prev, created]);
    setOpen(false);
    setName("");
    setAcronym("");
    setType("secretaria");
    toast.success("Órgão cadastrado com sucesso.");
  }

  return (
    <div>
      <PageHeader
        title="Órgãos estaduais"
        description="Cadastro institucional dos órgãos, secretarias e entidades vinculadas."
        breadcrumbs={[
          { label: "Administração", href: "/orgaos" },
          { label: "Órgãos" },
        ]}
        actions={
          <Button type="button" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Novo órgão
          </Button>
        }
      />

      <Card className="mb-4 border-border/80 shadow-sm">
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome ou sigla..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Buscar órgão"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sigla</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.acronym}</TableCell>
                  <TableCell>{org.name}</TableCell>
                  <TableCell>{typeLabels[org.type] ?? org.type}</TableCell>
                  <TableCell>
                    <StatusBadge
                      label={org.status === "ativo" ? "Ativo" : org.status}
                      tone={org.status === "ativo" ? "success" : "neutral"}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo órgão</DialogTitle>
            <DialogDescription>
              Cadastre um órgão, autarquia, fundação ou entidade vinculada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Nome</Label>
              <Input
                id="org-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex.: Fundação de Cultura de MS"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-acronym">Sigla</Label>
              <Input
                id="org-acronym"
                value={acronym}
                onChange={(event) => setAcronym(event.target.value)}
                placeholder="Ex.: FCMS"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-type">Tipo</Label>
              <Select
                value={type}
                onValueChange={(value) =>
                  setType((value as OrgUnitType) ?? "secretaria")
                }
              >
                <SelectTrigger id="org-type" aria-label="Tipo do órgão">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "orgao",
                      "secretaria",
                      "secretaria_executiva",
                      "unidade",
                    ] as OrgUnitType[]
                  ).map((item) => (
                    <SelectItem key={item} value={item}>
                      {typeLabels[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
