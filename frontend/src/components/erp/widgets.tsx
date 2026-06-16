import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Filter, Plus, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  up,
  sub,
  icon,
}: {
  label: string;
  value: string;
  delta?: string;
  up?: boolean;
  sub?: string;
  icon: ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-3 p-5 shadow-card transition-shadow hover:shadow-pop">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        <div className="mt-1 flex items-center gap-1.5 text-xs">
          {delta && (
            <span className={cn("inline-flex items-center gap-0.5 font-semibold", up ? "text-success" : "text-destructive")}>
              {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {delta}
            </span>
          )}
          {sub && <span className="text-muted-foreground">{sub}</span>}
        </div>
      </div>
    </Card>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden p-0 shadow-card", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </Card>
  );
}

export function Toolbar({
  placeholder = "Rechercher…",
  addLabel,
  onAdd,
}: {
  placeholder?: string;
  addLabel?: string;
  onAdd?: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={placeholder} className="h-9 pl-9" />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter className="h-4 w-4" /> Filtres
        </Button>
        {addLabel && (
          <Button size="sm" className="gap-1.5" onClick={onAdd}>
            <Plus className="h-4 w-4" /> {addLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export function Pagination({ count = 48 }: { count?: number }) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 pt-4 sm:flex-row">
      <p className="text-xs text-muted-foreground">
        Affichage de <span className="font-medium text-foreground">1–10</span> sur{" "}
        <span className="font-medium text-foreground">{count}</span> résultats
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" disabled>
          Précédent
        </Button>
        {[1, 2, 3].map((p) => (
          <Button key={p} variant={p === 1 ? "default" : "outline"} size="icon" className="h-8 w-8">
            {p}
          </Button>
        ))}
        <Button variant="outline" size="sm">
          Suivant
        </Button>
      </div>
    </div>
  );
}