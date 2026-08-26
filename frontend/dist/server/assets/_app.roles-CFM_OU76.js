import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { Plus, Loader2, Shield, Search, Lock, ChevronRight, Pencil, Trash2, Save, Layers, CheckCheck, CheckCircle2, XCircle } from "lucide-react";
import { P as PageHeader } from "./PageHeader-D6EtHCBB.js";
import { A as AppModal } from "./AppModal-C69IBz2_.js";
import { B as Button, I as Input } from "./input-B0E-1hwS.js";
import { L as Label } from "./label-JW23xmF-.js";
import { T as Textarea } from "./textarea-BWVwaDWu.js";
import { toast } from "sonner";
import { i as api } from "./router-B5GAJ1jr.js";
import "@tanstack/react-router";
import "@radix-ui/react-dialog";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "zod";
import "zustand";
import "axios";
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
  const response = await api.put(`/roles/${id}/permissions`, {
    permissionIds
  });
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
function toApiError(error) {
  return error && typeof error === "object" ? error : {};
}
function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
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
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => role.nomRole.toLowerCase().includes(roleSearchQuery.toLowerCase()) || role.description && role.description.toLowerCase().includes(roleSearchQuery.toLowerCase()));
  }, [roles, roleSearchQuery]);
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
    })).filter((g) => g.label.toLowerCase().includes(searchQuery.toLowerCase()) || g.module.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => a.label.localeCompare(b.label));
  }, [permissions, searchQuery]);
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
    if (Object.keys(newErrors).length) return;
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
      const apiError = toApiError(error);
      toast.error(apiError.message || "Échec de l’opération");
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
      const apiError = toApiError(error);
      toast.error(apiError.message || "Échec de la suppression");
    } finally {
      setDeleting(false);
    }
  };
  const handlePermissionToggle = (permissionId, checked) => {
    setPermissionIds((current) => checked ? [...current, permissionId] : current.filter((id) => id !== permissionId));
  };
  const handleToggleModulePermissions = (moduleItems) => {
    const moduleIds = moduleItems.map((item) => item.id);
    const allChecked = moduleIds.every((id) => permissionIds.includes(id));
    if (allChecked) {
      setPermissionIds((prev) => prev.filter((id) => !moduleIds.includes(id)));
    } else {
      setPermissionIds((prev) => Array.from(/* @__PURE__ */ new Set([...prev, ...moduleIds])));
    }
  };
  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    setSavingPermissions(true);
    try {
      await updateRolePermissions(selectedRoleId, permissionIds);
      toast.success("Permissions mises à jour avec succès");
      await loadData();
    } catch (error) {
      const apiError = toApiError(error);
      toast.error(apiError.message || "Échec de la sauvegarde");
    } finally {
      setSavingPermissions(false);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Rôles & permissions", description: "Gérez la matrice d'accès métiers et les rôles utilisateurs", breadcrumb: ["Administration", "Rôles"], actions: /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5 shadow-sm", onClick: openCreateModal, children: [
      /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
      " Nouveau rôle"
    ] }) }),
    loading ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm", children: "Chargement des données..." })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 lg:grid-cols-12 items-start", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm h-[800px] flex flex-col overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-3 border-b border-border/50 shrink-0 bg-primary/10 rounded-lg px-3 py-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Shield, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-sm text-foreground", children: "Rôles définis" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary", children: roles.length })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative my-3 shrink-0", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsx(Input, { placeholder: "Filtrer les rôles...", value: roleSearchQuery, onChange: (e) => setRoleSearchQuery(e.target.value), className: "pl-8 h-8 text-xs" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 overflow-y-auto min-h-0 flex-1 pr-1", children: [
          filteredRoles.map((role) => {
            const isActive = role.id === selectedRoleId;
            const permCount = role.permissions?.length ?? 0;
            return /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setSelectedRoleId(role.id), className: `w-full text-left p-3 rounded-lg transition-all flex items-center justify-between group ${isActive ? "bg-primary/10 border-l-4 border-l-primary text-foreground shadow-xs" : "hover:bg-muted/50 border-l-4 border-l-transparent text-muted-foreground hover:text-foreground"}`, children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-1 min-w-0 pr-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: `font-medium text-sm truncate ${isActive ? "text-primary font-semibold" : ""}`, children: role.nomRole }),
                  role.isSystemRole && /* @__PURE__ */ jsx(Lock, { className: "h-3 w-3 text-amber-500 shrink-0" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground line-clamp-1", children: role.description || "Sans description" }),
                /* @__PURE__ */ jsxs("div", { className: "text-[11px] font-medium text-primary/80", children: [
                  permCount,
                  " permission",
                  permCount > 1 ? "s" : ""
                ] })
              ] }),
              /* @__PURE__ */ jsx(ChevronRight, { className: `h-4 w-4 shrink-0 transition-transform ${isActive ? "text-primary translate-x-0.5" : "text-muted-foreground/40 group-hover:text-muted-foreground"}` })
            ] }, role.id);
          }),
          filteredRoles.length === 0 && /* @__PURE__ */ jsx("div", { className: "p-4 text-center text-xs text-muted-foreground", children: "Aucun rôle correspondant trouvé" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-9 rounded-xl border border-border/70 bg-card p-5 shadow-sm h-[800px] flex flex-col overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between border-b border-border/50 pb-4 shrink-0 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-base text-foreground flex items-center gap-2", children: [
              "Permissions :",
              selectedRole && /* @__PURE__ */ jsx("span", { className: "rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary", children: selectedRole.nomRole })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Configurez les accès spécifiques par module pour le rôle sélectionné" })
          ] }),
          selectedRole && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => openEditModal(selectedRole), children: [
              /* @__PURE__ */ jsx(Pencil, { className: "mr-1.5 h-3.5 w-3.5" }),
              " Modifier rôle"
            ] }),
            /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "text-destructive hover:bg-destructive/10", onClick: () => openDeleteModal(selectedRole), children: [
              /* @__PURE__ */ jsx(Trash2, { className: "mr-1.5 h-3.5 w-3.5" }),
              " Supprimer"
            ] }),
            /* @__PURE__ */ jsxs(Button, { onClick: () => void handleSavePermissions(), disabled: savingPermissions, size: "sm", className: "gap-1.5", children: [
              savingPermissions ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
              "Enregistrer"
            ] })
          ] })
        ] }),
        selectedRole ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col flex-1 min-h-0 pt-4 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative shrink-0", children: [
            /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
            /* @__PURE__ */ jsx(Input, { placeholder: "Rechercher un module (ex: Ventes, Stocks...)", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-9 text-sm" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "overflow-y-auto flex-1 min-h-0 pr-1 pb-2", children: [
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: groupedPermissions.map(({
              module,
              label,
              items
            }) => {
              const allModuleChecked = items.every((item) => permissionIds.includes(item.id));
              return /* @__PURE__ */ jsxs("div", { className: "flex flex-col rounded-xl border border-border/70 bg-card p-4 transition-all hover:border-border", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border/50 pb-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
                    /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground", children: /* @__PURE__ */ jsx(Layers, { className: "h-4 w-4 text-primary" }) }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("h4", { className: "font-semibold text-foreground text-sm", children: label }),
                      /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
                        items.length,
                        " action(s) disponible(s)"
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => handleToggleModulePermissions(items), className: "h-8 text-xs font-medium text-muted-foreground hover:text-foreground", children: [
                    /* @__PURE__ */ jsx(CheckCheck, { className: "mr-1 h-3.5 w-3.5" }),
                    allModuleChecked ? "Tout désactiver" : "Tout activer"
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "mt-3 flex flex-wrap gap-2 pt-1", children: items.map((permission) => {
                  const isChecked = permissionIds.includes(permission.id);
                  const actionName = actionLabels[permission.action] ?? permission.action;
                  return /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => handlePermissionToggle(permission.id, !isChecked), className: `inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${isChecked ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20" : "border-border/60 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted"}`, children: [
                    isChecked ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 text-emerald-600" }) : /* @__PURE__ */ jsx(XCircle, { className: "h-3.5 w-3.5 opacity-40" }),
                    actionName
                  ] }, permission.id);
                }) })
              ] }, module);
            }) }),
            groupedPermissions.length === 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center justify-center py-10 text-center", children: /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium text-muted-foreground", children: [
              'Aucun module trouvé pour "',
              searchQuery,
              '"'
            ] }) })
          ] })
        ] }) : /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center justify-center", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Aucun rôle sélectionné. Veuillez en créer ou en sélectionner un." }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(AppModal, { open: modalOpen, onOpenChange: setModalOpen, title: editingRole ? "Modifier un rôle" : "Ajouter un rôle", description: editingRole ? "Mettre à jour les informations de ce rôle métier." : "Créez un nouveau rôle métier pour définir des permissions.", size: "md", footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setModalOpen(false), disabled: submitting, children: "Annuler" }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => void handleSubmit(), disabled: submitting, children: [
        submitting && /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
        editingRole ? "Enregistrer" : "Créer"
      ] })
    ] }), children: /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs(Label, { htmlFor: "nomRole", children: [
          "Nom du rôle ",
          /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(Input, { id: "nomRole", placeholder: "ex: Manager des Ventes", value: form.nomRole, onChange: (event) => {
          setForm({
            ...form,
            nomRole: event.target.value
          });
          if (errors.nomRole) setErrors((prev) => ({
            ...prev,
            nomRole: ""
          }));
        } }),
        errors.nomRole && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: errors.nomRole })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "description", children: "Description" }),
        /* @__PURE__ */ jsx(Textarea, { id: "description", rows: 3, value: form.description ?? "", onChange: (event) => setForm({
          ...form,
          description: event.target.value
        }), placeholder: "Décrivez les responsabilités de ce rôle..." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AppModal, { open: deleteModalOpen, onOpenChange: setDeleteModalOpen, title: "Confirmer la suppression", description: "Cette action est irréversible.", size: "sm", footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setDeleteModalOpen(false), disabled: deleting, children: "Annuler" }),
      /* @__PURE__ */ jsxs(Button, { variant: "destructive", onClick: () => void handleDelete(), disabled: deleting, children: [
        deleting && /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
        "Supprimer définitivement"
      ] })
    ] }), children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground py-2", children: [
      "Voulez-vous vraiment supprimer le rôle",
      " ",
      /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: pendingDeleteRole?.nomRole }),
      " ",
      "?"
    ] }) })
  ] });
}
export {
  RolesPage as component
};
