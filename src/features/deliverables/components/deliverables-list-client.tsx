"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { deliverableTone, formatDate } from "@/features/management/utils";
import { DELIVERABLE_STATUS_LABELS } from "@/types/management";
import { isDueSoon, isDeliverableOverdue } from "@/lib/domain/progress";

export function DeliverablesListClient() {
  const { deliverables } = useManagement();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return deliverables;
    return deliverables.filter(
      (d) =>
        d.code.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.ownerName.toLowerCase().includes(q),
    );
  }, [deliverables, query]);

  return (
    <div>
      <PageHeader
        title="Entregas"
        description="Entregas mensuráveis com regras de evidência, atraso e percentual."
        breadcrumbs={[
          { label: "Gestão estratégica", href: "/entregas" },
          { label: "Entregas" },
        ]}
      />

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar entrega..."
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
                <TableHead>Título</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Execução</TableHead>
                <TableHead>Alerta</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Link
                      href={`/entregas/${item.id}`}
                      className="font-medium text-[#7d141d] hover:underline"
                    >
                      {item.code}
                    </Link>
                  </TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.ownerName}</TableCell>
                  <TableCell>{formatDate(item.dueDate)}</TableCell>
                  <TableCell>{item.executionPercent}%</TableCell>
                  <TableCell>
                    {isDeliverableOverdue(item) ? (
                      <StatusBadge label="Atrasada" tone="danger" />
                    ) : isDueSoon(item) ? (
                      <StatusBadge label="Prazo próximo" tone="warning" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={DELIVERABLE_STATUS_LABELS[item.status]}
                      tone={deliverableTone(item.status)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
