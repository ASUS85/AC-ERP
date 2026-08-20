import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useCallback, useEffect, useMemo } from "react";
import { ArrowDownToLine, ClipboardList, Warehouse, ArrowUpFromLine, AlertTriangle, Loader2, Eye, RefreshCw, CheckCircle2, Ban, Save, XCircle, AlertCircle } from "lucide-react";
import { P as PageHeader } from "./PageHeader-CfvoM4wf.js";
import { S as StatCard, a as SectionCard, b as SearchableSelect, P as Pagination } from "./widgets-Ck1AWi1R.js";
import { D as DataTable } from "./DataTable-uUNeH66y.js";
import { S as StatusBadge } from "./StatusBadge-aGU9ynBu.js";
import { A as AppModal } from "./AppModal-Bs0MJktd.js";
import { B as Button, I as Input } from "./input-BW84Prfz.js";
import { L as Label } from "./label-CTI7cUD5.js";
import { T as Textarea } from "./textarea-DsDdW-E7.js";
import { i as api, c as cn } from "./router-DTrY5jCH.js";
import { toast } from "sonner";
import { f as fmtCurrency, a as fmtNumber } from "./erp-data-lC_Sts2J.js";
import { n as normalizeNumberInput, f as formatGroupedInputNumber } from "./number-input-96FZwFNn.js";
import { u as useProductsStore } from "./products.store-OYz1kzkz.js";
import "@tanstack/react-router";
import "react-dom";
import "./dropdown-menu-DWDXYsmo.js";
import "@radix-ui/react-dropdown-menu";
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
import "./currency-BmQmAj7J.js";
const getStocks = (params) => api.get("/stocks", { params });
const getAlertes = () => api.get("/stocks/alertes");
const getMouvements = (params) => api.get("/stocks/mouvements", { params });
const ajusterStock = (data) => api.post("/stocks/ajustement", data);
const enregistrerComptageInventaire = (id, lignes) => api.patch(`/stocks/inventaires/${id}/comptage`, { lignes });
const rafraichirInventaire = (id) => api.post(`/stocks/inventaires/${id}/rafraichir`);
const annulerInventaire = (id) => api.post(`/stocks/inventaires/${id}/annuler`);
const validerInventaire = (id) => api.post(`/stocks/inventaires/${id}/valider`);
const typeStyle = {
  ENTREE_ACHAT: "text-success",
  SORTIE_VENTE: "text-info",
  AJUSTEMENT_POS: "text-success",
  AJUSTEMENT_NEG: "text-destructive",
  RETOUR_CLIENT: "text-success",
  RETOUR_FOURNISSEUR: "text-warning"
};
const typeLabels = {
  ENTREE_ACHAT: "Entrée achat",
  SORTIE_VENTE: "Sortie vente",
  AJUSTEMENT_POS: "Ajustement +",
  AJUSTEMENT_NEG: "Ajustement -",
  RETOUR_CLIENT: "Retour client",
  RETOUR_FOURNISSEUR: "Retour fourn."
};
const PAGE_SIZE = 10;
function InventoryPage() {
  const [stocks, setStocks] = useState([]);
  const [mouvements, setMouvements] = useState([]);
  const [alertes, setAlertes] = useState([]);
  const [inventaires, setInventaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState("stocks");
  const [skPage, setSkPage] = useState(1);
  const [skMeta, setSkMeta] = useState({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1
  });
  const [mvPage, setMvPage] = useState(1);
  const [mvMeta, setMvMeta] = useState({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1
  });
  const [invPage, setInvPage] = useState(1);
  const [invMeta, setInvMeta] = useState({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1
  });
  const [search, setSearch] = useState("");
  const [searchStock, setSearchStock] = useState("");
  const [stockCategorie, setStockCategorie] = useState("");
  const [mouvementDate, setMouvementDate] = useState("");
  const [inventaireDateCreation, setInventaireDateCreation] = useState("");
  const [inventaireDateValidation, setInventaireDateValidation] = useState("");
  const [adjModalOpen, setAdjModalOpen] = useState(false);
  const [adjForm, setAdjForm] = useState({
    idProduit: "",
    quantite: 0,
    motif: ""
  });
  const [adjSubmitting, setAdjSubmitting] = useState(false);
  const [invDetailOpen, setInvDetailOpen] = useState(false);
  const [invDetail, setInvDetail] = useState(null);
  const [invSubmitting, setInvSubmitting] = useState(false);
  const [invPendingAction, setInvPendingAction] = useState(null);
  const [adjProduits, setAdjProduits] = useState([]);
  const fetchProducts = useProductsStore((state) => state.fetchList);
  const loadAll = useCallback(async (force = false) => {
    setLoading(true);
    try {
      const [skRes, mvRes, alRes, invRes, prodRes] = await Promise.allSettled([getStocks({
        page: skPage,
        limit: PAGE_SIZE
      }), getMouvements({
        page: mvPage,
        limit: PAGE_SIZE,
        search: search || void 0,
        date: mouvementDate || void 0
      }), getAlertes(), (async () => {
        const {
          default: api2
        } = await import("./router-DTrY5jCH.js").then((n) => n.q);
        return api2.get("/stocks/inventaires");
      })(), fetchProducts({
        limit: 1e3,
        statut: "ACTIF"
      }, force)]);
      const stockData = skRes.status === "fulfilled" ? skRes.value : null;
      const movementData = mvRes.status === "fulfilled" ? mvRes.value : null;
      const alertData = alRes.status === "fulfilled" ? alRes.value : null;
      const inventaireData = invRes.status === "fulfilled" ? invRes.value : null;
      const productData = prodRes.status === "fulfilled" ? prodRes.value : null;
      setStocks(stockData?.data || []);
      setSkMeta(stockData?.meta || {
        total: 0,
        page: skPage,
        limit: PAGE_SIZE,
        totalPages: 1
      });
      setMouvements(movementData?.data || []);
      setMvMeta(movementData?.meta || {
        total: 0,
        page: mvPage,
        limit: PAGE_SIZE,
        totalPages: 1
      });
      setAlertes(alertData?.data || []);
      setInventaires(inventaireData?.data || []);
      setInvMeta({
        total: (inventaireData?.data || []).length,
        page: 1,
        limit: 1e4,
        totalPages: 1
      });
      const produitsRaw = productData?.data || [];
      setAdjProduits(produitsRaw.map((p) => ({
        id: p.id,
        label: `${p.designation} (${p.reference}) - stock: ${p.stock?.stockActuel ?? 0}`
      })));
    } catch {
      setStocks([]);
      setMouvements([]);
      setAlertes([]);
      setInventaires([]);
      setAdjProduits([]);
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, skPage, mvPage, search, mouvementDate]);
  useEffect(() => {
    void loadAll();
  }, [loadAll]);
  useEffect(() => {
    setMvPage(1);
  }, [search]);
  useEffect(() => {
    setMvPage(1);
  }, [mouvementDate]);
  useEffect(() => {
    setSkPage(1);
  }, [searchStock, stockCategorie]);
  useEffect(() => {
    setInvPage(1);
  }, [inventaireDateCreation, inventaireDateValidation]);
  const stats = useMemo(() => {
    const valeur = stocks.reduce((s, st) => s + Number(st.produit.prixVenteHt || 0) * st.stockActuel, 0);
    return {
      valeur,
      alertesCount: alertes.length
    };
  }, [stocks, alertes]);
  const handleAjustement = async () => {
    if (!adjForm.idProduit || adjForm.quantite === 0) {
      toast.error("Selectionnez un produit et une quantite");
      return;
    }
    setAdjSubmitting(true);
    try {
      await ajusterStock(adjForm);
      toast.success("Stock ajuste");
      setAdjModalOpen(false);
      setAdjForm({
        idProduit: "",
        quantite: 0,
        motif: ""
      });
      await loadAll();
    } catch (error) {
      const msg = error && typeof error === "object" && "message" in error ? error.message : "Erreur lors de l'ajustement";
      toast.error(msg);
    } finally {
      setAdjSubmitting(false);
    }
  };
  const openInvDetail = async (id) => {
    try {
      const {
        default: api2
      } = await import("./router-DTrY5jCH.js").then((n) => n.q);
      const res = await api2.get(`/stocks/inventaires/${id}`);
      const detail = res?.data || null;
      if (!detail) {
        toast.error("Inventaire introuvable");
        return;
      }
      setInvDetail(detail);
      setInvDetailOpen(true);
    } catch {
      toast.error("Impossible de charger l'inventaire");
    }
  };
  const updatePhysicalCount = (lineId, value) => {
    const stockReel = value.trim() ? Math.max(0, Math.trunc(Number(normalizeNumberInput(value)) || 0)) : null;
    setInvDetail((current) => current ? {
      ...current,
      lignes: current.lignes?.map((line) => line.id === lineId ? {
        ...line,
        stockReel
      } : line)
    } : current);
  };
  const updateInventoryDetail = (response) => {
    const data = response?.data;
    if (data) setInvDetail(data);
    return data;
  };
  const savePhysicalCounts = async () => {
    if (!invDetail) return;
    const lignes = (invDetail.lignes || []).filter((line) => line.stockReel !== null && line.stockReel !== void 0).map((line) => ({
      id: line.id,
      stockReel: Number(line.stockReel)
    }));
    if (!lignes.length) {
      toast.error("Saisissez au moins un stock physique avant d'enregistrer");
      return;
    }
    setInvSubmitting(true);
    try {
      const response = await enregistrerComptageInventaire(invDetail.id, lignes);
      updateInventoryDetail(response);
      toast.success("Comptage physique enregistré");
      await loadAll();
    } catch (error) {
      const message = error && typeof error === "object" && "message" in error ? String(error.message) : "Impossible d'enregistrer le comptage";
      toast.error(message);
    } finally {
      setInvSubmitting(false);
    }
  };
  const validateInventory = async () => {
    if (!invDetail) return;
    if ((invDetail.lignes || []).some((line) => line.stockReel == null)) {
      toast.error("Renseignez le stock physique de chaque ligne avant validation");
      return;
    }
    setInvSubmitting(true);
    try {
      await validerInventaire(invDetail.id);
      toast.success("Inventaire validé et écarts appliqués au stock");
      setInvDetailOpen(false);
      await loadAll();
    } catch (error) {
      const message = error && typeof error === "object" && "message" in error ? String(error.message) : "Erreur lors de la validation";
      toast.error(message);
    } finally {
      setInvSubmitting(false);
    }
  };
  const confirmInventoryAction = async () => {
    if (!invDetail || !invPendingAction) return;
    setInvSubmitting(true);
    try {
      const response = invPendingAction === "rafraichir" ? await rafraichirInventaire(invDetail.id) : await annulerInventaire(invDetail.id);
      const updated = updateInventoryDetail(response);
      setInvPendingAction(null);
      if (updated?.statut === "ANNULE") setInvDetailOpen(false);
      toast.success(updated?.statut === "ANNULE" ? "Inventaire annulé sans modification du stock" : "Snapshot théorique actualisé");
      await loadAll();
    } catch (error) {
      const message = error && typeof error === "object" && "message" in error ? String(error.message) : "Opération impossible";
      toast.error(message);
    } finally {
      setInvSubmitting(false);
    }
  };
  const filteredStocks = useMemo(() => {
    const q = searchStock.trim().toLowerCase();
    return stocks.filter((s) => {
      const categorie = s.produit.categorie?.nom || "";
      const categoryMatch = !stockCategorie || categorie === stockCategorie;
      const searchMatch = !q || s.produit.designation.toLowerCase().includes(q) || s.produit.reference.toLowerCase().includes(q);
      return categoryMatch && searchMatch;
    });
  }, [stocks, searchStock, stockCategorie]);
  const categoriesOptions = useMemo(() => [{
    value: "",
    label: "Toutes les categories"
  }, ...Array.from(new Set(stocks.map((s) => s.produit.categorie?.nom || "").filter((c) => c.length > 0))).sort((a, b) => a.localeCompare(b, "fr")).map((c) => ({
    value: c,
    label: c
  }))], [stocks]);
  const toDateOnly = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const filteredInventaires = useMemo(() => inventaires.filter((inv) => {
    const dateCreation = toDateOnly(inv.dateDebut);
    const dateValidation = toDateOnly(inv.dateFin);
    const creationMatch = !inventaireDateCreation || dateCreation === inventaireDateCreation;
    const validationMatch = !inventaireDateValidation || dateValidation && dateValidation === inventaireDateValidation;
    return creationMatch && validationMatch;
  }), [inventaires, inventaireDateCreation, inventaireDateValidation]);
  const filteredMouvements = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mouvements;
    return mouvements.filter((m) => m.produit.designation.toLowerCase().includes(q) || m.produit.reference.toLowerCase().includes(q));
  }, [mouvements, search]);
  const stockCols = [{
    key: "produit",
    header: "Produit",
    render: (s) => /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground", children: s.produit.designation }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: s.produit.reference })
    ] })
  }, {
    key: "categorie",
    header: "Categorie",
    render: (s) => s.produit.categorie?.nom || "—"
  }, {
    key: "stockActuel",
    header: "Stock",
    align: "right",
    render: (s) => /* @__PURE__ */ jsx("span", { className: "font-medium", children: fmtNumber(s.stockActuel) })
  }, {
    key: "stockReserve",
    header: "Reserve",
    align: "right",
    render: (s) => fmtNumber(s.stockReserve)
  }, {
    key: "stockMinimum",
    header: "Minimum",
    align: "right",
    render: (s) => fmtNumber(s.produit.stockMinimum)
  }, {
    key: "statut",
    header: "Statut",
    align: "right",
    render: (s) => {
      const dispo = s.stockActuel - s.stockReserve;
      if (dispo <= 0) return /* @__PURE__ */ jsx(StatusBadge, { status: "CRITIQUE" });
      if (dispo <= s.produit.stockMinimum) return /* @__PURE__ */ jsx(StatusBadge, { status: "VIGILANCE" });
      return /* @__PURE__ */ jsx(StatusBadge, { status: "ACTIF" });
    }
  }];
  const mvCols = [{
    key: "produit",
    header: "Produit",
    render: (m) => /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground", children: m.produit.designation }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: m.produit.reference })
    ] })
  }, {
    key: "typeMouvement",
    header: "Type",
    render: (m) => /* @__PURE__ */ jsx("span", { className: cn("font-medium", typeStyle[m.typeMouvement] || ""), children: typeLabels[m.typeMouvement] || m.typeMouvement })
  }, {
    key: "quantite",
    header: "Quantite",
    align: "right",
    render: (m) => /* @__PURE__ */ jsxs("span", { className: cn("font-medium", m.typeMouvement.includes("POS") || m.typeMouvement.includes("ENTREE") || m.typeMouvement.includes("RETOUR_CLIENT") ? "text-success" : "text-destructive"), children: [
      m.typeMouvement.includes("POS") || m.typeMouvement.includes("ENTREE") || m.typeMouvement.includes("RETOUR_CLIENT") ? "+" : "−",
      fmtNumber(m.quantite)
    ] })
  }, {
    key: "stockApres",
    header: "Stock final",
    align: "right",
    render: (m) => /* @__PURE__ */ jsx("span", { className: "text-foreground", children: fmtNumber(m.stockApres) })
  }, {
    key: "motif",
    header: "Motif",
    render: (m) => m.motif || "—"
  }, {
    key: "createdAt",
    header: "Date",
    align: "right",
    render: (m) => new Date(m.createdAt).toLocaleDateString("fr-FR")
  }];
  const invCols = [{
    key: "id",
    header: "N°",
    render: (i) => /* @__PURE__ */ jsxs("span", { className: "font-medium text-foreground", children: [
      "#",
      i.id.slice(0, 8)
    ] })
  }, {
    key: "statut",
    header: "Statut",
    render: (i) => /* @__PURE__ */ jsx(StatusBadge, { status: i.statut === "EN_COURS" ? "EN_ATTENTE" : i.statut === "VALIDE" ? "ACTIF" : "INACTIF" })
  }, {
    key: "dateDebut",
    header: "Date creation",
    render: (i) => new Date(i.dateDebut).toLocaleDateString("fr-FR")
  }, {
    key: "dateFin",
    header: "Date validation",
    render: (i) => i.dateFin ? new Date(i.dateFin).toLocaleDateString("fr-FR") : "—"
  }, {
    key: "createur",
    header: "Initialisé par",
    render: (i) => i.createur ? `${i.createur.prenom} ${i.createur.nom}`.trim() : "--/--"
  }, {
    key: "validateur",
    header: "Validé par",
    render: (i) => i.validateur ? `${i.validateur.prenom} ${i.validateur.nom}`.trim() : "--/--"
  }, {
    key: "lignes",
    header: "Lignes",
    align: "right",
    render: (i) => fmtNumber(i.lignes?.length || 0)
  }];
  const renderAlerteIcon = (stockDisponible, stockMinimum) => {
    if (stockDisponible <= 0) return /* @__PURE__ */ jsx(XCircle, { className: "h-5 w-5 text-destructive" });
    if (stockDisponible <= stockMinimum / 2) return /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5 text-warning" });
    return /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5 text-info" });
  };
  const renderAlerteSeverity = (stockDisponible, stockMinimum) => {
    if (stockDisponible <= 0) return "CRITIQUE";
    if (stockDisponible <= stockMinimum / 2) return "VIGILANCE";
    return "OK";
  };
  const totalInvPages = Math.max(1, Math.ceil(filteredInventaires.length / PAGE_SIZE));
  const paginatedInventaires = filteredInventaires.slice((invPage - 1) * PAGE_SIZE, invPage * PAGE_SIZE);
  const totalSkPages = Math.max(1, Math.ceil(filteredStocks.length / PAGE_SIZE));
  const paginatedStocks = useMemo(() => filteredStocks.slice((skPage - 1) * PAGE_SIZE, skPage * PAGE_SIZE), [filteredStocks, skPage]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Gestion des stocks", description: "Vue globale, mouvements et alertes de rupture", breadcrumb: ["Gestion commerciale", "Stocks"], actions: /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: () => setAdjModalOpen(true), children: [
        /* @__PURE__ */ jsx(ArrowDownToLine, { className: "h-4 w-4" }),
        " Ajustement"
      ] }),
      /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5", onClick: async () => {
        try {
          const {
            default: api2
          } = await import("./router-DTrY5jCH.js").then((n) => n.q);
          await api2.post("/stocks/inventaires");
          toast.success("Inventaire cree");
          await loadAll();
        } catch {
          toast.error("Erreur lors de la creation");
        }
      }, children: [
        /* @__PURE__ */ jsx(ClipboardList, { className: "h-4 w-4" }),
        " Inventaire"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Valeur du stock", value: fmtCurrency(stats.valeur), sub: "prix de vente", icon: /* @__PURE__ */ jsx(Warehouse, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Produits en stock", value: String(skMeta.total), sub: "au total", icon: /* @__PURE__ */ jsx(Warehouse, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Mouvements", value: String(mvMeta.total), sub: "au total", icon: /* @__PURE__ */ jsx(ArrowUpFromLine, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Alertes", value: String(stats.alertesCount), sub: "produits critiques", icon: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxs(SectionCard, { title: tab === "stocks" ? "Stock actuel" : tab === "mouvements" ? "Mouvements de stock" : "Inventaires physiques", description: tab === "stocks" ? `${skMeta.total} produit${skMeta.total > 1 ? "s" : ""}` : tab === "mouvements" ? `${mvMeta.total} mouvement${mvMeta.total > 1 ? "s" : ""}` : `${invMeta.total} inventaire${invMeta.total > 1 ? "s" : ""}`, className: "lg:col-span-3", action: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: () => void refreshStocks(), disabled: refreshing || loading, children: [
        /* @__PURE__ */ jsx(RefreshCw, { className: refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4" }),
        "Actualiser"
      ] }), children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex w-full max-w-xl  items-center gap-2", children: [
            tab !== "inventaires" ? /* @__PURE__ */ jsx("div", { className: "relative w-full max-w-xs", children: /* @__PURE__ */ jsx("input", { placeholder: tab === "stocks" ? "Rechercher un produit..." : "Rechercher un mouvement...", className: "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 pl-8 text-sm shadow-sm outline-none focus:ring-2 focus:ring-ring", value: tab === "stocks" ? searchStock : search, onChange: (e) => {
              if (tab === "stocks") {
                setSearchStock(e.target.value);
              } else {
                setSearch(e.target.value);
              }
            } }) }) : null,
            tab === "stocks" ? /* @__PURE__ */ jsx("div", { className: "w-full max-w-xs", children: /* @__PURE__ */ jsx(SearchableSelect, { value: stockCategorie, onValueChange: setStockCategorie, options: categoriesOptions, placeholder: "Trier par categorie", searchPlaceholder: "Rechercher une categorie", emptyMessage: "Aucune categorie" }) }) : null,
            tab === "mouvements" ? /* @__PURE__ */ jsx("div", { className: "w-full max-w-xs space-y-1", children: /* @__PURE__ */ jsx(Input, { id: "mv-date-filter", type: "date", value: mouvementDate, onChange: (e) => setMouvementDate(e.target.value) }) }) : null,
            tab === "inventaires" ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("div", { className: "w-full max-w-xs space-y-1", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "inv-date-creation-filter", className: "text-xs text-muted-foreground", children: "Date creation" }),
                /* @__PURE__ */ jsx(Input, { id: "inv-date-creation-filter", type: "date", value: inventaireDateCreation, onChange: (e) => setInventaireDateCreation(e.target.value) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "w-full max-w-xs space-y-1", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "inv-date-validation-filter", className: "text-xs text-muted-foreground", children: "Date validation" }),
                /* @__PURE__ */ jsx(Input, { id: "inv-date-validation-filter", type: "date", value: inventaireDateValidation, onChange: (e) => setInventaireDateValidation(e.target.value) })
              ] })
            ] }) : null
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-1 rounded-lg border border-border p-0.5", children: ["stocks", "mouvements", "inventaires"].map((t) => /* @__PURE__ */ jsx("button", { onClick: () => {
            setTab(t);
            if (t === "stocks") setSkPage(1);
            if (t === "mouvements") setMvPage(1);
            if (t === "inventaires") setInvPage(1);
          }, className: cn("rounded-md px-3 py-1.5 text-xs font-medium transition-colors", tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"), children: t === "stocks" ? "Stocks" : t === "mouvements" ? "Mouvements" : "Inventaires" }, t)) })
        ] }),
        loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx(Loader2, { className: "animate-spin" }) }) : tab === "stocks" ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(DataTable, { columns: stockCols, rows: paginatedStocks, rowKey: (s) => s.id, withActions: false }),
          /* @__PURE__ */ jsx(Pagination, { count: filteredStocks.length, currentPage: skPage, totalPages: totalSkPages, pageSize: PAGE_SIZE, onPageChange: setSkPage })
        ] }) : tab === "mouvements" ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(DataTable, { columns: mvCols, rows: filteredMouvements, rowKey: (m) => m.id, withActions: false }),
          /* @__PURE__ */ jsx(Pagination, { count: search ? filteredMouvements.length : mvMeta.total, currentPage: mvPage, totalPages: search ? Math.max(1, Math.ceil(filteredMouvements.length / PAGE_SIZE)) : mvMeta.totalPages, pageSize: PAGE_SIZE, onPageChange: setMvPage })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(DataTable, { columns: invCols, rows: paginatedInventaires, rowKey: (i) => i.id, rowActions: (inv) => [{
            label: "Voir details",
            icon: /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }),
            onClick: () => void openInvDetail(inv.id)
          }] }),
          /* @__PURE__ */ jsx(Pagination, { count: filteredInventaires.length, currentPage: invPage, totalPages: totalInvPages, pageSize: PAGE_SIZE, onPageChange: setInvPage })
        ] })
      ] }),
      /* @__PURE__ */ jsx(SectionCard, { title: "Alertes de rupture", description: `${alertes.length} produit${alertes.length > 1 ? "s" : ""} sous seuil`, children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: alertes.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-6 text-center", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "mb-2 h-8 w-8 text-success" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Aucune alerte" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground/70", children: "Tous les stocks sont a un niveau satisfaisant." })
      ] }) : alertes.map((a) => (() => {
        const stockDisponible = a.stockActuel - a.stockReserve;
        return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-lg border border-border p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "mt-0.5 shrink-0", children: renderAlerteIcon(stockDisponible, a.produit.stockMinimum) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground", children: a.produit.designation }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Ref. ",
              a.produit.reference,
              " · Min.",
              " ",
              a.produit.stockMinimum
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1.5 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-foreground", children: fmtNumber(stockDisponible) }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "disponible" }),
              /* @__PURE__ */ jsx(StatusBadge, { status: renderAlerteSeverity(stockDisponible, a.produit.stockMinimum) })
            ] })
          ] })
        ] }, a.id);
      })()) }) })
    ] }),
    /* @__PURE__ */ jsx(AppModal, { open: adjModalOpen, onOpenChange: setAdjModalOpen, title: "Ajustement de stock", description: "Entrez une quantite positive ou negative.", size: "lg", footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setAdjModalOpen(false), disabled: adjSubmitting, children: "Annuler" }),
      /* @__PURE__ */ jsxs(Button, { disabled: adjSubmitting, onClick: () => void handleAjustement(), children: [
        adjSubmitting ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
        " ",
        "Ajuster"
      ] })
    ] }), children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { children: "Produit" }),
        /* @__PURE__ */ jsx(SearchableSelect, { value: adjForm.idProduit, onValueChange: (idProduit) => setAdjForm((prev) => ({
          ...prev,
          idProduit
        })), options: adjProduits.map((p) => ({
          value: p.id,
          label: p.label
        })), placeholder: "Selectionnez un produit", searchPlaceholder: "Rechercher un produit", emptyMessage: "Aucun produit trouve" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "adj-qte", children: "Quantite" }),
        /* @__PURE__ */ jsx(Input, { id: "adj-qte", type: "text", inputMode: "decimal", value: formatGroupedInputNumber(String(adjForm.quantite || "")), onChange: (e) => setAdjForm((p) => ({
          ...p,
          quantite: Number(normalizeNumberInput(e.target.value))
        })), placeholder: "Positif = entree, negatif = sortie" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "adj-motif", children: "Motif" }),
        /* @__PURE__ */ jsx(Textarea, { id: "adj-motif", value: adjForm.motif, onChange: (e) => setAdjForm((p) => ({
          ...p,
          motif: e.target.value
        })), placeholder: "Raison de l'ajustement" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AppModal, { open: invDetailOpen, onOpenChange: setInvDetailOpen, title: "Detail de l'inventaire", description: invDetail ? `Cree le ${new Date(invDetail.dateDebut).toLocaleDateString("fr-FR")}` : "", size: "xl", footer: invDetail?.statut === "EN_COURS" ? /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setInvDetailOpen(false), children: "Fermer" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap justify-end gap-2", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: () => setInvPendingAction("annuler"), disabled: invSubmitting, children: [
          /* @__PURE__ */ jsx(Ban, { className: "mr-1.5 h-4 w-4" }),
          " Annuler"
        ] }),
        /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: () => setInvPendingAction("rafraichir"), disabled: invSubmitting, children: [
          /* @__PURE__ */ jsx(RefreshCw, { className: "mr-1.5 h-4 w-4" }),
          " Actualiser"
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: () => void savePhysicalCounts(), disabled: invSubmitting, children: [
          /* @__PURE__ */ jsx(Save, { className: "mr-1.5 h-4 w-4" }),
          " Enregistrer"
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: () => void validateInventory(), disabled: invSubmitting, children: [
          invSubmitting ? /* @__PURE__ */ jsx(Loader2, { className: "mr-1.5 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(CheckCircle2, { className: "mr-1.5 h-4 w-4" }),
          "Valider"
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setInvDetailOpen(false), children: "Fermer" }) }), children: invDetail && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[minmax(0,1fr)_110px_110px_80px] gap-3 px-3 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground", children: [
        /* @__PURE__ */ jsx("span", { children: "Produit" }),
        /* @__PURE__ */ jsx("span", { className: "text-right", children: "Théorique" }),
        /* @__PURE__ */ jsx("span", { className: "text-right", children: "Physique" }),
        /* @__PURE__ */ jsx("span", { className: "text-right", children: "Écart" })
      ] }),
      invDetail.lignes?.map((l) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[minmax(0,1fr)_110px_110px_80px] items-center gap-3 rounded-lg border border-border p-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground", children: l.produit?.designation || "—" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: l.produit?.reference })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-right text-sm font-medium text-foreground", children: fmtNumber(l.stockTheorique) }),
        invDetail.statut === "EN_COURS" ? /* @__PURE__ */ jsx(Input, { type: "text", inputMode: "numeric", value: l.stockReel ?? "", onChange: (event) => updatePhysicalCount(l.id, event.target.value), placeholder: "0", className: "text-right" }) : /* @__PURE__ */ jsx("p", { className: "text-right text-sm font-medium text-foreground", children: l.stockReel ?? "--/--" }),
        /* @__PURE__ */ jsx("p", { className: cn("text-right text-sm font-medium", l.stockReel == null ? "text-muted-foreground" : l.stockReel - l.stockTheorique !== 0 ? "text-destructive" : "text-success"), children: l.stockReel == null ? "--/--" : `${l.stockReel - l.stockTheorique > 0 ? "+" : ""}${l.stockReel - l.stockTheorique}` })
      ] }, l.id))
    ] }) }),
    /* @__PURE__ */ jsx(AppModal, { open: Boolean(invPendingAction), onOpenChange: (open) => {
      if (!open && !invSubmitting) setInvPendingAction(null);
    }, title: invPendingAction === "annuler" ? "Annuler l'inventaire" : "Actualiser le snapshot théorique", description: invPendingAction === "annuler" ? "L'inventaire sera clôturé sans modifier le stock réel." : "Les quantités théoriques seront recalculées depuis le stock actuel et les comptages physiques saisis seront effacés.", size: "sm", closeOnOutsideClick: true, footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setInvPendingAction(null), disabled: invSubmitting, children: "Retour" }),
      /* @__PURE__ */ jsxs(Button, { variant: invPendingAction === "annuler" ? "destructive" : "default", onClick: () => void confirmInventoryAction(), disabled: invSubmitting, children: [
        invSubmitting ? /* @__PURE__ */ jsx(Loader2, { className: "animate-spin" }) : null,
        "Confirmer"
      ] })
    ] }), children: /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: invPendingAction === "annuler" ? "Vous pourrez toujours consulter cet inventaire, mais il ne sera plus modifiable." : "Enregistrez les comptages nécessaires avant de poursuivre si vous souhaitez les conserver." }) })
  ] });
}
export {
  InventoryPage as component
};
