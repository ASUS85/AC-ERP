import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Plus, ShieldCheck, Check, X } from "lucide-react";
import { P as PageHeader } from "./PageHeader-JmieIep0.js";
import { a as SectionCard } from "./widgets-Cox8fFgr.js";
import { B as Button } from "./input-DooCX65b.js";
import { e as roles, g as permModules, h as permMatrix } from "./erp-data-CMZQ6Smj.js";
import "@tanstack/react-router";
import "react";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
function RolesPage() {
  const roleNames = Object.keys(permMatrix);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Rôles & permissions", description: "Contrôle d'accès par module", breadcrumb: ["Administration", "Rôles"], actions: /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5", children: [
      /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
      " Nouveau rôle"
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5", children: roles.map((r) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-4 shadow-card", children: [
      /* @__PURE__ */ jsx("span", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 font-semibold text-foreground", children: r.nom }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: r.desc }),
      /* @__PURE__ */ jsxs("p", { className: "mt-3 text-xs font-medium text-primary", children: [
        r.users,
        " utilisateur(s)"
      ] })
    ] }, r.nom)) }),
    /* @__PURE__ */ jsx(SectionCard, { title: "Matrice rôles / permissions", description: "Permissions accordées par module", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground", children: [
        /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5 font-medium", children: "Module" }),
        roleNames.map((r) => /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5 text-center font-medium", children: r }, r))
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: permModules.map((m) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/60 last:border-0 hover:bg-secondary/40", children: [
        /* @__PURE__ */ jsx("td", { className: "px-3 py-3 font-medium text-foreground", children: m }),
        roleNames.map((r) => /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-center", children: permMatrix[r][m] ? /* @__PURE__ */ jsx("span", { className: "inline-flex h-6 w-6 items-center justify-center rounded-full bg-success/12 text-success", children: /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }) }) : /* @__PURE__ */ jsx("span", { className: "inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground", children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }) }) }, r))
      ] }, m)) })
    ] }) }) })
  ] });
}
export {
  RolesPage as component
};
