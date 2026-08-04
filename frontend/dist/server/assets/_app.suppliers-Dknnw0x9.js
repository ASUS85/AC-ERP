import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Truck, Package, ShoppingCart, Search, Plus, Loader2, Pencil } from "lucide-react";
import { P as PageHeader } from "./PageHeader-Dn6TWXax.js";
import { S as StatCard, a as SectionCard, P as Pagination } from "./widgets-D7zUdX-c.js";
import { D as DataTable } from "./DataTable-DjbECzDQ.js";
import { S as StatusBadge } from "./StatusBadge-BEGVHPjC.js";
import { A as AppModal } from "./AppModal-wJAPjb8X.js";
import { I as Input, B as Button } from "./input-BJ9YT8a_.js";
import { L as Label } from "./label-vV9brelZ.js";
import { toast } from "sonner";
import { g as getFournisseurs, a as getFournisseurById, u as updateFournisseur, c as createFournisseur } from "./fournisseurs.service-BgjCZjeB.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-B_m41lVb.js";
import "@tanstack/react-router";
import "./router-Dmoktl13.js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "zod";
import "axios";
import "react-dom";
import "./dropdown-menu-DOVC0oLf.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-dialog";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
const emptyForm = {
  raisonSociale: "",
  email: "",
  telephone: "",
  adresse: "",
  ville: "",
  pays: "Cameroun",
  numeroFiscal: "",
  delaiLivraisonMoyen: 7,
  conditionsPaiement: "",
  statut: "ACTIF"
};
function SuppliersPage() {
  const [fournisseurs, setFournisseurs] = useState([]);
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
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const pageSize = 10;
  const loadFournisseurs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getFournisseurs({
        page,
        limit: pageSize,
        search: search || void 0
      });
      setFournisseurs(response?.data || []);
      setMeta(response?.meta || {
        total: 0,
        page,
        limit: pageSize,
        totalPages: 1
      });
    } catch {
      toast.error("Impossible de charger les fournisseurs");
    } finally {
      setLoading(false);
    }
  }, [page, search]);
  useEffect(() => {
    void loadFournisseurs();
  }, [loadFournisseurs]);
  useEffect(() => {
    setPage(1);
  }, [search]);
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
  const stats = useMemo(() => {
    const total = meta.total;
    return {
      total,
      actifs: fournisseurs.filter((f) => f.statut === "ACTIF").length
    };
  }, [meta.total, fournisseurs]);
  const openCreateModal = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };
  const openEditModal = async (id) => {
    try {
      const response = await getFournisseurById(id);
      const f = response?.data || {};
      setEditing(f);
      setForm({
        raisonSociale: f.raisonSociale || "",
        email: f.email || "",
        telephone: f.telephone || "",
        adresse: f.adresse || "",
        ville: f.ville || "",
        pays: f.pays || "Cameroun",
        numeroFiscal: f.numeroFiscal || "",
        delaiLivraisonMoyen: f.delaiLivraisonMoyen || 7,
        conditionsPaiement: f.conditionsPaiement || "",
        statut: f.statut
      });
      setErrors({});
      setModalOpen(true);
    } catch {
      toast.error("Impossible de charger le fournisseur");
    }
  };
  const validateForm = () => {
    const next = {};
    if (!form.raisonSociale.trim()) next.raisonSociale = "La raison sociale est obligatoire";
    if (!form.email.trim()) next.email = "L'email est obligatoire";
    if (!form.telephone.trim()) next.telephone = "Le téléphone est obligatoire";
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (editing) {
        await updateFournisseur(editing.id, form);
        toast.success("Fournisseur modifie");
      } else {
        await createFournisseur(form);
        toast.success("Fournisseur ajoute");
      }
      setModalOpen(false);
      await loadFournisseurs();
    } catch (error) {
      const msg = error && typeof error === "object" && "message" in error ? error.message : "Erreur lors de l'enregistrement";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };
  const cols = [{
    key: "raisonSociale",
    header: "Fournisseur",
    render: (s) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-lg bg-warning/15 text-warning-foreground", children: /* @__PURE__ */ jsx(Truck, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground", children: s.raisonSociale }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: s.email })
      ] })
    ] })
  }, {
    key: "numeroFiscal",
    header: "N° Fiscal",
    render: (s) => s.numeroFiscal || "--/--"
  }, {
    key: "ville",
    header: "Ville",
    render: (s) => s.ville || "—"
  }, {
    key: "telephone",
    header: "Téléphone",
    render: (s) => s.telephone || "—"
  }, {
    key: "telephone",
    header: "Adresse",
    render: (s) => s.adresse || "—"
  }, {
    key: "statut",
    header: "Statut",
    align: "right",
    render: (s) => /* @__PURE__ */ jsx(StatusBadge, { status: s.statut })
  }];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Fournisseurs", description: "Coordonnées, commandes et statistiques", breadcrumb: ["Gestion commerciale", "Fournisseurs"] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Fournisseurs", value: String(meta.total), sub: "au total", icon: /* @__PURE__ */ jsx(Truck, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Actifs", value: String(stats.actifs), sub: "enregistres", icon: /* @__PURE__ */ jsx(Package, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Sur cette page", value: String(fournisseurs.length), sub: `page ${page}`, icon: /* @__PURE__ */ jsx(ShoppingCart, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Delai moyen", value: "7 j", sub: "par defaut", icon: /* @__PURE__ */ jsx(Truck, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs(SectionCard, { title: "Liste des fournisseurs", description: `${meta.total} fournisseur${meta.total > 1 ? "s" : ""}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative w-full sm:max-w-xs", children: [
          /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsx(Input, { placeholder: "Rechercher un fournisseur...", className: "h-9 pl-9", value: search, onChange: (e) => setSearch(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5 whitespace-nowrap", onClick: openCreateModal, children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
          " Ajouter un fournisseur"
        ] })
      ] }),
      loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx(Loader2, { className: "animate-spin" }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(DataTable, { columns: cols, rows: fournisseurs, rowKey: (s) => s.id, rowActions: (fournisseur) => [{
          label: "Modifier",
          icon: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }),
          onClick: () => void openEditModal(fournisseur.id)
        }] }),
        /* @__PURE__ */ jsx(Pagination, { count: meta.total, currentPage: page, totalPages: meta.totalPages, pageSize, onPageChange: setPage })
      ] })
    ] }),
    /* @__PURE__ */ jsx(AppModal, { open: modalOpen, onOpenChange: setModalOpen, title: editing ? "Modifier un fournisseur" : "Ajouter un fournisseur", description: "Renseignez les coordonnées du fournisseur.", size: "xl", footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setModalOpen(false), disabled: submitting, children: "Annuler" }),
      /* @__PURE__ */ jsxs(Button, { disabled: submitting, onClick: () => void handleSubmit(), children: [
        submitting ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
        editing ? "Enregistrer" : "Creer"
      ] })
    ] }), children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxs(Field, { label: "Raison sociale", htmlFor: "raisonSociale", error: errors.raisonSociale, children: [
        /* @__PURE__ */ jsx("span", { class: "ml-1 text-destructive", children: "*" }),
        /* @__PURE__ */ jsx(Input, { id: "raisonSociale", value: form.raisonSociale, onChange: (e) => setField("raisonSociale", e.target.value), placeholder: "Nom de l'entreprise" })
      ] }),
      /* @__PURE__ */ jsxs(Field, { label: "Email", htmlFor: "email", error: errors.email, children: [
        /* @__PURE__ */ jsx("span", { class: "ml-1 text-destructive", children: "*" }),
        /* @__PURE__ */ jsx(Input, { id: "email", type: "email", value: form.email, onChange: (e) => setField("email", e.target.value), placeholder: "contact@fournisseur.com" })
      ] }),
      /* @__PURE__ */ jsxs(Field, { label: "Telephone", htmlFor: "telephone", error: errors.telephone, children: [
        /* @__PURE__ */ jsx("span", { class: "ml-1 text-destructive", children: "*" }),
        /* @__PURE__ */ jsx(Input, { id: "telephone", value: form.telephone, onChange: (e) => setField("telephone", e.target.value), placeholder: "+237 6XX XXX XXX" })
      ] }),
      /* @__PURE__ */ jsx(Field, { label: "Ville", htmlFor: "ville", children: /* @__PURE__ */ jsx(Input, { id: "ville", value: form.ville, onChange: (e) => setField("ville", e.target.value), placeholder: "Douala" }) }),
      /* @__PURE__ */ jsx(Field, { label: "Pays", htmlFor: "pays", children: /* @__PURE__ */ jsx(Input, { id: "pays", value: form.pays, onChange: (e) => setField("pays", e.target.value), placeholder: "Cameroun" }) }),
      /* @__PURE__ */ jsx(Field, { label: "Identifiant fiscal", htmlFor: "numeroFiscal", children: /* @__PURE__ */ jsx(Input, { id: "numeroFiscal", value: form.numeroFiscal || "", onChange: (e) => setField("numeroFiscal", e.target.value), placeholder: "N° de contribuable" }) }),
      /* @__PURE__ */ jsx(Field, { label: "Delai livraison (jours)", htmlFor: "delaiLivraisonMoyen", children: /* @__PURE__ */ jsx(Input, { id: "delaiLivraisonMoyen", type: "number", min: "1", value: form.delaiLivraisonMoyen, onChange: (e) => setField("delaiLivraisonMoyen", Number(e.target.value) || 7) }) }),
      /* @__PURE__ */ jsx(Field, { label: "Statut", htmlFor: "statut", children: /* @__PURE__ */ jsxs(Select, { value: form.statut, onValueChange: (value) => setField("statut", value), children: [
        /* @__PURE__ */ jsx(SelectTrigger, { id: "statut", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Statut" }) }),
        /* @__PURE__ */ jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsx(SelectItem, { value: "ACTIF", children: "Actif" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "INACTIF", children: "Inactif" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Field, { label: "Adresse", htmlFor: "adresse", className: "md:col-span-2", children: /* @__PURE__ */ jsx(Input, { id: "adresse", value: form.adresse, onChange: (e) => setField("adresse", e.target.value), placeholder: "Rue, quartier, immeuble..." }) }),
      /* @__PURE__ */ jsx(Field, { label: "Conditions de paiement", htmlFor: "conditionsPaiement", className: "md:col-span-2", children: /* @__PURE__ */ jsx(Input, { id: "conditionsPaiement", value: form.conditionsPaiement || "", onChange: (e) => setField("conditionsPaiement", e.target.value), placeholder: "30 jours fin de mois, etc." }) })
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
  SuppliersPage as component
};
