import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { Home, ChevronRight } from "lucide-react";
function PageHeader({
  title,
  description,
  breadcrumb = [],
  actions
}) {
  return /* @__PURE__ */ jsxs("div", { className: "relative mb-2 overflow-hidden", children: [
    /* @__PURE__ */ jsxs("nav", { className: "relative z-10 mb-3 flex items-center gap-1.5 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/",
          className: "flex items-center gap-1 transition-colors hover:text-foreground",
          children: [
            /* @__PURE__ */ jsx(Home, { className: "h-3.5 w-3.5" }),
            "Accueil"
          ]
        }
      ),
      breadcrumb.map((b) => /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx(ChevronRight, { className: "h-3.5 w-3.5" }),
        /* @__PURE__ */ jsx("span", { className: "text-foreground/80", children: b })
      ] }, b))
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsx("div", { className: "min-w-0", children: /* @__PURE__ */ jsx("h1", { className: "truncate text-2xl font-bold text-foreground", children: title }) }),
      actions && /* @__PURE__ */ jsx("div", { className: "flex shrink-0 flex-wrap items-center gap-2", children: actions })
    ] })
  ] });
}
export {
  PageHeader as P
};
