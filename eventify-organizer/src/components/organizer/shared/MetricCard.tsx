import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  chart?: ReactNode;
  className?: string;
  iconClassName?: string;
  variant?: "default" | "compact" | "featured";
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  chart,
  className,
  iconClassName,
  variant = "default",
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="w-3.5 h-3.5" />;
    if (trend.value < 0) return <TrendingDown className="w-3.5 h-3.5" />;
    return <Minus className="w-3.5 h-3.5" />;
  };

  const getTrendColor = () => {
    if (!trend) return "";
    if (trend.isPositive !== undefined) {
      return trend.isPositive ? "text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md" : "text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md";
    }
    return trend.value > 0 ? "text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md" : trend.value < 0 ? "text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md" : "text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-md";
  };

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm", className)}>
        {icon && (
          <div className={cn(
            "w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-900 flex-shrink-0",
            iconClassName
          )}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </div>
    );
  }

  if (variant === "featured") {
    return (
      <div className={cn(
        "relative overflow-hidden rounded-2xl p-6",
        "bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
        "hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300",
        className
      )}>
        {/* Decorative background gradient - Replaced with Gray/Pink subtle */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-500/5 to-[#E85A6B]/5 rounded-bl-full -mr-8 -mt-8 blur-2xl" />

        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className={cn("p-2.5 bg-gray-50 rounded-xl text-black", iconClassName)}>
              {icon}
            </div>
            {trend && (
              <div className={cn("flex items-center gap-1.5 text-xs font-bold", getTrendColor())}>
                {getTrendIcon()}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
          </div>

          {subtitle && (
            <p className="mt-2 text-sm text-gray-400 font-medium">{subtitle}</p>
          )}
        </div>

        {chart && <div className="mt-6 pt-4 border-t border-gray-50">{chart}</div>}
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-2xl bg-white p-6 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]",
      "hover:border-[#E85A6B]/20 hover:shadow-md transition-all duration-300",
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className={cn(
            "w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 transition-colors group-hover:bg-[#E85A6B]/10 group-hover:text-[#E85A6B]",
            iconClassName
          )}>
            {icon}
          </div>
        )}
        {trend && (
          <div className={cn("flex items-center gap-1 text-xs font-bold", getTrendColor())}>
            {getTrendIcon()}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-gray-400">{subtitle}</p>
      )}

      {chart && <div className="mt-4">{chart}</div>}
    </div>
  );
}
