"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  CircleHelp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MENU_GROUPS } from "@/lib/constants/menu";
import { hasPermission } from "@/lib/rbac/permissions";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SessionUser } from "@/types/domain";
import type { MenuGroup, MenuItem } from "@/lib/constants/menu";

interface SidebarProps {
  user: SessionUser;
  collapsed: boolean;
}

function resolveHref(href: string) {
  const url = new URL(href, "http://local.invalid");
  return {
    pathname: url.pathname,
    aba: url.searchParams.get("aba"),
  };
}

function itemIsActive(
  item: MenuItem,
  pathname: string,
  searchParams: URLSearchParams,
) {
  const target = resolveHref(item.href);
  const currentAba = searchParams.get("aba");

  if (target.pathname === "/orcamento") {
    if (pathname.startsWith("/orcamento/")) {
      return !target.aba;
    }
    if (pathname !== "/orcamento") return false;
    if (target.aba) return currentAba === target.aba;
    return !currentAba;
  }

  return (
    pathname === target.pathname ||
    pathname.startsWith(`${target.pathname}/`)
  );
}

function groupHasActiveItem(
  group: MenuGroup,
  pathname: string,
  searchParams: URLSearchParams,
) {
  return group.items.some((item) => itemIsActive(item, pathname, searchParams));
}

function SidebarChildLink({
  item,
  active,
}: {
  item: MenuItem;
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      className="flex h-10 items-center pl-6 text-sm font-medium transition-colors"
    >
      <span
        className={cn(
          "flex h-full flex-1 items-center border-l-2 px-2",
          active ? "border-white" : "border-white/40",
        )}
      >
        <span
          className={cn(
            "flex w-full items-center rounded-lg px-2 py-2",
            active
              ? "bg-[rgba(195,201,232,0.6)] text-white"
              : "text-[#e8e8e8] hover:bg-white/10",
          )}
        >
          {item.title}
        </span>
      </span>
    </Link>
  );
}

