import { format } from "date-fns";
import { MapPin, Clock, Users, MoreHorizontal, Eye, Edit, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { ActionMenu } from "./ActionMenu";
import { ProgressRing } from "./ProgressRing";
import { Event } from "@/lib/mock-data";

interface EventCardProps {
  event: Event;
  onClick?: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  variant?: "default" | "compact" | "detailed";
  className?: string;
}

export function EventCard({
  event,
  onClick,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  variant = "default",
  className,
}: EventCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const safeFormat = (date: any, fmt: string) => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "Invalid Date";
      return format(d, fmt);
    } catch (e) {
      return "Invalid Date";
    }
  };

  const actions = [
    ...(onView ? [{ icon: <Eye className="w-4 h-4" />, label: "View Details", onClick: onView }] : []),
    ...(onEdit ? [{ icon: <Edit className="w-4 h-4" />, label: "Edit Event", onClick: onEdit }] : []),
    ...(onDuplicate ? [{ icon: <Copy className="w-4 h-4" />, label: "Duplicate", onClick: onDuplicate }] : []),
    ...(onDelete ? [{ icon: <Trash2 className="w-4 h-4" />, label: "Delete", onClick: onDelete, variant: "destructive" as const }] : []),
  ];

  if (variant === "compact") {
    return (
      <div
        onClick={onClick}
        className={cn(
          "flex items-center gap-4 p-3 rounded-lg border border-border bg-card",
          "hover:border-primary/30 hover:shadow-sm transition-all",
          onClick && "cursor-pointer",
          className
        )}
      >
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center text-primary">
          <span className="text-xs font-medium">{safeFormat(event.date, "MMM")}</span>
          <span className="text-lg font-bold leading-none">{safeFormat(event.date, "d")}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{event.title}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {safeFormat(event.date, "h:mm a")}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {event.location}
            </span>
          </div>
        </div>
        <StatusBadge status={event.status} />
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <div className={cn(
        "group rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20",
        className
      )}>
        {/* Image Banner Section */}
        <div className="relative h-48 w-full bg-muted/30 overflow-hidden">
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex flex-col items-center opacity-40">
                <span className="text-4xl font-bold tracking-tighter text-primary">{safeFormat(event.date, "d")}</span>
                <span className="text-sm uppercase tracking-widest font-semibold text-primary/70">{safeFormat(event.date, "MMM")}</span>
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

          <div className="absolute top-4 right-4 z-10">
            <StatusBadge status={event.status} className="shadow-sm backdrop-blur-md bg-white/90" />
          </div>

          <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
            <div className="flex items-center gap-2 text-xs font-medium mb-1 opacity-90">
              <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-white border border-white/10 uppercase tracking-wider">
                {event.category}
              </span>
            </div>
            <h3 className="text-xl font-bold leading-tight line-clamp-2 drop-shadow-sm">
              {event.title}
            </h3>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{safeFormat(event.date, "EEE, MMM d • h:mm a")}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Registrations</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">{event.registrations}</span>
                <span className="text-xs text-muted-foreground">/ {event.capacity}</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((event.registrations / event.capacity) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Revenue</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(event.revenue)}</p>
              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onView} className="text-xs font-medium text-primary hover:underline">View</button>
                {onEdit && <button onClick={onEdit} className="text-xs font-medium text-primary hover:underline">Edit</button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-lg border border-border bg-card",
        "hover:border-primary/30 hover:shadow-sm transition-all",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-foreground truncate">{event.title}</h4>
            <StatusBadge status={event.status} size="sm" />
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {safeFormat(event.date, "MMM d, h:mm a")}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {event.location}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium text-foreground">{event.registrations}</span>
                <span className="text-muted-foreground">/{event.capacity}</span>
              </span>
            </div>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm font-medium text-foreground">{formatCurrency(event.revenue)}</span>
          </div>
        </div>
        {actions.length > 0 && (
          <div onClick={(e) => e.stopPropagation()}>
            <ActionMenu items={actions} />
          </div>
        )}
      </div>
    </div>
  );
}
