import {
  DEMO_CONTRACTS,
  DEMO_DELIVERABLES,
  DEMO_PROGRAMS,
  DEMO_PROJECTS,
} from "@/lib/data/demo-management";
import { DEMO_INDICATORS, DEMO_EVIDENCES } from "@/lib/data/demo-monitoring";
import { DEMO_ORGANIZATIONS } from "@/lib/data/demo-organizations";
import { calcAchievementPercent } from "@/lib/domain/monitoring";
import type {
  PublicDeliverableCard,
  PublicDocumentCard,
  PublicFilters,
  PublicIndicatorCard,
  PublicProgramCard,
  PublicProjectCard,
} from "@/types/public";

function orgAcronym(organizationId: string) {
  return (
    DEMO_ORGANIZATIONS.find((org) => org.id === organizationId)?.acronym ??
    "—"
  );
}

function contractYear(contractId: string) {
  return DEMO_CONTRACTS.find((c) => c.id === contractId)?.year ?? 2026;
}

export function getPublicPrograms(): PublicProgramCard[] {
  return DEMO_PROGRAMS.filter((program) => program.isPublic).map((program) => {
    const projects = DEMO_PROJECTS.filter(
      (project) => project.programId === program.id && project.isPublic,
    );
    const executionPercent =
      projects.length === 0
        ? 0
        : Math.round(
            projects.reduce((sum, p) => sum + p.executionPercent, 0) /
              projects.length,
          );
    return {
      id: program.id,
      code: program.code,
      name: program.name,
      description: program.description,
      objective: program.objective,
      organizationAcronym: orgAcronym(program.organizationId),
      pillarCode: program.pillarCode,
      ods: program.ods,
      scope: program.scope,
      year: contractYear(program.contractId),
      projectsCount: projects.length,
      executionPercent,
    };
  });
}

export function getPublicProjects(): PublicProjectCard[] {
  return DEMO_PROJECTS.filter((project) => project.isPublic).map((project) => {
    const program = DEMO_PROGRAMS.find((p) => p.id === project.programId);
    return {
      id: project.id,
      code: project.code,
      name: project.name,
      description: project.description,
      objective: project.objective,
      organizationAcronym: orgAcronym(project.organizationId),
      programId: project.programId,
      programName: program?.name ?? "—",
      programCode: program?.code ?? "—",
      year: contractYear(project.contractId),
      pillarCode: project.pillarCode,
      ods: project.ods,
      municipalities: project.municipalities,
      executionPercent: project.executionPercent,
      budgetPlanned: project.budgetPlanned,
      beneficiariesPlanned: project.beneficiariesPlanned,
      beneficiariesReached: project.beneficiariesReached,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
    };
  });
}

export function getPublicDeliverables(projectId: string): PublicDeliverableCard[] {
  return DEMO_DELIVERABLES.filter(
    (item) =>
      item.projectId === projectId &&
      (item.status === "concluida" || item.status === "concluida_parcialmente"),
  ).map((item) => ({
    id: item.id,
    code: item.code,
    title: item.title,
    municipalityName: item.municipalityName,
    executionPercent: item.executionPercent,
    completedAt: item.completedAt,
    unitOfMeasure: item.unitOfMeasure,
    achievedResult: item.achievedResult,
  }));
}

export function getPublicIndicators(projectId?: string): PublicIndicatorCard[] {
  return DEMO_INDICATORS.filter((indicator) => {
    if (projectId) return indicator.projectId === projectId;
    return Boolean(indicator.projectId);
  })
    .filter((indicator) => {
      const project = DEMO_PROJECTS.find((p) => p.id === indicator.projectId);
      return project?.isPublic;
    })
    .map((indicator) => ({
      id: indicator.id,
      code: indicator.code,
      name: indicator.name,
      unitOfMeasure: indicator.unitOfMeasure,
      annualTarget: indicator.annualTarget,
      currentResult: indicator.currentResult,
      achievementPercent: calcAchievementPercent(
        indicator.currentResult,
        indicator.annualTarget,
        indicator.polarity,
      ),
      periodicity: indicator.periodicity,
    }));
}

export function getPublicDocuments(projectId?: string): PublicDocumentCard[] {
  return DEMO_EVIDENCES.filter((evidence) => {
    if (evidence.accessLevel !== "publico" || evidence.status !== "aprovada") {
      return false;
    }
    const project = DEMO_PROJECTS.find((p) => p.id === evidence.projectId);
    if (!project?.isPublic) return false;
    if (projectId && evidence.projectId !== projectId) return false;
    return true;
  }).map((evidence) => {
    const project = DEMO_PROJECTS.find((p) => p.id === evidence.projectId);
    return {
      id: evidence.id,
      name: evidence.name,
      type: evidence.type,
      publishedAt: evidence.validatedAt ?? evidence.submittedAt,
      projectCode: project?.code,
    };
  });
}

export function filterPublicProjects(
  projects: PublicProjectCard[],
  filters: PublicFilters,
) {
  const q = filters.query.trim().toLowerCase();
  return projects.filter((project) => {
    const matchesQuery =
      !q ||
      project.name.toLowerCase().includes(q) ||
      project.code.toLowerCase().includes(q) ||
      project.programName.toLowerCase().includes(q) ||
      project.municipalities.some((m) => m.toLowerCase().includes(q));
    const matchesOrg =
      filters.organizationAcronym === "todas" ||
      project.organizationAcronym === filters.organizationAcronym;
    const matchesMun =
      filters.municipality === "todos" ||
      project.municipalities.includes(filters.municipality);
    const matchesYear =
      filters.year === "todos" || String(project.year) === filters.year;
    const matchesProgram =
      filters.programId === "todos" || project.programId === filters.programId;
    const matchesPillar =
      filters.pillarCode === "todos" ||
      project.pillarCode === filters.pillarCode;
    const matchesStatus =
      filters.status === "todos" || project.status === filters.status;
    return (
      matchesQuery &&
      matchesOrg &&
      matchesMun &&
      matchesYear &&
      matchesProgram &&
      matchesPillar &&
      matchesStatus
    );
  });
}

export function publicSummary(projects: PublicProjectCard[]) {
  const orgs = new Set(projects.map((p) => p.organizationAcronym));
  const execution =
    projects.length === 0
      ? 0
      : Math.round(
          projects.reduce((sum, p) => sum + p.executionPercent, 0) /
            projects.length,
        );
  const investment = projects.reduce((sum, p) => sum + p.budgetPlanned, 0);
  return {
    organizations: orgs.size,
    projects: projects.length,
    execution,
    investment,
  };
}
