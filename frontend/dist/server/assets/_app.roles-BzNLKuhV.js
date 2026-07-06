import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Check, Plus, Loader2, ShieldCheck, Lock, Pencil, Trash2, Save } from "lucide-react";
import { P as PageHeader } from "./PageHeader-JmieIep0.js";
import { a as SectionCard } from "./widgets-DEep6NAy.js";
import { A as AppModal } from "./AppModal-D9J-QfF-.js";
import { B as Button, I as Input } from "./input-AeiaPT4J.js";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { c as cn } from "./router-DtcNlqbc.js";
import { L as Label } from "./label-BDqSkCkP.js";
import { toast } from "sonner";
import { a as api } from "./client-DBXY_OFa.js";
import "@tanstack/react-router";
import "./dropdown-menu-CEa0MGsQ.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-dialog";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "axios";
const Checkbox = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  CheckboxPrimitive.Root,
  {
    ref,
    className: cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(CheckboxPrimitive.Indicator, { className: cn("grid place-content-center text-current"), children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
async function getRoles(params) {
  const response = await api.get("/roles", { params });
  return response;
}
async function getPermissions() {
  const response = await api.get("/roles/permissions");
  return response;
}
async function createRole(payload) {
  const response = await api.post("/roles", payload);
  return response;
}
async function updateRole(id, payload) {
  const response = await api.put(`/roles/${id}`, payload);
  return response;
}
async function deleteRole(id) {
  const response = await api.delete(`/roles/${id}`);
  return response;
}
async function updateRolePermissions(id, permissionIds) {
  const response = await api.put(`/roles/${id}/permissions`, { permissionIds });
  return response;
}
const actionLabels = {
  lire: "Lire",
  creer: "Créer",
  modifier: "Modifier",
  supprimer: "Supprimer",
  ajuster: "Ajuster",
  inventaire: "Inventaire",
  valider: "Valider",
  receptionner: "Réceptionner",
  livrer: "Livrer",
  avoir: "Avoir",
  envoyer: "Envoyer",
  exporter: "Exporter",
  chat: "Chat",
  rapport: "Rapport"
};
const moduleLabels = {
  users: "Utilisateurs",
  roles: "Rôles",
  categories: "Catégories",
  produits: "Produits",
  clients: "Clients",
  fournisseurs: "Fournisseurs",
  stocks: "Stocks",
  achats: "Achats",
  ventes: "Ventes",
  factures: "Factures",
  paiements: "Paiements",
  rapports: "Rapports",
  dashboard: "Tableau de bord",
  ia: "Intelligence artificielle"
};
function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [pendingDeleteRole, setPendingDeleteRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [form, setForm] = useState({
    nomRole: "",
    description: "",
    isSystemRole: false
  });
  const [errors, setErrors] = useState({});
  const [permissionIds, setPermissionIds] = useState([]);
  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([getRoles(), getPermissions()]);
      const rolesData = Array.isArray(rolesResponse?.data) ? rolesResponse.data.filter((role) => !role?.isSystemRole) : [];
      const permissionsData = Array.isArray(permissionsResponse?.data) ? permissionsResponse.data : [];
      setRoles(rolesData);
      setPermissions(permissionsData);
      setSelectedRoleId((currentId) => {
        if (rolesData.some((role) => role.id === currentId)) return currentId;
        return rolesData[0]?.id ?? null;
      });
    } catch {
      toast.error("Impossible de charger les rôles");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void loadData();
  }, []);
  useEffect(() => {
    const selectedRole2 = roles.find((role) => role.id === selectedRoleId);
    setPermissionIds(selectedRole2?.permissions?.map((entry) => entry.permission?.id ?? entry.idPermission) ?? []);
  }, [roles, selectedRoleId]);
  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null;
  const groupedPermissions = useMemo(() => {
    const grouped = /* @__PURE__ */ new Map();
    permissions.forEach((permission) => {
      const items = grouped.get(permission.module) ?? [];
      items.push(permission);
      grouped.set(permission.module, items);
    });
    return Array.from(grouped.entries()).map(([module, items]) => ({
      module,
      label: moduleLabels[module] ?? module,
      items: items.sort((a, b) => a.action.localeCompare(b.action))
    })).sort((a, b) => a.label.localeCompare(b.label));
  }, [permissions]);
  const openCreateModal = () => {
    setEditingRole(null);
    setErrors({});
    setForm({
      nomRole: "",
      description: "",
      isSystemRole: false
    });
    setModalOpen(true);
  };
  const openEditModal = (role) => {
    setEditingRole(role);
    setErrors({});
    setForm({
      nomRole: role.nomRole,
      description: role.description ?? "",
      isSystemRole: role.isSystemRole ?? false
    });
    setModalOpen(true);
  };
  const openDeleteModal = (role) => {
    setPendingDeleteRole(role);
    setDeleteModalOpen(true);
  };
  const handleSubmit = async () => {
    const newErrors = {};
    if (!form.nomRole.trim()) newErrors.nomRole = "Le nom du rôle est obligatoire";
    setErrors(newErrors);
    if (Object.keys(newErrors).length) {
      toast.error("Veuillez corriger les champs indiqués");
      return;
    }
    setSubmitting(true);
    try {
      if (editingRole) {
        await updateRole(editingRole.id, form);
        toast.success("Rôle mis à jour");
      } else {
        await createRole(form);
        toast.success("Rôle ajouté");
      }
      setModalOpen(false);
      setErrors({});
      await loadData();
    } catch (error) {
      const details = error?.details || {};
      const fieldErrors = details && typeof details === "object" ? Object.entries(details).reduce((acc, [key, value]) => {
        if (typeof value === "string") acc[key] = value;
        return acc;
      }, {}) : {};
      setErrors(fieldErrors);
      toast.error(error?.message || "Échec de l’opération");
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async () => {
    if (!pendingDeleteRole) return;
    setDeleting(true);
    try {
      await deleteRole(pendingDeleteRole.id);
      toast.success("Rôle supprimé");
      setDeleteModalOpen(false);
      setPendingDeleteRole(null);
      await loadData();
    } catch (error) {
      toast.error(error?.message || "Échec de la suppression");
    } finally {
      setDeleting(false);
    }
  };
  const handlePermissionToggle = (permissionId, checked) => {
    setPermissionIds((current) => checked ? [...current, permissionId] : current.filter((value) => value !== permissionId));
  };
  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    setSavingPermissions(true);
    try {
      await updateRolePermissions(selectedRoleId, permissionIds);
      toast.success("Permissions mises à jour");
      await loadData();
    } catch (error) {
      toast.error(error?.message || "Échec de la sauvegarde");
    } finally {
      setSavingPermissions(false);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Rôles & permissions", description: "Définissez les accès et les permissions métiers", breadcrumb: ["Administration", "Rôles"], actions: /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5", onClick: openCreateModal, children: [
      /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
      " Nouveau rôle"
    ] }) }),
    loading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center py-10 text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
      " Chargement…"
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3", children: roles.map((role) => {
        const isActive = role.id === selectedRoleId;
        return /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setSelectedRoleId(role.id), className: `rounded-xl border p-4 text-left shadow-card transition ${isActive ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-5 w-5" }) }),
            role.isSystemRole ? /* @__PURE__ */ jsx(Lock, { className: "h-4 w-4 text-muted-foreground" }) : null
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 font-semibold text-foreground", children: role.nomRole }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: role.description || "Aucune description" }),
          /* @__PURE__ */ jsxs("p", { className: "mt-3 text-xs font-medium text-primary", children: [
            role.permissions?.length ?? 0,
            " permission(s)"
          ] })
        ] }, role.id);
      }) }),
      /* @__PURE__ */ jsx(SectionCard, { title: selectedRole ? `Permissions — ${selectedRole.nomRole}` : "Permissions", description: "Activez ou désactivez les accès pour chaque module", children: selectedRole ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-secondary/30 p-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground", children: selectedRole.nomRole }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: selectedRole.description || "Aucune description" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => openEditModal(selectedRole), children: [
              /* @__PURE__ */ jsx(Pencil, { className: "mr-2 h-4 w-4" }),
              " Modifier"
            ] }),
            /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "text-destructive", onClick: () => openDeleteModal(selectedRole), children: [
              /* @__PURE__ */ jsx(Trash2, { className: "mr-2 h-4 w-4" }),
              " Supprimer"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground", children: [
            /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5 font-medium", children: "Module" }),
            /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5 font-medium", children: "Permissions" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: groupedPermissions.map(({
            module,
            label,
            items
          }) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/60 last:border-0 hover:bg-secondary/40", children: [
            /* @__PURE__ */ jsx("td", { className: "px-3 py-3 font-medium text-foreground", children: label }),
            /* @__PURE__ */ jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3", children: items.map((permission) => /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 rounded border border-border bg-background px-2.5 py-2 text-sm", children: [
              /* @__PURE__ */ jsx(Checkbox, { checked: permissionIds.includes(permission.id), onCheckedChange: (checked) => handlePermissionToggle(permission.id, checked === true) }),
              /* @__PURE__ */ jsx("span", { children: actionLabels[permission.action] ?? permission.action })
            ] }, permission.id)) }) })
          ] }, module)) })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(Button, { onClick: () => void handleSavePermissions(), disabled: savingPermissions, children: [
          savingPermissions ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "mr-2 h-4 w-4" }),
          "Enregistrer les permissions"
        ] }) })
      ] }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Aucun rôle disponible pour l’instant." }) })
    ] }),
    /* @__PURE__ */ jsx(AppModal, { open: modalOpen, onOpenChange: setModalOpen, title: editingRole ? "Modifier un rôle" : "Ajouter un rôle", description: editingRole ? "Mettre à jour les informations du rôle." : "Créez un nouveau rôle métier.", size: "md", footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setModalOpen(false), disabled: submitting, children: "Annuler" }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => void handleSubmit(), disabled: submitting, children: [
        submitting ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
        editingRole ? "Enregistrer" : "Créer"
      ] })
    ] }), children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "nomRole", children: "Nom du rôle" }),
        /* @__PURE__ */ jsx(Input, { id: "nomRole", value: form.nomRole, onChange: (event) => {
          setForm({
            ...form,
            nomRole: event.target.value
          });
          if (errors.nomRole) setErrors((prev) => ({
            ...prev,
            nomRole: ""
          }));
        } }),
        errors.nomRole ? /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: errors.nomRole }) : null
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "description", children: "Description" }),
        /* @__PURE__ */ jsx(Textarea, { id: "description", value: form.description ?? "", onChange: (event) => setForm({
          ...form,
          description: event.target.value
        }), placeholder: "Décrivez le rôle et son usage" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AppModal, { open: deleteModalOpen, onOpenChange: setDeleteModalOpen, title: "Confirmer la suppression", description: "Cette action est irréversible.", size: "sm", footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setDeleteModalOpen(false), disabled: deleting, children: "Annuler" }),
      /* @__PURE__ */ jsxs(Button, { variant: "destructive", onClick: () => void handleDelete(), disabled: deleting, children: [
        deleting ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
        "Supprimer"
      ] })
    ] }), children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Voulez-vous vraiment supprimer ",
      /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: pendingDeleteRole?.nomRole }),
      " ?"
    ] }) })
  ] });
}
export {
  RolesPage as component
};
