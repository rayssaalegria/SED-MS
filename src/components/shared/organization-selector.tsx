"use client";

import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setActiveOrganizationAction } from "@/features/auth/actions";
import type { SessionUser } from "@/types/domain";

interface OrganizationSelectorProps {
  user: SessionUser;
}

export function OrganizationSelector({ user }: OrganizationSelectorProps) {
  const router = useRouter();
  const organizations = user.roles
    .map((role) => role.organization)
    .filter((org): org is NonNullable<typeof org> => Boolean(org));

  const uniqueOrgs = organizations.filter(
    (org, index, arr) => arr.findIndex((item) => item.id === org.id) === index,
  );

  if (uniqueOrgs.length <= 1) {
    const org = uniqueOrgs[0];
    if (!org) return null;
    return (
      <div className="hidden items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-sm lg:flex">
        <Building2 className="size-4 text-[var(--ms-primary)]" aria-hidden />
        <span className="max-w-[180px] truncate font-medium">{org.acronym}</span>
      </div>
    );
  }

  return (
    <Select
      value={user.activeOrganizationId ?? uniqueOrgs[0].id}
      onValueChange={async (value) => {
        if (!value) return;
        await setActiveOrganizationAction(value);
        router.refresh();
      }}
    >
      <SelectTrigger
        className="w-[180px] md:w-[220px]"
        aria-label="Selecionar órgão"
      >
        <SelectValue placeholder="Selecionar órgão" />
      </SelectTrigger>
      <SelectContent>
        {uniqueOrgs.map((org) => (
          <SelectItem key={org.id} value={org.id}>
            {org.acronym} — {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
