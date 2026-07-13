import type { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
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

export function DataTable<T extends Record<string, any>>({
  columns,
  rows,
  rowKey,
  withActions = true,
  rowActions,
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
}) {
  const align = (a?: string) =>
    a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";

  const totalCols = columns.length + (withActions ? 1 : 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  "px-3 py-2.5 font-medium first:pl-1",
                  align(c.align),
                )}
              >
                {c.header}
              </th>
            ))}
            {withActions && <th className="w-10 px-3 py-2.5" />}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40"
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "px-3 py-3.5 first:pl-1",
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
                <td className="px-3 py-3.5 text-right">
                  {rowActions ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                          aria-label="Actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-40">
                        {rowActions(row).map((action) => (
                          <DropdownMenuItem
                            key={action.label}
                            className={cn(
                              action.destructive &&
                                "text-destructive focus:text-destructive",
                            )}
                            onClick={action.onClick}
                          >
                            {action.icon}
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
