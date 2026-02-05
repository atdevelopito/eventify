import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  title?: string;
  subtitle?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({ 
  title, 
  subtitle,
  description, 
  action, 
  children, 
  className,
  padding = "md" 
}: CardProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-card", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            {title && (
              <div className="flex items-baseline gap-2">
                <h3 className="text-sm font-medium text-foreground">{title}</h3>
                {subtitle && (
                  <span className="text-xs text-muted-foreground">{subtitle}</span>
                )}
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={paddingMap[padding]}>{children}</div>
    </div>
  );
}
