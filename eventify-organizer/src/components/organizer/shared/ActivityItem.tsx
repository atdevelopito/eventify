import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { 
  UserPlus, 
  Star, 
  Ticket, 
  DollarSign, 
  CalendarDays, 
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

type ActivityType = "registration" | "review" | "ticket" | "payout" | "event" | "alert" | "success";

interface ActivityItemProps {
  type: ActivityType;
  message: string;
  time: string;
  icon?: ReactNode;
  className?: string;
}

const typeConfig: Record<ActivityType, { icon: ReactNode; color: string }> = {
  registration: { 
    icon: <UserPlus className="w-4 h-4" />, 
    color: "bg-info/10 text-info" 
  },
  review: { 
    icon: <Star className="w-4 h-4" />, 
    color: "bg-warning/10 text-warning" 
  },
  ticket: { 
    icon: <Ticket className="w-4 h-4" />, 
    color: "bg-success/10 text-success" 
  },
  payout: { 
    icon: <DollarSign className="w-4 h-4" />, 
    color: "bg-primary/10 text-primary" 
  },
  event: { 
    icon: <CalendarDays className="w-4 h-4" />, 
    color: "bg-muted text-muted-foreground" 
  },
  alert: { 
    icon: <AlertCircle className="w-4 h-4" />, 
    color: "bg-destructive/10 text-destructive" 
  },
  success: { 
    icon: <CheckCircle className="w-4 h-4" />, 
    color: "bg-success/10 text-success" 
  },
};

export function ActivityItem({ type, message, time, icon, className }: ActivityItemProps) {
  const config = typeConfig[type];

  return (
    <div className={cn("flex items-start gap-3 py-3", className)}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        config.color
      )}>
        {icon || config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground line-clamp-2">{message}</p>
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}
