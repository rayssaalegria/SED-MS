"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { DEMO_ORGANIZATIONS } from "@/lib/data/demo-organizations";
import { DEMO_ORG_UNITS } from "@/lib/data/demo-units";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { Organization } from "@/types/domain";

interface TreeNode extends Organization {
  children: TreeNode[];
}

function buildTree(orgs: Organization[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  orgs.forEach((org) => map.set(org.id, { ...org, children: [] }));
  const roots: TreeNode[] = [];
  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function OrgNode({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = node.children.length > 0;
  const units = DEMO_ORG_UNITS.filter(
    (unit) => unit.organizationId === node.id,
  );

  return (
    <li>
      <div
        className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted/60"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren || units.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-expanded={open}
            aria-label={open ? `Recolher ${node.acronym}` : `Expandir ${node.acronym}`}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </Button>
        ) : (
          <span className="inline-block size-7" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            {node.acronym}{" "}
            <span className="font-normal text-muted-foreground">— {node.name}</span>
          </p>
        </div>
        <StatusBadge label="Ativo" tone="success" />
      </div>
      {open && units.length > 0 && (
        <ul>
          {units.map((unit) => (
            <li
              key={unit.id}
              className="flex items-center justify-between gap-2 px-2 py-1.5 text-sm text-muted-foreground"
              style={{ paddingLeft: `${(depth + 1) * 16 + 40}px` }}
            >
              <span>
                {unit.acronym} — {unit.name}
                <span className="ml-2 text-xs">({unit.managerName})</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {open && hasChildren && (
        <ul className={cn(open && "block")}>
          {node.children.map((child) => (
            <OrgNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function OrganizationTree() {
  const tree = useMemo(() => buildTree(DEMO_ORGANIZATIONS), []);

  return (
    <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organograma estadual</CardTitle>
        </CardHeader>
        <CardContent>
          <ul aria-label="Organograma estadual">
            {tree.map((node) => (
              <OrgNode key={node.id} node={node} />
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Unidades da SED (exemplo)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {DEMO_ORG_UNITS.map((unit) => (
            <div key={unit.id} className="rounded-lg border border-border p-3">
              <p className="font-medium text-foreground">
                {unit.acronym} — {unit.name}
              </p>
              <p className="text-muted-foreground">Gestor: {unit.managerName}</p>
              <p className="text-muted-foreground">
                Município: {unit.municipalityName}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
