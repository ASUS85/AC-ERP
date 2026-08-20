import { jsx, jsxs } from "react/jsx-runtime";
import { Loader2, MoreHorizontal } from "lucide-react";
import { c as cn } from "./router-DPN3mKuc.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, e as DropdownMenuItem } from "./dropdown-menu-DS6F64SI.js";
function isEditDeletePair(actions) {
  if (actions.length !== 2) return false;
  const labels = actions.map((a) => a.label.toLowerCase());
  const hasEdit = labels.some(
    (l) => ["modifier", "éditer", "editer", "edit", "update"].includes(l)
  );
  const hasDelete = labels.some(
    (l) => ["supprimer", "archiver", "delete", "remove", "effacer"].includes(l)
  );
  return hasEdit && hasDelete;
}
function DataTable({
  columns,
  rows,
  rowKey,
  withActions = true,
  rowActions,
  isRowActionLoading,
  onRowClick
}) {
  const align = (a) => a === "right" ? "text-right" : a === "left" ? "text-left" : "text-center";
  const totalCols = columns.length + (withActions ? 1 : 0);
  const colWidth = `${100 / totalCols}%`;
  return /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full table-fixed text-sm", children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border bg-primary/6 text-xs uppercase tracking-wide text-muted-foreground", children: [
      columns.map((c, index) => /* @__PURE__ */ jsx(
        "th",
        {
          style: { width: colWidth },
          className: cn("px-3 py-2.5 font-medium", align(c.align)),
          children: c.header
        },
        `${c.key}-${index}`
      )),
      withActions && /* @__PURE__ */ jsx(
        "th",
        {
          style: { width: colWidth },
          className: "px-3 py-2.5 text-end font-medium mx-3",
          children: "Action"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs("tbody", { children: [
      rows.map((row, rowIndex) => /* @__PURE__ */ jsxs(
        "tr",
        {
          className: cn(
            "border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/70",
            rowIndex % 2 === 1 ? "bg-secondary/40" : "bg-transparent",
            onRowClick ? "cursor-pointer" : ""
          ),
          onClick: () => onRowClick?.(row),
          children: [
            columns.map((c, index) => /* @__PURE__ */ jsx(
              "td",
              {
                className: cn(
                  "truncate px-3 py-2",
                  align(c.align),
                  c.className
                ),
                children: c.render ? c.render(row) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: row[c.key] })
              },
              `${c.key}-${index}`
            )),
            withActions && /* @__PURE__ */ jsx("td", { className: "px-3 py-1.5 text-end", children: rowActions ? (() => {
              const actions = rowActions(row);
              const isBusy = isRowActionLoading?.(row) ?? false;
              if (actions.length < 2 || actions.length === 2 && isEditDeletePair(actions)) {
                return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-end gap-1.5", children: actions.map((action) => /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    disabled: isBusy,
                    className: cn(
                      "inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium shadow-sm transition-colors hover:bg-secondary disabled:opacity-60",
                      action.destructive ? "text-destructive hover:bg-destructive/10" : "text-muted-foreground hover:text-foreground"
                    ),
                    onClick: (e) => {
                      e.stopPropagation();
                      action.onClick();
                    },
                    children: isBusy ? /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : action.icon
                  },
                  action.label
                )) });
              }
              return /* @__PURE__ */ jsxs(DropdownMenu, { children: [
                /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    disabled: isBusy,
                    className: "rounded-md p-2 text-muted-foreground bg-secondary/50 hover:bg-primary/10 hover:text-foreground",
                    "aria-label": isBusy ? "Action en cours" : "Actions",
                    onClick: (e) => e.stopPropagation(),
                    children: isBusy ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4" })
                  }
                ) }),
                /* @__PURE__ */ jsx(DropdownMenuContent, { align: "end", className: "min-w-40", children: actions.map((action) => /* @__PURE__ */ jsxs(
                  DropdownMenuItem,
                  {
                    disabled: isBusy,
                    className: cn(
                      action.destructive && "text-destructive focus:text-destructive"
                    ),
                    onClick: (e) => {
                      e.stopPropagation();
                      action.onClick();
                    },
                    children: [
                      action.icon,
                      action.label
                    ]
                  },
                  action.label
                )) })
              ] });
            })() : /* @__PURE__ */ jsx(
              "button",
              {
                className: "rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground",
                "aria-label": "Actions",
                children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4" })
              }
            ) })
          ]
        },
        rowKey(row)
      )),
      rows.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: columns.length + (rowActions ? 1 : 0), children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-6 text-center", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: "/src/assets/sorry.svg",
            alt: "Aucun élément",
            className: "mb-3 w-28 opacity-90"
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Aucun élément à afficher" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground/70", children: "Les données apparaîtront ici une fois ajoutées." })
      ] }) }) })
    ] })
  ] }) });
}
export {
  DataTable as D
};
