"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEMO_ACTIVITIES,
  DEMO_CONTRACTS,
  DEMO_DELIVERABLES,
  DEMO_PROGRAMS,
  DEMO_PROJECTS,
} from "@/lib/data/demo-management";
import {
  calcContractExecution,
  calcProjectExecution,
} from "@/lib/domain/progress";
import type {
  Activity,
  Deliverable,
  ManagementContract,
  Program,
  Project,
} from "@/types/management";

interface ManagementStore {
  contracts: ManagementContract[];
  programs: Program[];
  projects: Project[];
  deliverables: Deliverable[];
  activities: Activity[];
  upsertContract: (contract: ManagementContract) => void;
  softDeleteContract: (id: string) => void;
  upsertProgram: (program: Program) => void;
  softDeleteProgram: (id: string) => void;
  upsertProject: (project: Project) => void;
  softDeleteProject: (id: string) => void;
  upsertDeliverable: (deliverable: Deliverable) => void;
  softDeleteDeliverable: (id: string) => void;
  upsertActivity: (activity: Activity) => void;
  softDeleteActivity: (id: string) => void;
  recalculate: () => void;
}

const ManagementContext = createContext<ManagementStore | null>(null);

function withRecalc(
  projects: Project[],
  deliverables: Deliverable[],
  contracts: ManagementContract[],
) {
  const nextProjects = projects.map((project) => ({
    ...project,
    executionPercent: calcProjectExecution(
      deliverables.filter((d) => d.projectId === project.id),
    ),
  }));
  const nextContracts = contracts.map((contract) => ({
    ...contract,
    executionPercent: calcContractExecution(
      nextProjects.filter((p) => p.contractId === contract.id),
    ),
  }));
  return { projects: nextProjects, contracts: nextContracts };
}

export function ManagementProvider({ children }: { children: ReactNode }) {
  const [contracts, setContracts] = useState(DEMO_CONTRACTS);
  const [programs, setPrograms] = useState(DEMO_PROGRAMS);
  const [projects, setProjects] = useState(DEMO_PROJECTS);
  const [deliverables, setDeliverables] = useState(DEMO_DELIVERABLES);
  const [activities, setActivities] = useState(DEMO_ACTIVITIES);
  const [deletedContractIds, setDeletedContractIds] = useState<string[]>([]);
  const [deletedProgramIds, setDeletedProgramIds] = useState<string[]>([]);
  const [deletedProjectIds, setDeletedProjectIds] = useState<string[]>([]);
  const [deletedDeliverableIds, setDeletedDeliverableIds] = useState<string[]>(
    [],
  );
  const [deletedActivityIds, setDeletedActivityIds] = useState<string[]>([]);

  const recalculate = useCallback(() => {
    setProjects((prevProjects) => {
      const result = withRecalc(prevProjects, deliverables, contracts);
      setContracts(result.contracts);
      return result.projects;
    });
  }, [contracts, deliverables]);

  const value = useMemo<ManagementStore>(
    () => ({
      contracts: contracts.filter((c) => !deletedContractIds.includes(c.id)),
      programs: programs.filter((p) => !deletedProgramIds.includes(p.id)),
      projects: projects.filter((p) => !deletedProjectIds.includes(p.id)),
      deliverables: deliverables.filter(
        (d) => !deletedDeliverableIds.includes(d.id),
      ),
      activities: activities.filter((a) => !deletedActivityIds.includes(a.id)),
      upsertContract: (contract) => {
        setContracts((prev) => {
          const exists = prev.some((item) => item.id === contract.id);
          return exists
            ? prev.map((item) => (item.id === contract.id ? contract : item))
            : [...prev, contract];
        });
      },
      softDeleteContract: (id) =>
        setDeletedContractIds((prev) => [...new Set([...prev, id])]),
      upsertProgram: (program) => {
        setPrograms((prev) => {
          const exists = prev.some((item) => item.id === program.id);
          return exists
            ? prev.map((item) => (item.id === program.id ? program : item))
            : [...prev, program];
        });
      },
      softDeleteProgram: (id) =>
        setDeletedProgramIds((prev) => [...new Set([...prev, id])]),
      upsertProject: (project) => {
        setProjects((prev) => {
          const exists = prev.some((item) => item.id === project.id);
          const next = exists
            ? prev.map((item) => (item.id === project.id ? project : item))
            : [...prev, project];
          const result = withRecalc(next, deliverables, contracts);
          setContracts(result.contracts);
          return result.projects;
        });
      },
      softDeleteProject: (id) =>
        setDeletedProjectIds((prev) => [...new Set([...prev, id])]),
      upsertDeliverable: (deliverable) => {
        setDeliverables((prev) => {
          const exists = prev.some((item) => item.id === deliverable.id);
          const next = exists
            ? prev.map((item) =>
                item.id === deliverable.id ? deliverable : item,
              )
            : [...prev, deliverable];
          const result = withRecalc(projects, next, contracts);
          setProjects(result.projects);
          setContracts(result.contracts);
          return next;
        });
      },
      softDeleteDeliverable: (id) =>
        setDeletedDeliverableIds((prev) => [...new Set([...prev, id])]),
      upsertActivity: (activity) => {
        setActivities((prev) => {
          const exists = prev.some((item) => item.id === activity.id);
          return exists
            ? prev.map((item) => (item.id === activity.id ? activity : item))
            : [...prev, activity];
        });
      },
      softDeleteActivity: (id) =>
        setDeletedActivityIds((prev) => [...new Set([...prev, id])]),
      recalculate,
    }),
    [
      activities,
      contracts,
      deletedActivityIds,
      deletedContractIds,
      deletedDeliverableIds,
      deletedProgramIds,
      deletedProjectIds,
      deliverables,
      programs,
      projects,
      recalculate,
    ],
  );

  return (
    <ManagementContext.Provider value={value}>
      {children}
    </ManagementContext.Provider>
  );
}

export function useManagement() {
  const ctx = useContext(ManagementContext);
  if (!ctx) {
    throw new Error("useManagement deve ser usado dentro de ManagementProvider");
  }
  return ctx;
}
