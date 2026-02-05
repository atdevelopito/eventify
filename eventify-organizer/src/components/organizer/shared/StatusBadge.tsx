import { cn } from "@/lib/utils";

type StatusVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "default"
  | "muted";

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  size?: "sm" | "md";
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-info/10 text-info border-info/20",
  default: "bg-primary/10 text-primary border-primary/20",
  muted: "bg-muted text-muted-foreground border-border",
};

const statusToVariant: Record<string, StatusVariant> = {
  // Event statuses
  published: "success",
  draft: "muted",
  cancelled: "error",
  completed: "info",
  // Registration statuses
  confirmed: "success",
  pending: "warning",
  refunded: "muted",
  // Ticket statuses
  active: "success",
  sold_out: "error",
  hidden: "muted",
  // Attendee statuses
  vip: "default",
  blocked: "error",
  // Promotion statuses
  expired: "muted",
  paused: "warning",
  // Payout statuses
  processing: "warning",
  failed: "error",
  // Review statuses
  flagged: "warning",
  // Form statuses
  archived: "muted",
  // Merchandise statuses
  out_of_stock: "error",
};

export function StatusBadge({ status, variant, size = "sm", className }: StatusBadgeProps) {
  const resolvedVariant = variant || statusToVariant[status] || "default";

  const displayStatus = status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium border rounded-full",
        variantStyles[resolvedVariant],
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
    >
      {displayStatus}
    </span>
  );
}
