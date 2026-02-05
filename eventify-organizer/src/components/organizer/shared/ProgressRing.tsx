import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number;
  max: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
  strokeColor?: string;
}

export function ProgressRing({ 
  value, 
  max, 
  size = "md", 
  showLabel = true,
  className,
  strokeColor = "stroke-primary"
}: ProgressRingProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const dimensions = {
    sm: { size: 40, strokeWidth: 4, fontSize: "text-xs" },
    md: { size: 56, strokeWidth: 5, fontSize: "text-sm" },
    lg: { size: 80, strokeWidth: 6, fontSize: "text-base" },
  };
  
  const { size: svgSize, strokeWidth, fontSize } = dimensions[size];
  const radius = (svgSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={svgSize} height={svgSize} className="-rotate-90">
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-500 ease-out", strokeColor)}
        />
      </svg>
      {showLabel && (
        <div className={cn("absolute inset-0 flex items-center justify-center", fontSize)}>
          <span className="font-semibold text-foreground">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}
