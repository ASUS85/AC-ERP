import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Plus, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// StatCard
// ─────────────────────────────────────────────────────────────
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
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </p>
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
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
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
