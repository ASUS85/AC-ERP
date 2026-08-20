import type { ReactNode } from "react";
import { Loader2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import erpLogo from "@/assets/erp-logo.png";

export type Column<T> = {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  render?: (row: T) => ReactNode;
  className?: string;
};

function isEditDeletePair(
  actions: Array<{ label: string; destructive?: boolean }>,
): boolean {
  if (actions.length !== 2) return false;
  const labels = actions.map((a) => a.label.toLowerCase());
  const hasEdit = labels.some((l) =>
    ["modifier", "éditer", "editer", "edit", "update"].includes(l),
  );
  const hasDelete = labels.some((l) =>
    ["supprimer", "archiver", "delete", "remove", "effacer"].includes(l),
  );
  return hasEdit && hasDelete;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  rows,
  rowKey,
  withActions = true,
  rowActions,
  isRowActionLoading,
  onRowClick,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  withActions?: boolean;
  rowActions?: (row: T) => Array<{
    label: string;
    icon?: ReactNode;
    destructive?: boolean;
    onClick: () => void;
  }>;
  isRowActionLoading?: (row: T) => boolean;
  onRowClick?: (row: T) => void;
}) {
  const align = (a?: string) =>
    a === "right" ? "text-right" : a === "left" ? "text-left" : "text-center";

  const totalCols = columns.length + (withActions ? 1 : 0);
  const colWidth = `${100 / totalCols}%`;

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed text-sm">
        <thead>
          <tr className="border-b border-border bg-primary/6 text-xs uppercase tracking-wide text-muted-foreground">
            {columns.map((c, index) => (
              <th
                key={`${c.key}-${index}`}
                style={{ width: colWidth }}
                className={cn("px-3 py-2.5 font-medium", align(c.align))}
              >
                {c.header}
              </th>
            ))}
            {withActions && (
              <th
                style={{ width: colWidth }}
                className="px-3 py-2.5 text-end font-medium mx-3"
              >
                Action
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowKey(row)}
              className={cn(
                "border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/70",
                rowIndex % 2 === 1 ? "bg-secondary/40" : "bg-transparent",
                onRowClick ? "cursor-pointer" : "",
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((c, index) => (
                <td
                  key={`${c.key}-${index}`}
                  className={cn(
                    "truncate px-3 py-2",
                    align(c.align),
                    c.className,
                  )}
                >
                  {c.render ? (
                    c.render(row)
                  ) : (
                    <span className="text-muted-foreground">{row[c.key]}</span>
                  )}
                </td>
              ))}

              {withActions && (
                <td className="px-3 py-1.5 text-end">
                  {rowActions ? (
                    (() => {
                      const actions = rowActions(row);
                      const isBusy = isRowActionLoading?.(row) ?? false;
                      // Actions en clair (icône + libellé) si <= 2 actions, sinon menu déroulant
                      if (
                        actions.length < 2 ||
                        (actions.length === 2 && isEditDeletePair(actions))
                      ) {
                        return (
                          <div className="flex items-center justify-end gap-1.5">
                            {actions.map((action) => (
                              <button
                                key={action.label}
                                type="button"
                                disabled={isBusy}
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium shadow-sm transition-colors hover:bg-secondary disabled:opacity-60",
                                  action.destructive
                                    ? "text-destructive hover:bg-destructive/10"
                                    : "text-muted-foreground hover:text-foreground",
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick();
                                }}
                              >
                                {isBusy ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  action.icon
                                )}
                              </button>
                            ))}
                          </div>
                        );
                      }
                      return (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              disabled={isBusy}
                              className="rounded-md p-2 text-muted-foreground bg-secondary/50 hover:bg-primary/10 hover:text-foreground"
                              aria-label={
                                isBusy ? "Action en cours" : "Actions"
                              }
                              onClick={(e) => e.stopPropagation()}
                            >
                              {isBusy ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-40">
                            {actions.map((action) => (
                              <DropdownMenuItem
                                key={action.label}
                                disabled={isBusy}
                                className={cn(
                                  action.destructive &&
                                    "text-destructive focus:text-destructive",
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick();
                                }}
                              >
                                {action.icon}
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      );
                    })()
                  ) : (
                    <button
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      aria-label="Actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}

          {/* ── État vide ── */}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + (rowActions ? 1 : 0)}>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <img
                    src="/src/assets/sorry.svg"
                    alt="Aucun élément"
                    className="mb-3 w-28 opacity-90"
                  />
                  <p className="text-sm font-medium text-muted-foreground">
                    Aucun élément à afficher
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    Les données apparaîtront ici une fois ajoutées.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
