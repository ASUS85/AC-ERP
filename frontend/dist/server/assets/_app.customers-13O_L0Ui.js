import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Loader2, Eye, Download, Users, Contact, Wallet, Search, Pencil, Trash2 } from "lucide-react";
import { P as PageHeader } from "./PageHeader-CfvoM4wf.js";
import { S as StatCard, a as SectionCard, b as SearchableSelect, P as Pagination } from "./widgets-Ck1AWi1R.js";
import { D as DataTable } from "./DataTable-uUNeH66y.js";
import { S as StatusBadge } from "./StatusBadge-aGU9ynBu.js";
import { A as AppModal } from "./AppModal-Bs0MJktd.js";
import { B as Button, I as Input } from "./input-BW84Prfz.js";
import { L as Label } from "./label-CTI7cUD5.js";
import { toast } from "sonner";
import { f as fmtCurrency } from "./erp-data-lC_Sts2J.js";
import { u as useClientsStore, g as getClientsPdf, a as updateClient, c as createClient, d as deleteClient } from "./clients.store-BB8i7p-f.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-RqZqtBSe.js";
import { n as normalizeNumberInput, f as formatGroupedInputNumber } from "./number-input-96FZwFNn.js";
import "@tanstack/react-router";
import "./router-DTrY5jCH.js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "zod";
import "zustand";
import "axios";
import "react-dom";
import "./dropdown-menu-DWDXYsmo.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-dialog";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "./currency-BmQmAj7J.js";
import "@radix-ui/react-select";
const initials = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const cols = [{
  key: "nom",
  header: "Client",
  render: (c) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary", children: initials(c.nom) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "font-medium", children: c.nom }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: c.email })
    ] })
  ] })
}, {
  key: "ville",
  header: "Ville"
}, {
  key: "telephone",
  header: "Téléphone"
}, {
  key: "plafondCredit",
  header: "Crédit",
  align: "right",
  render: (c) => fmtCurrency(Number(c.plafondCredit || 0))
}, {
  key: "statut",
  header: "Statut",
  align: "right",
  render: (c) => /* @__PURE__ */ jsx(StatusBadge, { status: c.statut })
}];
function CustomersPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [pendingDeleteClient, setPendingDeleteClient] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [exportingPreview, setExportingPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState({});
  const fetchClients = useClientsStore((state) => state.fetchList);
  const invalidateClients = useClientsStore((state) => state.invalidate);
  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchClients({
        page,
        limit: 10,
        search: search || void 0,
        statut: statusFilter === "all" ? void 0 : statusFilter,
        ville: cityFilter === "all" ? void 0 : cityFilter
      });
      setClients(response?.data || []);
      setMeta(response?.meta ? {
        page: response.meta.page ?? page,
        limit: response.meta.limit ?? 10,
        total: response.meta.total ?? 0,
        totalPages: response.meta.totalPages ?? 1
      } : {
        page,
        limit: 10,
        total: 0,
        totalPages: 1
      });
    } catch {
      toast.error("Impossible de charger les clients");
    } finally {
      setLoading(false);
    }
  }, [fetchClients, page, search, statusFilter, cityFilter]);
  useEffect(() => {
    void loadClients();
  }, [loadClients]);
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, cityFilter]);
  const stats = useMemo(() => {
    const total = meta.total;
    const actifs = clients.filter((c) => c.statut === "ACTIF").length;
    const inactifs = clients.filter((c) => c.statut === "INACTIF").length;
    const encours = clients.reduce((sum, c) => sum + Number(c.plafondCredit || 0), 0);
    return {
      total,
      actifs,
      inactifs,
      encours
    };
  }, [clients, meta]);
  const uniqueCities = useMemo(() => {
    const cities = new Set(clients.map((c) => c.ville).filter(Boolean));
    return Array.from(cities).sort();
  }, [clients]);
  const validateForm = () => {
    const nextErrors = {};
    if (!form.nom.trim()) nextErrors.nom = "Le nom est obligatoire";
    if (!form.email.trim()) nextErrors.email = "L'email est obligatoire";
    if (!form.telephone.trim()) nextErrors.telephone = "Le téléphone est obligatoire";
    if (!form.ville.trim()) nextErrors.ville = "La ville est obligatoire";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };
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
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (editingClient) {
        await updateClient(editingClient.id, form);
        toast.success("Client modifié");
      } else {
        await createClient(form);
        toast.success("Client ajouté");
      }
      invalidateClients();
      setModalOpen(false);
      await loadClients();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };
  const openDeleteModal = (client) => {
    setPendingDeleteClient(client);
    setDeleteModalOpen(true);
  };
  const handleDelete = async () => {
    if (!pendingDeleteClient) return;
    setDeleting(true);
    try {
      await deleteClient(pendingDeleteClient.id);
      invalidateClients();
      toast.success("Client supprimé");
      setDeleteModalOpen(false);
      setPendingDeleteClient(null);
      await loadClients();
    } catch {
      toast.error("Suppression impossible");
    } finally {
      setDeleting(false);
    }
  };
  const emptyForm = {
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    ville: "",
    pays: "Cameroun",
    type: "ENTREPRISE",
    plafondCredit: 0,
    delaiPaiement: 0,
    modePaiementDefaut: "VIREMENT",
    statut: "ACTIF"
  };
  const [form, setForm] = useState(emptyForm);
  const openPreview = async () => {
    setPreviewLoading(true);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    try {
      const response = await getClientsPdf({
        search: search || void 0,
        statut: statusFilter === "all" ? void 0 : statusFilter,
        ville: cityFilter === "all" ? void 0 : cityFilter
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
  const exportClients = async () => {
    setExporting(true);
    try {
      const response = await getClientsPdf({
        search: search || void 0,
        statut: statusFilter === "all" ? void 0 : statusFilter,
        ville: cityFilter === "all" ? void 0 : cityFilter
      });
      const blob = response;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `clients-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Liste des clients exportée en PDF");
    } catch {
      toast.error("Export PDF impossible");
    } finally {
      setExporting(false);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Clients", description: "Fiches, soldes et historique d'achats", breadcrumb: ["Gestion commerciale", "Clients"], actions: /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: () => void openPreview(), disabled: previewLoading, children: [
        previewLoading ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }),
        "Apercu"
      ] }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: () => void exportClients(), disabled: exporting, children: [
        exporting ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
        "Exporter"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Clients", value: String(meta.total), sub: "au total", icon: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Actifs", value: String(stats.actifs), sub: "sur cette page", icon: /* @__PURE__ */ jsx(Contact, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Encours total", value: fmtCurrency(stats.encours), sub: "plafonds cumulés", icon: /* @__PURE__ */ jsx(Wallet, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Inactifs", value: String(stats.inactifs), sub: "sur cette page", icon: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs(SectionCard, { title: "Liste des clients", description: `${meta.total} client${meta.total > 1 ? "s" : ""}`, children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative w-full sm:max-w-xs", children: [
          /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsx(Input, { placeholder: "Rechercher un client...", className: "h-9 pl-9", value: search, onChange: (e) => setSearch(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(SearchableSelect, { value: statusFilter, onValueChange: setStatusFilter, options: [{
            label: "Tous les statuts",
            value: "all"
          }, {
            label: "Actifs",
            value: "ACTIF"
          }, {
            label: "Inactifs",
            value: "INACTIF"
          }], placeholder: "Tous les statuts", searchPlaceholder: "Chercher un statut...", emptyMessage: "Aucun statut trouvé", className: "w-[180px]" }),
          /* @__PURE__ */ jsx(SearchableSelect, { value: cityFilter, onValueChange: setCityFilter, options: [{
            label: "Toutes les villes",
            value: "all"
          }, ...uniqueCities.map((city) => ({
            label: city,
            value: city
          }))], placeholder: "Toutes les villes", searchPlaceholder: "Chercher une ville...", emptyMessage: "Aucune ville trouvée", className: "w-[180px]" }),
          /* @__PURE__ */ jsx(Button, { size: "sm", className: "gap-1.5 whitespace-nowrap", onClick: () => {
            setEditingClient(null);
            setForm(emptyForm);
            setErrors({});
            setModalOpen(true);
          }, children: "Ajouter un client" })
        ] })
      ] }) }),
      loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx(Loader2, { className: "animate-spin" }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(DataTable, { columns: cols, rows: clients, rowKey: (c) => c.id, rowActions: (client) => [{
          label: "Modifier",
          icon: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }),
          onClick: () => {
            setEditingClient(client);
            setForm({
              nom: client.nom || "",
              email: client.email || "",
              telephone: client.telephone || "",
              adresse: client.adresse || "",
              ville: client.ville || "",
              pays: client.pays || "Cameroun",
              type: client.type,
              plafondCredit: Number(client.plafondCredit || 0),
              delaiPaiement: client.delaiPaiement || 0,
              modePaiementDefaut: client.modePaiementDefaut || "VIREMENT",
              statut: client.statut
            });
            setModalOpen(true);
          }
        }, {
          label: "Supprimer",
          icon: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
          destructive: true,
          onClick: () => openDeleteModal(client)
        }] }),
        /* @__PURE__ */ jsx(Pagination, { count: meta.total, currentPage: page, totalPages: meta.totalPages, pageSize: 10, onPageChange: setPage })
      ] })
    ] }),
    /* @__PURE__ */ jsx(AppModal, { open: modalOpen, onOpenChange: setModalOpen, title: editingClient ? "Modifier un client" : "Ajouter un client", description: "Renseignez les informations du client.", size: "xl", footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setModalOpen(false), disabled: submitting, children: "Annuler" }),
      /* @__PURE__ */ jsxs(Button, { disabled: submitting, onClick: () => void handleSubmit(), children: [
        submitting ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
        editingClient ? "Enregistrer" : "Créer"
      ] })
    ] }), children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs(Field, { label: "Nom", htmlFor: "nom", error: errors.nom, children: [
        /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" }),
        /* @__PURE__ */ jsx(Input, { id: "nom", value: form.nom, onChange: (e) => setField("nom", e.target.value), placeholder: "Nom du client" })
      ] }),
      /* @__PURE__ */ jsxs(Field, { label: "Email", htmlFor: "email", error: errors.email, children: [
        /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" }),
        /* @__PURE__ */ jsx(Input, { id: "email", type: "email", value: form.email, onChange: (e) => setField("email", e.target.value), placeholder: "email@exemple.com" })
      ] }),
      /* @__PURE__ */ jsxs(Field, { label: "Téléphone", htmlFor: "telephone", error: errors.telephone, children: [
        /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" }),
        /* @__PURE__ */ jsx(Input, { id: "telephone", value: form.telephone, onChange: (e) => setField("telephone", e.target.value), placeholder: "+237 6XX XXX XXX" })
      ] }),
      /* @__PURE__ */ jsxs(Field, { label: "Ville", htmlFor: "ville", error: errors.ville, children: [
        /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" }),
        /* @__PURE__ */ jsx(Input, { id: "ville", value: form.ville, onChange: (e) => setField("ville", e.target.value), placeholder: "Douala" })
      ] }),
      /* @__PURE__ */ jsx(Field, { label: "Type", htmlFor: "type", error: errors.type, children: /* @__PURE__ */ jsxs(Select, { value: form.type || "", onValueChange: (value) => setField("type", value), children: [
        /* @__PURE__ */ jsx(SelectTrigger, { id: "type", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Sélectionner un type" }) }),
        /* @__PURE__ */ jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsx(SelectItem, { value: "PARTICULIER", children: "Particulier" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "ENTREPRISE", children: "Entreprise" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Field, { label: "Statut", htmlFor: "statut", error: errors.statut, children: /* @__PURE__ */ jsxs(Select, { value: form.statut || "", onValueChange: (value) => setField("statut", value), children: [
        /* @__PURE__ */ jsx(SelectTrigger, { id: "statut", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Sélectionner un statut" }) }),
        /* @__PURE__ */ jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsx(SelectItem, { value: "ACTIF", children: "Actif" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "INACTIF", children: "Inactif" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Field, { label: "Pays", htmlFor: "pays", error: errors.pays, children: /* @__PURE__ */ jsx(Input, { id: "pays", value: form.pays || "", onChange: (e) => setField("pays", e.target.value), placeholder: "Cameroun" }) }),
      /* @__PURE__ */ jsx(Field, { label: "Mode de paiement défaut", htmlFor: "modePaiement", error: errors.modePaiementDefaut, children: /* @__PURE__ */ jsxs(Select, { value: form.modePaiementDefaut || "", onValueChange: (value) => setField("modePaiementDefaut", value), children: [
        /* @__PURE__ */ jsx(SelectTrigger, { id: "modePaiement", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Sélectionner un mode" }) }),
        /* @__PURE__ */ jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsx(SelectItem, { value: "ESPECES", children: "Espèces" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "CHEQUE", children: "Chèque" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "VIREMENT", children: "Virement" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "MOBILE_MONEY", children: "Mobile Money" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Field, { label: "Plafond crédit", htmlFor: "plafond", error: errors.plafondCredit, children: /* @__PURE__ */ jsx(Input, { id: "plafond", type: "text", inputMode: "decimal", value: formatGroupedInputNumber(String(form.plafondCredit || ""), {
        allowNegative: false
      }), onChange: (e) => setField("plafondCredit", normalizeNumberInput(e.target.value, {
        allowNegative: false
      })), placeholder: "Plafond crédit" }) }),
      /* @__PURE__ */ jsx(Field, { label: "Délai paiement (jours)", htmlFor: "delai", error: errors.delaiPaiement, children: /* @__PURE__ */ jsx(Input, { id: "delai", type: "text", inputMode: "decimal", value: formatGroupedInputNumber(String(form.delaiPaiement || ""), {
        allowNegative: false
      }), onChange: (e) => setField("delaiPaiement", Number(normalizeNumberInput(e.target.value, {
        allowNegative: false
      }))), placeholder: "30" }) }),
      /* @__PURE__ */ jsx(Field, { label: "Adresse", htmlFor: "adresse", error: errors.adresse, children: /* @__PURE__ */ jsx(Input, { id: "adresse", value: form.adresse || "", onChange: (e) => setField("adresse", e.target.value), placeholder: "Rue, quartier, immeuble..." }) })
    ] }) }),
    /* @__PURE__ */ jsx(AppModal, { open: previewOpen, onOpenChange: (open) => {
      if (!open && previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewOpen(open);
    }, title: "Apercu PDF", description: "Visualisation du document tel qu'il sera exporte", position: "center", size: "xxl", footer: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewOpen(false);
      }, children: "Fermer" }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => {
        if (!previewUrl) return;
        const link = document.createElement("a");
        link.href = previewUrl;
        link.download = `clients-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("PDF telecharge");
      }, children: [
        /* @__PURE__ */ jsx(Download, { className: "mr-2 h-4 w-4" }),
        "Telecharger"
      ] })
    ] }), children: previewUrl ? /* @__PURE__ */ jsx("iframe", { src: previewUrl, className: "h-[70vh] w-full rounded-lg border border-border", title: "Apercu PDF clients" }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center py-12 text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
      "Generation du PDF..."
    ] }) }),
    /* @__PURE__ */ jsx(AppModal, { open: deleteModalOpen, onOpenChange: setDeleteModalOpen, title: "Confirmer la suppression", description: "Le client sera supprimé définitivement.", size: "sm", footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setDeleteModalOpen(false), disabled: deleting, children: "Annuler" }),
      /* @__PURE__ */ jsxs(Button, { variant: "destructive", onClick: () => void handleDelete(), disabled: deleting, children: [
        deleting ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
        "Supprimer"
      ] })
    ] }), children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Voulez-vous vraiment supprimer",
      " ",
      /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: pendingDeleteClient?.nom }),
      "?"
    ] }) })
  ] });
}
function Field({
  label,
  htmlFor,
  error,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsx(Label, { htmlFor, children: label }),
    children,
    error && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: error })
  ] });
}
export {
  CustomersPage as component
};
