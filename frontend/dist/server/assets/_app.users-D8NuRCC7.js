import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { Pencil, Trash2, UserPlus, Users, Loader2 } from "lucide-react";
import { P as PageHeader } from "./PageHeader-Dn6TWXax.js";
import { S as StatCard, a as SectionCard, T as Toolbar, P as Pagination } from "./widgets-Cm7juWWt.js";
import { D as DataTable } from "./DataTable-kHIrPCmJ.js";
import { S as StatusBadge } from "./StatusBadge-FV-hSipZ.js";
import { A as AppModal } from "./AppModal-DFgRRIth.js";
import { B as Button, I as Input } from "./input-CtRqKLv_.js";
import { L as Label } from "./label-BsP1U0zM.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-DuPmXmzY.js";
import { toast } from "sonner";
import { i as api } from "./router-CU8xXL5-.js";
import "@tanstack/react-router";
import "react-dom";
import "./dropdown-menu-284AmCSC.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-dialog";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "zod";
import "axios";
async function getUsers(params) {
  const response = await api.get("/utilisateurs", { params });
  return response;
}
async function createUser(payload) {
  const response = await api.post("/utilisateurs", payload);
  return response;
}
async function updateUser(id, payload) {
  const response = await api.put(`/utilisateurs/${id}`, payload);
  return response;
}
async function deleteUser(id) {
  const response = await api.delete(`/utilisateurs/${id}`);
  return response;
}
async function getRoles() {
  const response = await api.get("/roles");
  return response;
}
const initials = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
function UsersPage() {
  const [rows, setRows] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    idRole: "",
    statut: "ACTIF"
  });
  const loadData = async () => {
    setLoading(true);
    try {
      const [usersResponse, rolesResponse] = await Promise.all([getUsers(), getRoles()]);
      const usersData = Array.isArray(usersResponse?.data) ? usersResponse.data.filter((user) => !user?.role?.isSystemRole) : [];
      const rolesData = Array.isArray(rolesResponse?.data) ? rolesResponse.data.filter((role) => !role?.isSystemRole) : [];
      setRows(usersData);
      setRoles(rolesData);
    } catch {
      toast.error("Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void loadData();
  }, []);
  const openCreateModal = () => {
    setEditingUser(null);
    setErrors({});
    setForm({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      idRole: "",
      statut: ""
    });
    setModalOpen(true);
  };
  const openDeleteModal = (user) => {
    setPendingDeleteUser(user);
    setDeleteModalOpen(true);
  };
  const openEditModal = (user) => {
    setEditingUser(user);
    setErrors({});
    setForm({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone || "",
      idRole: user.role?.id || "",
      statut: user.statut || "ACTIF"
    });
    setModalOpen(true);
  };
  const handleSubmit = async () => {
    const newErrors = {};
    if (!form.nom.trim()) newErrors.nom = "Le nom est obligatoire";
    if (!form.prenom.trim()) newErrors.prenom = "Le prénom est obligatoire";
    if (!form.email.trim()) newErrors.email = "L’email est obligatoire";
    if (!form.idRole) newErrors.idRole = "Le rôle est obligatoire";
    setErrors(newErrors);
    if (Object.keys(newErrors).length) {
      return;
    }
    setSubmitting(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, form);
        toast.success("Utilisateur modifié");
      } else {
        await createUser(form);
        toast.success("Utilisateur ajouté");
      }
      setModalOpen(false);
      setErrors({});
      await loadData();
    } catch (error) {
      const message = error?.message || "Échec de l’opération";
      const details = error?.details || {};
      const fieldErrors = details && typeof details === "object" ? Object.entries(details).reduce((acc, [key, value]) => {
        if (typeof value === "string") acc[key] = value;
        return acc;
      }, {}) : {};
      setErrors(fieldErrors);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async () => {
    if (!pendingDeleteUser) return;
    setDeleting(true);
    try {
      await deleteUser(pendingDeleteUser.id);
      toast.success("Utilisateur supprimé");
      setDeleteModalOpen(false);
      setPendingDeleteUser(null);
      await loadData();
    } catch (error) {
      toast.error(error?.message || "Échec de la suppression");
    } finally {
      setDeleting(false);
    }
  };
  const filterOptions = [{
    label: "Tous",
    value: "all"
  }, {
    label: "Actifs",
    value: "ACTIF"
  }, {
    label: "Inactifs",
    value: "INACTIF"
  }, {
    label: "Bloqués",
    value: "BLOQUE"
  }];
  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return rows.filter((user) => {
      if (user.role?.isSystemRole) return false;
      const matchesStatus = statusFilter === "all" || user.statut === statusFilter;
      const matchesSearch = !normalizedSearch || `${user.prenom} ${user.nom}`.toLowerCase().includes(normalizedSearch) || user.email.toLowerCase().includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });
  }, [rows, search, statusFilter]);
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const pagedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);
  const cols = useMemo(() => [{
    key: "nom",
    header: "Utilisateur",
    render: (u) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-white", children: initials(`${u.prenom} ${u.nom}`) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground", children: `${u.prenom} ${u.nom}` }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: u.email })
      ] })
    ] })
  }, {
    key: "role",
    header: "Rôle",
    render: (u) => /* @__PURE__ */ jsx("span", { className: "text-foreground", children: u.role?.nomRole || "—" })
  }, {
    key: "statut",
    header: "Statut",
    render: (u) => /* @__PURE__ */ jsx(StatusBadge, { status: u.statut })
  }, {
    key: "act",
    header: "Actions",
    align: "right",
    render: (u) => /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-1", children: [
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => openEditModal(u), children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-destructive", onClick: () => openDeleteModal(u), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
    ] })
  }], [roles]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Utilisateurs", description: "Gestion des comptes et accès", breadcrumb: ["Administration", "Utilisateurs"], actions: /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5", onClick: openCreateModal, children: [
      /* @__PURE__ */ jsx(UserPlus, { className: "h-4 w-4" }),
      " Ajouter un utilisateur"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Utilisateurs", value: String(rows.length), sub: "comptes", icon: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Actifs", value: String(rows.filter((u) => u.statut === "ACTIF").length), sub: "comptes actifs", icon: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Rôles", value: String(roles.length), sub: "définis", icon: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Inactifs", value: String(rows.filter((u) => u.statut !== "ACTIF").length), sub: "comptes non actifs", icon: /* @__PURE__ */ jsx(UserPlus, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs(SectionCard, { title: "Liste des utilisateurs", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(Toolbar, { placeholder: "Rechercher un utilisateur…", searchValue: search, onSearchChange: setSearch, filterOptions, selectedFilter: statusFilter, onFilterChange: setStatusFilter }) }),
      loading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center py-10 text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
        " Chargement…"
      ] }) : /* @__PURE__ */ jsx(DataTable, { columns: cols, rows: pagedUsers, rowKey: (u) => u.id, withActions: false }),
      /* @__PURE__ */ jsx(Pagination, { count: filteredUsers.length, currentPage: page, totalPages, onPageChange: setPage })
    ] }),
    /* @__PURE__ */ jsx(AppModal, { open: modalOpen, onOpenChange: setModalOpen, title: editingUser ? "Modifier un utilisateur" : "Ajouter un utilisateur", description: editingUser ? "Mettez à jour les informations de l’utilisateur." : "Créez un nouveau compte utilisateur.", size: "lg", footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setModalOpen(false), disabled: submitting, children: "Annuler" }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => void handleSubmit(), disabled: submitting, children: [
        submitting ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
        editingUser ? "Enregistrer" : "Créer"
      ] })
    ] }), children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs(Label, { htmlFor: "nom", children: [
          "Nom ",
          /* @__PURE__ */ jsx("span", { class: "ml-1 text-destructive", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(Input, { id: "nom", value: form.nom, onChange: (e) => {
          setForm({
            ...form,
            nom: e.target.value
          });
          if (errors.nom) setErrors((prev) => ({
            ...prev,
            nom: ""
          }));
        }, placeholder: "Entrez le nom" }),
        errors.nom ? /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: errors.nom }) : null
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs(Label, { htmlFor: "prenom", children: [
          "Prénom ",
          /* @__PURE__ */ jsx("span", { class: "ml-1 text-destructive", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(Input, { id: "prenom", value: form.prenom, onChange: (e) => {
          setForm({
            ...form,
            prenom: e.target.value
          });
          if (errors.prenom) setErrors((prev) => ({
            ...prev,
            prenom: ""
          }));
        }, placeholder: "Entrez le prénom" }),
        errors.prenom ? /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: errors.prenom }) : null
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2 md:col-span-2", children: [
        /* @__PURE__ */ jsxs(Label, { htmlFor: "email", children: [
          "Email ",
          /* @__PURE__ */ jsx("span", { class: "ml-1 text-destructive", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(Input, { id: "email", type: "email", value: form.email, onChange: (e) => {
          setForm({
            ...form,
            email: e.target.value
          });
          if (errors.email) setErrors((prev) => ({
            ...prev,
            email: ""
          }));
        }, placeholder: "Entrez l'adresse email" }),
        errors.email ? /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: errors.email }) : null
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "telephone", children: "Téléphone" }),
        /* @__PURE__ */ jsx(Input, { id: "telephone", value: form.telephone || "", onChange: (e) => setForm({
          ...form,
          telephone: e.target.value
        }), placeholder: "Entrez le numéro de téléphone" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs(Label, { htmlFor: "role", children: [
          "Rôle ",
          /* @__PURE__ */ jsx("span", { class: "ml-1 text-destructive", children: "*" })
        ] }),
        /* @__PURE__ */ jsxs(Select, { value: form.idRole, onValueChange: (value) => {
          setForm({
            ...form,
            idRole: value
          });
          if (errors.idRole) setErrors((prev) => ({
            ...prev,
            idRole: ""
          }));
        }, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { id: "role", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Sélectionner un rôle" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: roles.map((role) => /* @__PURE__ */ jsx(SelectItem, { value: role.id, children: role.nomRole }, role.id)) })
        ] }),
        errors.idRole ? /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: errors.idRole }) : null
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "statut", children: "Statut" }),
        /* @__PURE__ */ jsxs(Select, { value: form.statut, onValueChange: (value) => setForm({
          ...form,
          statut: value
        }), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { id: "statut", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Sélectionner un statut" }) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "ACTIF", children: "Actif" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "INACTIF", children: "Inactif" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "BLOQUE", children: "Bloqué" })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AppModal, { open: deleteModalOpen, onOpenChange: setDeleteModalOpen, title: "Confirmer la suppression", description: "Cette action est irréversible.", size: "sm", footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setDeleteModalOpen(false), disabled: deleting, children: "Annuler" }),
      /* @__PURE__ */ jsxs(Button, { variant: "destructive", onClick: () => void handleDelete(), disabled: deleting, children: [
        deleting ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
        "Supprimer"
      ] })
    ] }), children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Voulez-vous vraiment supprimer",
      " ",
      /* @__PURE__ */ jsxs("span", { className: "font-semibold text-foreground", children: [
        pendingDeleteUser?.prenom,
        " ",
        pendingDeleteUser?.nom
      ] }),
      " ",
      "?"
    ] }) })
  ] });
}
export {
  UsersPage as component
};
