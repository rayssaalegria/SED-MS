export type AppNotification = {
  id: string;
  category: string;
  statusText: string;
  title: string;
  subtitle: string;
  href?: string;
  read: boolean;
};

export const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: "1",
    category: "Prazo",
    statusText: "Vence em 8 dias",
    title: "ENT-2026-004 — KITS DE CONECTIVIDADE",
    subtitle: "CAMPO GRANDE",
    href: "/entregas/ent-04",
    read: false,
  },
  {
    id: "2",
    category: "Aprovação",
    statusText: "Pendente há 7 dias",
    title: "CG-SED-2026 — VALIDAÇÃO SEGOV",
    subtitle: "SEGOV",
    href: "/aprovacoes",
    read: false,
  },
  {
    id: "3",
    category: "Evidência",
    statusText: "Complementação solicitada",
    title: "ENT-2026-002 — CONTRATAÇÃO DE OBRAS",
    subtitle: "DOURADOS",
    href: "/evidencias",
    read: false,
  },
  {
    id: "4",
    category: "Risco",
    statusText: "Criticidade alta",
    title: "AQUISIÇÃO — CONECTIVIDADE ESCOLAR",
    subtitle: "PRJ-SED-2026-02",
    href: "/riscos",
    read: true,
  },
];
