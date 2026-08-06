import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DataTableCardProps {
  children: ReactNode;
  className?: string;
  /** Conteúdo acima da tabela (avisos, legendas). */
  header?: ReactNode;
}

/** Card de tabela sem padding extra — conteúdo edge-to-edge. */
export function DataTableCard({
  children,
  className,
  header,
}: DataTableCardProps) {
  return (
    <Card className={cn("gap-0 overflow-hidden py-0", className)}>
      {header ? (
        <div className="border-b border-border/60 px-4 py-3 text-sm text-muted-foreground">
          {header}
        </div>
      ) : null}
      <CardContent className="p-0">
        <div className="overflow-x-auto">{children}</div>
      </CardContent>
    </Card>
  );
}
