import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  Ticket, 
  FileText, 
  Star, 
  DollarSign,
  ShoppingBag,
  Megaphone,
  Plus
} from "lucide-react";

interface EmptyStateProps {
  icon?: "calendar" | "users" | "ticket" | "file" | "star" | "dollar" | "shopping" | "megaphone";
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

const iconMap = {
  calendar: Calendar,
  users: Users,
  ticket: Ticket,
  file: FileText,
  star: Star,
  dollar: DollarSign,
  shopping: ShoppingBag,
  megaphone: Megaphone,
};

export function EmptyState({ icon = "file", title, description, action, children }: EmptyStateProps) {
  const Icon = iconMap[icon];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          <Plus className="w-4 h-4 mr-2" />
          {action.label}
        </Button>
      )}
      {children}
    </div>
  );
}
