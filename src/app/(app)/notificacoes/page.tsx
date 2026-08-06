"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DEMO_NOTIFICATIONS,
  type AppNotification,
} from "@/lib/data/demo-notifications";
import { cn } from "@/lib/utils";

function NotificationCard({
  item,
  onMarkRead,
}: {
  item: AppNotification;
  onMarkRead: (id: string) => void;
}) {
  const content = (
    <CardContent className="flex items-start gap-3 pt-5 pb-5">
      <span
        className={cn(
          "mt-1.5 size-2.5 shrink-0 rounded-full",
          item.read
            ? "border border-[#c5c9d6] bg-transparent"
            : "bg-[#7d141d]",
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
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
      </div>
      {!item.read && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-[#576175]"
          aria-label="Marcar como vista"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onMarkRead(item.id);
          }}
        >
          <Check className="size-4" />
        </Button>
      )}
    </CardContent>
  );

  return (
    <Card
      className={cn(
        "border-[#e8eaf0] shadow-sm",
        !item.read && "border-[#f0c4c4]/80 bg-[#fffcfc]",
      )}
    >
      {item.href ? (
        <Link href={item.href} className="block">
          {content}
        </Link>
      ) : (
        content
      )}
    </Card>
  );
}

export default function NotificacoesPage() {
  const [items, setItems] = useState(DEMO_NOTIFICATIONS);
  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items],
  );

  return (
    <div>
      <PageHeader
        title="Notificações"
        breadcrumbs={[
          { label: "Visão geral", href: "/dashboard" },
          { label: "Notificações" },
        ]}
        actions={
          <Button
            type="button"
            variant="outline"
            disabled={unreadCount === 0}
            onClick={() =>
              setItems((prev) => prev.map((item) => ({ ...item, read: true })))
            }
          >
            <CheckCheck className="size-4" />
            Marcar todas como vistas
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          title="Nenhuma notificação"
          description="Quando houver alertas de prazo, aprovação ou risco, eles aparecerão aqui."
          icon={Bell}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <NotificationCard
              key={item.id}
              item={item}
              onMarkRead={(id) =>
                setItems((prev) =>
                  prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
