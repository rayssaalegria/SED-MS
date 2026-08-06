"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ODS_ITEMS,
  PPA_PROGRAMS,
  STRATEGIC_PILLARS,
  type StrategicPillar,
} from "@/lib/data/strategic";

export function StrategicSettingsClient() {
  const [pillars, setPillars] = useState(STRATEGIC_PILLARS);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  function handleCreatePillar() {
    if (!name.trim() || !code.trim()) {
      toast.error("Informe código e nome do pilar.");
      return;
    }
    const created: StrategicPillar = {
      id: crypto.randomUUID(),
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim(),
      status: "ativo",
    };
    setPillars((prev) => [...prev, created]);
    setOpen(false);
    setName("");
    setCode("");
    setDescription("");
    toast.success("Pilar estratégico cadastrado.");
  }

  return (
    <div>
      <PageHeader
        title="Configurações estratégicas"
        description="Administre pilares estratégicos, ODS e programas do PPA utilizados no alinhamento de projetos."
        breadcrumbs={[
          { label: "Administração", href: "/configuracoes" },
          { label: "Configurações" },
        ]}
      />

      <Tabs defaultValue="pillars">
        <TabsList>
          <TabsTrigger value="pillars">Pilares</TabsTrigger>
          <TabsTrigger value="ods">ODS</TabsTrigger>
          <TabsTrigger value="ppa">Programas do PPA</TabsTrigger>
        </TabsList>

        <TabsContent value="pillars" className="space-y-4">
          <div className="flex justify-end">
            <Button type="button" onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              Novo pilar
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Situação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pillars.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.code}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="max-w-md text-muted-foreground">
                        {item.description}
                      </TableCell>
                      <TableCell>
                        <StatusBadge label="Ativo" tone="success" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ods">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº</TableHead>
                    <TableHead>ODS</TableHead>
                    <TableHead>Situação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ODS_ITEMS.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.number}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <StatusBadge label="Ativo" tone="success" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ppa">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Programa</TableHead>
                    <TableHead>Eixo</TableHead>
                    <TableHead>Situação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PPA_PROGRAMS.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.code}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.axis}</TableCell>
                      <TableCell>
                        <StatusBadge label="Ativo" tone="success" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo pilar estratégico</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pillar-code">Código</Label>
              <Input
                id="pillar-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pillar-name">Nome</Label>
              <Input
                id="pillar-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pillar-desc">Descrição</Label>
              <Input
                id="pillar-desc"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleCreatePillar}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
