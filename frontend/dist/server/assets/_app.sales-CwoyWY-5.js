import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { ShoppingCart, Receipt, Search, Loader2, User, UserRound, Minus, Plus, Trash2 } from "lucide-react";
import { P as PageHeader } from "./PageHeader-Dn6TWXax.js";
import { a as SectionCard, b as SearchableSelect, P as Pagination } from "./widgets-BIAbd_8_.js";
import { D as DataTable } from "./DataTable-DjdYI0L5.js";
import { S as StatusBadge } from "./StatusBadge-SHK-U26H.js";
import { A as AppModal } from "./AppModal-D5NIMQY7.js";
import { I as Input, B as Button } from "./input-CXzFZCFy.js";
import { L as Label } from "./label-V8RA7mjz.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CQEj5IEe.js";
import { f as fmtCurrency } from "./erp-data-Byxy0z8s.js";
import { n as normalizeNumberInput, f as formatGroupedInputNumber } from "./number-input-BgmEQ3sF.js";
import { g as getClients } from "./clients.service-BDqAZBtg.js";
import { g as getFactures, a as getFactureById, b as getFacturePdf } from "./factures.service-CUcxH4p-.js";
import { g as getProduits } from "./produits.service-TceHzn1I.js";
import { i as api } from "./router-qTiJlct9.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "react-dom";
import "./dropdown-menu-Cn6t4MSj.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-dialog";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-tabs";
import "./currency-BGNe4_9Y.js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "zod";
import "axios";
const createVenteDirecte = (data) => api.post("/ventes/directes", data);
const PAGE_SIZE = 10;
const paymentModes = [{
  label: "Espèces",
  value: "ESPECES"
}, {
  label: "Mobile money",
  value: "MOBILE_MONEY"
}, {
  label: "Carte",
  value: "CARTE"
}, {
  label: "Virement",
  value: "VIREMENT"
}, {
  label: "Chèque",
  value: "CHEQUE"
}, {
  label: "Compensation",
  value: "COMPENSATION"
}];
const statusLabels = {
  BROUILLON: "Brouillon",
  EMISE: "Emise",
  PARTIELLEMENT_PAYEE: "Partiellement payee",
  SOLDEE: "Soldee",
  ANNULEE: "Annulee",
  EN_RETARD: "En retard"
};
const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};
const formatDate = (value) => value ? new Date(value).toLocaleDateString("fr-FR") : "-";
const toDateOnly = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const responseData = (response) => {
  if (!response || typeof response !== "object" || !("data" in response)) {
    return [];
  }
  const data = response.data;
  return Array.isArray(data) ? data : [];
};
function lineHt(line) {
  return line.prixVenteHt * line.quantite * (1 - line.remise / 100);
}
function lineTtc(line) {
  return lineHt(line) * (1 + line.tauxTva / 100);
}
function SalesPage() {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [historyRows, setHistoryRows] = useState([]);
  const [cart, setCart] = useState([]);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [historyDate, setHistoryDate] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [clientMode, setClientMode] = useState("OCCASIONNEL");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [paymentMode, setPaymentMode] = useState("ESPECES");
  const [paidAmount, setPaidAmount] = useState("");
  const [showOccasionalInfo, setShowOccasionalInfo] = useState(false);
  const [clientOccasionnelInfo, setClientOccasionnelInfo] = useState({
    nom: "",
    prenom: "",
    sexe: "",
    numeroCni: "",
    telephone: ""
  });
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [historyDetailOpen, setHistoryDetailOpen] = useState(false);
  const [historyDetailLoading, setHistoryDetailLoading] = useState(false);
  const [historyDetail, setHistoryDetail] = useState(null);
  const cols = [{
    key: "ref",
    header: "Facture",
    render: (row) => /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: row.ref })
  }, {
    key: "client",
    header: "Client"
  }, {
    key: "date",
    header: "Date"
  }, {
    key: "montant",
    header: "Montant",
    align: "right",
    render: (row) => /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: fmtCurrency(row.montant) })
  }, {
    key: "statut",
    header: "Statut",
    align: "right",
    render: (row) => /* @__PURE__ */ jsx(StatusBadge, { status: row.statut })
  }];
  const loadProducts = async () => {
    const response = await getProduits({
      limit: 500,
      statut: "ACTIF"
    });
    setProducts(responseData(response));
  };
  const loadClients = async () => {
    const response = await getClients({
      limit: 500,
      statut: "ACTIF"
    });
    setClients(responseData(response));
  };
  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await getFactures({
        page: 1,
        limit: 1e3
      });
      const factures = responseData(response).filter((facture) => !facture.typeFacture || facture.typeFacture === "VENTE");
      setHistoryRows(factures.map((facture) => ({
        id: facture.id,
        ref: facture.numeroFacture,
        client: facture.client?.nom || "Client occasionnel",
        date: formatDate(facture.dateEmission),
        dateIso: toDateOnly(facture.dateEmission),
        montant: toNumber(facture.totalTtc),
        statut: statusLabels[facture.statut] || facture.statut,
        statutRaw: facture.statut
      })));
    } catch {
      setHistoryRows([]);
      toast.error("Impossible de charger l'historique des ventes");
    } finally {
      setHistoryLoading(false);
    }
  };
  useEffect(() => {
    setLoading(true);
    Promise.all([loadProducts(), loadClients()]).catch(() => toast.error("Impossible de charger les données de vente")).finally(() => setLoading(false));
    void loadHistory();
  }, []);
  useEffect(() => {
    setHistoryPage(1);
  }, [historySearch, historyDate]);
  useEffect(() => {
    if (clientMode === "OCCASIONNEL") setSelectedClientId("");
  }, [clientMode]);
  useEffect(() => {
    if (clientMode !== "OCCASIONNEL") {
      setShowOccasionalInfo(false);
      setClientOccasionnelInfo({
        nom: "",
        prenom: "",
        sexe: "",
        numeroCni: "",
        telephone: ""
      });
    }
  }, [clientMode]);
  const totals = useMemo(() => {
    const totalHt = cart.reduce((sum, line) => sum + lineHt(line), 0);
    const totalTtc = cart.reduce((sum, line) => sum + lineTtc(line), 0);
    return {
      totalHt,
      totalTva: totalTtc - totalHt,
      totalTtc
    };
  }, [cart]);
  useEffect(() => {
    if (!paidAmount || toNumber(paidAmount) === 0) {
      setPaidAmount(totals.totalTtc ? String(Math.round(totals.totalTtc)) : "");
    }
  }, [totals.totalTtc, paidAmount]);
  const categoryOptions = useMemo(() => [{
    value: "",
    label: "Toutes les categories"
  }, ...Array.from(new Set(products.map((product) => product.categorie?.nom || "").filter((name) => name.length > 0))).sort((a, b) => a.localeCompare(b, "fr")).map((name) => ({
    value: name,
    label: name
  }))], [products]);
  const filteredProducts = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase();
    const selectedCategory = catalogCategory;
    return products.filter((product) => {
      const categoryName = product.categorie?.nom || "";
      const categoryMatch = !selectedCategory || categoryName === selectedCategory;
      if (!categoryMatch) return false;
      if (!query) return true;
      return product.designation.toLowerCase().includes(query) || product.reference.toLowerCase().includes(query);
    });
  }, [products, catalogSearch, catalogCategory]);
  const filteredHistory = useMemo(() => {
    const query = historySearch.trim().toLowerCase();
    return historyRows.filter((row) => {
      const dateMatch = !historyDate || row.dateIso === historyDate;
      if (!dateMatch) return false;
      if (!query) return true;
      return row.ref.toLowerCase().includes(query) || row.client.toLowerCase().includes(query);
    });
  }, [historyRows, historySearch, historyDate]);
  const historyTotalPages = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));
  const paginatedHistory = filteredHistory.slice((historyPage - 1) * PAGE_SIZE, historyPage * PAGE_SIZE);
  const addProduct = (product) => {
    const stockActuel = toNumber(product.stock?.stockActuel);
    if (stockActuel <= 0) {
      toast.error("Stock indisponible pour ce produit");
      return;
    }
    setCart((current) => {
      const existing = current.find((line) => line.idProduit === product.id);
      if (existing) {
        if (existing.quantite >= existing.stockActuel) {
          toast.error("Quantité supérieure au stock disponible");
          return current;
        }
        return current.map((line) => line.idProduit === product.id ? {
          ...line,
          quantite: line.quantite + 1
        } : line);
      }
      return [...current, {
        idProduit: product.id,
        reference: product.reference,
        designation: product.designation,
        prixVenteHt: toNumber(product.prixVenteHt),
        tauxTva: toNumber(product.tauxTva),
        stockActuel,
        quantite: 1,
        remise: 0
      }];
    });
  };
  const setQuantity = (idProduit, delta) => {
    setCart((current) => current.map((line) => {
      if (line.idProduit !== idProduit) return line;
      const next = Math.max(1, Math.min(line.stockActuel, line.quantite + delta));
      return {
        ...line,
        quantite: next
      };
    }));
  };
  const removeLine = (idProduit) => setCart((current) => current.filter((line) => line.idProduit !== idProduit));
  const validateBeforeConfirm = () => {
    if (cart.length === 0) {
      toast.error("Ajoutez au moins un produit au panier");
      return false;
    }
    if (clientMode === "ENREGISTRE" && !selectedClientId) {
      toast.error("Sélectionnez un client enregistré");
      return false;
    }
    const paid = toNumber(paidAmount);
    if (paid < 0 || paid > totals.totalTtc) {
      toast.error("Le montant payé est invalide");
      return false;
    }
    return true;
  };
  const openConfirm = () => {
    if (!validateBeforeConfirm()) return;
    setConfirmOpen(true);
  };
  const hasOccasionalInfo = useMemo(() => Object.values(clientOccasionnelInfo).some((value) => String(value || "").trim().length > 0), [clientOccasionnelInfo]);
  const submitSale = async () => {
    if (!validateBeforeConfirm()) return;
    setSubmitting(true);
    try {
      const paid = toNumber(paidAmount);
      const payload = {
        typeClient: clientMode,
        idClient: clientMode === "ENREGISTRE" ? selectedClientId : null,
        clientOccasionnelInfo: clientMode === "OCCASIONNEL" && hasOccasionalInfo ? {
          nom: clientOccasionnelInfo.nom.trim() || void 0,
          prenom: clientOccasionnelInfo.prenom.trim() || void 0,
          sexe: clientOccasionnelInfo.sexe.trim() || void 0,
          numeroCni: clientOccasionnelInfo.numeroCni.trim() || void 0,
          telephone: clientOccasionnelInfo.telephone.trim() || void 0
        } : void 0,
        lignes: cart.map((line) => ({
          idProduit: line.idProduit,
          quantite: line.quantite,
          remise: line.remise,
          tauxTva: line.tauxTva
        })),
        paiement: paid > 0 ? {
          montant: paid,
          modePaiement: paymentMode,
          notes: "Paiement vente directe"
        } : void 0
      };
      const response = await createVenteDirecte(payload);
      setCreatedInvoice(response?.data || null);
      setCart([]);
      setPaidAmount("");
      setShowOccasionalInfo(false);
      setClientOccasionnelInfo({
        nom: "",
        prenom: "",
        sexe: "",
        numeroCni: "",
        telephone: ""
      });
      setConfirmOpen(false);
      setSuccessOpen(true);
      await Promise.all([loadProducts(), loadHistory()]);
      toast.success("Vente validée", {
        description: "La facture de vente a été générée."
      });
    } catch (error) {
      const message = error && typeof error === "object" && "message" in error ? String(error.message || "") : "";
      toast.error(message || "Impossible de valider la vente");
    } finally {
      setSubmitting(false);
    }
  };
  const downloadInvoicePdf = async () => {
    if (!createdInvoice?.id) return;
    try {
      const blob = await getFacturePdf(createdInvoice.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${createdInvoice.numeroFacture || "facture"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Impossible de télécharger la facture");
    }
  };
  const openHistoryDetail = async (row) => {
    setHistoryDetailOpen(true);
    setHistoryDetailLoading(true);
    try {
      const response = await getFactureById(row.id);
      setHistoryDetail(response?.data || null);
    } catch {
      setHistoryDetail(null);
      toast.error("Impossible de charger le détail de la facture");
    } finally {
      setHistoryDetailLoading(false);
    }
  };
  const downloadHistoryDetailPdf = async () => {
    if (!historyDetail?.id) return;
    try {
      const blob = await getFacturePdf(historyDetail.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${historyDetail.numeroFacture || "facture"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Impossible de télécharger la facture");
    }
  };
  const selectedClient = clients.find((client) => client.id === selectedClientId);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Ventes", description: "Création de ventes directes, panier et facturation", breadcrumb: ["Transactions", "Ventes"] }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "new", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "mb-4", children: [
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "new", className: "gap-1.5", children: [
          /* @__PURE__ */ jsx(ShoppingCart, { className: "h-4 w-4" }),
          " Nouvelle vente"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "list", className: "gap-1.5", children: [
          /* @__PURE__ */ jsx(Receipt, { className: "h-4 w-4" }),
          " Historique"
        ] })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "new", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxs(SectionCard, { title: "Catalogue", description: "Cliquez pour ajouter au panier", className: "lg:col-span-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative w-full", children: [
              /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
              /* @__PURE__ */ jsx(Input, { placeholder: "Rechercher un produit...", className: "pl-9", value: catalogSearch, onChange: (event) => setCatalogSearch(event.target.value) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "w-full max-w-xs", children: /* @__PURE__ */ jsx(SearchableSelect, { value: catalogCategory, onValueChange: setCatalogCategory, options: categoryOptions, placeholder: "Trier par categorie", searchPlaceholder: "Rechercher une categorie", emptyMessage: "Aucune categorie" }) })
          ] }),
          loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3", children: filteredProducts.slice(0, 18).map((product) => {
            const stock = toNumber(product.stock?.stockActuel);
            return /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => addProduct(product), className: "group rounded-lg border border-border p-3 text-left transition-all hover:border-primary/40 hover:shadow-card", children: [
              /* @__PURE__ */ jsx("div", { className: "mb-2 flex h-16 items-center justify-center rounded-md bg-secondary/60 text-primary", children: product.photo ? /* @__PURE__ */ jsx("img", { src: product.photo, alt: product.designation, className: "h-full w-full rounded-md object-cover" }) : /* @__PURE__ */ jsx(ShoppingCart, { className: "h-6 w-6 opacity-70" }) }),
              /* @__PURE__ */ jsx("p", { className: "line-clamp-1 text-sm font-medium text-foreground", children: product.designation }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                product.reference,
                " · Stock ",
                stock
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-primary", children: fmtCurrency(toNumber(product.prixVenteHt)) })
            ] }, product.id);
          }) })
        ] }),
        /* @__PURE__ */ jsxs(SectionCard, { title: "Panier", description: `${cart.length} article(s)`, children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-4 space-y-3 rounded-lg border border-border p-3", children: [
            /* @__PURE__ */ jsx(Label, { children: "Client" }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxs(Button, { type: "button", variant: clientMode === "OCCASIONNEL" ? "default" : "outline", className: "gap-1.5", onClick: () => setClientMode("OCCASIONNEL"), children: [
                /* @__PURE__ */ jsx(User, { className: "h-4 w-4" }),
                " Occasionnel"
              ] }),
              /* @__PURE__ */ jsxs(Button, { type: "button", variant: clientMode === "ENREGISTRE" ? "default" : "outline", className: "gap-1.5", onClick: () => setClientMode("ENREGISTRE"), children: [
                /* @__PURE__ */ jsx(UserRound, { className: "h-4 w-4" }),
                " Enregistré"
              ] })
            ] }),
            clientMode === "ENREGISTRE" ? /* @__PURE__ */ jsx(SearchableSelect, { value: selectedClientId, onValueChange: setSelectedClientId, placeholder: "Sélectionner un client", searchPlaceholder: "Rechercher un client...", emptyMessage: "Aucun client trouvé", options: clients.map((client) => ({
              value: client.id,
              label: client.nom
            })) }) : null
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            cart.map((line) => /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-border p-2.5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-medium text-foreground", children: line.designation }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  fmtCurrency(line.prixVenteHt),
                  " · TVA ",
                  line.tauxTva,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", className: "h-6 w-6", onClick: () => setQuantity(line.idProduit, -1), children: /* @__PURE__ */ jsx(Minus, { className: "h-3 w-3" }) }),
                /* @__PURE__ */ jsx("span", { className: "w-7 text-center text-sm font-medium", children: line.quantite }),
                /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", className: "h-6 w-6", onClick: () => setQuantity(line.idProduit, 1), children: /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" }) })
              ] }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => removeLine(line.idProduit), className: "text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
            ] }) }, line.idProduit)),
            cart.length === 0 ? /* @__PURE__ */ jsx("p", { className: "rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground", children: "Aucun article dans le panier." }) : null
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-2 border-t border-border pt-4 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
              /* @__PURE__ */ jsx("span", { children: "Total HT" }),
              /* @__PURE__ */ jsx("span", { children: fmtCurrency(totals.totalHt) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
              /* @__PURE__ */ jsx("span", { children: "TVA" }),
              /* @__PURE__ */ jsx("span", { children: fmtCurrency(totals.totalTva) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-base font-bold text-foreground", children: [
              /* @__PURE__ */ jsx("span", { children: "Total TTC" }),
              /* @__PURE__ */ jsx("span", { children: fmtCurrency(totals.totalTtc) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { children: "Mode de paiement" }),
              /* @__PURE__ */ jsx(SearchableSelect, { value: paymentMode, onValueChange: (value) => setPaymentMode(value), options: paymentModes, placeholder: "Mode de paiement", searchPlaceholder: "Rechercher un mode...", emptyMessage: "Aucun mode trouvé" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "paidAmount", children: "Montant payé" }),
              /* @__PURE__ */ jsx(Input, { id: "paidAmount", type: "text", inputMode: "decimal", value: formatGroupedInputNumber(paidAmount), onChange: (event) => setPaidAmount(normalizeNumberInput(event.target.value)) })
            ] }),
            clientMode === "OCCASIONNEL" ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", className: "w-full", onClick: () => setShowOccasionalInfo((prev) => !prev), children: showOccasionalInfo ? "Masquer les infos personnelles" : "Ajouter des infos personnelles" }),
              showOccasionalInfo ? /* @__PURE__ */ jsxs("div", { className: "space-y-2 rounded-lg border border-border p-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-2 sm:grid-cols-2", children: [
                  /* @__PURE__ */ jsx(Input, { placeholder: "Nom", value: clientOccasionnelInfo.nom, onChange: (event) => setClientOccasionnelInfo((prev) => ({
                    ...prev,
                    nom: event.target.value
                  })) }),
                  /* @__PURE__ */ jsx(Input, { placeholder: "Prénom", value: clientOccasionnelInfo.prenom, onChange: (event) => setClientOccasionnelInfo((prev) => ({
                    ...prev,
                    prenom: event.target.value
                  })) })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-2 sm:grid-cols-1", children: /* @__PURE__ */ jsx(Input, { placeholder: "Numéro de CNI", value: clientOccasionnelInfo.numeroCni, onChange: (event) => setClientOccasionnelInfo((prev) => ({
                  ...prev,
                  numeroCni: event.target.value
                })) }) }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-2 sm:grid-cols-2", children: [
                  /* @__PURE__ */ jsx(Input, { placeholder: "Sexe", value: clientOccasionnelInfo.sexe, onChange: (event) => setClientOccasionnelInfo((prev) => ({
                    ...prev,
                    sexe: event.target.value
                  })) }),
                  /* @__PURE__ */ jsx(Input, { placeholder: "Numéro de téléphone", value: clientOccasionnelInfo.telephone, onChange: (event) => setClientOccasionnelInfo((prev) => ({
                    ...prev,
                    telephone: event.target.value
                  })) })
                ] })
              ] }) : null
            ] }) : null
          ] }),
          /* @__PURE__ */ jsx(Button, { className: "mt-4 w-full", onClick: openConfirm, children: "Valider & facturer" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "list", children: /* @__PURE__ */ jsxs(SectionCard, { title: "Historique des ventes", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-sm", children: [
            /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
            /* @__PURE__ */ jsx(Input, { placeholder: "Rechercher une facture...", className: "pl-9", value: historySearch, onChange: (event) => setHistorySearch(event.target.value) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "w-full max-w-xs", children: /* @__PURE__ */ jsx(Input, { type: "date", value: historyDate, onChange: (event) => setHistoryDate(event.target.value) }) })
        ] }),
        historyLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(DataTable, { columns: cols, rows: paginatedHistory, rowKey: (row) => row.id, withActions: false, onRowClick: (row) => {
            void openHistoryDetail(row);
          } }),
          /* @__PURE__ */ jsx(Pagination, { count: filteredHistory.length, currentPage: historyPage, totalPages: historyTotalPages, pageSize: PAGE_SIZE, onPageChange: setHistoryPage })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(AppModal, { open: confirmOpen, onOpenChange: setConfirmOpen, title: "Confirmer la vente", description: "La facture et les mouvements de stock seront créés après validation.", size: "lg", footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setConfirmOpen(false), disabled: submitting, children: "Annuler" }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => void submitSale(), disabled: submitting, children: [
        submitting ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
        "Valider la vente"
      ] })
    ] }), children: /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border p-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase text-muted-foreground", children: "Client" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 font-medium text-foreground", children: clientMode === "ENREGISTRE" ? selectedClient?.nom || "Client enregistré" : "Client occasionnel" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: cart.map((line) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 rounded-lg border border-border p-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "truncate font-medium text-foreground", children: line.designation }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            line.quantite,
            " x ",
            fmtCurrency(line.prixVenteHt)
          ] })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: fmtCurrency(lineTtc(line)) })
      ] }, line.idProduit)) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1 border-t border-border pt-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { children: "Total HT" }),
          /* @__PURE__ */ jsx("span", { children: fmtCurrency(totals.totalHt) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { children: "TVA" }),
          /* @__PURE__ */ jsx("span", { children: fmtCurrency(totals.totalTva) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-base font-bold text-foreground", children: [
          /* @__PURE__ */ jsx("span", { children: "Total TTC" }),
          /* @__PURE__ */ jsx("span", { children: fmtCurrency(totals.totalTtc) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { children: "Montant payé" }),
          /* @__PURE__ */ jsx("span", { children: fmtCurrency(toNumber(paidAmount)) })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AppModal, { open: successOpen, onOpenChange: setSuccessOpen, title: "Vente facturée", description: createdInvoice?.numeroFacture || "Facture générée", size: "sm", footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setSuccessOpen(false), children: "Fermer" }),
      /* @__PURE__ */ jsx(Button, { onClick: () => void downloadInvoicePdf(), children: "Télécharger PDF" })
    ] }), children: /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "La vente a été enregistrée et la facture est disponible dans l'historique des factures." }),
      /* @__PURE__ */ jsx("p", { className: "font-semibold text-foreground", children: fmtCurrency(toNumber(createdInvoice?.totalTtc)) })
    ] }) }),
    /* @__PURE__ */ jsx(AppModal, { open: historyDetailOpen, onOpenChange: setHistoryDetailOpen, title: "Détail de la facture", description: historyDetail?.numeroFacture || "Facture", size: "lg", footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setHistoryDetailOpen(false), children: "Fermer" }),
      /* @__PURE__ */ jsx(Button, { onClick: () => void downloadHistoryDetailPdf(), disabled: !historyDetail?.id, children: "Télécharger la facture" })
    ] }), children: historyDetailLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : historyDetail ? /* @__PURE__ */ jsx("div", { className: "space-y-3 text-sm", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-2 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Client :" }),
        " ",
        historyDetail.client?.nom || "Client occasionnel"
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Statut :" }),
        " ",
        statusLabels[historyDetail.statut] || historyDetail.statut
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Date émission :" }),
        " ",
        formatDate(historyDetail.dateEmission)
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Date échéance :" }),
        " ",
        formatDate(historyDetail.dateEcheance)
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Total HT :" }),
        " ",
        fmtCurrency(toNumber(historyDetail.totalHt))
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "TVA :" }),
        " ",
        fmtCurrency(toNumber(historyDetail.totalTva))
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Total TTC :" }),
        " ",
        fmtCurrency(toNumber(historyDetail.totalTtc))
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Montant payé :" }),
        " ",
        fmtCurrency(toNumber(historyDetail.montantPaye))
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Reste à payer :" }),
        " ",
        fmtCurrency(Math.max(0, toNumber(historyDetail.totalTtc) - toNumber(historyDetail.montantPaye)))
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Mode paiement :" }),
        " ",
        historyDetail.paiements?.[0]?.modePaiement || "-"
      ] })
    ] }) }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Détail indisponible pour cette facture." }) })
  ] });
}
export {
  SalesPage as component
};
