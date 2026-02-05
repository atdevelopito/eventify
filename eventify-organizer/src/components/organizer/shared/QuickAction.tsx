import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface QuickActionProps {
  icon: ReactNode;
  title: string;
  description?: string;
  onClick: () => void;
  badge?: string | number;
  badgeVariant?: "default" | "warning" | "success" | "destructive";
  disabled?: boolean;
  className?: string;
}

export function QuickAction({
  icon,
  title,
  description,
  onClick,
  badge,
  badgeVariant = "default",
  disabled = false,
  className,
}: QuickActionProps) {
  const badgeColors = {
    default: "bg-primary/10 text-primary",
    warning: "bg-warning/10 text-warning",
    success: "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
        "hover:bg-muted/50 active:scale-[0.99]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "group",
        className
      )}
    >
      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-foreground text-sm">{title}</p>
          {badge !== undefined && (
            <span className={cn(
              "px-1.5 py-0.5 text-xs font-medium rounded-full",
              badgeColors[badgeVariant]
            )}>
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{description}</p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
    </button>
  );
}
