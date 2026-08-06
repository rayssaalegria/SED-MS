"use client";

import type { ReactNode } from "react";
import { ManagementProvider } from "@/features/management/store";
import { MonitoringProvider } from "@/features/monitoring/store";
import { GovernanceProvider } from "@/features/governance/store";
import { BudgetModuleProvider } from "@/features/budgets/store";
import { AppShell } from "@/components/layout/app-shell";
import type { SessionUser } from "@/types/domain";

export function AppProviders({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  return (
    <ManagementProvider>
      <MonitoringProvider>
        <GovernanceProvider>
          <BudgetModuleProvider>
            <AppShell user={user}>{children}</AppShell>
          </BudgetModuleProvider>
        </GovernanceProvider>
      </MonitoringProvider>
    </ManagementProvider>
  );
}
