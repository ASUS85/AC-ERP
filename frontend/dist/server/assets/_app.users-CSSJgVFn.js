import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { UserPlus, Users, Pencil, Trash2 } from "lucide-react";
import { P as PageHeader } from "./PageHeader-JmieIep0.js";
import { S as StatCard, a as SectionCard, T as Toolbar, P as Pagination } from "./widgets-Cox8fFgr.js";
import { D as DataTable } from "./DataTable-DyNXzAjJ.js";
import { S as StatusBadge } from "./StatusBadge-DlT8mfWJ.js";
import { B as Button } from "./input-DooCX65b.js";
import { u as users } from "./erp-data-CMZQ6Smj.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "react";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
const initials = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const cols = [{
  key: "nom",
  header: "Utilisateur",
  render: (u) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-white", children: initials(u.nom) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground", children: u.nom }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: u.email })
    ] })
  ] })
}, {
  key: "role",
  header: "Rôle",
  render: (u) => /* @__PURE__ */ jsx("span", { className: "text-foreground", children: u.role })
}, {
  key: "dernier",
  header: "Dernière activité"
}, {
  key: "statut",
  header: "Statut",
  render: (u) => /* @__PURE__ */ jsx(StatusBadge, { status: u.statut })
}, {
  key: "act",
  header: "Actions",
  align: "right",
  render: () => /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-1", children: [
    /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => toast.info("Modifier"), children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-destructive", onClick: () => toast.error("Supprimer"), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
  ] })
}];
function UsersPage() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Utilisateurs", description: "Gestion des comptes et accès", breadcrumb: ["Administration", "Utilisateurs"], actions: /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5", onClick: () => toast.info("Ajout d'un utilisateur"), children: [
      /* @__PURE__ */ jsx(UserPlus, { className: "h-4 w-4" }),
      " Ajouter un utilisateur"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Utilisateurs", value: "16", sub: "comptes", icon: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Actifs", value: "13", sub: "connectés ce mois", icon: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Rôles", value: "5", sub: "définis", icon: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Invitations", value: "2", sub: "en attente", icon: /* @__PURE__ */ jsx(UserPlus, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs(SectionCard, { title: "Liste des utilisateurs", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(Toolbar, { placeholder: "Rechercher un utilisateur…" }) }),
      /* @__PURE__ */ jsx(DataTable, { columns: cols, rows: users, rowKey: (u) => u.email, withActions: false }),
      /* @__PURE__ */ jsx(Pagination, { count: 16 })
    ] })
  ] });
}
export {
  UsersPage as component
};
