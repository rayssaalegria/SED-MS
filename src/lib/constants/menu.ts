import type { UserRole } from "@/types/domain";
import {
  LayoutDashboard,
  Bell,
  FileText,
  FolderKanban,
  Package,
  Target,
  ListTodo,
  Paperclip,
  Wallet,
  AlertTriangle,
  Ban,
  CheckSquare,
  RefreshCw,
  FilePlus2,
  ClipboardCheck,
  MapPin,
  Map,
  BarChart3,
  Building2,
  Network,
  Users,
  Shield,
  Settings,
  ScrollText,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";

export interface MenuItem {
  title: string;
  href: string;
  icon: LucideIcon;
  permissions?: string[];
  roles?: UserRole[];
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export const MENU_GROUPS: MenuGroup[] = [
  {
    title: "Visão geral",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Agenda estratégica",
        href: "/agenda",
        icon: CalendarDays,
        permissions: ["dashboard.estadual", "dashboard.secretaria"],
      },
      {
        title: "Notificações",
        href: "/notificacoes",
        icon: Bell,
      },
    ],
  },
  {
    title: "Gestão estratégica",
    items: [
      {
        title: "Contratos de Gestão",
        href: "/contratos",
        icon: FileText,
        permissions: ["contracts.read"],
      },
      {
        title: "Programas",
        href: "/programas",
        icon: FolderKanban,
        permissions: ["projects.read"],
      },
      {
        title: "Projetos",
        href: "/projetos",
        icon: Package,
        permissions: ["projects.read"],
      },
      {
        title: "Entregas",
        href: "/entregas",
        icon: ListTodo,
        permissions: ["deliverables.read"],
      },
      {
        title: "Indicadores",
        href: "/indicadores",
        icon: Target,
        permissions: ["indicators.read"],
      },
    ],
  },
  {
    title: "Execução",
    items: [
      {
        title: "Atividades",
        href: "/atividades",
        icon: ListTodo,
        permissions: ["deliverables.read"],
      },
      {
        title: "Evidências",
        href: "/evidencias",
        icon: Paperclip,
        permissions: ["deliverables.read", "evidences.validate"],
      },
      {
        title: "Orçamento",
        href: "/orcamento",
        icon: Wallet,
        permissions: ["projects.read"],
      },
      {
        title: "Riscos",
        href: "/riscos",
        icon: AlertTriangle,
        permissions: ["projects.read"],
      },
      {
        title: "Impedimentos",
        href: "/impedimentos",
        icon: Ban,
        permissions: ["projects.read"],
      },
    ],
  },
  {
    title: "Governança",
    items: [
      {
        title: "Aprovações",
        href: "/aprovacoes",
        icon: CheckSquare,
        permissions: ["approvals.act"],
      },
      {
        title: "Alterações",
        href: "/alteracoes",
        icon: RefreshCw,
        permissions: ["approvals.act", "contracts.write"],
      },
      {
        title: "Aditivos",
        href: "/aditivos",
        icon: FilePlus2,
        permissions: ["contracts.write"],
      },
      {
        title: "Avaliações",
        href: "/avaliacoes",
        icon: ClipboardCheck,
        permissions: ["approvals.act", "evidences.validate"],
      },
    ],
  },
  {
    title: "Gestão territorial",
    items: [
      {
        title: "Municípios",
        href: "/municipios",
        icon: MapPin,
        permissions: ["dashboard.estadual", "dashboard.secretaria"],
      },
      {
        title: "Mapa da rede",
        href: "/mapa",
        icon: Map,
        permissions: ["dashboard.estadual", "dashboard.secretaria"],
      },
    ],
  },
  {
    title: "Relatórios",
    items: [
      {
        title: "Relatórios",
        href: "/relatorios",
        icon: BarChart3,
        permissions: ["reports.export"],
      },
    ],
  },
  {
    title: "Administração",
    items: [
      {
        title: "Órgãos",
        href: "/orgaos",
        icon: Building2,
        permissions: ["organizations.manage"],
      },
      {
        title: "Estrutura organizacional",
        href: "/estrutura",
        icon: Network,
        permissions: ["organizations.manage"],
      },
      {
        title: "Usuários",
        href: "/usuarios",
        icon: Users,
        permissions: ["users.manage"],
      },
      {
        title: "Perfis e permissões",
        icon: Shield,
        href: "/perfis",
        permissions: ["permissions.manage"],
      },
      {
        title: "Configurações",
        href: "/configuracoes",
        icon: Settings,
        permissions: ["settings.manage"],
      },
      {
        title: "Logs de auditoria",
        href: "/auditoria",
        icon: ScrollText,
        permissions: ["audit.read"],
      },
    ],
  },
];

export const APP_NAME = "SED - MS";
export const APP_FULL_NAME =
  "Sistema de Gestão Estratégica — Secretaria de Estado de Educação de Mato Grosso do Sul";
export const APP_ORG_NAME = "Secretaria de Estado de Educação";
export const APP_ORG_ACRONYM = "SED";
export const APP_STATE_NAME = "Mato Grosso do Sul";
