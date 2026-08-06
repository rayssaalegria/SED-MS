"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleUserRound,
  Globe,
  KeyRound,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
} from "lucide-react";
import { ROLE_LABELS, type SessionUser } from "@/types/domain";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/shared/user-avatar";
import { OrganizationSelector } from "@/components/shared/organization-selector";
import { NotificationsPopover } from "@/features/notifications/components/notifications-popover";
import { logoutAction } from "@/features/auth/actions";
import { APP_NAME, MENU_GROUPS } from "@/lib/constants/menu";

interface HeaderProps {
  user: SessionUser;
  collapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileNav?: () => void;
}

function resolvePageTitle(pathname: string) {
  for (const group of MENU_GROUPS) {
    for (const item of group.items) {
      if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
        return item.title;
      }
    }
  }
  if (pathname.startsWith("/dashboard/estadual")) return "Visão consolidada da SED";
  if (pathname.startsWith("/dashboard/secretaria")) return "Dashboard da SED";
  if (pathname === "/") return APP_NAME;
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  return APP_NAME;
}

export function Header({
  user,
  collapsed,
  onToggleSidebar,
  onOpenMobileNav,
}: HeaderProps) {
  const pathname = usePathname();
  const title = resolvePageTitle(pathname);
  const org =
    user.roles.find((r) => r.organization_id === user.activeOrganizationId)
      ?.organization?.acronym ?? "Sistema";

  return (
    <header className="flex h-[76px] items-stretch border-b border-[rgba(195,201,232,0.45)] bg-[#f4f5ff]">
      <div className="flex w-12 shrink-0 items-center justify-center border-r border-[rgba(195,201,232,0.45)]">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden size-8 text-[#1b2030] md:inline-flex"
          onClick={onToggleSidebar}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-5" />
          ) : (
            <PanelLeftClose className="size-5" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onOpenMobileNav}
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </Button>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-4 px-4">
        <h1 className="truncate text-2xl font-bold text-[#1b2030]">{title}</h1>

        <div className="flex items-center gap-2 md:gap-3">
          <OrganizationSelector user={user} />

          <div className="hidden items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-[#576175] lg:flex">
            <Globe className="size-4" aria-hidden />
            <span>Português (PTBR)</span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden text-[#1b2030] sm:inline-flex"
            aria-label="Alto contraste"
          >
            <CircleUserRound className="size-5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-[#1b2030]"
            aria-label="Tema claro"
          >
            <Sun className="size-5" />
          </Button>

          <NotificationsPopover />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto gap-2 rounded-lg px-2 py-1"
                  aria-label="Menu do usuário"
                />
              }
            >
              <UserAvatar name={user.profile.full_name} />
              <span className="hidden text-left md:block">
                <span className="block text-sm font-semibold text-[#1b2030]">
                  {user.profile.full_name}
                </span>
                <span className="block text-xs text-[#576175]">
                  {ROLE_LABELS[user.activeRole].split(" / ")[0]} • {org}
                </span>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="z-[100] w-72 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white p-1 shadow-[0_12px_40px_rgba(27,32,48,0.16)]"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-3 py-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-[#1b2030]">
                      {user.profile.full_name}
                    </p>
                    <p className="text-xs font-normal text-[#576175]">
                      {user.profile.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="cursor-pointer gap-2 px-3 py-2"
                  render={<Link href="/alterar-senha" />}
                >
                  <KeyRound className="size-4" />
                  Alterar senha
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer gap-2 px-3 py-2"
                  render={<Link href="/publico" />}
                >
                  <Globe className="size-4" />
                  Portal público
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer gap-2 px-3 py-2 text-[#7d141d] focus:bg-[#fdeceb] focus:text-[#7d141d]"
                  onClick={() => {
                    void logoutAction();
                  }}
                >
                  <LogOut className="size-4" />
                  Sair do sistema
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
