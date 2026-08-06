"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { DEMO_AGENDA_EVENTS } from "@/lib/data/demo-analytics";
import {
  AGENDA_TYPE_LABELS,
  type AgendaEventType,
} from "@/types/analytics";

function agendaTone(status: string) {
  if (status === "concluido") return "success" as const;
  if (status === "cancelado") return "danger" as const;
  return "info" as const;
}

export function AgendaClient() {
  const [type, setType] = useState<string>("todos");
  const [month, setMonth] = useState<string>("2026-08");

  const filtered = useMemo(() => {
    return DEMO_AGENDA_EVENTS.filter((item) => {
      const matchesType = type === "todos" || item.type === type;
      const matchesMonth = item.date.startsWith(month);
      return matchesType && matchesMonth;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [month, type]);

  return (
    <div>
      <PageHeader
        title="Agenda estratégica"
        breadcrumbs={[
          { label: "Visão geral", href: "/dashboard" },
          { label: "Agenda estratégica" },
        ]}
      />

      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 pt-6 md:flex-row">
          <Select
            value={month}
            onValueChange={(value) => setMonth(value ?? "2026-08")}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026-07">Julho/2026</SelectItem>
              <SelectItem value="2026-08">Agosto/2026</SelectItem>
              <SelectItem value="2026-09">Setembro/2026</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={type}
            onValueChange={(value) => setType(value ?? "todos")}
          >
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              {(Object.keys(AGENDA_TYPE_LABELS) as AgendaEventType[]).map(
                (item) => (
                  <SelectItem key={item} value={item}>
                    {AGENDA_TYPE_LABELS[item]}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Órgão</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-nowrap">
                    {item.date}
                    {item.time ? ` · ${item.time}` : ""}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{item.title}</p>
                    {item.relatedLabel && (
                      <p className="text-xs text-muted-foreground">
                        {item.relatedLabel}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{AGENDA_TYPE_LABELS[item.type]}</TableCell>
                  <TableCell>{item.organizationAcronym}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>
                    <StatusBadge
                      label={
                        item.status === "agendado"
                          ? "Agendado"
                          : item.status === "concluido"
                            ? "Concluído"
                            : "Cancelado"
                      }
                      tone={agendaTone(item.status)}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Nenhum evento no filtro selecionado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
