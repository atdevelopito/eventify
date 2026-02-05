import { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ActionItem {
  icon?: ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

interface ActionMenuProps {
  items: ActionItem[];
  trigger?: ReactNode;
  align?: "start" | "center" | "end";
}

export function ActionMenu({ items, trigger, align = "end" }: ActionMenuProps) {
  const defaultItems = items.filter(item => item.variant !== "destructive");
  const destructiveItems = items.filter(item => item.variant === "destructive");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        {defaultItems.map((item, index) => (
          <DropdownMenuItem 
            key={index} 
            onClick={item.onClick}
            disabled={item.disabled}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
          </DropdownMenuItem>
        ))}
        {destructiveItems.length > 0 && defaultItems.length > 0 && (
          <DropdownMenuSeparator />
        )}
        {destructiveItems.map((item, index) => (
          <DropdownMenuItem 
            key={`destructive-${index}`} 
            onClick={item.onClick}
            disabled={item.disabled}
            className="text-destructive focus:text-destructive"
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