function AccordionGroup({
  group,
  pathname,
  searchParams,
  compact,
  defaultOpen,
}: {
  group: MenuGroup;
  pathname: string;
  searchParams: URLSearchParams;
  compact: boolean;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const singleItem = group.items.length === 1 ? group.items[0] : null;
  const Icon = (singleItem?.icon ??
    group.items[0]?.icon ??
    ChevronDown) as LucideIcon;
  const groupActive = groupHasActiveItem(group, pathname, searchParams);

  useEffect(() => {
    if (compact) {
      setOpen(false);
      return;
    }
    setOpen(defaultOpen);
  }, [compact, defaultOpen]);

  // Modo recolhido: só o canal pai (ícone).
  if (compact) {
    if (singleItem) {
      const active = itemIsActive(singleItem, pathname, searchParams);
      return (
        <Link
          href={singleItem.href}
          title={group.title}
          aria-label={group.title}
          className={cn(
            "mx-2 flex h-12 items-center justify-center rounded-lg transition-colors",
            active
              ? "bg-[rgba(195,201,232,0.6)] text-white"
              : "text-[#e8e8e8] hover:bg-white/10",
          )}
        >
          <Icon className="size-5" aria-hidden />
        </Link>
      );
    }

    return (
      <div
        title={group.title}
        aria-label={group.title}
        className={cn(
          "mx-2 flex h-12 items-center justify-center rounded-lg transition-colors",
          groupActive
            ? "bg-[rgba(195,201,232,0.35)] text-white"
            : "text-[#e8e8e8] hover:bg-white/10",
        )}
      >
        <Icon className="size-5" aria-hidden />
        <span className="sr-only">{group.title}</span>
      </div>
    );
  }

  // Grupo com um único destino: o próprio canal é o link (sem filho).
  if (singleItem) {
    const active = itemIsActive(singleItem, pathname, searchParams);
    return (
      <Link
        href={singleItem.href}
        className={cn(
          "flex h-12 w-full items-center gap-2 px-4 text-left text-sm font-medium transition-colors",
          active
            ? "bg-[rgba(195,201,232,0.6)] text-white"
            : "text-[#e8e8e8] hover:bg-white/5",
        )}
      >
        <Icon className="size-4 shrink-0" aria-hidden />
        <span className="flex-1 truncate">{group.title}</span>
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        className="flex h-12 w-full items-center gap-2 px-4 text-left text-sm font-medium text-[#e8e8e8] hover:bg-white/5"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon className="size-4 shrink-0" aria-hidden />
        <span className="flex-1 truncate">{group.title}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open && (
        <ul>
          {group.items.map((item) => {
            const active = itemIsActive(item, pathname, searchParams);
            return (
              <li key={item.href}>
                <SidebarChildLink item={item} active={active} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function Sidebar({ user, collapsed }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [peek, setPeek] = useState(false);

  useEffect(() => {
    if (!collapsed) setPeek(false);
  }, [collapsed]);

  const compact = collapsed && !peek;
  const overlayExpanded = collapsed && peek;

  const visibleGroups = useMemo(
    () =>
      MENU_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            hasPermission(user.permissions, item.permissions) &&
            (!item.roles || item.roles.includes(user.activeRole)),
        ),
      })).filter((group) => group.items.length > 0),
    [user.permissions, user.activeRole],
  );

  return (
    <div
      className={cn(
        "relative h-full",
        collapsed ? "w-[72px]" : "w-[220px]",
      )}
      onMouseEnter={() => {
        if (collapsed) setPeek(true);
      }}
      onMouseLeave={() => setPeek(false)}
    >
      <aside
        className={cn(
          "flex h-full flex-col bg-[#1b2030] text-[#e8e8e8] transition-[width,box-shadow] duration-200 ease-out",
          collapsed && "absolute inset-y-0 left-0 z-50",
          compact && "w-[72px]",
          overlayExpanded && "w-[220px] shadow-[8px_0_32px_rgba(0,0,0,0.45)]",
          !collapsed && "relative w-[220px]",
        )}
        aria-expanded={!compact}
      >
        <div
          className={cn(
            "flex h-[76px] items-center px-4 pb-4 pt-4",
            compact && "justify-center px-2",
          )}
        >
          {compact ? (
            <div className="relative flex size-10 items-center justify-center overflow-hidden">
              <Image
                src="/brand/sed-brasao-branco.png"
                alt="Brasão de Mato Grosso do Sul"
                width={40}
                height={46}
                className="object-contain"
                sizes="40px"
                priority
              />
            </div>
          ) : (
            <div className="relative h-[52px] w-[188px]">
              <Image
                src="/brand/sed-logo-branco.png"
                alt="SED — Secretaria de Estado de Educação / Estado de Mato Grosso do Sul"
                fill
                className="object-contain object-left"
                sizes="188px"
                priority
              />
            </div>
          )}
        </div>

        <ScrollArea className="flex-1">
          <nav aria-label="Menu principal" className="pb-4">
            {visibleGroups.map((group) => (
              <AccordionGroup
                key={group.title}
                group={group}
                pathname={pathname}
                searchParams={searchParams}
                compact={compact}
                defaultOpen={groupHasActiveItem(
                  group,
                  pathname,
                  searchParams,
                )}
              />
            ))}
          </nav>
        </ScrollArea>

        <div className="mt-auto border-t border-[rgba(195,201,232,0.35)]">
          {compact ? (
            <Link
              href="/ajuda"
              title="Ajuda"
              aria-label="Ajuda"
              className="mx-2 my-2 flex h-12 items-center justify-center rounded-lg text-[#e8e8e8] hover:bg-white/10"
            >
              <CircleHelp className="size-5" aria-hidden />
            </Link>
          ) : (
            <>
              <Link
                href="/ajuda"
                className="flex h-14 items-center gap-2 px-4 text-sm font-medium text-[#e8e8e8] hover:bg-white/5"
              >
                <CircleHelp className="size-4" aria-hidden />
                <span className="flex-1">Ajuda</span>
                <ChevronRight className="size-4" aria-hidden />
              </Link>
              <div className="space-y-1 px-4 py-2 text-[10px] text-[#e8e8e8]/70">
                <p>v.2.16.03</p>
                <p>Copyright © 2026 Governo de MS</p>
                <div className="flex items-center gap-1.5 pt-1">
                  <Image
                    src="/brand/sasi-mark.svg"
                    alt=""
                    width={14}
                    height={14}
                    className="size-[14px]"
                  />
                  <span>
                    Powered by <strong className="font-semibold">SASI</strong>
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
