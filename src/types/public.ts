import type { ProjectStatus } from "@/types/management";

export interface PublicFilters {
  query: string;
  organizationAcronym: string;
  municipality: string;
  year: string;
  programId: string;
  pillarCode: string;
  status: string;
}

export interface PublicProgramCard {
  id: string;
  code: string;
  name: string;
  description: string;
  objective: string;
  organizationAcronym: string;
  pillarCode: string;
  ods: string[];
  scope: string;
  year: number;
  projectsCount: number;
  executionPercent: number;
}

export interface PublicProjectCard {
  id: string;
  code: string;
  name: string;
  description: string;
  objective: string;
  organizationAcronym: string;
  programId: string;
  programName: string;
  programCode: string;
  year: number;
  pillarCode: string;
  ods: string[];
  municipalities: string[];
  executionPercent: number;
  budgetPlanned: number;
  beneficiariesPlanned: number;
  beneficiariesReached: number;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
}

export interface PublicDeliverableCard {
  id: string;
  code: string;
  title: string;
  municipalityName?: string;
  executionPercent: number;
  completedAt?: string | null;
  unitOfMeasure: string;
  achievedResult: number;
}

export interface PublicIndicatorCard {
  id: string;
  code: string;
  name: string;
  unitOfMeasure: string;
  annualTarget: number;
  currentResult: number;
  achievementPercent: number;
  periodicity: string;
}

export interface PublicDocumentCard {
  id: string;
  name: string;
  type: string;
  publishedAt: string;
  projectCode?: string;
}
