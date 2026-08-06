"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Bell, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DEMO_NOTIFICATIONS,
  type AppNotification,
} from "@/lib/data/demo-notifications";
import { cn } from "@/lib/utils";

function NotificationRow({
  item,
  onMarkRead,
  onOpen,
}: {
  item: AppNotification;
  onMarkRead: (id: string) => void;
  onOpen: (item: AppNotification) => void;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 border-b border-[#e8eaf0] px-4 py-3 last:border-b-0",
        !item.read && "bg-[#fafafa]",
      )}
    >
      <span
        className={cn(
          "mt-1.5 size-2.5 shrink-0 rounded-full",
          item.read
            ? "border border-[#c5c9d6] bg-transparent"
            : "bg-[#7d141d]",
        )}
        aria-hidden
      />

      <button
        type="button"
        className="min-w-0 flex-1 text-left"
        onClick={() => onOpen(item)}
      >
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#f0c4c4] bg-[#fdeceb] px-2 py-0.5 text-[11px] font-medium text-[#7d141d]">
            {item.category}
          </span>
          <span className="text-[11px] font-medium text-[#9f2d2d]">
            {item.statusText}
          </span>
        </div>
        <p className="text-sm font-bold tracking-wide text-[#1b2030] uppercase">
          {item.title}
        </p>
        <p className="text-xs font-medium tracking-wide text-[#8b93a7] uppercase">
          {item.subtitle}
        </p>
      </button>

      {!item.read && (
        <button
          type="button"
          className="mt-0.5 rounded-md p-1 text-[#576175] transition-colors hover:bg-[#eef0f6] hover:text-[#1b2030]"
          aria-label="Marcar como vista"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onMarkRead(item.id);
          }}
        >
          <Check className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

export function NotificationsPopover() {
  const router = useRouter();
  const [items, setItems] = useState(DEMO_NOTIFICATIONS);
  const [open, setOpen] = useState(false);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items],
  );

  function markAllRead() {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
  }

  function markRead(id: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }

  function openItem(item: AppNotification) {
    markRead(item.id);
    setOpen(false);
    if (item.href) router.push(item.href);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative text-[#1b2030]"
            aria-label={`Notificações${unreadCount ? `, ${unreadCount} não lidas` : ""}`}
          />
        }
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 min-w-5 justify-center rounded-full bg-[#7d141d] px-1 text-[10px] text-white hover:bg-[#7d141d]">
            {unreadCount}
          </Badge>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white p-0 text-[#1b2030] shadow-[0_12px_40px_rgba(27,32,48,0.16)] ring-0"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#e8eaf0] px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <p className="text-base font-semibold text-[#1b2030]">
              Notificações
            </p>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#7d141d] px-2 py-0.5 text-[11px] font-semibold text-white">
                {unreadCount} {unreadCount === 1 ? "nova" : "novas"}
              </span>
            )}
          </div>
          <button
            type="button"
            className="shrink-0 text-xs font-medium text-[#9f2d2d] hover:underline disabled:opacity-40"
            disabled={unreadCount === 0}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              markAllRead();
            }}
          >
            Marcar todas como vistas
          </button>
        </div>

        <div className="max-h-[360px] overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[#8b93a7]">
              Nenhuma notificação no momento.
            </p>
          ) : (
            items.map((item) => (
              <NotificationRow
                key={item.id}
                item={item}
                onMarkRead={markRead}
                onOpen={openItem}
              />
            ))
          )}
        </div>

        <div className="border-t border-[#e8eaf0] px-4 py-2.5">
          <Link
            href="/notificacoes"
            className="block text-center text-xs font-medium text-[#576175] hover:text-[#1b2030] hover:underline"
            onClick={() => setOpen(false)}
          >
            Ver todas as notificações
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
