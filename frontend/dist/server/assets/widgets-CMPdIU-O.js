import { jsx, jsxs } from "react/jsx-runtime";
import { ArrowUpRight, ArrowDownRight, Search, Filter, Plus } from "lucide-react";
import * as React from "react";
import { c as cn } from "./router-BPNLrioU.js";
import { I as Input, B as Button } from "./input-Dis5tVWN.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, e as DropdownMenuItem } from "./dropdown-menu-D2wOmaKU.js";
const Card = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    ),
    ...props
  }
));
Card.displayName = "Card";
const CardHeader = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("flex flex-col space-y-1.5 p-6", className),
    ...props
  }
));
CardHeader.displayName = "CardHeader";
const CardTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("font-semibold leading-none tracking-tight", className),
    ...props
  }
));
CardTitle.displayName = "CardTitle";
const CardDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
CardDescription.displayName = "CardDescription";
const CardContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("p-6 pt-0", className), ...props }));
CardContent.displayName = "CardContent";
const CardFooter = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("flex items-center p-6 pt-0", className),
    ...props
  }
));
CardFooter.displayName = "CardFooter";
function StatCard({
  label,
  value,
  delta,
  up,
  sub,
  icon
}) {
  return /* @__PURE__ */ jsxs(Card, { className: "flex flex-col gap-3 p-5 shadow-card transition-shadow hover:shadow-pop", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-muted-foreground", children: label }),
      /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary", children: icon })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold tracking-tight text-foreground", children: value }),
      /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center gap-1.5 text-xs", children: [
        delta && /* @__PURE__ */ jsxs(
          "span",
          {
            className: cn(
              "inline-flex items-center gap-0.5 font-semibold",
              up ? "text-success" : "text-destructive"
            ),
            children: [
              up ? /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(ArrowDownRight, { className: "h-3.5 w-3.5" }),
              delta
            ]
          }
        ),
        sub && /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: sub })
      ] })
    ] })
  ] });
}
function SectionCard({
  title,
  description,
  action,
  children,
  className
}) {
  return /* @__PURE__ */ jsxs(Card, { className: cn("overflow-hidden p-0 shadow-card", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 border-b border-border px-5 py-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold text-foreground", children: title }),
        description && /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-muted-foreground", children: description })
      ] }),
      action
    ] }),
    /* @__PURE__ */ jsx("div", { className: "p-5", children })
  ] });
}
function Toolbar({
  placeholder = "Rechercher…",
  addLabel,
  onAdd,
  searchValue,
  onSearchChange,
  filterOptions,
  selectedFilter,
  onFilterChange
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative w-full sm:max-w-xs", children: [
      /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          placeholder,
          className: "h-9 pl-9",
          value: searchValue ?? "",
          onChange: (event) => onSearchChange?.(event.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      filterOptions && onFilterChange ? /* @__PURE__ */ jsxs(DropdownMenu, { children: [
        /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", children: [
          /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4" }),
          " ",
          filterOptions.find((option) => option.value === selectedFilter)?.label || "Filtre"
        ] }) }),
        /* @__PURE__ */ jsx(DropdownMenuContent, { align: "end", className: "min-w-[180px]", children: filterOptions.map((option) => /* @__PURE__ */ jsx(
          DropdownMenuItem,
          {
            onClick: () => onFilterChange(option.value),
            children: option.label
          },
          option.value
        )) })
      ] }) : /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", children: [
        /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4" }),
        " Filtres"
      ] }),
      addLabel && /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5", onClick: onAdd, children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        " ",
        addLabel
      ] })
    ] })
  ] });
}
function Pagination({
  count = 48,
  currentPage = 1,
  totalPages,
  onPageChange,
  pageSize = 10
}) {
  const total = totalPages ?? Math.max(1, Math.ceil(count / pageSize));
  const pages = Array.from(
    new Set(
      [
        1,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        total
      ].filter((page) => page >= 1 && page <= total)
    )
  );
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-between gap-3 pt-4 sm:flex-row", children: [
    /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "Page ",
      /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: currentPage }),
      " ",
      "sur ",
      /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: total }),
      /* @__PURE__ */ jsxs("span", { className: "ml-2", children: [
        "(",
        count,
        " éléments)"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex max-w-full items-center gap-1 overflow-x-auto", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "outline",
          size: "sm",
          disabled: currentPage <= 1,
          onClick: () => onPageChange?.(currentPage - 1),
          children: "Précédent"
        }
      ),
      pages.map((page, index) => /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
        index > 0 && page - pages[index - 1] > 1 ? /* @__PURE__ */ jsx("span", { className: "px-1 text-xs text-muted-foreground", children: "…" }) : null,
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: page === currentPage ? "default" : "outline",
            size: "icon",
            className: "h-8 w-8 shrink-0",
            onClick: () => onPageChange?.(page),
            children: page
          }
        )
      ] }, page)),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "outline",
          size: "sm",
          disabled: currentPage >= total,
          onClick: () => onPageChange?.(currentPage + 1),
          children: "Suivant"
        }
      )
    ] })
  ] });
}
export {
  Pagination as P,
  StatCard as S,
  Toolbar as T,
  SectionCard as a
};
