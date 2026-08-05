import { jsx, jsxs } from "react/jsx-runtime";
import { ChevronDown, Search, Check, ArrowUpRight, ArrowDownRight, Plus } from "lucide-react";
import * as React from "react";
import { c as cn } from "./router-soiu03Zn.js";
import { I as Input, B as Button } from "./input-DgNX5wjv.js";
import { createPortal } from "react-dom";
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
function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Sélectionner...",
  searchPlaceholder = "Rechercher...",
  emptyMessage = "Aucun résultat",
  disabled,
  className,
  portalMode = "nearest"
}) {
  const dropdownMaxHeight = 240;
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef(null);
  const dropdownRef = React.useRef(null);
  const viewportRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const getPortalContainer = React.useCallback(() => {
    if (typeof document === "undefined") return null;
    const nearestPortalRoot = containerRef.current?.closest(
      '[data-searchable-portal-root="true"]'
    );
    if (portalMode === "body") {
      const bodyPointerEvents = window.getComputedStyle(
        document.body
      ).pointerEvents;
      if (bodyPointerEvents === "none" && nearestPortalRoot) {
        return nearestPortalRoot;
      }
      return document.body;
    }
    return nearestPortalRoot ?? document.body;
  }, [portalMode]);
  const [pos, setPos] = React.useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: dropdownMaxHeight,
    strategy: "fixed"
  });
  const updatePosition = React.useCallback(() => {
    const trigger = containerRef.current;
    if (!trigger) return;
    const portalContainer2 = getPortalContainer();
    if (!portalContainer2) return;
    const rect = trigger.getBoundingClientRect();
    const vh = window.innerHeight;
    const below = vh - rect.bottom;
    const above = rect.top;
    const up = below < dropdownMaxHeight && above > below;
    const maxH = Math.max(
      120,
      Math.min(dropdownMaxHeight, up ? above - 12 : below - 12)
    );
    const inCustomContainer = portalContainer2 !== document.body;
    const portalRect = inCustomContainer ? portalContainer2.getBoundingClientRect() : null;
    const next = {
      left: inCustomContainer && portalRect ? rect.left - portalRect.left : rect.left,
      top: inCustomContainer && portalRect ? up ? rect.top - portalRect.top - 4 - maxH : rect.bottom - portalRect.top + 4 : up ? Math.max(8, rect.top - 4 - maxH) : rect.bottom + 4,
      width: rect.width,
      maxHeight: maxH,
      strategy: inCustomContainer ? "absolute" : "fixed"
    };
    setPos((prev) => {
      if (prev.left === next.left && prev.top === next.top && prev.width === next.width && prev.maxHeight === next.maxHeight && prev.strategy === next.strategy) {
        return prev;
      }
      return next;
    });
  }, [getPortalContainer]);
  const portalContainer = getPortalContainer();
  const handleDropdownWheelCapture = React.useCallback(
    (e) => {
      if (portalMode !== "body") return;
      const viewport = viewportRef.current;
      if (!viewport) return;
      const canScroll = viewport.scrollHeight > viewport.clientHeight;
      if (!canScroll) return;
      viewport.scrollTop += e.deltaY;
      e.preventDefault();
      e.stopPropagation();
    },
    [portalMode]
  );
  React.useEffect(() => {
    function handleClickOutside(e) {
      const target = e.target;
      const insideTrigger = containerRef.current?.contains(target);
      const insideDropdown = dropdownRef.current?.contains(target);
      if (!insideTrigger && !insideDropdown) {
        setOpen(false);
        setSearch("");
      }
    }
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);
  React.useEffect(() => {
    if (open) {
      updatePosition();
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open, updatePosition]);
  React.useEffect(() => {
    if (!open) return;
    const handleResize = () => updatePosition();
    const handleScroll = (e) => {
      if (dropdownRef.current?.contains(e.target)) {
        return;
      }
      updatePosition();
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, updatePosition]);
  const filtered = React.useMemo(
    () => options.filter(
      (option) => option.label.toLowerCase().includes(search.toLowerCase())
    ),
    [options, search]
  );
  const selected = options.find((o) => o.value === value);
  return /* @__PURE__ */ jsxs("div", { ref: containerRef, className: cn("relative w-full", className), children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        disabled,
        onClick: () => {
          if (disabled) return;
          setOpen((prev) => {
            if (prev) setSearch("");
            return !prev;
          });
        },
        className: cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors",
          "hover:border-primary",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
          disabled && "cursor-not-allowed opacity-50"
        ),
        children: [
          /* @__PURE__ */ jsx("span", { className: cn("truncate", !selected && "text-muted-foreground"), children: selected?.label ?? placeholder }),
          /* @__PURE__ */ jsx(
            ChevronDown,
            {
              className: cn(
                "ml-2 h-4 w-4 shrink-0 opacity-60 transition-transform",
                open && "rotate-180"
              )
            }
          )
        ]
      }
    ),
    open && portalContainer && createPortal(
      /* @__PURE__ */ jsxs(
        "div",
        {
          ref: dropdownRef,
          className: "flex flex-col rounded-md border bg-popover text-popover-foreground shadow-md overflow-hidden",
          style: {
            position: pos.strategy,
            left: pos.left,
            top: pos.top,
            width: pos.width,
            maxHeight: pos.maxHeight,
            zIndex: 99999
          },
          "data-searchable-dropdown": "true",
          "data-radix-scroll-lock-scrollable": "",
          onWheelCapture: handleDropdownWheelCapture,
          role: "listbox",
          children: [
            /* @__PURE__ */ jsx("div", { className: "shrink-0 p-2", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  ref: inputRef,
                  value: search,
                  onChange: (e) => setSearch(e.target.value),
                  placeholder: searchPlaceholder,
                  className: cn(
                    "h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm",
                    "outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                    "placeholder:text-muted-foreground"
                  ),
                  onKeyDown: (e) => {
                    if (e.key === "Escape") {
                      setOpen(false);
                      setSearch("");
                      e.stopPropagation();
                    }
                  }
                }
              )
            ] }) }),
            /* @__PURE__ */ jsx(
              "div",
              {
                ref: viewportRef,
                className: "flex-1 overflow-y-auto overscroll-contain py-1",
                style: { maxHeight: pos.maxHeight - 55 },
                "data-radix-scroll-lock-scrollable": "",
                children: filtered.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-3 py-6 text-center text-sm text-muted-foreground", children: emptyMessage }) : filtered.map((option) => {
                  const isActive = option.value === value;
                  return /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        onValueChange(option.value);
                        setOpen(false);
                        setSearch("");
                      },
                      className: cn(
                        "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        isActive && "bg-accent text-accent-foreground font-medium"
                      ),
                      children: [
                        /* @__PURE__ */ jsx("span", { className: "truncate", children: option.label }),
                        isActive && /* @__PURE__ */ jsx(Check, { className: "ml-2 h-4 w-4 shrink-0" })
                      ]
                    },
                    option.value
                  );
                })
              }
            )
          ]
        }
      ),
      portalContainer
    )
  ] });
}
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
  onFilterChange,
  filterPlaceholder = "Filtrer…",
  filterSearchPlaceholder = "Rechercher…"
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
          onChange: (e) => onSearchChange?.(e.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      filterOptions && onFilterChange && /* @__PURE__ */ jsx(
        SearchableSelect,
        {
          value: selectedFilter,
          onValueChange: onFilterChange,
          options: filterOptions,
          placeholder: filterPlaceholder,
          searchPlaceholder: filterSearchPlaceholder,
          emptyMessage: "Aucun filtre trouvé",
          className: "w-[200px]"
        }
      ),
      addLabel && /* @__PURE__ */ jsxs(
        Button,
        {
          size: "sm",
          className: "gap-1.5 whitespace-nowrap",
          onClick: onAdd,
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            addLabel
          ]
        }
      )
    ] })
  ] });
}
function Pagination({
  count = 0,
  currentPage = 1,
  totalPages,
  onPageChange,
  pageSize = 10
}) {
  const total = totalPages ?? Math.max(1, Math.ceil(count / pageSize));
  const pages = Array.from(
    new Set(
      [1, currentPage - 1, currentPage, currentPage + 1, total].filter(
        (p) => p >= 1 && p <= total
      )
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
        " élément",
        count > 1 ? "s" : "",
        ")"
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
        index > 0 && page - pages[index - 1] > 1 && /* @__PURE__ */ jsx("span", { className: "px-1 text-xs text-muted-foreground", children: "…" }),
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
  SectionCard as a,
  SearchableSelect as b
};
