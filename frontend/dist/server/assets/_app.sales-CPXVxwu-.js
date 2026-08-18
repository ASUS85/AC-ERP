import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { ShoppingCart, Receipt, Search, Loader2, User, UserRound, Minus, Plus, Trash2, FileText, Wallet, AlertCircle } from "lucide-react";
import { P as PageHeader } from "./PageHeader-Dn6TWXax.js";
import { a as SectionCard, b as SearchableSelect, P as Pagination } from "./widgets-Cm7juWWt.js";
import { D as DataTable } from "./DataTable-kHIrPCmJ.js";
import { S as StatusBadge } from "./StatusBadge-FV-hSipZ.js";
import { A as AppModal } from "./AppModal-DFgRRIth.js";
import { I as Input, B as Button } from "./input-CtRqKLv_.js";
import { L as Label } from "./label-BsP1U0zM.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-Cg5RJprd.js";
import { f as fmtCurrency } from "./erp-data-De0hQiRg.js";
import { n as normalizeNumberInput, f as formatGroupedInputNumber } from "./number-input-96FZwFNn.js";
import { g as getClients } from "./clients.service-CofqHEFu.js";
import { g as getFactures, a as getFactureById, b as getFacturePdf } from "./factures.service-Bty_q9kc.js";
import { g as getProduits } from "./produits.service-DqmgakDn.js";
import { i as api, c as cn } from "./router-CU8xXL5-.js";
import { c as createPaiement } from "./paiements.service-B-jpirNz.js";
import { toast } from "sonner";
import { a as resolveMediaUrl } from "./avatar-Abbf1WZy.js";
import "@tanstack/react-router";
import "react-dom";
import "./dropdown-menu-284AmCSC.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-dialog";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-tabs";
import "./currency-BmQmAj7J.js";
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
  const [addPaymentModalOpen, setAddPaymentModalOpen] = useState(false);
  const [newPaymentAmount, setNewPaymentAmount] = useState("");
  const [newPaymentMode, setNewPaymentMode] = useState("ESPECES");
  const [newPaymentDate, setNewPaymentDate] = useState("");
  const [newPaymentRef, setNewPaymentRef] = useState("");
  const [newPaymentNotes, setNewPaymentNotes] = useState("");
  const [addPaymentSubmitting, setAddPaymentSubmitting] = useState(false);
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
    const paid = toNumber(paidAmount.trim());
    if (paid < 0 || paid > totals.totalTtc) {
      toast.error("Le montant payé est invalide");
      return false;
    }
    if (clientMode === "OCCASIONNEL" && paid < totals.totalTtc) {
      toast.error("Un client occasionnel doit payer l'intégralité de la facture");
      return false;
    }
    if (clientMode === "ENREGISTRE" && selectedClient) {
      const resteAPayer = totals.totalTtc - paid;
      if (resteAPayer > 0 && selectedClient.creditDisponible !== void 0 && resteAPayer > selectedClient.creditDisponible) {
        toast.error("Le plafond de crédit du client est dépassé");
        return false;
      }
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
  const handleAddPayment = async () => {
    if (!historyDetail?.id) return;
    const amount = Number(newPaymentAmount);
    if (!amount || amount <= 0) {
      toast.error("Veuillez saisir un montant valide");
      return;
    }
    const soldeDu = historyDetail.montantTtc - historyDetail.montantPaye;
    if (amount > soldeDu) {
      toast.error("Le montant dépasse le reste à payer");
      return;
    }
    setAddPaymentSubmitting(true);
    try {
      await createPaiement({
        idFacture: historyDetail.id,
        montant: amount,
        modePaiement: newPaymentMode,
        datePaiement: newPaymentDate || (/* @__PURE__ */ new Date()).toISOString(),
        referenceDocument: newPaymentRef || void 0,
        notes: newPaymentNotes || void 0
      });
      toast.success("Paiement ajouté avec succès");
      setAddPaymentModalOpen(false);
      setNewPaymentAmount("");
      setNewPaymentDate("");
      setNewPaymentRef("");
      setNewPaymentNotes("");
      void openHistoryDetail({
        id: historyDetail.id
      });
      void loadHistory();
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'ajout du paiement");
    } finally {
      setAddPaymentSubmitting(false);
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
              /* @__PURE__ */ jsx("div", { className: "mb-2 flex h-16 items-center justify-center overflow-hidden rounded-md bg-secondary/60 text-primary", children: product.photo ? /* @__PURE__ */ jsx("img", { src: resolveMediaUrl(product.photo), alt: product.designation, className: "h-full w-full rounded-md object-cover", onError: (e) => {
                e.currentTarget.style.display = "none";
              } }) : /* @__PURE__ */ jsx(ShoppingCart, { className: "h-6 w-6 opacity-70" }) }),
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
            clientMode === "ENREGISTRE" ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(SearchableSelect, { value: selectedClientId, onValueChange: setSelectedClientId, placeholder: "Sélectionner un client", searchPlaceholder: "Rechercher un client...", emptyMessage: "Aucun client trouvé", options: clients.map((client) => ({
                value: client.id,
                label: client.nom
              })) }),
              selectedClient && /* @__PURE__ */ jsxs("div", { className: "rounded border bg-muted/50 p-2 text-xs", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Plafond de crédit:" }),
                  /* @__PURE__ */ jsx("span", { className: "font-medium", children: selectedClient.plafondCredit ? fmtCurrency(Number(selectedClient.plafondCredit)) : "Non défini" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Encours actuel:" }),
                  /* @__PURE__ */ jsx("span", { className: "font-medium", children: fmtCurrency(selectedClient.encoursActuel || 0) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-t border-border mt-1 pt-1", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Crédit disponible:" }),
                  /* @__PURE__ */ jsx("span", { className: cn("font-bold", (selectedClient.creditDisponible ?? 0) > 0 ? "text-green-600 dark:text-green-400" : "text-destructive"), children: selectedClient.creditDisponible !== void 0 ? fmtCurrency(selectedClient.creditDisponible) : "N/A" })
                ] })
              ] })
            ] }) : null
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
              /* @__PURE__ */ jsx(Input, { id: "paidAmount", type: "text", inputMode: "decimal", value: formatGroupedInputNumber(fmtCurrency(totals.totalTtc), {
                allowNegative: false
              }), onChange: (event) => setPaidAmount(normalizeNumberInput(event.target.value, {
                allowNegative: false
              })), placeholder: "Montant payé" })
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
    /* @__PURE__ */ jsx(AppModal, { open: confirmOpen, onOpenChange: setConfirmOpen, title: "Confirmer la vente", description: "La facture et les mouvements de stock seront créés après validation.", size: "lg", footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-2", children: [
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
    /* @__PURE__ */ jsx(AppModal, { open: successOpen, onOpenChange: setSuccessOpen, title: "Vente facturée", description: createdInvoice?.numeroFacture || "Facture générée", size: "sm", footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setSuccessOpen(false), children: "Fermer" }),
      /* @__PURE__ */ jsx(Button, { onClick: () => void downloadInvoicePdf(), children: "Télécharger PDF" })
    ] }), children: /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "La vente a été enregistrée et la facture est disponible dans l'historique des factures." }),
      /* @__PURE__ */ jsx("p", { className: "font-semibold text-foreground", children: fmtCurrency(toNumber(createdInvoice?.totalTtc)) })
    ] }) }),
    /* @__PURE__ */ jsx(AppModal, { open: historyDetailOpen, onOpenChange: setHistoryDetailOpen, title: "Détail de la facture", description: historyDetail?.numeroFacture || "Facture", size: "xl", footer: /* @__PURE__ */ jsx("div", { className: "flex justify-end w-full", children: /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setHistoryDetailOpen(false), children: "Fermer" }) }), children: historyDetailLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : historyDetail ? /* @__PURE__ */ jsxs(Tabs, { defaultValue: "details", className: "w-full", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4 border-b border-border pb-2", children: [
        /* @__PURE__ */ jsxs(TabsList, { children: [
          /* @__PURE__ */ jsx(TabsTrigger, { value: "details", children: "Détails" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "paiements", children: "Paiements" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => void downloadHistoryDetailPdf(), disabled: !historyDetail?.id, children: [
            /* @__PURE__ */ jsx(FileText, { className: "mr-2 h-4 w-4" }),
            "Télécharger"
          ] }),
          (historyDetail.statut === "PARTIELLEMENT_PAYEE" || historyDetail.statut === "EMISE") && /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: () => setAddPaymentModalOpen(true), children: [
            /* @__PURE__ */ jsx(Wallet, { className: "mr-2 h-4 w-4" }),
            "Ajouter un paiement"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "details", children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-4 shadow-sm", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-muted-foreground mb-1", children: "Total TTC" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold", children: fmtCurrency(toNumber(historyDetail.totalTtc)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-4 shadow-sm", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-muted-foreground mb-1", children: "Montant Payé" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-green-600 dark:text-green-400", children: fmtCurrency(toNumber(historyDetail.montantPaye)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-4 shadow-sm", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-muted-foreground mb-1", children: "Reste à payer" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-destructive", children: fmtCurrency(Math.max(0, toNumber(historyDetail.totalTtc) - toNumber(historyDetail.montantPaye))) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-foreground flex items-center gap-2 border-b pb-2", children: [
              /* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-muted-foreground" }),
              "Informations Client"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-2 text-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Nom :" }),
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: historyDetail.client?.nom || "Client occasionnel" })
              ] }),
              historyDetail.client?.telephone && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Téléphone :" }),
                /* @__PURE__ */ jsx("span", { children: historyDetail.client.telephone })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-foreground flex items-center gap-2 border-b pb-2", children: [
              /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4 text-muted-foreground" }),
              "Détails Facture"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-2 text-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Statut :" }),
                /* @__PURE__ */ jsx("span", { className: "font-medium bg-muted px-2 py-0.5 rounded-md text-xs uppercase tracking-wider", children: statusLabels[historyDetail.statut] || historyDetail.statut })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Date d'émission :" }),
                /* @__PURE__ */ jsx("span", { children: formatDate(historyDetail.dateEmission) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Échéance :" }),
                /* @__PURE__ */ jsx("span", { children: formatDate(historyDetail.dateEcheance) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Mode de paiement :" }),
                /* @__PURE__ */ jsx("span", { children: historyDetail.paiements?.[0]?.modePaiement || "-" })
              ] })
            ] })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "paiements", children: historyDetail.paiements && historyDetail.paiements.length > 0 ? /* @__PURE__ */ jsx("div", { className: "rounded-md border border-border", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm text-left", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-muted text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "Date" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "Mode" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "Référence" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium text-right", children: "Montant" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border", children: historyDetail.paiements.map((p) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-muted/50 transition-colors", children: [
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: formatDate(p.datePaiement) }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary", children: p.modePaiement }) }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: p.referenceDocument || "-" }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right font-medium text-green-600 dark:text-green-400", children: fmtCurrency(toNumber(p.montant)) })
        ] }, p.id)) })
      ] }) }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed", children: [
        /* @__PURE__ */ jsx(Wallet, { className: "h-8 w-8 text-muted-foreground mb-3 opacity-50" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground", children: "Aucun paiement" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Il n'y a pas encore de paiement enregistré pour cette facture." })
      ] }) })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-center text-muted-foreground", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-8 w-8 mb-3 opacity-50" }),
      /* @__PURE__ */ jsx("p", { children: "Détail indisponible pour cette facture." })
    ] }) }),
    /* @__PURE__ */ jsx(AppModal, { open: addPaymentModalOpen, onOpenChange: setAddPaymentModalOpen, title: "Ajouter un paiement", description: "Enregistrer un nouveau paiement pour cette facture", size: "md", footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-2 w-full", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setAddPaymentModalOpen(false), disabled: addPaymentSubmitting, children: "Annuler" }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => void handleAddPayment(), disabled: addPaymentSubmitting, children: [
        addPaymentSubmitting && /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
        "Confirmer le paiement"
      ] })
    ] }), children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Montant à payer" }),
          /* @__PURE__ */ jsx(Input, { type: "text", inputMode: "decimal", value: formatGroupedInputNumber(newPaymentAmount), onChange: (e) => {
            const val = normalizeNumberInput(e.target.value);
            if (val === "" || !isNaN(Number(val))) {
              setNewPaymentAmount(val);
            }
          }, placeholder: "Montant..." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Mode de paiement" }),
          /* @__PURE__ */ jsx(SearchableSelect, { value: newPaymentMode, onValueChange: (val) => setNewPaymentMode(val), options: paymentModes, placeholder: "Mode..." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Date du paiement" }),
          /* @__PURE__ */ jsx(Input, { type: "date", value: newPaymentDate, onChange: (e) => setNewPaymentDate(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Référence" }),
          /* @__PURE__ */ jsx(Input, { value: newPaymentRef, onChange: (e) => setNewPaymentRef(e.target.value), placeholder: "N° chèque, transaction..." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { children: "Notes" }),
        /* @__PURE__ */ jsx(Input, { value: newPaymentNotes, onChange: (e) => setNewPaymentNotes(e.target.value), placeholder: "Commentaires éventuels" })
      ] })
    ] }) })
  ] });
}
export {
  SalesPage as component
};
