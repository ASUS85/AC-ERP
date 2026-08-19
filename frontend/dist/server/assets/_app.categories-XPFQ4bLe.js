import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useCallback, useEffect, useMemo } from "react";
import { FolderTree, Folder, Search, Plus, Loader2, Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { P as PageHeader } from "./PageHeader-CfvoM4wf.js";
import { S as StatCard, a as SectionCard, P as Pagination, b as SearchableSelect } from "./widgets-CpNLLYbf.js";
import { D as DataTable } from "./DataTable-ihkB0RA5.js";
import { S as StatusBadge } from "./StatusBadge-uJo4wGa2.js";
import { A as AppModal } from "./AppModal-C0J9hUIk.js";
import { I as Input, B as Button } from "./input-Bk3f2XgL.js";
import { L as Label } from "./label-SlaWkmYa.js";
import { T as Textarea } from "./textarea-BsOrOoHp.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-DxTURWmf.js";
import { toast } from "sonner";
import { u as useCategoriesStore, a as updateCategorie, c as createCategorie, d as deleteCategorie } from "./categories.store-BWhlZ0DM.js";
import "@tanstack/react-router";
import "./router-Ccz3J_v4.js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "zod";
import "zustand";
import "axios";
import "react-dom";
import "./dropdown-menu-C8ysl2CK.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-dialog";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
const emptyForm = {
  nom: "",
  description: "",
  idCategorieParent: null,
  icone: "",
  statut: "ACTIF"
};
function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [arbre, setArbre] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(/* @__PURE__ */ new Set());
  const pageSize = 10;
  const fetchCategories = useCategoriesStore((state) => state.fetchList);
  const fetchCategoryTree = useCategoriesStore((state) => state.fetchTree);
  const invalidateCategories = useCategoriesStore((state) => state.invalidate);
  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, arbreRes, allCatRes] = await Promise.all([fetchCategories({
        page,
        limit: pageSize,
        search: search || void 0
      }), fetchCategoryTree(), fetchCategories({
        limit: 1e4
      })]);
      setCategories(catRes?.data || []);
      setMeta(catRes?.meta || {
        total: 0,
        page,
        limit: pageSize,
        totalPages: 1
      });
      setAllCategories(allCatRes?.data || []);
      setArbre(arbreRes?.data || []);
    } catch {
      toast.error("Impossible de charger les categories");
    } finally {
      setLoading(false);
    }
  }, [fetchCategories, fetchCategoryTree, page, search]);
  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);
  useEffect(() => {
    setPage(1);
  }, [search]);
  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const stats = useMemo(() => {
    const total = arbre.length;
    const totalProduits = arbre.reduce((s, n) => s + (n._count?.produits || 0), 0);
    return {
      total,
      totalProduits
    };
  }, [arbre]);
  const setField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) setErrors((prev) => ({
      ...prev,
      [field]: ""
    }));
  };
  const openCreateModal = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };
  const openEditModal = (cat) => {
    setEditing(cat);
    setForm({
      nom: cat.nom || "",
      description: cat.description || "",
      idCategorieParent: cat.idCategorieParent || null,
      icone: cat.icone || "",
      statut: cat.statut
    });
    setErrors({});
    setModalOpen(true);
  };
  const openDeleteModal = (cat) => {
    setPendingDelete(cat);
    setDeleteModalOpen(true);
  };
  const validateForm = () => {
    const next = {};
    if (!form.nom.trim()) next.nom = "Le nom est obligatoire";
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (editing) {
        await updateCategorie(editing.id, form);
        toast.success("Categorie modifiee");
      } else {
        await createCategorie(form);
        toast.success("Categorie ajoutee");
      }
      invalidateCategories();
      setModalOpen(false);
      await loadCategories();
    } catch (error) {
      const msg = error && typeof error === "object" && "message" in error ? error.message : "Erreur lors de l'enregistrement";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteCategorie(pendingDelete.id);
      invalidateCategories();
      toast.success("Categorie supprimee");
      setDeleteModalOpen(false);
      setPendingDelete(null);
      await loadCategories();
    } catch (error) {
      const msg = error && typeof error === "object" && "message" in error ? error.message : "Suppression impossible";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };
  const parentOptions = allCategories.filter((c) => c.id !== editing?.id).map((c) => ({
    value: c.id,
    label: c.nom
  }));
  const cols = [{
    key: "nom",
    header: "Categorie",
    render: (c) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-info/12 text-info", children: /* @__PURE__ */ jsx(Folder, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: c.nom })
    ] })
  }, {
    key: "parent",
    header: "Parent",
    render: (c) => c.parent?.nom || "—"
  }, {
    key: "description",
    header: "Description",
    render: (c) => c.description || "—"
  }, {
    key: "statut",
    header: "Statut",
    align: "right",
    render: (c) => /* @__PURE__ */ jsx(StatusBadge, { status: c.statut })
  }];
  const renderArbreNode = (node, depth = 0) => {
    const hasChildren = node.enfants && node.enfants.length > 0;
    const isExpanded = expanded.has(node.id);
    return /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => hasChildren && toggleExpand(node.id), className: `flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary/60 ${depth > 0 ? "ml-4 border-l border-border pl-3" : ""}`, children: [
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2 text-foreground", children: [
          hasChildren ? isExpanded ? /* @__PURE__ */ jsx(ChevronDown, { className: "h-3.5 w-3.5 text-muted-foreground" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "h-3.5 w-3.5 text-muted-foreground" }) : /* @__PURE__ */ jsx("span", { className: "w-3.5" }),
          /* @__PURE__ */ jsx(FolderTree, { className: "h-4 w-4 text-primary" }),
          node.nom
        ] }),
        node.enfants && node.enfants.length > 0 ? /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: node.enfants.length }) : null
      ] }),
      hasChildren && isExpanded && node.enfants.map((child) => renderArbreNode(child, depth + 1))
    ] }, node.id);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Categories", description: "Organisation arborescente du catalogue", breadcrumb: ["Gestion commerciale", "Categories"] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Categories", value: String(stats.total), sub: "racines", icon: /* @__PURE__ */ jsx(FolderTree, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Avec produits", value: String(stats.totalProduits), sub: "produits rattaches", icon: /* @__PURE__ */ jsx(Folder, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Sur cette page", value: String(meta.total), sub: "au total", icon: /* @__PURE__ */ jsx(Folder, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsx(SectionCard, { title: "Arborescence", description: "Cliquez pour deplier / replier", children: /* @__PURE__ */ jsx("div", { className: "space-y-1", children: arbre.length === 0 ? /* @__PURE__ */ jsx("p", { className: "py-4 text-center text-sm text-muted-foreground", children: "Aucune categorie racine" }) : arbre.map((node) => renderArbreNode(node)) }) }),
      /* @__PURE__ */ jsxs(SectionCard, { title: "Toutes les categories", className: "lg:col-span-2", description: `${meta.total} categorie${meta.total > 1 ? "s" : ""}`, children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative w-full sm:max-w-xs", children: [
            /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
            /* @__PURE__ */ jsx(Input, { placeholder: "Rechercher une categorie...", className: "h-9 pl-9", value: search, onChange: (e) => setSearch(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5 whitespace-nowrap", onClick: openCreateModal, children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            " Nouvelle categorie"
          ] })
        ] }),
        loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx(Loader2, { className: "animate-spin" }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(DataTable, { columns: cols, rows: categories, rowKey: (c) => c.id, rowActions: (cat) => [{
            label: "Modifier",
            icon: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }),
            onClick: () => openEditModal(cat)
          }, {
            label: "Supprimer",
            icon: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
            destructive: true,
            onClick: () => openDeleteModal(cat)
          }] }),
          /* @__PURE__ */ jsx(Pagination, { count: meta.total, currentPage: page, totalPages: meta.totalPages, pageSize, onPageChange: setPage })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(AppModal, { open: modalOpen, onOpenChange: setModalOpen, title: editing ? "Modifier une categorie" : "Ajouter une categorie", description: "Organisez votre catalogue par categories.", size: "lg", footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setModalOpen(false), disabled: submitting, children: "Annuler" }),
      /* @__PURE__ */ jsxs(Button, { disabled: submitting, onClick: () => void handleSubmit(), children: [
        submitting ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
        editing ? "Enregistrer" : "Creer"
      ] })
    ] }), children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxs(Field, { label: "Nom", htmlFor: "nom", error: errors.nom, children: [
        /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" }),
        /* @__PURE__ */ jsx(Input, { id: "nom", value: form.nom, onChange: (e) => setField("nom", e.target.value), placeholder: "Nom de la categorie" })
      ] }),
      /* @__PURE__ */ jsx(Field, { label: "Categorie parente", htmlFor: "parent", children: /* @__PURE__ */ jsx(SearchableSelect, { value: form.idCategorieParent || "", onValueChange: (value) => setField("idCategorieParent", value || null), options: parentOptions, placeholder: "Selectionnez une categorie", searchPlaceholder: "Rechercher une categorie", emptyMessage: "Aucune categorie trouvee" }) }),
      /* @__PURE__ */ jsx(Field, { label: "Statut", htmlFor: "statut", children: /* @__PURE__ */ jsxs(Select, { value: form.statut, onValueChange: (value) => setField("statut", value), children: [
        /* @__PURE__ */ jsx(SelectTrigger, { id: "statut", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Statut" }) }),
        /* @__PURE__ */ jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsx(SelectItem, { value: "ACTIF", children: "Actif" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "INACTIF", children: "Inactif" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Field, { label: "Icône", htmlFor: "icone", children: /* @__PURE__ */ jsx(Input, { id: "icone", value: form.icone || "", onChange: (e) => setField("icone", e.target.value), placeholder: "Nom de l'icone" }) }),
      /* @__PURE__ */ jsx(Field, { label: "Description", htmlFor: "description", className: "md:col-span-2", children: /* @__PURE__ */ jsx(Textarea, { id: "description", value: form.description || "", onChange: (e) => setField("description", e.target.value), placeholder: "Description facultative" }) })
    ] }) }),
    /* @__PURE__ */ jsx(AppModal, { open: deleteModalOpen, onOpenChange: setDeleteModalOpen, title: "Confirmer la suppression", description: "La categorie sera supprimee definitivement.", size: "sm", footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setDeleteModalOpen(false), disabled: deleting, children: "Annuler" }),
      /* @__PURE__ */ jsxs(Button, { variant: "destructive", onClick: () => void handleDelete(), disabled: deleting, children: [
        deleting ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
        " ",
        "Supprimer"
      ] })
    ] }), children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Voulez-vous vraiment supprimer",
      " ",
      /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: pendingDelete?.nom }),
      " ",
      "?"
    ] }) })
  ] });
}
function Field({
  label,
  htmlFor,
  error,
  children,
  className
}) {
  return /* @__PURE__ */ jsxs("div", { className: `space-y-2 ${className || ""}`, children: [
    /* @__PURE__ */ jsx(Label, { htmlFor, children: label }),
    children,
    error && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: error })
  ] });
}
export {
  CategoriesPage as component
};
