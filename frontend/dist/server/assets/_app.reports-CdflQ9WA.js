import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState } from "react";
import { ChevronDown, Check, ChevronUp, Receipt, ShoppingCart, Warehouse, Banknote, Sparkles, FileBarChart, FileText, Download } from "lucide-react";
import { P as PageHeader } from "./PageHeader-JmieIep0.js";
import { a as SectionCard } from "./widgets-Cox8fFgr.js";
import { c as cn, B as Button } from "./input-DooCX65b.js";
import { L as Label } from "./label-J69NRFJS.js";
import * as SelectPrimitive from "@radix-ui/react-select";
import { toast } from "sonner";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollUpButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollDownButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
  SelectPrimitive.Content,
  {
    ref,
    className: cn(
      "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsx(
        SelectPrimitive.Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsx(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = SelectPrimitive.Content.displayName;
const SelectLabel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Label,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", className),
    ...props
  }
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
    ]
  }
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
const types = [{
  id: "sales",
  label: "Rapport des ventes",
  icon: Receipt,
  desc: "CA, marges et top produits"
}, {
  id: "purchases",
  label: "Rapport des achats",
  icon: ShoppingCart,
  desc: "Commandes et fournisseurs"
}, {
  id: "stock",
  label: "Rapport des stocks",
  icon: Warehouse,
  desc: "Valeur, mouvements et ruptures"
}, {
  id: "finance",
  label: "Rapport financier",
  icon: Banknote,
  desc: "Trésorerie et résultats"
}];
function ReportsPage() {
  const [selected, setSelected] = useState("sales");
  const [generated, setGenerated] = useState(false);
  const active = types.find((t) => t.id === selected);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Génération de rapports", description: "Créez et exportez des rapports automatiques", breadcrumb: ["Intelligence", "Rapports"] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs(SectionCard, { title: "Configuration", description: "Choisissez le type de rapport", children: [
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: types.map((t) => /* @__PURE__ */ jsxs("button", { onClick: () => {
          setSelected(t.id);
          setGenerated(false);
        }, className: cn("flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all", selected === t.id ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/40"), children: [
          /* @__PURE__ */ jsx("span", { className: cn("flex h-9 w-9 items-center justify-center rounded-lg", selected === t.id ? "bg-gradient-primary text-white" : "bg-secondary text-muted-foreground"), children: /* @__PURE__ */ jsx(t.icon, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground", children: t.label }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: t.desc })
          ] })
        ] }, t.id)) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { children: "Période" }),
          /* @__PURE__ */ jsxs(Select, { defaultValue: "month", children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "month", children: "Ce mois-ci" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "quarter", children: "Ce trimestre" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "year", children: "Cette année" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Button, { className: "mt-4 w-full gap-1.5", onClick: () => {
          setGenerated(true);
          toast.success("Rapport généré");
        }, children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
          " Générer le rapport"
        ] })
      ] }),
      /* @__PURE__ */ jsx(SectionCard, { title: "Prévisualisation", description: active.label, className: "lg:col-span-2", action: generated && /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: () => toast.success("PDF exporté"), children: [
        /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
        " Exporter PDF"
      ] }), children: !generated ? /* @__PURE__ */ jsxs("div", { className: "flex h-80 flex-col items-center justify-center gap-3 text-center", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground", children: /* @__PURE__ */ jsx(FileBarChart, { className: "h-7 w-7" }) }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
          "Configurez puis générez un rapport",
          /* @__PURE__ */ jsx("br", {}),
          "pour afficher la prévisualisation."
        ] })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border pb-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-display text-lg font-bold text-foreground", children: active.label }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Période : Juin 2026 · Généré le 10 juin 2026" })
          ] }),
          /* @__PURE__ */ jsx(FileText, { className: "h-8 w-8 text-primary" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 grid grid-cols-3 gap-4", children: [{
          k: "Total",
          v: "284 750 €"
        }, {
          k: "Croissance",
          v: "+12,4 %"
        }, {
          k: "Transactions",
          v: "1 248"
        }].map((s) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-secondary/50 p-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: s.k }),
          /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-foreground", children: s.v })
        ] }, s.k)) }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm leading-relaxed text-muted-foreground", children: "Synthèse automatique : la période analysée affiche une performance solide avec une croissance de 12,4 %. Les indicateurs clés sont en progression, portés par le segment Informatique. Aucun risque financier majeur détecté." })
      ] }) })
    ] })
  ] });
}
export {
  ReportsPage as component
};
