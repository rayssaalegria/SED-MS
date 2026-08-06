"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useManagement } from "@/features/management/store";
import { DEMO_ORGANIZATIONS } from "@/lib/data/demo-organizations";
import type { ContractStatus, ManagementContract } from "@/types/management";
import { CONTRACT_STATUS_LABELS } from "@/types/management";

export function ContractFormClient() {
  const router = useRouter();
  const { upsertContract } = useManagement();
  const secretarias = DEMO_ORGANIZATIONS.filter(
    (org) => org.acronym === "SED",
  );

  const [form, setForm] = useState({
    code: "",
    name: "",
    year: "2026",
    organizationId: "11111111-1111-1111-1111-111111111008",
    objective: "",
    governorName: "Carlos Eduardo Mendes",
    secretaryName: "",
    managerName: "",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "em_elaboracao" as ContractStatus,
    observations: "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      toast.error("Informe código e nome do contrato.");
      return;
    }
    const org = secretarias.find((item) => item.id === form.organizationId);
    const contract: ManagementContract = {
      id: crypto.randomUUID(),
      code: form.code.trim().toUpperCase(),
      year: Number(form.year),
      organizationId: form.organizationId,
      organizationAcronym: org?.acronym ?? "ORG",
      name: form.name.trim(),
      objective: form.objective.trim(),
      governorName: form.governorName.trim(),
      secretaryName: form.secretaryName.trim(),
      managerName: form.managerName.trim(),
      draftedAt: new Date().toISOString().slice(0, 10),
      startDate: form.startDate,
      endDate: form.endDate,
      version: 1,
      status: form.status,
      executionPercent: 0,
      observations: form.observations.trim(),
      isPublic: false,
    };
    upsertContract(contract);
    toast.success("Contrato criado com sucesso.");
    router.push(`/contratos/${contract.id}`);
  }

  return (
    <div>
      <PageHeader
        title="Novo Contrato de Gestão"
        description="Preencha os dados básicos para iniciar a elaboração do contrato."
        breadcrumbs={[
          { label: "Contratos", href: "/contratos" },
          { label: "Novo contrato" },
        ]}
      />

      <Card>
        <CardContent className="pt-6">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                value={form.code}
                onChange={(e) => update("code", e.target.value)}
                placeholder="CG-SED-2026"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Ano</Label>
              <Input
                id="year"
                type="number"
                value={form.year}
                onChange={(e) => update("year", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nome do contrato</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="objective">Objetivo geral</Label>
              <Input
                id="objective"
                value={form.objective}
                onChange={(e) => update("objective", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Órgão responsável</Label>
              <Select
                value={form.organizationId}
                onValueChange={(value) =>
                  update("organizationId", value ?? form.organizationId)
                }
              >
                <SelectTrigger aria-label="Órgão responsável">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {secretarias.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.acronym} — {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Situação</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  update("status", (value as ContractStatus) ?? form.status)
                }
              >
                <SelectTrigger aria-label="Situação">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CONTRACT_STATUS_LABELS) as ContractStatus[]).map(
                    (status) => (
                      <SelectItem key={status} value={status}>
                        {CONTRACT_STATUS_LABELS[status]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="governor">Governador signatário</Label>
              <Input
                id="governor"
                value={form.governorName}
                onChange={(e) => update("governorName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secretary">Secretário responsável</Label>
              <Input
                id="secretary"
                value={form.secretaryName}
                onChange={(e) => update("secretaryName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager">Gestor do contrato</Label>
              <Input
                id="manager"
                value={form.managerName}
                onChange={(e) => update("managerName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start">Data inicial</Label>
              <Input
                id="start"
                type="date"
                value={form.startDate}
                onChange={(e) => update("startDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Data final</Label>
              <Input
                id="end"
                type="date"
                value={form.endDate}
                onChange={(e) => update("endDate", e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="obs">Observações</Label>
              <Input
                id="obs"
                value={form.observations}
                onChange={(e) => update("observations", e.target.value)}
              />
            </div>
            <div className="flex gap-2 md:col-span-2">
              <Button type="submit">Salvar contrato</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/contratos")}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
