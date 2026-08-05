import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect, useMemo } from "react";
import { Plus, FileText, Loader2, Printer, Download, Eye, Send } from "lucide-react";
import { P as PageHeader } from "./PageHeader-Dn6TWXax.js";
import { S as StatCard, a as SectionCard, T as Toolbar, P as Pagination } from "./widgets-dh2l9GK9.js";
import { D as DataTable } from "./DataTable-D-aCylbm.js";
import { S as StatusBadge } from "./StatusBadge-DvAwEj8v.js";
import { A as AppModal } from "./AppModal-v_VDoVT5.js";
import { B as Button } from "./input-DgNX5wjv.js";
import { l as logo } from "./erp-logo-C4ESMtut.js";
import { f as fmtCurrency } from "./erp-data-C8LoOZfP.js";
import { i as api } from "./router-soiu03Zn.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "react-dom";
import "./dropdown-menu-BYb2pE4C.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-dialog";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./currency-BGNe4_9Y.js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "zod";
import "axios";
const getFactures = (params) => api.get("/factures", { params });
const getFactureById = (id) => api.get(`/factures/${id}`);
const getFacturePdf = (id) => api.get(`/factures/${id}/pdf`, {
  responseType: "blob"
});
const envoyerFacture = (id) => api.post(`/factures/${id}/envoyer`);
const cols = [{
  key: "ref",
  header: "N facture",
  render: (i) => /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: i.ref })
}, {
  key: "tiers",
  header: "Client / Fournisseur"
}, {
  key: "echeance",
  header: "Échéance"
}, {
  key: "montant",
  header: "Montant",
  align: "right",
  render: (i) => /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: fmtCurrency(i.montant) })
}, {
  key: "statut",
  header: "Statut",
  align: "right",
  render: (i) => /* @__PURE__ */ jsx(StatusBadge, { status: i.statut })
}];
const PAGE_SIZE = 10;
const STATUS_LABELS = {
  BROUILLON: "Brouillon",
  EMISE: "Emise",
  PARTIELLEMENT_PAYEE: "Partiellement payee",
  SOLDEE: "Soldee",
  ANNULEE: "Annulee",
  EN_RETARD: "En retard"
};
const normalizeStatus = (status) => STATUS_LABELS[status || ""] || status || "-";
const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};
const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("fr-FR");
};
function InvoicesPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [rowActionPendingById, setRowActionPendingById] = useState({});
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfModalLoading, setPdfModalLoading] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfFilename, setPdfFilename] = useState("facture.pdf");
  const pdfFrameRef = useRef(null);
  const loadRows = async () => {
    setLoading(true);
    try {
      const response = await getFactures({
        page: 1,
        limit: 1e3
      });
      const factures = Array.isArray(response?.data) ? response.data : [];
      const mapped = factures.map((item) => ({
        id: item.id,
        ref: item.numeroFacture,
        tiers: item.client?.nom || item.fournisseur?.raisonSociale || "-",
        echeance: formatDate(item.dateEcheance),
        montant: toNumber(item.totalTtc, 0),
        statut: normalizeStatus(item.statut),
        statutRaw: item.statut
      }));
      setRows(mapped);
      if (!selectedInvoiceId && mapped.length > 0) {
        setSelectedInvoiceId(mapped[0].id);
      }
    } catch {
      setRows([]);
      toast.error("Impossible de charger les factures");
    } finally {
      setLoading(false);
    }
  };
  const loadPreview = async (invoiceId) => {
    setPreviewLoading(true);
    try {
      const response = await getFactureById(invoiceId);
      setPreview(response?.data || null);
    } catch {
      setPreview(null);
      toast.error("Impossible de charger le detail de la facture");
    } finally {
      setPreviewLoading(false);
    }
  };
  useEffect(() => {
    void loadRows();
  }, []);
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);
  useEffect(() => {
    if (!rows.length) {
      setSelectedInvoiceId(null);
      setPreview(null);
      return;
    }
    if (!selectedInvoiceId || !rows.some((row) => row.id === selectedInvoiceId)) {
      setSelectedInvoiceId(rows[0].id);
      return;
    }
    void loadPreview(selectedInvoiceId);
  }, [rows, selectedInvoiceId]);
  const filterOptions = useMemo(() => [{
    label: "Tous les statuts",
    value: ""
  }, ...Array.from(new Set(rows.map((r) => r.statut))).filter(Boolean).sort((a, b) => a.localeCompare(b, "fr")).map((status) => ({
    label: status,
    value: status
  }))], [rows]);
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const searchMatch = !q || r.ref.toLowerCase().includes(q) || r.tiers.toLowerCase().includes(q);
      const statusMatch = !statusFilter || r.statut === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [rows, search, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const paginatedRows = useMemo(() => filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredRows, page]);
  const stats = useMemo(() => {
    const totalFacture = rows.reduce((acc, row) => acc + row.montant, 0);
    const totalPayees = rows.filter((row) => row.statutRaw === "SOLDEE").reduce((acc, row) => acc + row.montant, 0);
    const totalEnAttente = rows.filter((row) => ["EMISE", "PARTIELLEMENT_PAYEE"].includes(row.statutRaw)).reduce((acc, row) => acc + row.montant, 0);
    const totalEnRetard = rows.filter((row) => row.statutRaw === "EN_RETARD").reduce((acc, row) => acc + row.montant, 0);
    const countRetard = rows.filter((row) => row.statutRaw === "EN_RETARD").length;
    return {
      totalFacture,
      totalPayees,
      totalEnAttente,
      totalEnRetard,
      countRetard
    };
  }, [rows]);
  const executeRowActionWithLoader = async (rowId, actionKey, action) => {
    let shouldRun = true;
    setRowActionPendingById((prev) => {
      if (prev[rowId]) {
        shouldRun = false;
        return prev;
      }
      return {
        ...prev,
        [rowId]: actionKey
      };
    });
    if (!shouldRun) return;
    try {
      await action();
    } finally {
      setRowActionPendingById((prev) => {
        const {
          [rowId]: _removed,
          ...rest
        } = prev;
        return rest;
      });
    }
  };
  const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("PDF_READ_FAILED"));
    reader.readAsDataURL(blob);
  });
  const openPdf = async (invoiceId) => {
    setPdfModalLoading(true);
    setPdfModalOpen(true);
    try {
      const blob = await getFacturePdf(invoiceId);
      const dataUrl = await blobToDataUrl(blob);
      const numero = rows.find((row) => row.id === invoiceId)?.ref || "facture";
      setPdfFilename(`${numero}.pdf`);
      setPdfBlob(blob);
      setPdfDataUrl(dataUrl);
    } catch {
      toast.error("Impossible de generer le PDF");
      setPdfModalOpen(false);
    } finally {
      setPdfModalLoading(false);
    }
  };
  const downloadCurrentPdf = () => {
    if (!pdfBlob) return;
    const objectUrl = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = pdfFilename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1e3);
  };
  const printCurrentPdf = () => {
    try {
      pdfFrameRef.current?.contentWindow?.focus();
      pdfFrameRef.current?.contentWindow?.print();
    } catch {
      toast.error("Impossible de lancer l'impression");
    }
  };
  const sendInvoice = async (invoiceId) => {
    try {
      await envoyerFacture(invoiceId);
      toast.success("Facture envoyee");
      await loadRows();
    } catch (error) {
      const maybeMessage = error && typeof error === "object" && "message" in error ? String(error.message || "") : "";
      toast.error(maybeMessage.trim() || "Envoi de facture impossible");
    }
  };
  const actionsByStatus = (row) => {
    const makeAction = (key, label, icon, action) => {
      const isRunning = rowActionPendingById[row.id] === key;
      return {
        label,
        icon: isRunning ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : icon,
        onClick: () => void executeRowActionWithLoader(row.id, key, action)
      };
    };
    const common = [makeAction("preview", "Apercu", /* @__PURE__ */ jsx(Eye, { className: "mr-2 h-4 w-4" }), async () => {
      setSelectedInvoiceId(row.id);
      await loadPreview(row.id);
    }), makeAction("download", "Telecharger PDF", /* @__PURE__ */ jsx(Download, { className: "mr-2 h-4 w-4" }), () => openPdf(row.id))];
    if (["ANNULEE", "SOLDEE"].includes(row.statutRaw)) {
      return common;
    }
    return [...common, makeAction("send", "Envoyer par email", /* @__PURE__ */ jsx(Send, { className: "mr-2 h-4 w-4" }), () => sendInvoice(row.id))];
  };
  const previewLines = preview?.lignes || [];
  const computedHt = previewLines.reduce((sum, line) => sum + toNumber(line.montantHt, 0), 0);
  const previewHt = toNumber(preview?.totalHt, computedHt);
  const previewTtc = toNumber(preview?.totalTtc, previewHt);
  const previewTva = toNumber(preview?.totalTva, previewTtc - previewHt);
  const selectedPreviewRef = preview?.numeroFacture || "-";
  const selectedPreviewTier = preview?.client?.nom || preview?.fournisseur?.raisonSociale || "-";
  const selectedPreviewEcheance = formatDate(preview?.dateEcheance);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Factures", description: "Liste, détails, impression PDF et statuts de paiement", breadcrumb: ["Transactions", "Factures"], actions: /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5", onClick: () => toast.info("Nouvelle facture"), children: [
      /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
      " Nouvelle facture"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Total facturé", value: fmtCurrency(stats.totalFacture), sub: "toutes factures", icon: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Payées", value: fmtCurrency(stats.totalPayees), sub: "encaissées", icon: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "En attente", value: fmtCurrency(stats.totalEnAttente), sub: "à venir", icon: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "En retard", value: fmtCurrency(stats.totalEnRetard), sub: `${stats.countRetard} facture${stats.countRetard > 1 ? "s" : ""}`, icon: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-5", children: [
      /* @__PURE__ */ jsxs(SectionCard, { title: "Liste des factures", className: "lg:col-span-3", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(Toolbar, { placeholder: "Rechercher une facture...", searchValue: search, onSearchChange: setSearch, filterOptions, selectedFilter: statusFilter, onFilterChange: setStatusFilter, filterPlaceholder: "Filtrer par statut", filterSearchPlaceholder: "Rechercher un statut" }) }),
        loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(DataTable, { columns: cols, rows: paginatedRows, rowKey: (i) => i.id, rowActions: actionsByStatus, isRowActionLoading: (i) => Boolean(rowActionPendingById[i.id]) }),
          /* @__PURE__ */ jsx(Pagination, { count: filteredRows.length, currentPage: page, totalPages, pageSize: PAGE_SIZE, onPageChange: setPage })
        ] })
      ] }),
      /* @__PURE__ */ jsx(SectionCard, { title: "Aperçu facture", description: selectedPreviewRef, className: "lg:col-span-2", action: /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", className: "h-8 w-8", disabled: !selectedInvoiceId || previewLoading, onClick: () => selectedInvoiceId ? void openPdf(selectedInvoiceId) : null, children: /* @__PURE__ */ jsx(Printer, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", className: "h-8 w-8", disabled: !selectedInvoiceId || previewLoading, onClick: () => selectedInvoiceId ? void openPdf(selectedInvoiceId) : null, children: /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }) })
      ] }), children: /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-card p-5 text-sm", children: [
        previewLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : null,
        !previewLoading && !preview ? /* @__PURE__ */ jsx("p", { className: "py-8 text-center text-sm text-muted-foreground", children: "Selectionnez une facture pour voir son detail." }) : null,
        !previewLoading && preview ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("img", { src: logo, alt: "Logo", width: 32, height: 32, className: "h-8 w-8" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-display font-bold text-foreground", children: "AC ERP" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "12 rue du Commerce, Lyon" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsx("p", { className: "font-bold text-foreground", children: "FACTURE" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: selectedPreviewRef })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "my-4 border-t border-border pt-3 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxs("p", { className: "font-medium text-foreground", children: [
              "Facture a : ",
              selectedPreviewTier
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              "Lyon, France · Echeance : ",
              selectedPreviewEcheance
            ] })
          ] }),
          /* @__PURE__ */ jsxs("table", { className: "w-full text-xs", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border text-left text-muted-foreground", children: [
              /* @__PURE__ */ jsx("th", { className: "pb-2 font-medium", children: "Désignation" }),
              /* @__PURE__ */ jsx("th", { className: "pb-2 text-center font-medium", children: "Qté" }),
              /* @__PURE__ */ jsx("th", { className: "pb-2 text-right font-medium", children: "Total" })
            ] }) }),
            /* @__PURE__ */ jsxs("tbody", { children: [
              previewLines.map((l) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/60", children: [
                /* @__PURE__ */ jsx("td", { className: "py-2 text-foreground", children: l.designation || "Produit" }),
                /* @__PURE__ */ jsx("td", { className: "py-2 text-center text-muted-foreground", children: toNumber(l.quantite, 0) }),
                /* @__PURE__ */ jsx("td", { className: "py-2 text-right text-foreground", children: fmtCurrency(toNumber(l.montantTtc, toNumber(l.montantHt, 0))) })
              ] }, l.id)),
              previewLines.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 3, className: "py-4 text-center text-muted-foreground", children: "Aucune ligne de facture" }) }) : null
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-1 text-xs", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
              /* @__PURE__ */ jsx("span", { children: "Total HT" }),
              /* @__PURE__ */ jsx("span", { children: fmtCurrency(previewHt) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
              /* @__PURE__ */ jsx("span", { children: "TVA" }),
              /* @__PURE__ */ jsx("span", { children: fmtCurrency(previewTva) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-t border-border pt-1 font-bold text-foreground", children: [
              /* @__PURE__ */ jsx("span", { children: "Total TTC" }),
              /* @__PURE__ */ jsx("span", { children: fmtCurrency(previewTtc) })
            ] })
          ] })
        ] }) : null
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(AppModal, { open: pdfModalOpen, onOpenChange: (open) => {
      setPdfModalOpen(open);
      if (!open) {
        setPdfDataUrl(null);
        setPdfBlob(null);
        setPdfModalLoading(false);
      }
    }, title: "Apercu PDF facture", description: pdfFilename, size: "xxl", footer: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setPdfModalOpen(false), children: "Fermer" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: printCurrentPdf, disabled: !pdfDataUrl || pdfModalLoading, children: [
          /* @__PURE__ */ jsx(Printer, { className: "mr-2 h-4 w-4" }),
          " Imprimer"
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: downloadCurrentPdf, disabled: !pdfBlob || pdfModalLoading, children: [
          /* @__PURE__ */ jsx(Download, { className: "mr-2 h-4 w-4" }),
          " Telecharger"
        ] })
      ] })
    ] }), children: pdfModalLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-16", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : pdfDataUrl ? /* @__PURE__ */ jsx("iframe", { ref: pdfFrameRef, src: pdfDataUrl, title: "Apercu facture PDF", className: "h-[70vh] w-full rounded-md border border-border" }) : /* @__PURE__ */ jsx("p", { className: "py-10 text-center text-sm text-muted-foreground", children: "Aucun PDF charge." }) })
  ] });
}
export {
  InvoicesPage as component
};
