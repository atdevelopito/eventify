import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: "plus" | "download" | "upload";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: "plus" | "download" | "upload";
  };
  children?: ReactNode;
}

const iconMap = {
  plus: Plus,
  download: Download,
  upload: Upload,
};

export function PageHeader({ title, description, action, secondaryAction, children }: PageHeaderProps) {
  const ActionIcon = action?.icon ? iconMap[action.icon] : null;
  const SecondaryIcon = secondaryAction?.icon ? iconMap[secondaryAction.icon] : null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight pt-2 sm:pt-0">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {children}
        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction.onClick}>
            {SecondaryIcon && <SecondaryIcon className="w-4 h-4 mr-2" />}
            {secondaryAction.label}
          </Button>
        )}
        {action && (
          <Button onClick={action.onClick}>
            {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
