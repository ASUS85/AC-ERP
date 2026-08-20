import type { CSSProperties, ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Plus, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// StatCard
// ─────────────────────────────────────────────────────────────
const statCardTones = [
  {
    gradient: "from-sky-100/80 via-sky-50/40 to-transparent",
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-600",
  },
  {
    gradient: "from-emerald-100/80 via-emerald-50/40 to-transparent",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
  },
  {
    gradient: "from-violet-100/80 via-violet-50/40 to-transparent",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-600",
  },
  {
    gradient: "from-amber-100/80 via-amber-50/40 to-transparent",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
  },
];

function toneForLabel(label: string) {
  const sum = Array.from(label).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return statCardTones[sum % statCardTones.length];
}

export function StatCard({
  label,
  value,
  delta,
  up,
  sub,
  icon,
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  up?: boolean;
  sub?: string;
  icon: ReactNode;
}) {
  const tone = toneForLabel(label);
  return (
    <Card
      className={cn(
        "relative flex flex-col gap-3 overflow-hidden bg-gradient-to-br p-5 shadow-card transition-shadow hover:shadow-pop",
        tone.gradient,
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-current opacity-[0.06]" />
      <div className="relative flex items-start justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            tone.iconBg,
            tone.iconColor,
          )}
        >
          {icon}
        </span>
      </div>
      <div className="relative">
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs">
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold",
                up ? "text-success" : "text-destructive",
              )}
            >
              {up ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {delta}
            </span>
          )}
          {sub && <span className="text-muted-foreground">{sub}</span>}
        </div>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// SectionCard
// ─────────────────────────────────────────────────────────────
export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  style,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  style?: CSSProperties;
}) {
  return (
    <Card
      className={cn("flex flex-col overflow-hidden p-0 shadow-card", className)}
      style={style}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      <div className={cn("p-3", contentClassName)}>{children}</div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// Toolbar
// ─────────────────────────────────────────────────────────────
export function Toolbar({
  placeholder = "Rechercher…",
  addLabel,
  onAdd,
  searchValue,
  onSearchChange,
  filterOptions,
  selectedFilter,
  onFilterChange,
  filterPlaceholder = "Filtrer…",
  filterSearchPlaceholder = "Rechercher…",
}: {
  placeholder?: string;
  addLabel?: string;
  onAdd?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filterOptions?: Array<{ label: string; value: string }>;
  selectedFilter?: string;
  onFilterChange?: (value: string) => void;
  /** Texte affiché dans le select quand rien n'est sélectionné */
  filterPlaceholder?: string;
  /** Placeholder de l'input de recherche à l'intérieur du select */
  filterSearchPlaceholder?: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Barre de recherche */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="h-9 pl-9"
          value={searchValue ?? ""}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>

      {/* Actions droite */}
      <div className="flex items-center gap-2">
        {/* Filtre avec recherche intégrée */}
        {filterOptions && onFilterChange && (
          <SearchableSelect
            value={selectedFilter}
            onValueChange={onFilterChange}
            options={filterOptions}
            placeholder={filterPlaceholder}
            searchPlaceholder={filterSearchPlaceholder}
            emptyMessage="Aucun filtre trouvé"
            className="w-[200px]"
          />
        )}

        {/* Bouton d'ajout */}
        {addLabel && (
          <Button
            size="sm"
            className="gap-1.5 whitespace-nowrap"
            onClick={onAdd}
          >
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────
export function Pagination({
  count = 0,
  currentPage = 1,
  totalPages,
  onPageChange,
  pageSize = 10,
}: {
  count?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
}) {
  const total = totalPages ?? Math.max(1, Math.ceil(count / pageSize));

  // Pages visibles : 1, currentPage-1, currentPage, currentPage+1, total
  const pages = Array.from(
    new Set(
      [1, currentPage - 1, currentPage, currentPage + 1, total].filter(
        (p) => p >= 1 && p <= total,
      ),
    ),
  );

  return (
    <div className="flex flex-col items-center justify-between gap-3 pt-4 sm:flex-row">
      <p className="text-xs text-muted-foreground">
        Page <span className="font-medium text-foreground">{currentPage}</span>{" "}
        sur <span className="font-medium text-foreground">{total}</span>
        <span className="ml-2">
          ({count} élément{count > 1 ? "s" : ""})
        </span>
      </p>

      <div className="flex max-w-full items-center gap-1 overflow-x-auto">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange?.(currentPage - 1)}
        >
          Précédent
        </Button>

        {pages.map((page, index) => (
          <span key={page} className="flex items-center gap-1">
            {/* Ellipsis si saut de pages */}
            {index > 0 && page - pages[index - 1] > 1 && (
              <span className="px-1 text-xs text-muted-foreground">…</span>
            )}
            <Button
              variant={page === currentPage ? "default" : "outline"}
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onPageChange?.(page)}
            >
              {page}
            </Button>
          </span>
        ))}

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= total}
          onClick={() => onPageChange?.(currentPage + 1)}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
