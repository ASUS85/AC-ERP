import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useCallback, useEffect, useMemo } from "react";
import { ArrowDownToLine, ClipboardList, Warehouse, ArrowUpFromLine, AlertTriangle, Loader2, Eye, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { P as PageHeader } from "./PageHeader-Dn6TWXax.js";
import { S as StatCard, a as SectionCard, P as Pagination, b as SearchableSelect } from "./widgets-Bk5igfjY.js";
import { D as DataTable } from "./DataTable-D0d6QdoR.js";
import { S as StatusBadge } from "./StatusBadge-DjyUVlew.js";
import { A as AppModal } from "./AppModal-CQZkm4Qj.js";
import { B as Button, I as Input } from "./input-mTkd6t5x.js";
import { L as Label } from "./label-Bj7nLUiA.js";
import { T as Textarea } from "./textarea-CskUkV0I.js";
import { i as api, c as cn } from "./router-htMRrCu_.js";
import { toast } from "sonner";
import { f as fmtCurrency, d as fmtNumber } from "./erp-data-DmZyEQ_I.js";
import "@tanstack/react-router";
import "react-dom";
import "./dropdown-menu-CdWXpfh2.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-dialog";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "zod";
import "axios";
import "./currency-BGNe4_9Y.js";
const getStocks = (params) => api.get("/stocks", { params });
const getAlertes = () => api.get("/stocks/alertes");
const getMouvements = (params) => api.get("/stocks/mouvements", { params });
const ajusterStock = (data) => api.post("/stocks/ajustement", data);
const stocks_service = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ajusterStock,
  getAlertes,
  getMouvements,
  getStocks
}, Symbol.toStringTag, { value: "Module" }));
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
  const [adjModalOpen, setAdjModalOpen] = useState(false);
  const [adjForm, setAdjForm] = useState({
    idProduit: "",
    quantite: 0,
    motif: ""
  });
  const [adjSubmitting, setAdjSubmitting] = useState(false);
  const [invDetailOpen, setInvDetailOpen] = useState(false);
  const [invDetail, setInvDetail] = useState(null);
  const [adjProduits, setAdjProduits] = useState([]);
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [skRes, mvRes, alRes, invRes, prodRes] = await Promise.allSettled([
        getStocks({
          page: skPage,
          limit: PAGE_SIZE
        }),
        getMouvements({
          page: mvPage,
          limit: PAGE_SIZE,
          search: search || void 0
        }),
        getAlertes(),
        (async () => {
          const {
            default: api2
          } = await import("./router-htMRrCu_.js").then((n) => n.s);
          return api2.get("/stocks/inventaires");
        })(),
        // Chargement de tous les produits pour le select de l'ajustement
        (async () => {
          const {
            default: api2
          } = await import("./router-htMRrCu_.js").then((n) => n.s);
          return api2.get("/produits", {
            params: {
              limit: 1e4,
              statut: "ACTIF"
            }
          });
        })()
      ]);
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
  }, [skPage, mvPage, search]);
  useEffect(() => {
    void loadAll();
  }, [loadAll]);
  useEffect(() => {
    setMvPage(1);
  }, [search]);
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
      const {
        ajusterStock: ajusterStock2
      } = await Promise.resolve().then(() => stocks_service);
      await ajusterStock2(adjForm);
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
      } = await import("./router-htMRrCu_.js").then((n) => n.s);
      const res = await api2.get(`/stocks/inventaires/${id}`);
      setInvDetail(res?.data || {});
      setInvDetailOpen(true);
    } catch {
      toast.error("Impossible de charger l'inventaire");
    }
  };
  const filteredStocks = useMemo(() => {
    if (!searchStock) return stocks;
    const q = searchStock.toLowerCase();
    return stocks.filter((s) => s.produit.designation.toLowerCase().includes(q) || s.produit.reference.toLowerCase().includes(q));
  }, [stocks, searchStock]);
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
    key: "lignes",
    header: "Lignes",
    align: "right",
    render: (i) => fmtNumber(i.lignes?.length || 0)
  }];
  const renderAlerteIcon = (stockActuel, stockMinimum) => {
    if (stockActuel <= 0) return /* @__PURE__ */ jsx(XCircle, { className: "h-5 w-5 text-destructive" });
    if (stockActuel <= stockMinimum / 2) return /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5 text-warning" });
    return /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5 text-info" });
  };
  const renderAlerteSeverity = (stockActuel, stockMinimum) => {
    if (stockActuel <= 0) return "CRITIQUE";
    if (stockActuel <= stockMinimum / 2) return "VIGILANCE";
    return "OK";
  };
  const totalInvPages = Math.ceil(inventaires.length / PAGE_SIZE);
  const paginatedInventaires = inventaires.slice((invPage - 1) * PAGE_SIZE, invPage * PAGE_SIZE);
  const totalSkPages = Math.ceil(filteredStocks.length / PAGE_SIZE);
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
          } = await import("./router-htMRrCu_.js").then((n) => n.s);
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
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs(SectionCard, { title: tab === "stocks" ? "Stock actuel" : tab === "mouvements" ? "Mouvements de stock" : "Inventaires physiques", description: tab === "stocks" ? `${skMeta.total} produit${skMeta.total > 1 ? "s" : ""}` : tab === "mouvements" ? `${mvMeta.total} mouvement${mvMeta.total > 1 ? "s" : ""}` : `${invMeta.total} inventaire${invMeta.total > 1 ? "s" : ""}`, className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("div", { className: "relative w-full max-w-xs", children: /* @__PURE__ */ jsx("input", { placeholder: tab === "stocks" ? "Rechercher un produit..." : tab === "mouvements" ? "Rechercher un mouvement..." : "Rechercher un inventaire...", className: "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 pl-8 text-sm shadow-sm outline-none focus:ring-2 focus:ring-ring", value: tab === "stocks" ? searchStock : search, onChange: (e) => {
            if (tab === "stocks") {
              setSearchStock(e.target.value);
              setSkPage(1);
            } else setSearch(e.target.value);
          } }) }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-1 rounded-lg border border-border p-0.5", children: ["stocks", "mouvements", "inventaires"].map((t) => /* @__PURE__ */ jsx("button", { onClick: () => {
            setTab(t);
            if (t === "stocks") setSkPage(1);
            if (t === "inventaires") setInvPage(1);
          }, className: cn("rounded-md px-3 py-1.5 text-xs font-medium transition-colors", tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"), children: t === "stocks" ? "Stocks" : t === "mouvements" ? "Mouvements" : "Inventaires" }, t)) })
        ] }),
        loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx(Loader2, { className: "animate-spin" }) }) : tab === "stocks" ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(DataTable, { columns: stockCols, rows: paginatedStocks, rowKey: (s) => s.id, withActions: false }),
          /* @__PURE__ */ jsx(Pagination, { count: filteredStocks.length, currentPage: skPage, totalPages: totalSkPages, pageSize: PAGE_SIZE, onPageChange: setSkPage })
        ] }) : tab === "mouvements" ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(DataTable, { columns: mvCols, rows: mouvements, rowKey: (m) => m.id, withActions: false }),
          /* @__PURE__ */ jsx(Pagination, { count: mvMeta.total, currentPage: mvPage, totalPages: mvMeta.totalPages, pageSize: PAGE_SIZE, onPageChange: setMvPage })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(DataTable, { columns: invCols, rows: paginatedInventaires, rowKey: (i) => i.id, rowActions: (inv) => [{
            label: "Voir details",
            icon: /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }),
            onClick: () => void openInvDetail(inv.id)
          }] }),
          /* @__PURE__ */ jsx(Pagination, { count: inventaires.length, currentPage: invPage, totalPages: totalInvPages, pageSize: PAGE_SIZE, onPageChange: setInvPage })
        ] })
      ] }),
      /* @__PURE__ */ jsx(SectionCard, { title: "Alertes de rupture", description: `${alertes.length} produit${alertes.length > 1 ? "s" : ""} sous seuil`, children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: alertes.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-6 text-center", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "mb-2 h-8 w-8 text-success" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Aucune alerte" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground/70", children: "Tous les stocks sont a un niveau satisfaisant." })
      ] }) : alertes.map((a) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-lg border border-border p-3", children: [
        /* @__PURE__ */ jsx("span", { className: "mt-0.5 shrink-0", children: renderAlerteIcon(a.stockActuel, a.produit.stockMinimum) }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground", children: a.produit.designation }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Ref. ",
            a.produit.reference,
            " · Min. ",
            a.produit.stockMinimum
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-1.5 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-foreground", children: fmtNumber(a.stockActuel) }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "en stock" }),
            /* @__PURE__ */ jsx(StatusBadge, { status: renderAlerteSeverity(a.stockActuel, a.produit.stockMinimum) })
          ] })
        ] })
      ] }, a.id)) }) })
    ] }),
    /* @__PURE__ */ jsx(AppModal, { open: adjModalOpen, onOpenChange: setAdjModalOpen, title: "Ajustement de stock", description: "Entrez une quantite positive ou negative.", size: "lg", footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
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
        /* @__PURE__ */ jsx(Input, { id: "adj-qte", type: "number", value: adjForm.quantite, onChange: (e) => setAdjForm((p) => ({
          ...p,
          quantite: Number(e.target.value) || 0
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
    /* @__PURE__ */ jsx(AppModal, { open: invDetailOpen, onOpenChange: setInvDetailOpen, title: "Detail de l'inventaire", description: invDetail ? `Cree le ${new Date(invDetail.dateDebut).toLocaleDateString("fr-FR")}` : "", size: "xl", footer: invDetail?.statut === "EN_COURS" ? /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setInvDetailOpen(false), children: "Fermer" }),
      /* @__PURE__ */ jsxs(Button, { onClick: async () => {
        try {
          const {
            default: api2
          } = await import("./router-htMRrCu_.js").then((n) => n.s);
          await api2.post(`/stocks/inventaires/${invDetail.id}/valider`);
          toast.success("Inventaire valide");
          setInvDetailOpen(false);
          await loadAll();
        } catch {
          toast.error("Erreur lors de la validation");
        }
      }, children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "mr-1.5 h-4 w-4" }),
        " Valider"
      ] })
    ] }) : /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setInvDetailOpen(false), children: "Fermer" }) }), children: invDetail && /* @__PURE__ */ jsx("div", { className: "space-y-2", children: invDetail.lignes?.map((l) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-lg border border-border p-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground", children: l.produit?.designation || "—" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: l.produit?.reference })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-foreground", children: [
          "Theorique:",
          " ",
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: l.stockTheorique })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-foreground", children: [
          "Reel:",
          " ",
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: l.stockReel ?? "—" })
        ] }),
        l.stockReel != null && /* @__PURE__ */ jsxs("p", { className: cn("text-xs font-medium", l.stockReel - l.stockTheorique !== 0 ? "text-destructive" : "text-success"), children: [
          "Ecart: ",
          l.stockReel - l.stockTheorique > 0 ? "+" : "",
          l.stockReel - l.stockTheorique
        ] })
      ] })
    ] }, l.id)) }) })
  ] });
}
export {
  InventoryPage as component
};
