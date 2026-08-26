import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { Loader2, Eye, Package, Pencil, Trash2, RefreshCw, Download } from "lucide-react";
import { P as PageHeader } from "./PageHeader-D6EtHCBB.js";
import { S as StatCard, a as SectionCard, T as Toolbar, P as Pagination, b as SearchableSelect } from "./widgets-VrwHyJZb.js";
import { D as DataTable } from "./DataTable-B46euxbY.js";
import { S as StatusBadge } from "./StatusBadge-C8cTjTMX.js";
import { A as AppModal } from "./AppModal-C69IBz2_.js";
import { B as Button, I as Input } from "./input-B0E-1hwS.js";
import { L as Label } from "./label-JW23xmF-.js";
import { T as Textarea } from "./textarea-BWVwaDWu.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-OAv68Gn2.js";
import { toast } from "sonner";
import { f as fmtCurrency, a as fmtNumber } from "./erp-data-lC_Sts2J.js";
import { u as useProductsStore, g as getProduitsPdf, a as uploadProduitPhoto, b as updateProduit, c as createProduit, d as archiveProduit } from "./products.store--7hNed_p.js";
import { n as normalizeNumberInput, f as formatGroupedInputNumber } from "./number-input-96FZwFNn.js";
import { a as resolveMediaUrl } from "./avatar-Abbf1WZy.js";
import { u as useCategoriesStore } from "./categories.store-BM6rVbej.js";
import "@tanstack/react-router";
import "./router-B5GAJ1jr.js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "zod";
import "zustand";
import "axios";
import "react-dom";
import "./dropdown-menu-BWhuKXK1.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-dialog";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "./currency-BmQmAj7J.js";
const emptyForm = {
  reference: "",
  designation: "",
  photo: "",
  description: "",
  uniteMesure: "",
  prixAchatHt: "",
  prixVenteHt: "",
  tauxTva: "",
  stockMinimum: "",
  stockInitial: "",
  idCategorie: "",
  statut: ""
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const pageSize = 40;
  const fetchCategories = useCategoriesStore((state) => state.fetchList);
  const fetchProducts = useProductsStore((state) => state.fetchList);
  const invalidateProducts = useProductsStore((state) => state.invalidate);
  const loadCategories = async () => {
    const response = await fetchCategories({
      limit: 500,
      statut: "ACTIF"
    });
    setCategories(responseData(response));
  };
  const loadProducts = async (force = false) => {
    setLoading(true);
    try {
      const response = await fetchProducts({
        page,
        limit: pageSize,
        search: search.trim() || void 0,
        categorieId: categoryFilter === "all" ? void 0 : categoryFilter
      }, force);
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
  }, [fetchCategories]);
  useEffect(() => {
    void loadProducts();
  }, [fetchProducts, page, search, categoryFilter]);
  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter]);
  const refreshProducts = async () => {
    setRefreshing(true);
    try {
      await loadProducts(true);
      toast.success("Catalogue actualisé");
    } finally {
      setRefreshing(false);
    }
  };
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
      photo: product.photo || "",
      description: product.description || "",
      uniteMesure: product.uniteMesure || "",
      prixAchatHt: Number(product.prixAchatHt || ""),
      prixVenteHt: Number(product.prixVenteHt || ""),
      tauxTva: Number(product.tauxTva || ""),
      stockMinimum: Number(product.stockMinimum || ""),
      idCategorie: product.idCategorie || product.categorie?.id || "",
      statut: product.statut || ""
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
    if (Number(form.tauxTva) <= 0) nextErrors.tauxTva = "La TVA est obligatoire";
    if (Number(form.prixAchatHt) < 0) nextErrors.prixAchatHt = "Le prix d’achat doit être positif";
    if (Number(form.prixVenteHt) <= 0) nextErrors.prixVenteHt = "Le prix de vente est obligatoire";
    if (Number(form.tauxTva || 0) < 0) nextErrors.tauxTva = "La TVA doit être positive";
    if (Number(form.stockMinimum || 0) < 0) nextErrors.stockMinimum = "Le stock minimum doit être positif";
    if (Number(form.stockMinimum) <= 0) nextErrors.stockMinimum = "Le stock minimum est obligatoire";
    if (!editingProduct && Number(form.stockInitial || 0) < 0) nextErrors.stockInitial = "Le stock initial doit être positif";
    if (!form.statut) nextErrors.statut = "Le statut est obligatoire";
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
        photo: form.photo?.trim() || void 0,
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
      invalidateProducts();
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
      invalidateProducts();
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
  const handlePhotoUpload = async (file) => {
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const response = await uploadProduitPhoto(file);
      const uploadedPhoto = response?.data?.photo || "";
      if (!uploadedPhoto) {
        toast.error("Aucune URL image renvoyée");
        return;
      }
      setField("photo", uploadedPhoto);
      toast.success("Image importée");
    } catch {
      toast.error("Import image impossible");
    } finally {
      setUploadingPhoto(false);
    }
  };
  const openPreview = async () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewLoading(true);
    try {
      const response = await getProduitsPdf({
        search: search.trim() || void 0,
        categorieId: categoryFilter === "all" ? void 0 : categoryFilter
      });
      const blob = response;
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewOpen(true);
    } catch {
      toast.error("Impossible de generer l'apercu PDF");
    } finally {
      setPreviewLoading(false);
    }
  };
  const cols = [{
    key: "designation",
    header: "Produit",
    align: "left",
    render: (product) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary", children: product.photo ? /* @__PURE__ */ jsx("img", { src: resolveMediaUrl(product.photo), alt: product.designation, className: "h-full w-full rounded-lg object-cover", onError: (e) => {
        e.currentTarget.style.display = "none";
      } }) : /* @__PURE__ */ jsx(Package, { className: "h-4 w-4" }) }),
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
    /* @__PURE__ */ jsx(PageHeader, { title: "Produits", description: "Catalogue et gestion des articles", breadcrumb: ["Gestion commerciale", "Produits"], actions: /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: () => void openPreview(), disabled: previewLoading, children: [
      previewLoading ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }),
      "Apercu"
    ] }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Total produits", value: String(stats.total), sub: "en catalogue", icon: /* @__PURE__ */ jsx(Package, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Actifs", value: String(stats.actifs), sub: "sur cette page", icon: /* @__PURE__ */ jsx(Package, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Stock faible", value: String(stats.stockFaible), sub: "à réapprovisionner", icon: /* @__PURE__ */ jsx(Package, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Ruptures", value: String(stats.ruptures), sub: "indisponibles", icon: /* @__PURE__ */ jsx(Package, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs(SectionCard, { title: "Catalogue produits", description: `${meta.total} produit${meta.total > 1 ? "s" : ""}`, action: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: () => void refreshProducts(), disabled: refreshing, children: [
      /* @__PURE__ */ jsx(RefreshCw, { className: refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4" }),
      "Actualiser"
    ] }), children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(Toolbar, { placeholder: "Rechercher un produit…", addLabel: "Ajouter un produit", searchValue: search, onSearchChange: setSearch, filterOptions, selectedFilter: categoryFilter, onFilterChange: setCategoryFilter, filterPlaceholder: "Toutes les catégories", filterSearchPlaceholder: "Rechercher une catégorie…", onAdd: openCreateModal }) }),
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
    /* @__PURE__ */ jsx(AppModal, { open: modalOpen, onOpenChange: setModalOpen, title: editingProduct ? "Modifier un produit" : "Ajouter un produit", description: "Renseignez les informations du catalogue.", size: "xl", footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setModalOpen(false), disabled: submitting, children: "Annuler" }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => void handleSubmit(), disabled: submitting, children: [
        submitting ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
        editingProduct ? "Enregistrer" : "Créer"
      ] })
    ] }), children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
      /* @__PURE__ */ jsx(Field, { label: "Référence", htmlFor: "reference", error: errors.reference, children: /* @__PURE__ */ jsx(Input, { id: "reference", value: form.reference || "", onChange: (e) => setField("reference", e.target.value), placeholder: "Automatique si vide" }) }),
      /* @__PURE__ */ jsxs(Field, { label: "Désignation", htmlFor: "designation", error: errors.designation, children: [
        /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" }),
        /* @__PURE__ */ jsx(Input, { id: "designation", value: form.designation, onChange: (e) => setField("designation", e.target.value), placeholder: "Nom du produit" })
      ] }),
      /* @__PURE__ */ jsx(Field, { label: "Image produit", htmlFor: "photo", error: errors.photo, children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Input, { id: "photo", type: "file", accept: "image/png,image/jpeg,image/webp", onChange: (e) => void handlePhotoUpload(e.target.files?.[0]) }),
        uploadingPhoto ? /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Import en cours..." }) : null,
        form.photo ? /* @__PURE__ */ jsx("div", { className: "rounded-md border border-border p-2", children: /* @__PURE__ */ jsx("img", { src: resolveMediaUrl(form.photo), alt: "Aperçu produit", className: "h-24 w-24 rounded object-cover", onError: (e) => {
          e.currentTarget.style.display = "none";
        } }) }) : null
      ] }) }),
      /* @__PURE__ */ jsxs(Field, { label: "Catégorie", htmlFor: "categorie", error: errors.idCategorie, children: [
        /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" }),
        /* @__PURE__ */ jsx(SearchableSelect, { value: form.idCategorie, onValueChange: (value) => setField("idCategorie", value), placeholder: "Sélectionner une catégorie", searchPlaceholder: "Rechercher une catégorie...", emptyMessage: "Aucune catégorie trouvée", options: categories.map((cat) => ({
          value: cat.id,
          label: cat.nom
        })) })
      ] }),
      /* @__PURE__ */ jsxs(Field, { label: "Unité", htmlFor: "uniteMesure", error: errors.uniteMesure, children: [
        /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" }),
        /* @__PURE__ */ jsx(SearchableSelect, { value: form.uniteMesure, onValueChange: (value) => setField("uniteMesure", value), placeholder: "Sélectionner une unité", searchPlaceholder: "Rechercher une unité...", emptyMessage: "Aucune unité trouvée", options: units.map((unit) => ({
          value: unit.value,
          label: unit.label
        })) })
      ] }),
      /* @__PURE__ */ jsx(Field, { label: "Prix d’achat HT", htmlFor: "prixAchatHt", error: errors.prixAchatHt, children: /* @__PURE__ */ jsx(Input, { id: "prixAchatHt", type: "text", inputMode: "decimal", value: formatGroupedInputNumber(String(form.prixAchatHt || ""), {
        allowNegative: false
      }), onChange: (e) => setField("prixAchatHt", normalizeNumberInput(e.target.value, {
        allowNegative: false
      })), placeholder: "Entrez un prix de d'achat" }) }),
      /* @__PURE__ */ jsxs(Field, { label: "Prix de vente HT", htmlFor: "prixVenteHt", error: errors.prixVenteHt, children: [
        /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" }),
        /* @__PURE__ */ jsx(Input, { id: "prixVenteHt", type: "text", inputMode: "decimal", value: formatGroupedInputNumber(String(form.prixVenteHt || ""), {
          allowNegative: false
        }), onChange: (e) => setField("prixVenteHt", normalizeNumberInput(e.target.value, {
          allowNegative: false
        })), placeholder: "Entrez un prix de vente" })
      ] }),
      /* @__PURE__ */ jsxs(Field, { label: "Taux TVA (%)", htmlFor: "tauxTva", error: errors.tauxTva, children: [
        /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" }),
        /* @__PURE__ */ jsx(Input, { id: "tauxTva", type: "text", inputMode: "decimal", value: formatGroupedInputNumber(String(form.tauxTva ?? ""), {
          allowNegative: false
        }), onChange: (e) => setField("tauxTva", normalizeNumberInput(e.target.value, {
          allowNegative: false
        })), placeholder: "Entrez la TVA (%)" })
      ] }),
      /* @__PURE__ */ jsxs(Field, { label: "Stock minimum", htmlFor: "stockMinimum", error: errors.stockMinimum, children: [
        /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" }),
        /* @__PURE__ */ jsx(Input, { id: "stockMinimum", type: "text", inputMode: "decimal", value: formatGroupedInputNumber(String(form.stockMinimum || ""), {
          allowNegative: false
        }), onChange: (e) => setField("stockMinimum", normalizeNumberInput(e.target.value, {
          allowNegative: false
        })), placeholder: "Entrez le stock minimum" })
      ] }),
      !editingProduct ? /* @__PURE__ */ jsx(Field, { label: "Stock initial", htmlFor: "stockInitial", error: errors.stockInitial, children: /* @__PURE__ */ jsx(Input, { id: "stockInitial", type: "text", inputMode: "decimal", value: formatGroupedInputNumber(String(form.stockInitial || ""), {
        allowNegative: false
      }), onChange: (e) => setField("stockInitial", normalizeNumberInput(e.target.value, {
        allowNegative: false
      })), placeholder: "Entrez le stock initial" }) }) : null,
      /* @__PURE__ */ jsxs(Field, { label: "Statut", htmlFor: "statut", error: errors.statut, children: [
        /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" }),
        /* @__PURE__ */ jsxs(Select, { value: form.statut || "", onValueChange: (value) => setField("statut", value), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { id: "statut", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Sélectionner un statut" }) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "ACTIF", children: "Actif" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "INACTIF", children: "Inactif" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "ARCHIVE", children: "Archivé" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Field, { label: "Description", htmlFor: "description", error: errors.description, className: "md:col-span-2", children: /* @__PURE__ */ jsx(Textarea, { id: "description", value: form.description || "", onChange: (e) => setField("description", e.target.value), placeholder: "Description courte du produit" }) })
    ] }) }),
    /* @__PURE__ */ jsx(AppModal, { open: previewOpen, onOpenChange: (open) => {
      if (!open && previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewOpen(open);
    }, title: "Apercu PDF", description: "Catalogue des produits tel qu'il sera exporte", position: "center", size: "xxl", footer: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewOpen(false);
      }, children: "Fermer" }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => {
        if (!previewUrl) return;
        const link = document.createElement("a");
        link.href = previewUrl;
        link.download = `produits-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("PDF telecharge");
      }, children: [
        /* @__PURE__ */ jsx(Download, { className: "mr-2 h-4 w-4" }),
        "Telecharger"
      ] })
    ] }), children: previewUrl ? /* @__PURE__ */ jsx("iframe", { src: previewUrl, className: "h-[70vh] w-full rounded-lg border border-border", title: "Apercu PDF produits" }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center py-12 text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
      "Generation du PDF..."
    ] }) }),
    /* @__PURE__ */ jsx(AppModal, { open: deleteModalOpen, onOpenChange: setDeleteModalOpen, title: "Confirmer la suppression", description: "Le produit sera archivé s’il peut être retiré du catalogue.", size: "sm", footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-2", children: [
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
