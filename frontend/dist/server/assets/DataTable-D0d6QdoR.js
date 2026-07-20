import { jsx, jsxs } from "react/jsx-runtime";
import { MoreHorizontal } from "lucide-react";
import { c as cn } from "./router-htMRrCu_.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, e as DropdownMenuItem } from "./dropdown-menu-CdWXpfh2.js";
function DataTable({
  columns,
  rows,
  rowKey,
  withActions = true,
  rowActions
}) {
  const align = (a) => a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";
  columns.length + (withActions ? 1 : 0);
  return /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground", children: [
      columns.map((c, index) => /* @__PURE__ */ jsx(
        "th",
        {
          className: cn(
            "px-3 py-2.5 font-medium first:pl-1",
            align(c.align)
          ),
          children: c.header
        },
        `${c.key}-${index}`
      )),
      withActions && /* @__PURE__ */ jsx("th", { className: "w-10 px-3 py-2.5" })
    ] }) }),
    /* @__PURE__ */ jsxs("tbody", { children: [
      rows.map((row) => /* @__PURE__ */ jsxs(
        "tr",
        {
          className: "border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40",
          children: [
            columns.map((c, index) => /* @__PURE__ */ jsx(
              "td",
              {
                className: cn(
                  "px-3 py-3.5 first:pl-1",
                  align(c.align),
                  c.className
                ),
                children: c.render ? c.render(row) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: row[c.key] })
              },
              `${c.key}-${index}`
            )),
            withActions && /* @__PURE__ */ jsx("td", { className: "px-3 py-3.5 text-right", children: rowActions ? /* @__PURE__ */ jsxs(DropdownMenu, { children: [
              /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                "button",
                {
                  className: "rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground",
                  "aria-label": "Actions",
                  children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4" })
                }
              ) }),
              /* @__PURE__ */ jsx(DropdownMenuContent, { align: "end", className: "min-w-40", children: rowActions(row).map((action) => /* @__PURE__ */ jsxs(
                DropdownMenuItem,
                {
                  className: cn(
                    action.destructive && "text-destructive focus:text-destructive"
                  ),
                  onClick: action.onClick,
                  children: [
                    action.icon,
                    action.label
                  ]
                },
                action.label
              )) })
            ] }) : /* @__PURE__ */ jsx(
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
