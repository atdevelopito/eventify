import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  change?: {
    value: number;
    label: string;
  };
  variant?: "default" | "primary" | "success" | "warning";
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  change, 
  variant = "default",
  className 
}: StatsCardProps) {
  const isPositive = change ? change.value >= 0 : true;

  return (
    <div
      className={cn(
        "p-5 rounded-lg border border-border bg-card",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold text-foreground tracking-tight">{value}</p>
          {change && (
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-success" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-destructive" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  isPositive ? "text-success" : "text-destructive"
                )}
              >
                {isPositive ? "+" : ""}{change.value}%
              </span>
              <span className="text-xs text-muted-foreground">{change.label}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
