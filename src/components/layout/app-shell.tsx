"use client";

import { Suspense, useState, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { SessionUser } from "@/types/domain";

interface AppShellProps {
  user: SessionUser;
  children: ReactNode;
}

function SidebarSlot({
  user,
  collapsed,
}: {
  user: SessionUser;
  collapsed: boolean;
}) {
  return (
    <Suspense fallback={<div className="h-full w-[220px] bg-[#1b2030]" />}>
      <Sidebar user={user} collapsed={collapsed} />
    </Suspense>
  );
}

export function AppShell({ user, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#1b2030]">
      <div className="hidden md:block">
        <SidebarSlot user={user} collapsed={collapsed} />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[220px] border-0 bg-[#1b2030] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu de navegação</SheetTitle>
          </SheetHeader>
          <div className="h-full">
            <SidebarSlot user={user} collapsed={false} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col py-2 pr-2">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-lg bg-[#f4f5ff]">
          <Header
            user={user}
            collapsed={collapsed}
            onToggleSidebar={() => setCollapsed((value) => !value)}
            onOpenMobileNav={() => setMobileOpen(true)}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
