import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { Loader2, Download, Package, Pencil, Trash2 } from "lucide-react";
import { P as PageHeader } from "./PageHeader-Dn6TWXax.js";
import { S as StatCard, a as SectionCard, T as Toolbar, P as Pagination } from "./widgets-CMPdIU-O.js";
import { D as DataTable } from "./DataTable-BdeZJD0g.js";
import { S as StatusBadge } from "./StatusBadge-DSMu8YcM.js";
import { A as AppModal } from "./AppModal-B4MWKuTc.js";
import { B as Button, I as Input } from "./input-Dis5tVWN.js";
import { L as Label } from "./label-BzT64fza.js";
import { T as Textarea } from "./textarea-DBOoNM3O.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-GzknFkUw.js";
import { toast } from "sonner";
import { f as fmtCurrency, e as fmtNumber } from "./erp-data-Dpg9mwIn.js";
import { a as api } from "./client-B-gDdwdO.js";
import "@tanstack/react-router";
import "./router-BPNLrioU.js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "./dropdown-menu-D2wOmaKU.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-dialog";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "axios";
const getCategories = (params) => api.get("/categories", { params });
const getProduits = (params) => api.get("/produits", { params });
const createProduit = (data) => api.post("/produits", data);
const updateProduit = (id, data) => api.put(`/produits/${id}`, data);
const archiveProduit = (id) => api.delete(`/produits/${id}`);
const emptyForm = {
  reference: "",
  designation: "",
  description: "",
  uniteMesure: "PIECE",
  prixAchatHt: 0,
  prixVenteHt: 0,
  tauxTva: 18,
  stockMinimum: 0,
  stockInitial: 0,
  idCategorie: "",
  statut: "ACTIF"
};
const units = [{
  label: "Pièce",
  value: "PIECE"
}, {
  label: "Kg",
  value: "KG"
}, {
  label: "Litre",
  value: "LITRE"
}, {
  label: "Mètre",
  value: "METRE"
}, {
  label: "M2",
  value: "M2"
}, {
  label: "Boîte",
  value: "BOITE"
}, {
  label: "Carton",
  value: "CARTON"
}];
const toApiError = (error) => error && typeof error === "object" ? error : {};
const responseData = (response) => Array.isArray(response?.data) ? response.data : [];
function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const pageSize = 10;
  const loadCategories = async () => {
    const response = await getCategories({
      limit: 500,
      statut: "ACTIF"
    });
    setCategories(responseData(response));
  };
  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await getProduits({
        page,
        limit: pageSize,
        search: search.trim() || void 0,
        categorieId: categoryFilter === "all" ? void 0 : categoryFilter
      });
      setProducts(responseData(response));
      setMeta(response?.meta || {
        total: 0,
        page,
        limit: pageSize,
        totalPages: 1
      });
    } catch {
      toast.error("Impossible de charger les produits");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void loadCategories().catch(() => toast.error("Impossible de charger les catégories"));
  }, []);
  useEffect(() => {
    void loadProducts();
  }, [page, search, categoryFilter]);
  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter]);
  const stats = useMemo(() => {
    const total = meta.total;
    const actifs = products.filter((p) => p.statut === "ACTIF").length;
    const stockFaible = products.filter((p) => Number(p.stock?.stockActuel || 0) <= Number(p.stockMinimum || 0)).length;
    const ruptures = products.filter((p) => Number(p.stock?.stockActuel || 0) <= 0).length;
    return {
      total,
      actifs,
      stockFaible,
      ruptures
    };
  }, [meta.total, products]);
  const filterOptions = [{
    label: "Toutes les catégories",
    value: "all"
  }, ...categories.map((category) => ({
    label: category.nom,
    value: category.id
  }))];
  const setField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
    if (errors[field]) setErrors((current) => ({
      ...current,
      [field]: ""
    }));
  };
  const openCreateModal = () => {
    setEditingProduct(null);
    setErrors({});
    setForm(emptyForm);
    setModalOpen(true);
  };
  const openEditModal = (product) => {
    setEditingProduct(product);
    setErrors({});
    setForm({
      reference: product.reference || "",
      designation: product.designation || "",
      description: product.description || "",
      uniteMesure: product.uniteMesure || "PIECE",
      prixAchatHt: Number(product.prixAchatHt || 0),
      prixVenteHt: Number(product.prixVenteHt || 0),
      tauxTva: Number(product.tauxTva || 18),
      stockMinimum: Number(product.stockMinimum || 0),
      idCategorie: product.idCategorie || product.categorie?.id || "",
      statut: product.statut || "ACTIF"
    });
    setModalOpen(true);
  };
  const openDeleteModal = (product) => {
    setPendingDeleteProduct(product);
    setDeleteModalOpen(true);
  };
  const validateForm = () => {
    const nextErrors = {};
    if (!form.designation.trim()) nextErrors.designation = "La désignation est obligatoire";
    if (!form.uniteMesure) nextErrors.uniteMesure = "L’unité est obligatoire";
    if (!form.idCategorie) nextErrors.idCategorie = "La catégorie est obligatoire";
    if (Number(form.prixAchatHt) < 0) nextErrors.prixAchatHt = "Le prix d’achat doit être positif";
    if (Number(form.prixVenteHt) <= 0) nextErrors.prixVenteHt = "Le prix de vente est obligatoire";
    if (Number(form.tauxTva || 0) < 0) nextErrors.tauxTva = "La TVA doit être positive";
    if (Number(form.stockMinimum || 0) < 0) nextErrors.stockMinimum = "Le stock minimum doit être positif";
    if (!editingProduct && Number(form.stockInitial || 0) < 0) nextErrors.stockInitial = "Le stock initial doit être positif";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        reference: form.reference?.trim() || void 0,
        description: form.description?.trim() || void 0,
        prixAchatHt: Number(form.prixAchatHt),
        prixVenteHt: Number(form.prixVenteHt),
        tauxTva: Number(form.tauxTva || 0),
        stockMinimum: Number(form.stockMinimum || 0),
        ...!editingProduct ? {
          stockInitial: Number(form.stockInitial || 0)
        } : {}
      };
      if (editingProduct) {
        await updateProduit(editingProduct.id, payload);
        toast.success("Produit modifié");
      } else {
        await createProduit(payload);
        toast.success("Produit ajouté");
      }
      setModalOpen(false);
      await loadProducts();
    } catch (error) {
      const apiError = toApiError(error);
      const details = apiError.details || {};
      const fieldErrors = details && typeof details === "object" ? Object.entries(details).reduce((acc, [key, value]) => {
        if (typeof value === "string") acc[key] = value;
        return acc;
      }, {}) : {};
      setErrors(fieldErrors);
      toast.error(apiError.message || "Échec de l’enregistrement");
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async () => {
    if (!pendingDeleteProduct) return;
    setDeleting(true);
    try {
      await archiveProduit(pendingDeleteProduct.id);
      toast.success("Produit archivé");
      setDeleteModalOpen(false);
      setPendingDeleteProduct(null);
      await loadProducts();
    } catch (error) {
      const apiError = toApiError(error);
      toast.error(apiError.message || "Suppression impossible");
    } finally {
      setDeleting(false);
    }
  };
  const exportProducts = async () => {
    setExporting(true);
    try {
      const response = await getProduits({
        limit: 1e4,
        search: search.trim() || void 0,
        categorieId: categoryFilter === "all" ? void 0 : categoryFilter
      });
      const rows = responseData(response);
      const csvRows = [["Référence", "Désignation", "Catégorie", "Unité", "Prix achat HT", "Prix vente HT", "TVA", "Stock", "Stock minimum", "Statut"], ...rows.map((product) => [product.reference, product.designation, product.categorie?.nom || "", product.uniteMesure, String(product.prixAchatHt), String(product.prixVenteHt), String(product.tauxTva), String(product.stock?.stockActuel || 0), String(product.stockMinimum || 0), product.statut])];
      const csv = csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")).join("\n");
      const blob = new Blob([`\uFEFF${csv}`], {
        type: "text/csv;charset=utf-8;"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `produits-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Liste des produits exportée");
    } catch {
      toast.error("Export impossible");
    } finally {
      setExporting(false);
    }
  };
  const cols = [{
    key: "designation",
    header: "Produit",
    render: (product) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(Package, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "truncate font-medium text-foreground", children: product.designation }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: product.reference })
      ] })
    ] })
  }, {
    key: "categorie",
    header: "Catégorie",
    render: (product) => product.categorie?.nom || "—"
  }, {
    key: "prixVenteHt",
    header: "Prix",
    align: "right",
    render: (product) => /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: fmtCurrency(Number(product.prixVenteHt || 0)) })
  }, {
    key: "stock",
    header: "Stock",
    align: "right",
    render: (product) => /* @__PURE__ */ jsx("span", { className: "text-foreground", children: fmtNumber(Number(product.stock?.stockActuel || 0)) })
  }, {
    key: "statut",
    header: "Statut",
    align: "right",
    render: (product) => /* @__PURE__ */ jsx(StatusBadge, { status: product.statut })
  }];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Produits", description: "Catalogue et gestion des articles", breadcrumb: ["Gestion commerciale", "Produits"], actions: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: () => void exportProducts(), disabled: exporting, children: [
      exporting ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
      "Exporter"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Total produits", value: String(stats.total), sub: "en catalogue", icon: /* @__PURE__ */ jsx(Package, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Actifs", value: String(stats.actifs), sub: "sur cette page", icon: /* @__PURE__ */ jsx(Package, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Stock faible", value: String(stats.stockFaible), sub: "à réapprovisionner", icon: /* @__PURE__ */ jsx(Package, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Ruptures", value: String(stats.ruptures), sub: "indisponibles", icon: /* @__PURE__ */ jsx(Package, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs(SectionCard, { title: "Catalogue produits", description: `${meta.total} produit${meta.total > 1 ? "s" : ""}`, children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(Toolbar, { placeholder: "Rechercher un produit…", addLabel: "Ajouter un produit", searchValue: search, onSearchChange: setSearch, filterOptions, selectedFilter: categoryFilter, onFilterChange: setCategoryFilter, onAdd: openCreateModal }) }),
      loading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center py-10 text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
        " Chargement…"
      ] }) : /* @__PURE__ */ jsx(DataTable, { columns: cols, rows: products, rowKey: (product) => product.id, rowActions: (product) => [{
        label: "Modifier",
        icon: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }),
        onClick: () => openEditModal(product)
      }, {
        label: "Supprimer",
        icon: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
        destructive: true,
        onClick: () => openDeleteModal(product)
      }] }),
      /* @__PURE__ */ jsx(Pagination, { count: meta.total, currentPage: page, totalPages: meta.totalPages, pageSize, onPageChange: setPage })
    ] }),
    /* @__PURE__ */ jsx(AppModal, { open: modalOpen, onOpenChange: setModalOpen, title: editingProduct ? "Modifier un produit" : "Ajouter un produit", description: "Renseignez les informations du catalogue.", size: "xl", footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setModalOpen(false), disabled: submitting, children: "Annuler" }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => void handleSubmit(), disabled: submitting, children: [
        submitting ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
        editingProduct ? "Enregistrer" : "Créer"
      ] })
    ] }), children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
      /* @__PURE__ */ jsx(Field, { label: "Référence", htmlFor: "reference", error: errors.reference, children: /* @__PURE__ */ jsx(Input, { id: "reference", value: form.reference || "", onChange: (e) => setField("reference", e.target.value), placeholder: "Automatique si vide" }) }),
      /* @__PURE__ */ jsx(Field, { label: "Désignation", htmlFor: "designation", error: errors.designation, children: /* @__PURE__ */ jsx(Input, { id: "designation", value: form.designation, onChange: (e) => setField("designation", e.target.value), placeholder: "Nom du produit" }) }),
      /* @__PURE__ */ jsx(Field, { label: "Catégorie", htmlFor: "categorie", error: errors.idCategorie, children: /* @__PURE__ */ jsxs(Select, { value: form.idCategorie, onValueChange: (value) => setField("idCategorie", value), children: [
        /* @__PURE__ */ jsx(SelectTrigger, { id: "categorie", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Sélectionner une catégorie" }) }),
        /* @__PURE__ */ jsx(SelectContent, { children: categories.map((category) => /* @__PURE__ */ jsx(SelectItem, { value: category.id, children: category.nom }, category.id)) })
      ] }) }),
      /* @__PURE__ */ jsx(Field, { label: "Unité", htmlFor: "uniteMesure", error: errors.uniteMesure, children: /* @__PURE__ */ jsxs(Select, { value: form.uniteMesure, onValueChange: (value) => setField("uniteMesure", value), children: [
        /* @__PURE__ */ jsx(SelectTrigger, { id: "uniteMesure", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Sélectionner une unité" }) }),
        /* @__PURE__ */ jsx(SelectContent, { children: units.map((unit) => /* @__PURE__ */ jsx(SelectItem, { value: unit.value, children: unit.label }, unit.value)) })
      ] }) }),
      /* @__PURE__ */ jsx(Field, { label: "Prix d’achat HT", htmlFor: "prixAchatHt", error: errors.prixAchatHt, children: /* @__PURE__ */ jsx(Input, { id: "prixAchatHt", type: "number", min: "0", value: form.prixAchatHt, onChange: (e) => setField("prixAchatHt", Number(e.target.value)) }) }),
      /* @__PURE__ */ jsx(Field, { label: "Prix de vente HT", htmlFor: "prixVenteHt", error: errors.prixVenteHt, children: /* @__PURE__ */ jsx(Input, { id: "prixVenteHt", type: "number", min: "0", value: form.prixVenteHt, onChange: (e) => setField("prixVenteHt", Number(e.target.value)) }) }),
      /* @__PURE__ */ jsx(Field, { label: "Taux TVA (%)", htmlFor: "tauxTva", error: errors.tauxTva, children: /* @__PURE__ */ jsx(Input, { id: "tauxTva", type: "number", min: "0", value: form.tauxTva, onChange: (e) => setField("tauxTva", Number(e.target.value)) }) }),
      /* @__PURE__ */ jsx(Field, { label: "Stock minimum", htmlFor: "stockMinimum", error: errors.stockMinimum, children: /* @__PURE__ */ jsx(Input, { id: "stockMinimum", type: "number", min: "0", value: form.stockMinimum, onChange: (e) => setField("stockMinimum", Number(e.target.value)) }) }),
      !editingProduct ? /* @__PURE__ */ jsx(Field, { label: "Stock initial", htmlFor: "stockInitial", error: errors.stockInitial, children: /* @__PURE__ */ jsx(Input, { id: "stockInitial", type: "number", min: "0", value: form.stockInitial, onChange: (e) => setField("stockInitial", Number(e.target.value)) }) }) : null,
      /* @__PURE__ */ jsx(Field, { label: "Statut", htmlFor: "statut", error: errors.statut, children: /* @__PURE__ */ jsxs(Select, { value: form.statut || "ACTIF", onValueChange: (value) => setField("statut", value), children: [
        /* @__PURE__ */ jsx(SelectTrigger, { id: "statut", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Sélectionner un statut" }) }),
        /* @__PURE__ */ jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsx(SelectItem, { value: "ACTIF", children: "Actif" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "INACTIF", children: "Inactif" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "ARCHIVE", children: "Archivé" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Field, { label: "Description", htmlFor: "description", error: errors.description, className: "md:col-span-2", children: /* @__PURE__ */ jsx(Textarea, { id: "description", value: form.description || "", onChange: (e) => setField("description", e.target.value), placeholder: "Description courte du produit" }) })
    ] }) }),
    /* @__PURE__ */ jsx(AppModal, { open: deleteModalOpen, onOpenChange: setDeleteModalOpen, title: "Confirmer la suppression", description: "Le produit sera archivé s’il peut être retiré du catalogue.", size: "sm", footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setDeleteModalOpen(false), disabled: deleting, children: "Annuler" }),
      /* @__PURE__ */ jsxs(Button, { variant: "destructive", onClick: () => void handleDelete(), disabled: deleting, children: [
        deleting ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
        "Supprimer"
      ] })
    ] }), children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Voulez-vous vraiment supprimer",
      " ",
      /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: pendingDeleteProduct?.designation }),
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
    error ? /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: error }) : null
  ] });
}
export {
  ProductsPage as component
};
