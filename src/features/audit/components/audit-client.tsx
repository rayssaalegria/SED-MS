"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTableCard } from "@/components/shared/data-table-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  FilterToolbar,
  ResultCount,
  SearchField,
  filterFieldClass,
} from "@/components/shared/filter-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { useGovernance } from "@/features/governance/store";
import { auditActionTone } from "@/lib/domain/governance";
import {
  AUDIT_ACTION_LABELS,
  type AuditAction,
} from "@/types/governance";
import { cn } from "@/lib/utils";

export function AuditClient() {
  const { auditLogs } = useGovernance();
  const [query, setQuery] = useState("");
  const [action, setAction] = useState<string>("todas");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return auditLogs.filter((item) => {
      const matchesAction = action === "todas" || item.action === action;
      const matchesQuery =
        !q ||
        item.userName.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.entity.toLowerCase().includes(q) ||
        item.organizationAcronym.toLowerCase().includes(q);
      return matchesAction && matchesQuery;
    });
  }, [action, auditLogs, query]);

  return (
    <div>
      <PageHeader
        title="Logs de auditoria"
        breadcrumbs={[
          { label: "Administração", href: "/auditoria" },
          { label: "Logs" },
        ]}
      />

      <FilterToolbar
        trailing={
          <ResultCount
            filtered={filtered.length}
            total={auditLogs.length}
            label="registro"
          />
        }
      >
        <SearchField
          placeholder="Buscar por usuário, entidade ou resumo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar log de auditoria"
        />
        <Select
          value={action}
          onValueChange={(value) => setAction(value ?? "todas")}
        >
          <SelectTrigger
            className={cn(filterFieldClass, "w-[180px]")}
            aria-label="Filtrar por ação"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as ações</SelectItem>
            {(Object.keys(AUDIT_ACTION_LABELS) as AuditAction[]).map(
              (item) => (
                <SelectItem key={item} value={item}>
                  {AUDIT_ACTION_LABELS[item]}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </FilterToolbar>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum registro encontrado"
          description="Ajuste a busca ou o filtro de ação para visualizar resultados."
        />
      ) : (
        <DataTableCard header="Trilha imutável no modo demonstração (apenas inclusão). Logs não podem ser excluídos por usuários comuns.">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead>Órgão</TableHead>
                <TableHead>Resumo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">{log.at}</TableCell>
                  <TableCell>
                    <p className="font-medium">{log.userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.userEmail}
                    </p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={AUDIT_ACTION_LABELS[log.action]}
                      tone={auditActionTone(log.action)}
                    />
                  </TableCell>
                  <TableCell>
                    <p>{log.entity}</p>
                    {log.entityId && (
                      <p className="text-xs text-muted-foreground">
                        {log.entityId}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{log.organizationAcronym}</TableCell>
                  <TableCell className="max-w-xs text-sm">
                    {log.summary}
                    {(log.previousValue || log.newValue) && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {log.previousValue && `De: ${log.previousValue}`}
                        {log.previousValue && log.newValue && " · "}
                        {log.newValue && `Para: ${log.newValue}`}
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTableCard>
      )}
    </div>
  );
}
