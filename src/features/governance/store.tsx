"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEMO_AMENDMENTS,
  DEMO_APPROVALS,
  DEMO_AUDIT_LOGS,
  DEMO_CHANGE_REQUESTS,
  DEMO_EVALUATIONS,
} from "@/lib/data/demo-governance";
import { applyApprovalDecision } from "@/lib/domain/governance";
import type {
  AnnualEvaluation,
  ApprovalDecision,
  ApprovalItem,
  AuditLogEntry,
  ChangeRequest,
  ContractAmendment,
} from "@/types/governance";

interface GovernanceStore {
  approvals: ApprovalItem[];
  changeRequests: ChangeRequest[];
  amendments: ContractAmendment[];
  evaluations: AnnualEvaluation[];
  auditLogs: AuditLogEntry[];
  decideApproval: (
    id: string,
    decision: ApprovalDecision,
    note: string,
    actor?: string,
  ) => void;
  upsertChangeRequest: (item: ChangeRequest) => void;
  reviewChangeRequest: (
    id: string,
    status: ChangeRequest["status"],
    note: string,
    reviewer?: string,
  ) => void;
  upsertAmendment: (item: ContractAmendment) => void;
  upsertEvaluation: (item: AnnualEvaluation) => void;
  appendAuditLog: (entry: Omit<AuditLogEntry, "id" | "at"> & { at?: string }) => void;
}

const GovernanceContext = createContext<GovernanceStore | null>(null);

function nowStamp() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

export function GovernanceProvider({ children }: { children: ReactNode }) {
  const [approvals, setApprovals] = useState(DEMO_APPROVALS);
  const [changeRequests, setChangeRequests] = useState(DEMO_CHANGE_REQUESTS);
  const [amendments, setAmendments] = useState(DEMO_AMENDMENTS);
  const [evaluations, setEvaluations] = useState(DEMO_EVALUATIONS);
  const [auditLogs, setAuditLogs] = useState(DEMO_AUDIT_LOGS);

  const value = useMemo<GovernanceStore>(
    () => ({
      approvals,
      changeRequests,
      amendments,
      evaluations,
      auditLogs,
      decideApproval: (id, decision, note, actor = "Usuário autenticado") => {
        setApprovals((prev) =>
          prev.map((item) =>
            item.id === id
              ? applyApprovalDecision(item, decision, actor, note)
              : item,
          ),
        );
        setAuditLogs((prev) => [
          {
            id: crypto.randomUUID(),
            at: nowStamp(),
            userName: actor,
            userEmail: "sessao@sed.ms.gov.br",
            action: decision === "aprovar" ? "approve" : "reject",
            entity: "approvals",
            entityId: id,
            organizationAcronym: "SED",
            summary: `Decisão "${decision}" na aprovação ${id}.`,
            newValue: note,
          },
          ...prev,
        ]);
      },
      upsertChangeRequest: (item) => {
        setChangeRequests((prev) => {
          const exists = prev.some((row) => row.id === item.id);
          return exists
            ? prev.map((row) => (row.id === item.id ? item : row))
            : [item, ...prev];
        });
      },
      reviewChangeRequest: (
        id,
        status,
        note,
        reviewer = "Fernanda Oliveira Costa",
      ) => {
        setChangeRequests((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status,
                  reviewNote: note,
                  reviewerName: reviewer,
                  reviewedAt: new Date().toISOString().slice(0, 10),
                }
              : item,
          ),
        );
        setAuditLogs((prev) => [
          {
            id: crypto.randomUUID(),
            at: nowStamp(),
            userName: reviewer,
            userEmail: "segov@sed.ms.gov.br",
            action: status === "aprovada" ? "approve" : "reject",
            entity: "change_requests",
            entityId: id,
            organizationAcronym: "SEGOV",
            summary: `Alteração ${id} marcada como ${status}.`,
            newValue: note,
          },
          ...prev,
        ]);
      },
      upsertAmendment: (item) => {
        setAmendments((prev) => {
          const exists = prev.some((row) => row.id === item.id);
          return exists
            ? prev.map((row) => (row.id === item.id ? item : row))
            : [item, ...prev];
        });
        setAuditLogs((prev) => [
          {
            id: crypto.randomUUID(),
            at: nowStamp(),
            userName: item.requestedBy,
            userEmail: "gestor.sed@sed.ms.gov.br",
            action: "update",
            entity: "amendments",
            entityId: item.id,
            organizationAcronym: "SED",
            summary: `Aditivo ${item.code} atualizado (${item.status}).`,
          },
          ...prev,
        ]);
      },
      upsertEvaluation: (item) => {
        setEvaluations((prev) => {
          const exists = prev.some((row) => row.id === item.id);
          return exists
            ? prev.map((row) => (row.id === item.id ? item : row))
            : [item, ...prev];
        });
      },
      appendAuditLog: (entry) => {
        setAuditLogs((prev) => [
          {
            ...entry,
            id: crypto.randomUUID(),
            at: entry.at ?? nowStamp(),
          },
          ...prev,
        ]);
      },
    }),
    [amendments, approvals, auditLogs, changeRequests, evaluations],
  );

  return (
    <GovernanceContext.Provider value={value}>
      {children}
    </GovernanceContext.Provider>
  );
}

export function useGovernance() {
  const ctx = useContext(GovernanceContext);
  if (!ctx) {
    throw new Error(
      "useGovernance deve ser usado dentro de GovernanceProvider",
    );
  }
  return ctx;
}
