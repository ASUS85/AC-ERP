import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect, useMemo } from "react";
import { FileText, Search, Loader2, Printer, Download, Eye, Send } from "lucide-react";
import { P as PageHeader } from "./PageHeader-D6EtHCBB.js";
import { S as StatCard, a as SectionCard, b as SearchableSelect, P as Pagination } from "./widgets-VrwHyJZb.js";
import { D as DataTable } from "./DataTable-B46euxbY.js";
import { S as StatusBadge } from "./StatusBadge-C8cTjTMX.js";
import { A as AppModal } from "./AppModal-C69IBz2_.js";
import { I as Input, B as Button } from "./input-B0E-1hwS.js";
import { f as fmtCurrency } from "./erp-data-lC_Sts2J.js";
import { g as getFactures, a as getFactureById, b as getFacturePdf, e as envoyerFacture } from "./factures.service-CzrsRYf6.js";
import { toast } from "sonner";
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
import "./currency-BmQmAj7J.js";
const cols = [{
  key: "ref",
  header: "N facture",
  align: "left",
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
  const [typeFilter, setTypeFilter] = useState("");
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
        tiers: item.client?.nom || item.fournisseur?.raisonSociale || "Client occasionnel",
        echeance: formatDate(item.dateEcheance),
        montant: toNumber(item.totalTtc, 0),
        statut: normalizeStatus(item.statut),
        statutRaw: item.statut,
        typeFacture: item.typeFacture || "VENTE"
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
  }, [search, statusFilter, typeFilter]);
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
      const typeMatch = !typeFilter || r.typeFacture === typeFilter;
      return searchMatch && statusMatch && typeMatch;
    });
  }, [rows, search, statusFilter, typeFilter]);
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
      await openPdf(row.id);
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
  toNumber(preview?.totalTva, previewTtc - previewHt);
  preview?.numeroFacture || "-";
  preview?.client?.nom || preview?.fournisseur?.raisonSociale || "Client occasionnel";
  formatDate(preview?.dateEcheance);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Factures", description: "Liste, détails, impression PDF et statuts de paiement", breadcrumb: ["Transactions", "Factures"] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Total facturé", value: fmtCurrency(stats.totalFacture), sub: "toutes factures", icon: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Payées", value: fmtCurrency(stats.totalPayees), sub: "encaissées", icon: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "En attente", value: fmtCurrency(stats.totalEnAttente), sub: "à venir", icon: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "En retard", value: fmtCurrency(stats.totalEnRetard), sub: `${stats.countRetard} facture${stats.countRetard > 1 ? "s" : ""}`, icon: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "w-full", children: /* @__PURE__ */ jsxs(SectionCard, { title: "Liste des factures", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative w-full sm:max-w-xs", children: [
          /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsx(Input, { placeholder: "Rechercher une facture...", className: "h-9 pl-9", value: search, onChange: (e) => setSearch(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(SearchableSelect, { value: typeFilter, onValueChange: setTypeFilter, options: [{
            label: "Tous les types",
            value: ""
          }, {
            label: "Ventes",
            value: "VENTE"
          }, {
            label: "Achats",
            value: "ACHAT"
          }], placeholder: "Type de facture...", className: "w-[180px]" }),
          /* @__PURE__ */ jsx(SearchableSelect, { value: statusFilter, onValueChange: setStatusFilter, options: filterOptions, placeholder: "Filtrer par statut...", searchPlaceholder: "Rechercher statut...", className: "w-[180px]" })
        ] })
      ] }),
      loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(DataTable, { columns: cols, rows: paginatedRows, rowKey: (i) => i.id, rowActions: actionsByStatus, isRowActionLoading: (i) => Boolean(rowActionPendingById[i.id]) }),
        /* @__PURE__ */ jsx(Pagination, { count: filteredRows.length, currentPage: page, totalPages, pageSize: PAGE_SIZE, onPageChange: setPage })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AppModal, { open: pdfModalOpen, onOpenChange: (open) => {
      setPdfModalOpen(open);
      if (!open) {
        setPdfDataUrl(null);
        setPdfBlob(null);
        setPdfModalLoading(false);
      }
    }, title: "Apercu PDF facture", description: pdfFilename, size: "xl", footer: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
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
