"use client";

import { useMemo, useState } from "react";
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
import { useMonitoring } from "@/features/monitoring/store";
import {
  IMPEDIMENT_STATUS_LABELS,
  type Impediment,
  type ImpedimentStatus,
} from "@/types/monitoring";

export function ImpedimentsClient() {
  const { impediments, upsertImpediment } = useMonitoring();
  const { projects, deliverables } = useManagement();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Impediment | null>(null);
  const [solution, setSolution] = useState("");
  const [status, setStatus] = useState<ImpedimentStatus>("resolvido");

  const rows = useMemo(
    () =>
      impediments.map((item) => ({
        item,
        project: projects.find((p) => p.id === item.projectId),
        deliverable: deliverables.find((d) => d.id === item.deliverableId),
      })),
    [deliverables, impediments, projects],
  );

  function openResolve(item: Impediment) {
    setEditing(item);
    setSolution(item.solution ?? "");
    setStatus(item.status === "resolvido" ? "resolvido" : "em_tratamento");
    setOpen(true);
  }

  function handleSave() {
    if (!editing) return;
    if (
      (status === "resolvido" || status === "em_tratamento") &&
      !solution.trim()
    ) {
      toast.error("Registre a solução ou andamento do impedimento.");
      return;
    }
    upsertImpediment({
      ...editing,
      status,
      solution: solution.trim(),
    });
    setOpen(false);
    toast.success("Impedimento atualizado.");
  }

  return (
    <div>
      <PageHeader
        title="Impedimentos"
        breadcrumbs={[
          { label: "Execução", href: "/impedimentos" },
          { label: "Impedimentos" },
        ]}
      />

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Impedimento</TableHead>
                <TableHead>Projeto</TableHead>
                <TableHead>Entrega</TableHead>
                <TableHead>Órgão envolvido</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ item, project, deliverable }) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </TableCell>
                  <TableCell>{project?.code ?? "—"}</TableCell>
                  <TableCell>{deliverable?.code ?? "—"}</TableCell>
                  <TableCell>{item.involvedOrg}</TableCell>
                  <TableCell className="capitalize">{item.priority}</TableCell>
                  <TableCell>
                    <StatusBadge
                      label={IMPEDIMENT_STATUS_LABELS[item.status]}
                      tone={
                        item.status === "resolvido"
                          ? "success"
                          : item.status === "aberto" ||
                              item.status === "dependencia_externa"
                            ? "danger"
                            : "warning"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => openResolve(item)}
                    >
                      Atualizar
                    </Button>
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
            <DialogTitle>Atualizar impedimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm font-medium">{editing?.title}</p>
            <div className="space-y-2">
              <Label>Situação</Label>
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus((value as ImpedimentStatus) ?? status)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.keys(IMPEDIMENT_STATUS_LABELS) as ImpedimentStatus[]
                  ).map((item) => (
                    <SelectItem key={item} value={item}>
                      {IMPEDIMENT_STATUS_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="solution">Solução / andamento</Label>
              <Input
                id="solution"
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
