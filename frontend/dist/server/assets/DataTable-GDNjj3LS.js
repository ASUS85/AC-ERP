import { jsx, jsxs } from "react/jsx-runtime";
import { MoreHorizontal } from "lucide-react";
import { c as cn } from "./router-DKXtA4iJ.js";
function DataTable({
  columns,
  rows,
  rowKey,
  withActions = true
}) {
  const align = (a) => a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";
  return /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground", children: [
      columns.map((c) => /* @__PURE__ */ jsx(
        "th",
        {
          className: cn(
            "px-3 py-2.5 font-medium first:pl-1",
            align(c.align)
          ),
          children: c.header
        },
        c.key
      )),
      withActions && /* @__PURE__ */ jsx("th", { className: "w-10 px-3 py-2.5" })
    ] }) }),
    /* @__PURE__ */ jsx("tbody", { children: rows.map((row) => /* @__PURE__ */ jsxs(
      "tr",
      {
        className: "border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40",
        children: [
          columns.map((c) => /* @__PURE__ */ jsx(
            "td",
            {
              className: cn(
                "px-3 py-3.5 first:pl-1",
                align(c.align),
                c.className
              ),
              children: c.render ? c.render(row) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: row[c.key] })
            },
            c.key
          )),
          withActions && /* @__PURE__ */ jsx("td", { className: "px-3 py-3.5", children: /* @__PURE__ */ jsx(
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
    )) })
  ] }) });
}
export {
  DataTable as D
};
