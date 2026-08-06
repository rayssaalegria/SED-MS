import { AlertCircle, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
  className?: string;
}

const toneStyles: Record<StatusTone, string> = {
  success: "bg-[var(--ms-success)]/10 text-[var(--ms-success)] border-[var(--ms-success)]/20",
  warning: "bg-[var(--ms-warning)]/15 text-[#8A6D00] border-[var(--ms-warning)]/30",
  danger: "bg-[var(--ms-danger)]/10 text-[var(--ms-danger)] border-[var(--ms-danger)]/20",
  info: "bg-[var(--ms-secondary)]/10 text-[var(--ms-secondary)] border-[var(--ms-secondary)]/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

const toneIcons: Record<StatusTone, typeof CheckCircle2> = {
  success: CheckCircle2,
  warning: AlertCircle,
  danger: XCircle,
  info: Clock3,
  neutral: Clock3,
};

export function StatusBadge({
  label,
  tone = "neutral",
  className,
}: StatusBadgeProps) {
  const Icon = toneIcons[tone];
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium",
        toneStyles[tone],
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      <span>{label}</span>
    </Badge>
  );
}
