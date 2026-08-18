import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ChartFrame({
  loading,
  className,
  children,
}: {
  loading: boolean;
  className?: string;
  children: ReactNode;
}) {
  if (loading) {
    return <Skeleton className={cn("h-full w-full", className)} />;
  }

  return (
    <div
      className={cn(
        "h-full animate-in fade-in-0 zoom-in-95 duration-500",
        className,
      )}
    >
      {children}
    </div>
  );
}
