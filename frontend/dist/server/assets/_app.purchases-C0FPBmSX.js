import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect, useMemo } from "react";
import { FileEdit, CheckCircle2, Truck, PackageCheck, Plus, Loader2, ReceiptText, Trash2, ArrowLeft, ArrowRight, Printer, Download, Copy, Send } from "lucide-react";
import { P as PageHeader } from "./PageHeader-D6EtHCBB.js";
import { a as SectionCard, T as Toolbar, P as Pagination, b as SearchableSelect } from "./widgets-VrwHyJZb.js";
import { D as DataTable } from "./DataTable-B46euxbY.js";
import { S as StatusBadge } from "./StatusBadge-C8cTjTMX.js";
import { A as AppModal } from "./AppModal-C69IBz2_.js";
import { B as Button, I as Input } from "./input-B0E-1hwS.js";
import { L as Label } from "./label-JW23xmF-.js";
import { T as Textarea } from "./textarea-BWVwaDWu.js";
import { S as Switch } from "./switch-Bj2xGc6B.js";
import { f as fmtCurrency } from "./erp-data-lC_Sts2J.js";
import { i as api, c as cn } from "./router-B5GAJ1jr.js";
import { n as normalizeNumberInput, f as formatGroupedInputNumber } from "./number-input-96FZwFNn.js";
import { g as getFournisseurs } from "./fournisseurs.service-CousVtzX.js";
import { toast } from "sonner";
import { u as useProductsStore } from "./products.store--7hNed_p.js";
import "@tanstack/react-router";
import "react-dom";
import "./dropdown-menu-BWhuKXK1.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-dialog";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-switch";
import "./currency-BmQmAj7J.js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "zod";
import "zustand";
import "axios";
const getBonsCommandeFournisseur = () => api.get("/achats/bons-commande");
const getBonCommandeFournisseurById = (id) => api.get(`/achats/bons-commande/${id}`);
const createBonCommandeFournisseur = (data) => api.post("/achats/bons-commande", data);
const envoyerBonCommandeFournisseur = (id) => api.patch(`/achats/bons-commande/${id}/envoyer`);
const transitionBonCommandeFournisseur = (id, action) => api.patch(`/achats/bons-commande/${id}/statut`, { action });
const dupliquerBonCommandeFournisseur = (id) => api.post(`/achats/bons-commande/${id}/dupliquer`);
const telechargerBonCommandeFournisseurPdf = (id) => api.get(`/achats/bons-commande/${id}/pdf`, {
  responseType: "blob"
});
const importerFactureFournisseurBcf = (id, payload) => {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("decision", payload.decision);
  return api.post(`/achats/bons-commande/${id}/factures-importees`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};
const getFacturesImporteesBcf = (id) => api.get(`/achats/bons-commande/${id}/factures-importees`);
const receptionBonCommandeFournisseur = (id, data) => api.post(`/achats/bons-commande/${id}/reception`, data);
const UNIT_OPTIONS = [{
  value: "PIECE",
  label: "Piece"
}, {
  value: "KG",
  label: "Kg"
}, {
  value: "LITRE",
  label: "Litre"
}, {
  value: "METRE",
  label: "Metre"
}, {
  value: "M2",
  label: "M2"
}, {
  value: "BOITE",
  label: "Boite"
}, {
  value: "CARTON",
  label: "Carton"
}];
const toInputDate = (date) => {
  const local = new Date(date);
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toISOString().slice(0, 10);
};
const PAGE_SIZE = 10;
const RECEPTION_PAGE_SIZE = 8;
const STATUS_LABELS = {
  BROUILLON: "Brouillon",
  SOUMIS: "Soumis",
  VALIDE: "Valide",
  ENVOYE: "Envoye",
  CONFIRME: "Confirme",
  REJETE: "Rejete",
  RECU_PARTIEL: "Recu partiel",
  RECU_TOTAL: "Recu total",
  ANNULE: "Annule"
};
const normalizeStatus = (status) => STATUS_LABELS[status || ""] || status || "-";
const INVOICE_ALLOWED_STATUSES = /* @__PURE__ */ new Set(["RECU_PARTIEL", "RECU_TOTAL"]);
const canCreateInvoiceForStatus = (status) => INVOICE_ALLOWED_STATUSES.has(status || "");
const normalizeReceptionStatus = (status) => {
  if (status === "CONFORME") return "Valide";
  if (status === "PARTIELLE") return "Brouillon";
  if (status === "NON_CONFORME") return "Annule";
  return status || "-";
};
const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};
const computeTtcFromHtAndTva = (montantHt, tva) => {
  const ht = toNumber(montantHt, Number.NaN);
  const vat = toNumber(tva, Number.NaN);
  if (!Number.isFinite(ht) || !Number.isFinite(vat) || ht < 0 || vat < 0) {
    return "";
  }
  const ttc = ht + ht * vat / 100;
  return String(Math.round(ttc * 100) / 100);
};
const makeLineId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
function PurchasesPage() {
  const todayDate = toInputDate(/* @__PURE__ */ new Date());
  const tomorrowDate = toInputDate(new Date((/* @__PURE__ */ new Date()).setDate((/* @__PURE__ */ new Date()).getDate() + 1)));
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [generalForm, setGeneralForm] = useState({
    idFournisseur: "",
    entrepot: "",
    dateBon: todayDate,
    dateLivraisonSouhaitee: "",
    conditionsPaiement: "",
    conditionsLivraison: "",
    devise: "XOF",
    priorite: "NORMALE",
    commentaires: ""
  });
  const [lines, setLines] = useState([]);
  const [generalErrors, setGeneralErrors] = useState({});
  const [linesError, setLinesError] = useState("");
  const [lineErrorsById, setLineErrorsById] = useState({});
  const [confirmationError, setConfirmationError] = useState("");
  const [receptionOpen, setReceptionOpen] = useState(false);
  const [receptionStep, setReceptionStep] = useState(1);
  const [receptionSubmitting, setReceptionSubmitting] = useState(false);
  const [receptionGeneralForm, setReceptionGeneralForm] = useState({
    date: todayDate,
    observations: ""
  });
  const [receptionGeneralErrors, setReceptionGeneralErrors] = useState({});
  const [receptionLinesError, setReceptionLinesError] = useState("");
  const [rowActionPendingById, setRowActionPendingById] = useState({});
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfModalLoading, setPdfModalLoading] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfFilename, setPdfFilename] = useState("bon-commande.pdf");
  const pdfFrameRef = useRef(null);
  const [receptionOrder, setReceptionOrder] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importOrder, setImportOrder] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importPreviewUrl, setImportPreviewUrl] = useState(null);
  const [importSubmitting, setImportSubmitting] = useState(false);
  const [importedInvoices, setImportedInvoices] = useState([]);
  const [importedInvoicesLoading, setImportedInvoicesLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsOrder, setDetailsOrder] = useState(null);
  const [receptionRowsSearch, setReceptionRowsSearch] = useState("");
  const [receptionRowsStatusFilter, setReceptionRowsStatusFilter] = useState("");
  const [receptionRowsPage, setReceptionRowsPage] = useState(1);
  const [invoiceWizardOpen, setInvoiceWizardOpen] = useState(false);
  const [invoiceWizardStep, setInvoiceWizardStep] = useState(1);
  const [invoiceWizardSubmitting, setInvoiceWizardSubmitting] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    numeroFacture: "",
    dateFacture: todayDate,
    dateEcheance: "",
    montantHt: "",
    tva: "",
    ttc: "",
    remise: "",
    transport: "",
    observations: ""
  });
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [invoiceFormErrors, setInvoiceFormErrors] = useState({});
  const fetchProducts = useProductsStore((state) => state.fetchList);
  const validateReceptionStep1 = () => {
    const nextErrors = {};
    if (!receptionGeneralForm.date) {
      nextErrors.date = "Ce champ est requis";
    }
    setReceptionGeneralErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };
  const validateReceptionStep2 = () => {
    const hasAnyQty = receptionOrder?.lines.some((line) => line.quantiteARecevoir > 0) ?? false;
    if (!hasAnyQty) {
      setReceptionLinesError("Saisissez au moins une quantite recue");
      return false;
    }
    setReceptionLinesError("");
    return true;
  };
  const validateInvoiceStep1 = () => {
    const nextErrors = {};
    if (!invoiceForm.numeroFacture.trim()) {
      nextErrors.numeroFacture = "Ce champ est requis";
    }
    if (!invoiceForm.dateFacture) {
      nextErrors.dateFacture = "Ce champ est requis";
    }
    if (!invoiceForm.dateEcheance) {
      nextErrors.dateEcheance = "Ce champ est requis";
    }
    if (!invoiceForm.montantHt || toNumber(invoiceForm.montantHt, 0) < 0) {
      nextErrors.montantHt = "Montant HT invalide";
    }
    if (!invoiceForm.tva || toNumber(invoiceForm.tva, 0) < 0) {
      nextErrors.tva = "TVA invalide";
    }
    if (!invoiceForm.ttc || toNumber(invoiceForm.ttc, 0) < 0) {
      nextErrors.ttc = "TTC invalide";
    }
    if (invoiceForm.remise && toNumber(invoiceForm.remise, 0) < 0) {
      nextErrors.remise = "La valeur doit etre positive";
    }
    if (invoiceForm.transport && toNumber(invoiceForm.transport, 0) < 0) {
      nextErrors.transport = "La valeur doit etre positive";
    }
    setInvoiceFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };
  const resetCreateWizard = () => {
    setCreateStep(1);
    setCreateSubmitting(false);
    setConfirmationChecked(false);
    setGeneralForm({
      idFournisseur: "",
      entrepot: "",
      dateBon: todayDate,
      dateLivraisonSouhaitee: "",
      conditionsPaiement: "",
      conditionsLivraison: "",
      devise: "XOF",
      priorite: "NORMALE",
      commentaires: ""
    });
    setLines([]);
    setGeneralErrors({});
    setLinesError("");
    setLineErrorsById({});
    setConfirmationError("");
  };
  const loadRows = async () => {
    setLoading(true);
    try {
      const response = await getBonsCommandeFournisseur();
      const bcf = Array.isArray(response?.data) ? response.data : [];
      const rowsWithInvoiceState = await Promise.all(bcf.map(async (item) => {
        let factureRecue = item.statut === "FACTURE_RECU";
        if (!factureRecue) {
          try {
            const invoiceResponse = await getFacturesImporteesBcf(item.id);
            factureRecue = Array.isArray(invoiceResponse?.data) ? invoiceResponse.data.length > 0 : false;
          } catch {
            factureRecue = false;
          }
        }
        return {
          id: item.id,
          ref: item.numeroBcf,
          fournisseur: item.fournisseur?.raisonSociale || "-",
          articles: item.lignes?.length || 0,
          date: item.dateCommande ? new Date(item.dateCommande).toLocaleDateString("fr-FR") : "-",
          montant: Number(item.totalTtc || 0),
          statut: normalizeStatus(item.statut),
          statutRaw: item.statut,
          factureRecue
        };
      }));
      setRows(rowsWithInvoiceState);
    } catch {
      setRows([]);
      toast.error("Impossible de charger les bons de commande");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void loadRows();
  }, []);
  useEffect(() => {
    if (!createOpen) return;
    const loadCatalog = async () => {
      try {
        const [suppliersRes, productsRes] = await Promise.all([getFournisseurs({
          limit: 1e3
        }), fetchProducts({
          limit: 1e3,
          statut: "ACTIF"
        })]);
        setSuppliers(Array.isArray(suppliersRes?.data) ? suppliersRes.data : []);
        setProducts(Array.isArray(productsRes?.data) ? productsRes.data : []);
      } catch {
        toast.error("Impossible de charger fournisseurs et produits");
      }
    };
    void loadCatalog();
  }, [createOpen, fetchProducts]);
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);
  useEffect(() => {
    setReceptionRowsPage(1);
  }, [receptionRowsSearch, receptionRowsStatusFilter]);
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
      const searchMatch = !q || r.ref.toLowerCase().includes(q) || r.fournisseur.toLowerCase().includes(q);
      const statusMatch = !statusFilter || r.statut === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [rows, search, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const paginatedRows = useMemo(() => filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredRows, page]);
  const receptionRows = useMemo(() => {
    if (!detailsOrder) return [];
    const supplierName = detailsOrder.fournisseur?.raisonSociale || "-";
    return (detailsOrder.receptions || []).map((item, index) => {
      const userName = item.utilisateur ? [item.utilisateur.prenom, item.utilisateur.nom].filter(Boolean).join(" ") : "-";
      const quantiteRecue = (item.lignes || []).reduce((acc, line) => acc + toNumber(line.quantiteRecue, 0), 0);
      return {
        id: item.id,
        reference: `REC-${String(index + 1).padStart(3, "0")}`,
        date: item.dateReception ? new Date(item.dateReception).toLocaleDateString("fr-FR") : "-",
        fournisseur: supplierName,
        utilisateur: userName || "-",
        lignes: item.lignes?.length || 0,
        quantiteRecue,
        statut: normalizeReceptionStatus(item.statut),
        statutRaw: item.statut
      };
    });
  }, [detailsOrder]);
  const receptionFilterOptions = useMemo(() => [{
    label: "Tous les statuts",
    value: ""
  }, ...Array.from(new Set(receptionRows.map((row) => row.statutRaw))).filter(Boolean).map((status) => ({
    label: normalizeReceptionStatus(status),
    value: status
  }))], [receptionRows]);
  const filteredReceptionRows = useMemo(() => {
    const q = receptionRowsSearch.trim().toLowerCase();
    return receptionRows.filter((row) => {
      const searchMatch = !q || row.reference.toLowerCase().includes(q) || row.fournisseur.toLowerCase().includes(q) || row.utilisateur.toLowerCase().includes(q);
      const statusMatch = !receptionRowsStatusFilter || row.statutRaw === receptionRowsStatusFilter;
      return searchMatch && statusMatch;
    });
  }, [receptionRows, receptionRowsSearch, receptionRowsStatusFilter]);
  const receptionTotalPages = Math.max(1, Math.ceil(filteredReceptionRows.length / RECEPTION_PAGE_SIZE));
  const paginatedReceptionRows = useMemo(() => filteredReceptionRows.slice((receptionRowsPage - 1) * RECEPTION_PAGE_SIZE, receptionRowsPage * RECEPTION_PAGE_SIZE), [filteredReceptionRows, receptionRowsPage]);
  const openInvoiceWizard = async (orderId) => {
    const selectedOrderId = orderId || detailsOrder?.id;
    if (!selectedOrderId) return;
    const row = rows.find((item) => item.id === selectedOrderId);
    const targetStatus = row?.statutRaw || detailsOrder?.statut;
    if (!canCreateInvoiceForStatus(targetStatus)) {
      toast.warning("Reception valide requise avant la creation de la facture fournisseur");
      return;
    }
    if (!detailsOrder || detailsOrder.id !== selectedOrderId) {
      await openDetailsModal(selectedOrderId);
    }
    setImportOrder({
      id: selectedOrderId,
      ref: row?.ref || "BCF"
    });
    setInvoiceWizardStep(1);
    setInvoiceWizardOpen(true);
  };
  const purchaseColumns = [{
    key: "ref",
    header: "Bon de commande",
    align: "left",
    render: (o) => /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: o.ref })
  }, {
    key: "fournisseur",
    header: "Fournisseur"
  }, {
    key: "articles",
    header: "Articles",
    align: "right"
  }, {
    key: "date",
    header: "Date"
  }, {
    key: "montant",
    header: "Montant",
    align: "right",
    render: (o) => /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: fmtCurrency(o.montant) })
  }, {
    key: "statut",
    header: "Statut",
    align: "right",
    render: (o) => /* @__PURE__ */ jsx(StatusBadge, { status: o.statut })
  }, {
    key: "factureRecue",
    header: "Facture recue",
    align: "right",
    render: (o) => {
      const canCreateInvoice = canCreateInvoiceForStatus(o.statutRaw);
      return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end gap-1", onClick: (e) => e.stopPropagation(), children: [
        /* @__PURE__ */ jsx(Switch, { checked: o.factureRecue, disabled: !canCreateInvoice, onCheckedChange: () => {
          if (!canCreateInvoice) return;
          void openInvoiceWizard(o.id);
        }, "aria-label": `Facture recue pour ${o.ref}` }),
        !canCreateInvoice ? /* @__PURE__ */ jsx("p", { className: "text-center text-[11px] leading-tight text-amber-600", children: "Reception valide requise" }) : null
      ] });
    }
  }];
  const receptionColumns = useMemo(() => [{
    key: "reference",
    header: "Reference"
  }, {
    key: "date",
    header: "Date"
  }, {
    key: "fournisseur",
    header: "Fournisseur"
  }, {
    key: "utilisateur",
    header: "Utilisateur"
  }, {
    key: "lignes",
    header: "Lignes",
    align: "right"
  }, {
    key: "quantiteRecue",
    header: "Quantite recue",
    align: "right"
  }, {
    key: "statut",
    header: "Statut",
    align: "right",
    render: (row) => /* @__PURE__ */ jsx(StatusBadge, { status: row.statut })
  }], []);
  const steps = useMemo(() => {
    const byStatus = (targets) => rows.filter((r) => targets.includes(r.statutRaw)).length;
    const countBrouillon = byStatus(["BROUILLON"]);
    const countValidation = byStatus(["SOUMIS", "VALIDE"]);
    const countEnvoye = byStatus(["ENVOYE", "CONFIRME"]);
    const countReception = byStatus(["RECU_PARTIEL", "RECU_TOTAL"]);
    return [{
      icon: FileEdit,
      label: `Brouillon (${countBrouillon})`,
      done: countBrouillon > 0
    }, {
      icon: CheckCircle2,
      label: `Validation (${countValidation})`,
      done: countValidation > 0
    }, {
      icon: Truck,
      label: `Commande envoyee (${countEnvoye})`,
      done: countEnvoye > 0
    }, {
      icon: PackageCheck,
      label: `Reception (${countReception})`,
      done: countReception > 0
    }];
  }, [rows]);
  const productMap = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const p of products) map.set(p.id, p);
    return map;
  }, [products]);
  const supplierOptions = useMemo(() => suppliers.map((s) => ({
    value: s.id,
    label: s.raisonSociale || "Fournisseur"
  })), [suppliers]);
  const productOptions = useMemo(() => products.map((p) => ({
    value: p.id,
    label: `${p.designation} (${p.reference || "-"})`
  })), [products]);
  const lineCalculations = useMemo(() => lines.map((line) => {
    const brut = line.quantite * line.prixUnitaireHt;
    const remiseMontant = brut * (line.remise / 100);
    const netHt = brut - remiseMontant;
    const tvaMontant = netHt * (line.tva / 100);
    const ttc = netHt + tvaMontant;
    return {
      ...line,
      brut,
      remiseMontant,
      netHt,
      tvaMontant,
      ttc
    };
  }), [lines]);
  const totals = useMemo(() => lineCalculations.reduce((acc, line) => {
    acc.totalHt += line.netHt;
    acc.totalRemise += line.remiseMontant;
    acc.totalTva += line.tvaMontant;
    acc.totalTtc += line.ttc;
    return acc;
  }, {
    totalHt: 0,
    totalRemise: 0,
    totalTva: 0,
    totalTtc: 0
  }), [lineCalculations]);
  const addLine = () => {
    setLines((prev) => [...prev, {
      id: makeLineId(),
      idProduit: "",
      quantite: 1,
      unite: "PIECE",
      prixUnitaireHt: 0,
      remise: 0,
      tva: 18
    }]);
    setLinesError("");
  };
  const updateLine = (lineId, patch) => {
    setLines((prev) => prev.map((line) => line.id === lineId ? {
      ...line,
      ...patch
    } : line));
    setLineErrorsById((prev) => {
      const current = prev[lineId];
      if (!current) return prev;
      const next = {
        ...current
      };
      if (patch.idProduit !== void 0) delete next.idProduit;
      if (patch.quantite !== void 0) delete next.quantite;
      if (patch.prixUnitaireHt !== void 0) delete next.prixUnitaireHt;
      if (patch.remise !== void 0) delete next.remise;
      if (patch.tva !== void 0) delete next.tva;
      if (Object.keys(next).length === 0) {
        const {
          [lineId]: _removed,
          ...rest
        } = prev;
        return rest;
      }
      return {
        ...prev,
        [lineId]: next
      };
    });
  };
  const removeLine = (lineId) => {
    setLines((prev) => prev.filter((line) => line.id !== lineId));
    setLineErrorsById((prev) => {
      const {
        [lineId]: _removed,
        ...rest
      } = prev;
      return rest;
    });
  };
  const setGeneralField = (key, value) => {
    setGeneralForm((prev) => ({
      ...prev,
      [key]: value
    }));
    if (generalErrors[key]) {
      setGeneralErrors((prev) => ({
        ...prev,
        [key]: void 0
      }));
    }
  };
  const validateStep1 = () => {
    const next = {};
    if (!generalForm.idFournisseur) next.idFournisseur = "Ce champ est requis";
    if (!generalForm.entrepot.trim()) next.entrepot = "Ce champ est requis";
    if (!generalForm.dateLivraisonSouhaitee) next.dateLivraisonSouhaitee = "Ce champ est requis";
    if (generalForm.dateLivraisonSouhaitee && generalForm.dateLivraisonSouhaitee <= todayDate) {
      next.dateLivraisonSouhaitee = "La date de livraison doit etre strictement posterieure a aujourd'hui";
    }
    if (!generalForm.conditionsPaiement.trim()) next.conditionsPaiement = "Ce champ est requis";
    if (!generalForm.conditionsLivraison.trim()) next.conditionsLivraison = "Ce champ est requis";
    if (!generalForm.devise) next.devise = "Ce champ est requis";
    if (!generalForm.priorite) next.priorite = "Ce champ est requis";
    setGeneralErrors(next);
    return Object.keys(next).length === 0;
  };
  const validateStep2 = () => {
    const nextLineErrors = {};
    if (lines.length === 0) {
      setLinesError("Ajoutez au moins une ligne produit");
      setLineErrorsById({});
      return false;
    }
    setLinesError("");
    for (const line of lines) {
      const lineError = {};
      if (!line.idProduit) {
        lineError.idProduit = "Ce champ est requis";
      }
      if (!line.unite) {
        lineError.idProduit = lineError.idProduit || "Ce champ est requis";
      }
      if (line.quantite <= 0) {
        lineError.quantite = "La quantite doit etre superieure a 0";
      }
      if (line.prixUnitaireHt < 0) {
        lineError.prixUnitaireHt = "La valeur doit etre positive";
      }
      if (line.remise < 0 || line.remise > 100) {
        lineError.remise = "Valeur attendue entre 0 et 100";
      }
      if (line.tva < 0 || line.tva > 100) {
        lineError.tva = "Valeur attendue entre 0 et 100";
      }
      if (Object.keys(lineError).length > 0) {
        nextLineErrors[line.id] = lineError;
      }
    }
    setLineErrorsById(nextLineErrors);
    return Object.keys(nextLineErrors).length === 0;
  };
  const nextStep = () => {
    if (createStep === 1 && !validateStep1()) {
      if (generalForm.dateLivraisonSouhaitee && generalForm.dateLivraisonSouhaitee <= todayDate) {
        toast.warning("La date de livraison doit etre strictement posterieure a aujourd'hui");
      }
      return;
    }
    if (createStep === 2 && !validateStep2()) {
      if (lines.length > 0) {
        const invalidLineIndex = lines.findIndex((line) => {
          return line.quantite <= 0 || line.prixUnitaireHt < 0 || line.remise < 0 || line.remise > 100 || line.tva < 0 || line.tva > 100;
        });
        if (invalidLineIndex >= 0) {
          toast.warning(`Regle metier invalide sur la ligne ${invalidLineIndex + 1}: quantite > 0, prix >= 0, remise et TVA entre 0 et 100`);
        }
      }
      return;
    }
    setCreateStep((prev) => Math.min(3, prev + 1));
  };
  const previousStep = () => {
    setCreateStep((prev) => Math.max(1, prev - 1));
  };
  const createBonCommande = async () => {
    if (!validateStep1() || !validateStep2()) return;
    if (!confirmationChecked) {
      setConfirmationError("Ce champ est requis");
      return;
    }
    setConfirmationError("");
    const notes = [`Entrepot: ${generalForm.entrepot}`, `Date bon: ${generalForm.dateBon}`, `Conditions paiement: ${generalForm.conditionsPaiement}`, `Conditions livraison: ${generalForm.conditionsLivraison}`, `Devise: ${generalForm.devise}`, `Priorite: ${generalForm.priorite}`, generalForm.commentaires ? `Commentaires: ${generalForm.commentaires}` : ""].filter(Boolean).join("\n");
    const payload = {
      idFournisseur: generalForm.idFournisseur,
      dateLivraisonPrevue: generalForm.dateLivraisonSouhaitee,
      notes,
      lignes: lines.map((line) => ({
        idProduit: line.idProduit,
        quantiteCommandee: toNumber(line.quantite, 0),
        prixUnitaireHt: toNumber(line.prixUnitaireHt, 0),
        remise: toNumber(line.remise, 0),
        tauxTva: toNumber(line.tva, 18)
      }))
    };
    setCreateSubmitting(true);
    try {
      await createBonCommandeFournisseur(payload);
      toast.success("Bon d'achat cree avec le statut BROUILLON");
      setCreateOpen(false);
      resetCreateWizard();
      await loadRows();
    } catch (error) {
      const maybeMessage = error && typeof error === "object" && "message" in error ? String(error.message || "") : "";
      toast.error(maybeMessage.trim() || "Impossible de creer le bon d'achat");
    } finally {
      setCreateSubmitting(false);
    }
  };
  const buildReceptionLinesFromOrder = (order) => (order.lignes || []).map((line) => {
    const commandee = toNumber(line.quantiteCommandee, 0);
    const dejaRecue = toNumber(line.quantiteRecue, 0);
    const restant = Math.max(0, commandee - dejaRecue);
    return {
      idLigneBcf: line.id,
      produit: `${line.produit?.designation || "Produit"} (${line.produit?.reference || "-"})`,
      quantiteCommandee: commandee,
      quantiteDejaRecue: dejaRecue,
      restant,
      quantiteARecevoir: 0
    };
  });
  const openDetailsModal = async (orderId) => {
    setDetailsLoading(true);
    try {
      const response = await getBonCommandeFournisseurById(orderId);
      const order = response?.data;
      if (!order) {
        toast.error("Bon de commande introuvable");
        return;
      }
      try {
        const imported = await getFacturesImporteesBcf(order.id);
        setImportedInvoices(Array.isArray(imported?.data) ? imported.data : []);
      } catch {
        setImportedInvoices([]);
      }
      setDetailsOrder(order);
      setReceptionRowsSearch("");
      setReceptionRowsStatusFilter("");
      setReceptionRowsPage(1);
      setDetailsOpen(true);
    } catch {
      toast.error("Impossible de charger le detail du bon");
    } finally {
      setDetailsLoading(false);
    }
  };
  const openReceptionModal = async (orderId) => {
    const selectedOrderId = orderId || detailsOrder?.id;
    if (!selectedOrderId) return;
    try {
      const response = await getBonCommandeFournisseurById(selectedOrderId);
      const order = response?.data;
      if (!order) {
        toast.error("Bon de commande introuvable");
        return;
      }
      const receptionLines = buildReceptionLinesFromOrder(order);
      setReceptionOrder({
        id: order.id,
        ref: order.numeroBcf,
        lines: receptionLines
      });
      setReceptionGeneralForm({
        date: todayDate,
        observations: ""
      });
      setReceptionGeneralErrors({});
      setReceptionLinesError("");
      setReceptionStep(1);
      setReceptionOpen(true);
      setDetailsOrder(order);
    } catch {
      toast.error("Impossible de charger le detail du bon");
    }
  };
  const submitReception = async () => {
    if (!receptionOrder) return;
    const lignes = receptionOrder.lines.filter((line) => line.quantiteARecevoir > 0).map((line) => ({
      idLigneBcf: line.idLigneBcf,
      quantiteRecue: Math.min(line.quantiteARecevoir, line.restant),
      conforme: true
    }));
    if (lignes.length === 0) {
      toast.error("Saisissez au moins une quantite recue");
      return;
    }
    setReceptionSubmitting(true);
    try {
      await receptionBonCommandeFournisseur(receptionOrder.id, {
        lignes
      });
      toast.success("Reception enregistree");
      setReceptionOpen(false);
      setReceptionOrder(null);
      setReceptionStep(1);
      await loadRows();
      await openDetailsModal(receptionOrder.id);
    } catch {
      toast.error("Impossible d'enregistrer la reception");
    } finally {
      setReceptionSubmitting(false);
    }
  };
  const sendToSupplier = async (orderId) => {
    try {
      await envoyerBonCommandeFournisseur(orderId);
      toast.success("Bon envoye au fournisseur");
      await loadRows();
    } catch (error) {
      const maybeMessage = error && typeof error === "object" && "message" in error ? String(error.message || "") : "";
      toast.error(maybeMessage.trim() || "Impossible d'envoyer le bon au fournisseur");
    }
  };
  const transitionOrder = async (orderId, action, successMessage) => {
    try {
      await transitionBonCommandeFournisseur(orderId, action);
      toast.success(successMessage);
      await loadRows();
    } catch (error) {
      const maybeMessage = error && typeof error === "object" && "message" in error ? String(error.message || "") : "";
      toast.error(maybeMessage.trim() || "Operation impossible sur ce statut");
    }
  };
  const duplicateOrder = async (orderId) => {
    try {
      await dupliquerBonCommandeFournisseur(orderId);
      toast.success("Bon de commande duplique en brouillon");
      await loadRows();
    } catch (error) {
      const maybeMessage = error && typeof error === "object" && "message" in error ? String(error.message || "") : "";
      toast.error(maybeMessage.trim() || "Duplication impossible");
    }
  };
  const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("PDF_READ_FAILED"));
    reader.readAsDataURL(blob);
  });
  const openPdfOrder = async (orderId) => {
    setPdfModalLoading(true);
    setPdfModalOpen(true);
    try {
      const blob = await telechargerBonCommandeFournisseurPdf(orderId);
      const dataUrl = await blobToDataUrl(blob);
      const numero = rows.find((row) => row.id === orderId)?.ref || "bcf";
      setPdfFilename(`${numero}.pdf`);
      setPdfBlob(blob);
      setPdfDataUrl(dataUrl);
    } catch (error) {
      const maybeMessage = error && typeof error === "object" && "message" in error ? String(error.message || "") : "";
      toast.error(maybeMessage.trim() || "Impossible de generer le PDF");
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
  const onImportFileChange = (file) => {
    setImportFile(file);
    if (importPreviewUrl) {
      URL.revokeObjectURL(importPreviewUrl);
      setImportPreviewUrl(null);
    }
    if (file && file.type === "application/pdf") {
      setImportPreviewUrl(URL.createObjectURL(file));
    }
  };
  const submitImportInvoiceDecision = async (decision) => {
    if (!importOrder?.id) return;
    if (!importFile) {
      toast.error("Selectionnez d'abord un fichier PDF, DOC ou DOCX");
      return;
    }
    setImportSubmitting(true);
    try {
      const response = await importerFactureFournisseurBcf(importOrder.id, {
        file: importFile,
        decision
      });
      const numero = response?.data?.numeroFacture;
      toast.success(numero ? `Facture importee ${decision.toLowerCase()}: ${numero}` : `Facture importee ${decision.toLowerCase()}`);
      onImportFileChange(null);
      const listResponse = await getFacturesImporteesBcf(importOrder.id);
      setImportedInvoices(Array.isArray(listResponse?.data) ? listResponse.data : []);
      await loadRows();
    } catch (error) {
      const maybeMessage = error && typeof error === "object" && "message" in error ? String(error.message || "") : "";
      toast.error(maybeMessage.trim() || "Import de facture impossible");
    } finally {
      setImportSubmitting(false);
    }
  };
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
  const actionsByStatus = (row) => {
    const makeAction = (key, label, icon, action, destructive = false) => {
      const isRunning = rowActionPendingById[row.id] === key;
      return {
        label,
        icon: isRunning ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : icon,
        destructive,
        onClick: () => void executeRowActionWithLoader(row.id, key, action)
      };
    };
    if (row.statutRaw === "BROUILLON") {
      return [makeAction("submit", "Soumettre", /* @__PURE__ */ jsx(ArrowRight, { className: "mr-2 h-4 w-4" }), () => transitionOrder(row.id, "SUBMIT", "Bon soumis pour validation")), makeAction("cancel", "Annuler", /* @__PURE__ */ jsx(Trash2, { className: "mr-2 h-4 w-4" }), () => transitionOrder(row.id, "CANCEL", "Bon annule"), true), makeAction("duplicate", "Dupliquer", /* @__PURE__ */ jsx(Copy, { className: "mr-2 h-4 w-4" }), () => duplicateOrder(row.id)), makeAction("export-pdf", "Exporter PDF", /* @__PURE__ */ jsx(Download, { className: "mr-2 h-4 w-4" }), () => openPdfOrder(row.id))];
    }
    if (row.statutRaw === "SOUMIS") {
      return [makeAction("validate", "Valider", /* @__PURE__ */ jsx(CheckCircle2, { className: "mr-2 h-4 w-4" }), () => transitionOrder(row.id, "VALIDATE", "Bon valide")), makeAction("cancel", "Annuler", /* @__PURE__ */ jsx(Trash2, { className: "mr-2 h-4 w-4" }), () => transitionOrder(row.id, "CANCEL", "Bon annule"), true), makeAction("back-to-draft", "Retour au brouillon", /* @__PURE__ */ jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }), () => transitionOrder(row.id, "BACK_TO_DRAFT", "Bon retourne au brouillon")), makeAction("duplicate", "Dupliquer", /* @__PURE__ */ jsx(Copy, { className: "mr-2 h-4 w-4" }), () => duplicateOrder(row.id))];
    }
    if (row.statutRaw === "VALIDE") {
      return [
        makeAction("send", "Envoyer au fournisseur", /* @__PURE__ */ jsx(Send, { className: "mr-2 h-4 w-4" }), () => sendToSupplier(row.id)),
        makeAction("download-pdf", "Telecharger PDF", /* @__PURE__ */ jsx(Download, { className: "mr-2 h-4 w-4" }), () => openPdfOrder(row.id)),
        /* makeAction(
          "print",
          "Imprimer",
          <Printer className="mr-2 h-4 w-4" />,
          () => openPdfOrder(row.id, true),
        ), */
        makeAction("cancel", "Annuler", /* @__PURE__ */ jsx(Trash2, { className: "mr-2 h-4 w-4" }), () => transitionOrder(row.id, "CANCEL", "Bon annule"), true)
      ];
    }
    if (row.statutRaw === "ENVOYE") {
      return [makeAction("resend", "Relancer le fournisseur", /* @__PURE__ */ jsx(Send, { className: "mr-2 h-4 w-4" }), () => sendToSupplier(row.id)), makeAction("details", "Voir le detail", /* @__PURE__ */ jsx(FileEdit, { className: "mr-2 h-4 w-4" }), () => openReceptionModal(row.id)), makeAction("cancel", "Annuler", /* @__PURE__ */ jsx(Trash2, { className: "mr-2 h-4 w-4" }), () => transitionOrder(row.id, "CANCEL", "Bon annule"), true), makeAction("create-reception", "Creer une reception", /* @__PURE__ */ jsx(PackageCheck, { className: "mr-2 h-4 w-4" }), () => openReceptionModal(row.id)), makeAction("download-pdf", "Telecharger PDF", /* @__PURE__ */ jsx(Download, { className: "mr-2 h-4 w-4" }), () => openPdfOrder(row.id))];
    }
    if (row.statutRaw === "CONFIRME") {
      return [
        /* makeAction(
          "details",
          "Voir le detail",
          <FileEdit className="mr-2 h-4 w-4" />,
          () => openReceptionModal(row.id),
        ), */
        makeAction("create-reception", "Creer une reception", /* @__PURE__ */ jsx(PackageCheck, { className: "mr-2 h-4 w-4" }), () => openReceptionModal(row.id)),
        makeAction("download-pdf", "Telecharger PDF", /* @__PURE__ */ jsx(Download, { className: "mr-2 h-4 w-4" }), () => openPdfOrder(row.id))
        /* makeAction(
          "print",
          "Imprimer",
          <Printer className="mr-2 h-4 w-4" />,
          () => openPdfOrder(row.id, true),
        ), */
      ];
    }
    if (row.statutRaw === "RECU_PARTIEL") {
      return [
        makeAction("import-invoice", "Ajouter facture fournisseur", /* @__PURE__ */ jsx(FileEdit, { className: "mr-2 h-4 w-4" }), () => openInvoiceWizard(row.id)),
        makeAction("new-reception", "Nouvelle reception", /* @__PURE__ */ jsx(PackageCheck, { className: "mr-2 h-4 w-4" }), () => openReceptionModal(row.id)),
        /*  makeAction(
          "remaining-quantities",
          "Voir les quantites restantes",
          <FileEdit className="mr-2 h-4 w-4" />,
          () => openReceptionModal(row.id),
        ), */
        makeAction("download-pdf", "Telecharger PDF", /* @__PURE__ */ jsx(Download, { className: "mr-2 h-4 w-4" }), () => openPdfOrder(row.id))
        /*  makeAction(
          "print",
          "Imprimer",
          <Printer className="mr-2 h-4 w-4" />,
          () => openPdfOrder(row.id, true),
        ), */
      ];
    }
    if (row.statutRaw === "RECU_TOTAL") {
      return [
        makeAction("import-invoice", "Ajouter facture fournisseur", /* @__PURE__ */ jsx(FileEdit, { className: "mr-2 h-4 w-4" }), () => openInvoiceWizard(row.id)),
        makeAction("download-pdf", "Telecharger PDF", /* @__PURE__ */ jsx(Download, { className: "mr-2 h-4 w-4" }), () => openPdfOrder(row.id)),
        /*  makeAction(
          "print",
          "Imprimer",
          <Printer className="mr-2 h-4 w-4" />,
          () => openPdfOrder(row.id, true),
        ), */
        makeAction("duplicate", "Dupliquer", /* @__PURE__ */ jsx(Copy, { className: "mr-2 h-4 w-4" }), () => duplicateOrder(row.id))
      ];
    }
    if (row.statutRaw === "ANNULE") {
      return [makeAction("duplicate", "Dupliquer", /* @__PURE__ */ jsx(Copy, { className: "mr-2 h-4 w-4" }), () => duplicateOrder(row.id)), makeAction("download-pdf", "Telecharger PDF", /* @__PURE__ */ jsx(Download, { className: "mr-2 h-4 w-4" }), () => openPdfOrder(row.id))];
    }
    if (row.statutRaw === "REJETE") {
      return [makeAction("duplicate", "Dupliquer", /* @__PURE__ */ jsx(Copy, { className: "mr-2 h-4 w-4" }), () => duplicateOrder(row.id)), makeAction("download-pdf", "Telecharger PDF", /* @__PURE__ */ jsx(Download, { className: "mr-2 h-4 w-4" }), () => openPdfOrder(row.id))];
    }
    return [];
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Achats", description: "Bons de commande, réceptions et validation fournisseurs", breadcrumb: ["Transactions", "Achats"], actions: /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5", onClick: () => {
      resetCreateWizard();
      setCreateOpen(true);
    }, children: [
      /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
      " Nouveau bon de commande"
    ] }) }),
    /* @__PURE__ */ jsx(SectionCard, { title: "Workflow d'achat", description: "Cycle de vie d'un bon de commande", className: "mb-3 bg-gradient-to-r from-blue-500/2 via-sky-500/4 to-indigo-500/2 border border-blue-200/50", children: /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-start", children: steps.map((s, i) => /* @__PURE__ */ jsxs("div", { className: "flex flex-1 items-center gap-2 sm:flex-col sm:items-center sm:gap-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex w-full items-center sm:flex-col sm:items-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "absolute -right-1 -top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-background text-[9px] font-bold ring-1 ring-border text-muted-foreground", children: i + 1 }),
          /* @__PURE__ */ jsx("span", { className: cn("flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300", s.done ? "bg-gradient-primary text-white shadow-md shadow-primary/30 ring-4 ring-primary/10" : "border-2 border-dashed border-border bg-muted/40 text-muted-foreground"), children: /* @__PURE__ */ jsx(s.icon, { className: "h-5 w-5" }) }),
          s.done && /* @__PURE__ */ jsx("span", { className: "absolute -bottom-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-green-500 ring-2 ring-background", children: /* @__PURE__ */ jsx("svg", { className: "h-2 w-2 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 3, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 13l4 4L19 7" }) }) })
        ] }),
        i < steps.length - 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: cn("hidden h-0.5 flex-1 sm:block", s.done ? "bg-gradient-to-r from-primary/60 to-primary/20" : "bg-border/60") }),
          /* @__PURE__ */ jsx("div", { className: cn("mx-5 my-1 h-5 w-0.5 sm:hidden", s.done ? "bg-primary/40" : "bg-border/60") })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "sm:mt-3 sm:text-center", children: [
        /* @__PURE__ */ jsx("p", { className: cn("text-sm font-semibold leading-tight", s.done ? "text-foreground" : "text-muted-foreground"), children: s.label }),
        /* @__PURE__ */ jsx("p", { className: cn("mt-0.5 text-[11px]", s.done ? "text-green-600 dark:text-green-400" : "text-muted-foreground/60"), children: s.done ? "Complété" : "En attente" })
      ] })
    ] }, s.label)) }) }),
    /* @__PURE__ */ jsxs(SectionCard, { title: "Bons de commande", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(Toolbar, { placeholder: "Rechercher un bon de commande...", searchValue: search, onSearchChange: setSearch, filterOptions, selectedFilter: statusFilter, onFilterChange: setStatusFilter, filterPlaceholder: "Filtrer par statut", filterSearchPlaceholder: "Rechercher un statut" }) }),
      loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(DataTable, { columns: purchaseColumns, rows: paginatedRows, rowKey: (o) => o.id, rowActions: actionsByStatus, isRowActionLoading: (o) => Boolean(rowActionPendingById[o.id]), onRowClick: (row) => {
          void openDetailsModal(row.id);
        } }),
        /* @__PURE__ */ jsx(Pagination, { count: filteredRows.length, currentPage: page, totalPages, pageSize: PAGE_SIZE, onPageChange: setPage })
      ] })
    ] }),
    /* @__PURE__ */ jsx(AppModal, { open: detailsOpen, onOpenChange: (open) => {
      setDetailsOpen(open);
      if (!open) setDetailsOrder(null);
    }, title: detailsOrder ? `Bon ${detailsOrder.numeroBcf}` : "Detail bon", description: "Receptions independantes et facture fournisseur", size: "xxl", footer: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-end", children: /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setDetailsOpen(false), children: "Fermer" }) }), children: detailsLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-14", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : detailsOrder ? /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      canCreateInvoiceForStatus(detailsOrder.statut) ? null : /* @__PURE__ */ jsx("div", { className: "rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700", children: "Creation de facture disponible apres une reception valide (partielle ou totale)." }),
      /* @__PURE__ */ jsx(PageHeader, { title: `Receptions - ${detailsOrder.numeroBcf}`, description: "Pilotage des receptions et facture fournisseur", breadcrumb: ["Achats", "Bon de commande", "Receptions"], actions: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", disabled: !canCreateInvoiceForStatus(detailsOrder.statut), onClick: () => void openInvoiceWizard(detailsOrder.id), children: [
          /* @__PURE__ */ jsx(ReceiptText, { className: "mr-1 h-4 w-4" }),
          " Ajouter facture"
        ] }),
        /* @__PURE__ */ jsxs(Button, { size: "sm", disabled: detailsOrder.statut === "RECU_TOTAL", title: detailsOrder.statut === "RECU_TOTAL" ? "Reception deja totale" : void 0, onClick: () => void openReceptionModal(detailsOrder.id), children: [
          /* @__PURE__ */ jsx(Plus, { className: "mr-1 h-4 w-4" }),
          " Nouvelle reception"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(SectionCard, { title: "Liste des receptions", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(Toolbar, { placeholder: "Rechercher une reception...", searchValue: receptionRowsSearch, onSearchChange: setReceptionRowsSearch, filterOptions: receptionFilterOptions, selectedFilter: receptionRowsStatusFilter, onFilterChange: setReceptionRowsStatusFilter, filterPlaceholder: "Filtrer par statut", filterSearchPlaceholder: "Rechercher un statut" }) }),
        /* @__PURE__ */ jsx(DataTable, { columns: receptionColumns, rows: paginatedReceptionRows, rowKey: (row) => row.id, withActions: false }),
        /* @__PURE__ */ jsx(Pagination, { count: filteredReceptionRows.length, currentPage: receptionRowsPage, totalPages: receptionTotalPages, pageSize: RECEPTION_PAGE_SIZE, onPageChange: setReceptionRowsPage })
      ] })
    ] }) : /* @__PURE__ */ jsx("p", { className: "py-10 text-center text-sm text-muted-foreground", children: "Aucun detail disponible." }) }),
    /* @__PURE__ */ jsxs(AppModal, { open: createOpen, onOpenChange: (open) => {
      if (!createSubmitting) setCreateOpen(open);
    }, title: "Creation du bon d'achat", description: "Wizard en 3 etapes: informations, produits, verification", size: "xxl", footer: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setCreateOpen(false), disabled: createSubmitting, children: "Annuler" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        createStep > 1 ? /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: previousStep, disabled: createSubmitting, children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "mr-1 h-4 w-4" }),
          " Retour"
        ] }) : null,
        createStep < 3 ? /* @__PURE__ */ jsxs(Button, { onClick: nextStep, disabled: createSubmitting, children: [
          "Suivant ",
          /* @__PURE__ */ jsx(ArrowRight, { className: "ml-1 h-4 w-4" })
        ] }) : /* @__PURE__ */ jsxs(Button, { onClick: () => void createBonCommande(), disabled: createSubmitting || !confirmationChecked, children: [
          createSubmitting ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
          "Creer le bon"
        ] })
      ] })
    ] }), children: [
      /* @__PURE__ */ jsx("div", { className: "mb-5 flex items-center gap-2", children: [1, 2, 3].map((step) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: `flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${createStep >= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`, children: step }),
        step < 3 ? /* @__PURE__ */ jsx("span", { className: "h-0.5 w-8 bg-border" }) : null
      ] }, step)) }),
      createStep === 1 ? /* @__PURE__ */ jsxs("div", { className: "grid h-[560px] content-start gap-4 overflow-y-auto pr-1 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs(Label, { children: [
            "Fournisseur",
            /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: cn(generalErrors.idFournisseur ? "rounded-md border border-destructive p-1" : ""), children: /* @__PURE__ */ jsx(SearchableSelect, { portalMode: "body", value: generalForm.idFournisseur, onValueChange: (value) => setGeneralField("idFournisseur", value), options: supplierOptions, placeholder: "Selectionner un fournisseur", searchPlaceholder: "Rechercher un fournisseur", emptyMessage: "Aucun fournisseur" }) }),
          generalErrors.idFournisseur ? /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: generalErrors.idFournisseur }) : null
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs(Label, { htmlFor: "entrepot", children: [
            "Entrepot",
            /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(Input, { id: "entrepot", value: generalForm.entrepot, onChange: (e) => setGeneralField("entrepot", e.target.value), className: cn(generalErrors.entrepot ? "border-destructive" : ""), placeholder: "Entrepot principal" }),
          generalErrors.entrepot ? /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: generalErrors.entrepot }) : null
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs(Label, { children: [
            "Date du bon",
            /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex h-9 items-center rounded-md border border-input bg-muted/40 px-3 text-sm text-foreground", children: generalForm.dateBon ? new Date(generalForm.dateBon).toLocaleDateString("fr-FR") : "-" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "La date du bon est automatiquement definie a la date actuelle." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs(Label, { htmlFor: "date-livraison", children: [
            "Date souhaitee de livraison",
            /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(Input, { id: "date-livraison", type: "date", min: tomorrowDate, value: generalForm.dateLivraisonSouhaitee, onChange: (e) => setGeneralField("dateLivraisonSouhaitee", e.target.value), className: cn(generalErrors.dateLivraisonSouhaitee ? "border-destructive" : "") }),
          generalErrors.dateLivraisonSouhaitee ? /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: generalErrors.dateLivraisonSouhaitee }) : null
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs(Label, { htmlFor: "cond-paiement", children: [
            "Conditions de paiement",
            /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(Input, { id: "cond-paiement", value: generalForm.conditionsPaiement, onChange: (e) => setGeneralField("conditionsPaiement", e.target.value), className: cn(generalErrors.conditionsPaiement ? "border-destructive" : ""), placeholder: "Ex: 30 jours fin de mois" }),
          generalErrors.conditionsPaiement ? /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: generalErrors.conditionsPaiement }) : null
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs(Label, { htmlFor: "cond-livraison", children: [
            "Conditions de livraison",
            /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(Input, { id: "cond-livraison", value: generalForm.conditionsLivraison, onChange: (e) => setGeneralField("conditionsLivraison", e.target.value), className: cn(generalErrors.conditionsLivraison ? "border-destructive" : ""), placeholder: "Ex: Franco entrepot" }),
          generalErrors.conditionsLivraison ? /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: generalErrors.conditionsLivraison }) : null
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs(Label, { children: [
            "Devise",
            /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: cn(generalErrors.devise ? "rounded-md border border-destructive p-1" : ""), children: /* @__PURE__ */ jsx(SearchableSelect, { portalMode: "body", value: generalForm.devise, onValueChange: (value) => setGeneralField("devise", value), options: [{
            value: "XOF",
            label: "XOF"
          }, {
            value: "EUR",
            label: "EUR"
          }, {
            value: "USD",
            label: "USD"
          }], placeholder: "Selectionner une devise", searchPlaceholder: "Rechercher une devise", emptyMessage: "Aucune devise" }) }),
          generalErrors.devise ? /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: generalErrors.devise }) : null
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs(Label, { children: [
            "Priorite",
            /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: cn(generalErrors.priorite ? "rounded-md border border-destructive p-1" : ""), children: /* @__PURE__ */ jsx(SearchableSelect, { portalMode: "body", value: generalForm.priorite, onValueChange: (value) => setGeneralField("priorite", value), options: [{
            value: "BASSE",
            label: "Basse"
          }, {
            value: "NORMALE",
            label: "Normale"
          }, {
            value: "HAUTE",
            label: "Haute"
          }, {
            value: "URGENTE",
            label: "Urgente"
          }], placeholder: "Selectionner une priorite", searchPlaceholder: "Rechercher une priorite", emptyMessage: "Aucune priorite" }) }),
          generalErrors.priorite ? /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: generalErrors.priorite }) : null
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 md:col-span-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "commentaires", children: "Commentaires" }),
          /* @__PURE__ */ jsx(Textarea, { id: "commentaires", value: generalForm.commentaires, onChange: (e) => setGeneralForm((prev) => ({
            ...prev,
            commentaires: e.target.value
          })), placeholder: "Commentaires internes" })
        ] })
      ] }) : null,
      createStep === 2 ? /* @__PURE__ */ jsxs("div", { className: "h-[560px] space-y-4 overflow-y-auto pr-1", children: [
        linesError ? /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: linesError }) : null,
        /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: addLine, children: [
          /* @__PURE__ */ jsx(Plus, { className: "mr-1 h-4 w-4" }),
          " Ajouter une ligne"
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-md border border-border", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[980px] text-sm", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground", children: [
            /* @__PURE__ */ jsxs("th", { className: "px-2 py-2", children: [
              "Produit",
              /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsxs("th", { className: "px-2 py-2", children: [
              "Quantite",
              /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsx("th", { className: "min-w-[170px] px-2 py-2", children: "Unite" }),
            /* @__PURE__ */ jsx("th", { className: "px-2 py-2", children: "Prix unitaire HT" }),
            /* @__PURE__ */ jsx("th", { className: "px-2 py-2", children: "Remise %" }),
            /* @__PURE__ */ jsx("th", { className: "px-2 py-2", children: "TVA %" }),
            /* @__PURE__ */ jsx("th", { className: "px-2 py-2 text-right", children: "Total HT" }),
            /* @__PURE__ */ jsx("th", { className: "px-2 py-2" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: lineCalculations.map((line) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/60", children: [
            /* @__PURE__ */ jsxs("td", { className: "px-2 py-2", children: [
              /* @__PURE__ */ jsx("div", { className: cn(lineErrorsById[line.id]?.idProduit ? "rounded-md border border-destructive p-1" : ""), children: /* @__PURE__ */ jsx(SearchableSelect, { portalMode: "body", value: line.idProduit, onValueChange: (value) => {
                const product = productMap.get(value);
                updateLine(line.id, {
                  idProduit: value,
                  unite: product?.uniteMesure || "PIECE",
                  prixUnitaireHt: toNumber(product?.prixAchatHt, 0),
                  tva: toNumber(product?.tauxTva, 18)
                });
              }, options: productOptions, placeholder: "Selectionner un produit", searchPlaceholder: "Rechercher un produit", emptyMessage: "Aucun produit" }) }),
              lineErrorsById[line.id]?.idProduit ? /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-destructive", children: lineErrorsById[line.id].idProduit }) : null
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "px-2 py-2", children: [
              /* @__PURE__ */ jsx(Input, { type: "text", inputMode: "decimal", value: formatGroupedInputNumber(String(line.quantite)), className: cn(lineErrorsById[line.id]?.quantite ? "border-destructive" : ""), onChange: (e) => updateLine(line.id, {
                quantite: Math.max(0, toNumber(normalizeNumberInput(e.target.value), 0))
              }) }),
              lineErrorsById[line.id]?.quantite ? /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-destructive", children: lineErrorsById[line.id].quantite }) : null
            ] }),
            /* @__PURE__ */ jsx("td", { className: "min-w-[170px] px-2 py-2", children: /* @__PURE__ */ jsx(SearchableSelect, { portalMode: "body", value: line.unite, onValueChange: (value) => updateLine(line.id, {
              unite: value
            }), options: UNIT_OPTIONS, placeholder: "Selectionner une unite", searchPlaceholder: "Rechercher une unite", emptyMessage: "Aucune unite", className: "min-w-[170px]" }) }),
            /* @__PURE__ */ jsxs("td", { className: "px-2 py-2", children: [
              /* @__PURE__ */ jsx(Input, { type: "text", inputMode: "decimal", value: formatGroupedInputNumber(String(line.prixUnitaireHt)), className: cn(lineErrorsById[line.id]?.prixUnitaireHt ? "border-destructive" : ""), onChange: (e) => updateLine(line.id, {
                prixUnitaireHt: Math.max(0, toNumber(normalizeNumberInput(e.target.value), 0))
              }) }),
              lineErrorsById[line.id]?.prixUnitaireHt ? /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-destructive", children: lineErrorsById[line.id].prixUnitaireHt }) : null
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "px-2 py-2", children: [
              /* @__PURE__ */ jsx(Input, { type: "text", inputMode: "decimal", value: formatGroupedInputNumber(String(line.remise)), className: cn(lineErrorsById[line.id]?.remise ? "border-destructive" : ""), onChange: (e) => updateLine(line.id, {
                remise: Math.min(100, Math.max(0, toNumber(normalizeNumberInput(e.target.value), 0)))
              }) }),
              lineErrorsById[line.id]?.remise ? /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-destructive", children: lineErrorsById[line.id].remise }) : null
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "px-2 py-2", children: [
              /* @__PURE__ */ jsx(Input, { type: "text", inputMode: "decimal", value: formatGroupedInputNumber(String(line.tva)), className: cn(lineErrorsById[line.id]?.tva ? "border-destructive" : ""), onChange: (e) => updateLine(line.id, {
                tva: Math.min(100, Math.max(0, toNumber(normalizeNumberInput(e.target.value), 0)))
              }) }),
              lineErrorsById[line.id]?.tva ? /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-destructive", children: lineErrorsById[line.id].tva }) : null
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-right font-medium", children: fmtCurrency(line.netHt) }),
            /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-right", children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => removeLine(line.id), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) }) })
          ] }, line.id)) })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2 md:grid-cols-2 lg:grid-cols-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border p-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Total HT" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold", children: fmtCurrency(totals.totalHt) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border p-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Total remise" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold", children: fmtCurrency(totals.totalRemise) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border p-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Total TVA" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold", children: fmtCurrency(totals.totalTva) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border p-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Total TTC" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold", children: fmtCurrency(totals.totalTtc) })
          ] })
        ] })
      ] }) : null,
      createStep === 3 ? /* @__PURE__ */ jsxs("div", { className: "h-[560px] space-y-4 overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border p-4", children: [
          /* @__PURE__ */ jsx("h4", { className: "mb-2 text-sm font-semibold", children: "Informations generales" }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2 text-sm md:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Fournisseur:" }),
              " ",
              supplierOptions.find((s) => s.value === generalForm.idFournisseur)?.label || "-"
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Entrepot:" }),
              " ",
              generalForm.entrepot || "-"
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Date bon:" }),
              " ",
              generalForm.dateBon || "-"
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Date livraison:" }),
              " ",
              generalForm.dateLivraisonSouhaitee || "-"
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Conditions paiement:" }),
              " ",
              generalForm.conditionsPaiement || "-"
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Conditions livraison:" }),
              " ",
              generalForm.conditionsLivraison || "-"
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Devise:" }),
              " ",
              generalForm.devise || "-"
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Priorite:" }),
              " ",
              generalForm.priorite || "-"
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "md:col-span-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Commentaires:" }),
              " ",
              generalForm.commentaires || "-"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border p-4", children: [
          /* @__PURE__ */ jsx("h4", { className: "mb-2 text-sm font-semibold", children: "Produits" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2", children: lineCalculations.map((line) => {
            const product = productMap.get(line.idProduit);
            return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm", children: [
              /* @__PURE__ */ jsxs("p", { children: [
                product?.designation || "Produit",
                " (",
                product?.reference || "-",
                ") · ",
                line.quantite,
                " ",
                line.unite
              ] }),
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: fmtCurrency(line.netHt) })
            ] }, line.id);
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2 md:grid-cols-2 lg:grid-cols-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border p-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Total HT" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold", children: fmtCurrency(totals.totalHt) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border p-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Total remise" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold", children: fmtCurrency(totals.totalRemise) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border p-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Total TVA" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold", children: fmtCurrency(totals.totalTva) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border p-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Total TTC" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold", children: fmtCurrency(totals.totalTtc) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border p-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Statut apres creation: BROUILLON" }),
          /* @__PURE__ */ jsxs("label", { className: "mt-3 flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: confirmationChecked, onChange: (e) => {
              setConfirmationChecked(e.target.checked);
              if (e.target.checked) setConfirmationError("");
            } }),
            "Je confirme les informations du bon d'achat."
          ] }),
          confirmationError ? /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-destructive", children: confirmationError }) : null
        ] })
      ] }) : null
    ] }),
    /* @__PURE__ */ jsx(AppModal, { open: receptionOpen, onOpenChange: (open) => {
      if (!receptionSubmitting) setReceptionOpen(open);
      if (!open) {
        setReceptionOrder(null);
        setReceptionGeneralErrors({});
        setReceptionLinesError("");
        setReceptionStep(1);
      }
    }, title: "Nouvelle réception", description: receptionOrder ? `Bon ${receptionOrder.ref} - Enregistrement d'une réception` : "", size: "xxl", footer: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 w-full", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", disabled: receptionSubmitting, onClick: () => {
        setReceptionOpen(false);
        setReceptionOrder(null);
      }, children: "Annuler" }),
      /* @__PURE__ */ jsxs(Button, { disabled: receptionSubmitting, onClick: () => {
        if (!validateReceptionStep1() || !validateReceptionStep2()) {
          return;
        }
        void submitReception();
      }, children: [
        receptionSubmitting ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
        "Valider la réception"
      ] })
    ] }), children: receptionOrder ? /* @__PURE__ */ jsx("div", { className: "h-[65vh] overflow-y-auto pr-2 space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-6 md:grid-cols-[1fr_300px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-5 shadow-sm", children: [
          /* @__PURE__ */ jsxs("h4", { className: "mb-4 text-sm font-semibold text-foreground flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary", children: "1" }),
            "Informations Générales"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { className: "text-muted-foreground", children: "Fournisseur" }),
              /* @__PURE__ */ jsx(Input, { value: detailsOrder?.fournisseur?.raisonSociale || rows.find((item) => item.id === receptionOrder.id)?.fournisseur || "-", disabled: true, className: "bg-muted/40 font-medium" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { className: "text-muted-foreground", children: "Bon de commande" }),
              /* @__PURE__ */ jsx(Input, { value: receptionOrder.ref, disabled: true, className: "bg-muted/40 font-medium" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "reception-date", children: "Date de réception" }),
              /* @__PURE__ */ jsx(Input, { id: "reception-date", type: "date", className: cn(receptionGeneralErrors.date ? "border-destructive focus-visible:ring-destructive" : ""), value: receptionGeneralForm.date, onChange: (e) => setReceptionGeneralForm((prev) => ({
                ...prev,
                date: e.target.value
              })) }),
              receptionGeneralErrors.date && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: receptionGeneralErrors.date })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2 md:col-span-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "reception-observations", children: "Observations" }),
              /* @__PURE__ */ jsx(Textarea, { id: "reception-observations", value: receptionGeneralForm.observations, onChange: (e) => setReceptionGeneralForm((prev) => ({
                ...prev,
                observations: e.target.value
              })), placeholder: "Ajoutez vos observations de réception...", className: "resize-none h-20" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-5 shadow-sm", children: [
          /* @__PURE__ */ jsxs("h4", { className: "mb-4 text-sm font-semibold text-foreground flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary", children: "2" }),
            "Articles à réceptionner"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            receptionLinesError && /* @__PURE__ */ jsx("div", { className: "rounded-md bg-destructive/10 p-3 text-sm text-destructive", children: receptionLinesError }),
            receptionOrder.lines.map((line) => /* @__PURE__ */ jsxs("div", { className: "group flex flex-col gap-4 rounded-lg border border-border/60 bg-muted/20 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-foreground", children: line.produit }),
                /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-4 text-xs text-muted-foreground", children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    "Cmd:",
                    " ",
                    /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: line.quantiteCommandee })
                  ] }),
                  /* @__PURE__ */ jsx("span", { children: "•" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    "Reçu:",
                    " ",
                    /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: line.quantiteDejaRecue })
                  ] }),
                  /* @__PURE__ */ jsx("span", { children: "•" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-amber-600 font-medium", children: [
                    "Reste: ",
                    line.restant
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 sm:w-48", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: `recv-${line.idLigneBcf}`, className: "sr-only", children: "Recu maintenant" }),
                /* @__PURE__ */ jsxs("div", { className: "relative w-full", children: [
                  /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground", children: "Qté:" }),
                  /* @__PURE__ */ jsx(Input, { id: `recv-${line.idLigneBcf}`, type: "text", inputMode: "decimal", placeholder: "0", className: "pl-9 font-medium", value: formatGroupedInputNumber(String(line.quantiteARecevoir)), onChange: (e) => {
                    const value = Math.max(0, Math.min(line.restant, toNumber(normalizeNumberInput(e.target.value), 0)));
                    setReceptionOrder((prev) => prev ? {
                      ...prev,
                      lines: prev.lines.map((l) => l.idLigneBcf === line.idLigneBcf ? {
                        ...l,
                        quantiteARecevoir: value
                      } : l)
                    } : prev);
                    setReceptionLinesError("");
                  } })
                ] })
              ] })
            ] }, line.idLigneBcf))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "sticky top-0 rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxs("h4", { className: "mb-4 text-sm font-semibold text-primary flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-6 w-6 items-center justify-center rounded-full bg-primary/20", children: "3" }),
          "Résumé de la réception"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center border-b border-primary/10 pb-3", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "Produits concernés" }),
            /* @__PURE__ */ jsx("span", { className: "font-semibold", children: receptionOrder.lines.length })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center border-b border-primary/10 pb-3", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "Quantité totale" }),
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-primary", children: receptionOrder.lines.reduce((acc, line) => acc + line.quantiteARecevoir, 0) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center pt-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "Valeur estimée" }),
            /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-foreground", children: fmtCurrency(receptionOrder.lines.reduce((acc, line) => {
              const sourceLine = detailsOrder?.lignes?.find((item) => item.id === line.idLigneBcf);
              return acc + line.quantiteARecevoir * toNumber(sourceLine?.prixUnitaireHt, 0);
            }, 0)) })
          ] })
        ] })
      ] }) })
    ] }) }) : null }),
    /* @__PURE__ */ jsx(AppModal, { open: invoiceWizardOpen, onOpenChange: (open) => {
      setInvoiceWizardOpen(open);
      if (!open) {
        setImportOrder(null);
        setImportFile(null);
        setInvoiceWizardStep(1);
        setInvoiceFormErrors({});
        if (importPreviewUrl) {
          URL.revokeObjectURL(importPreviewUrl);
          setImportPreviewUrl(null);
        }
      }
    }, title: "Création facture fournisseur", description: importOrder ? `Bon ${importOrder.ref} - Enregistrement de la facture` : "", size: "xxl", position: "center", footer: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 w-full", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", disabled: invoiceWizardSubmitting, onClick: () => setInvoiceWizardOpen(false), children: "Annuler" }),
      /* @__PURE__ */ jsxs(Button, { disabled: invoiceWizardSubmitting || !importFile, onClick: async () => {
        if (!validateInvoiceStep1()) {
          return;
        }
        if (!importFile) {
          setInvoiceFormErrors((prev) => ({
            ...prev,
            file: "Le fichier PDF est requis"
          }));
          return;
        }
        setInvoiceWizardSubmitting(true);
        await submitImportInvoiceDecision("VALIDER");
        setInvoiceWizardSubmitting(false);
        setInvoiceWizardOpen(false);
        if (importOrder?.id) {
          await openDetailsModal(importOrder.id);
          await loadRows();
        }
      }, children: [
        invoiceWizardSubmitting ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
        "Valider la facture"
      ] })
    ] }), children: /* @__PURE__ */ jsx("div", { className: "h-[75vh] overflow-y-auto pr-2", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-6 xl:grid-cols-[450px_1fr]", children: [
      /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxs("h4", { className: "mb-4 text-sm font-semibold text-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary", children: "1" }),
          "Informations de la facture"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2 sm:col-span-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "invoice-number", children: "Numéro de la facture" }),
            /* @__PURE__ */ jsx(Input, { id: "invoice-number", placeholder: "Ex: FAC-2026-0001", className: cn(invoiceFormErrors.numeroFacture ? "border-destructive focus-visible:ring-destructive" : ""), value: invoiceForm.numeroFacture, onChange: (e) => setInvoiceForm((prev) => ({
              ...prev,
              numeroFacture: e.target.value
            })) }),
            invoiceFormErrors.numeroFacture && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: invoiceFormErrors.numeroFacture })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "invoice-date", children: "Date facture" }),
            /* @__PURE__ */ jsx(Input, { id: "invoice-date", type: "date", className: cn(invoiceFormErrors.dateFacture ? "border-destructive focus-visible:ring-destructive" : ""), value: invoiceForm.dateFacture, onChange: (e) => setInvoiceForm((prev) => ({
              ...prev,
              dateFacture: e.target.value
            })) }),
            invoiceFormErrors.dateFacture && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: invoiceFormErrors.dateFacture })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "invoice-due", children: "Échéance" }),
            /* @__PURE__ */ jsx(Input, { id: "invoice-due", type: "date", className: cn(invoiceFormErrors.dateEcheance ? "border-destructive focus-visible:ring-destructive" : ""), value: invoiceForm.dateEcheance, onChange: (e) => setInvoiceForm((prev) => ({
              ...prev,
              dateEcheance: e.target.value
            })) }),
            invoiceFormErrors.dateEcheance && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: invoiceFormErrors.dateEcheance })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "invoice-ht", children: "Montant HT" }),
            /* @__PURE__ */ jsx(Input, { id: "invoice-ht", type: "text", inputMode: "decimal", placeholder: "0", className: cn(invoiceFormErrors.montantHt ? "border-destructive focus-visible:ring-destructive" : ""), value: formatGroupedInputNumber(invoiceForm.montantHt), onChange: (e) => {
              const montantHt = normalizeNumberInput(e.target.value);
              setInvoiceForm((prev) => ({
                ...prev,
                montantHt,
                ttc: computeTtcFromHtAndTva(montantHt, prev.tva)
              }));
            } }),
            invoiceFormErrors.montantHt && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: invoiceFormErrors.montantHt })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "invoice-tva", children: "TVA" }),
            /* @__PURE__ */ jsx(Input, { id: "invoice-tva", type: "text", inputMode: "decimal", placeholder: "0", className: cn(invoiceFormErrors.tva ? "border-destructive focus-visible:ring-destructive" : ""), value: formatGroupedInputNumber(invoiceForm.tva), onChange: (e) => {
              const tva = normalizeNumberInput(e.target.value);
              setInvoiceForm((prev) => ({
                ...prev,
                tva,
                ttc: computeTtcFromHtAndTva(prev.montantHt, tva)
              }));
            } }),
            invoiceFormErrors.tva && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: invoiceFormErrors.tva })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "invoice-remise", children: "Remise" }),
            /* @__PURE__ */ jsx(Input, { id: "invoice-remise", type: "text", inputMode: "decimal", placeholder: "0", className: cn(invoiceFormErrors.remise ? "border-destructive focus-visible:ring-destructive" : ""), value: formatGroupedInputNumber(invoiceForm.remise), onChange: (e) => setInvoiceForm((prev) => ({
              ...prev,
              remise: normalizeNumberInput(e.target.value)
            })) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "invoice-transport", children: "Transport" }),
            /* @__PURE__ */ jsx(Input, { id: "invoice-transport", type: "text", inputMode: "decimal", placeholder: "0", className: cn(invoiceFormErrors.transport ? "border-destructive focus-visible:ring-destructive" : ""), value: formatGroupedInputNumber(invoiceForm.transport), onChange: (e) => setInvoiceForm((prev) => ({
              ...prev,
              transport: normalizeNumberInput(e.target.value)
            })) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2 sm:col-span-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "invoice-ttc", children: "Total TTC" }),
            /* @__PURE__ */ jsx(Input, { id: "invoice-ttc", type: "text", inputMode: "decimal", placeholder: "0", readOnly: true, className: cn("bg-muted/40 font-bold text-primary", invoiceFormErrors.ttc ? "border-destructive focus-visible:ring-destructive" : ""), value: formatGroupedInputNumber(invoiceForm.ttc) }),
            invoiceFormErrors.ttc && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: invoiceFormErrors.ttc })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2 sm:col-span-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "invoice-observations", children: "Observations" }),
            /* @__PURE__ */ jsx(Textarea, { id: "invoice-observations", placeholder: "Commentaires sur la facture fournisseur", value: invoiceForm.observations, onChange: (e) => setInvoiceForm((prev) => ({
              ...prev,
              observations: e.target.value
            })), className: "resize-none h-20" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "space-y-6 flex flex-col h-full", children: /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-5 shadow-sm flex-1 flex flex-col", children: [
        /* @__PURE__ */ jsxs("h4", { className: "mb-4 text-sm font-semibold text-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary", children: "2" }),
          "Document PDF"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4 flex-1 flex flex-col", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "supplier-invoice-file", className: "sr-only", children: "Fichier PDF" }),
            /* @__PURE__ */ jsx(Input, { id: "supplier-invoice-file", type: "file", accept: "application/pdf,.pdf", className: cn("file:bg-primary/10 file:text-primary file:border-0 hover:file:bg-primary/20", invoiceFormErrors.file ? "border-destructive focus-visible:ring-destructive" : ""), onChange: (e) => {
              onImportFileChange(e.target.files?.[0] || null);
              setInvoiceFormErrors((prev) => ({
                ...prev,
                file: void 0
              }));
            } }),
            invoiceFormErrors.file ? /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-destructive", children: invoiceFormErrors.file }) : importFile ? /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
              importFile.name,
              " ·",
              " ",
              (importFile.size / 1024 / 1024).toFixed(2),
              " Mo"
            ] }) : null
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 rounded-lg border border-border overflow-hidden bg-muted/20 min-h-[400px]", children: importFile && importFile.type === "application/pdf" && importPreviewUrl ? /* @__PURE__ */ jsx("iframe", { src: importPreviewUrl, title: "Apercu facture fournisseur", className: "h-full w-full border-0" }) : /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center justify-center text-sm text-muted-foreground", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2", children: [
            /* @__PURE__ */ jsx(FileEdit, { className: "h-8 w-8 opacity-20" }),
            /* @__PURE__ */ jsx("p", { children: "Sélectionnez un PDF pour afficher l'aperçu" })
          ] }) }) })
        ] })
      ] }) })
    ] }) }) }),
    /* @__PURE__ */ jsx(AppModal, { open: pdfModalOpen, onOpenChange: (open) => {
      setPdfModalOpen(open);
      if (!open) {
        setPdfDataUrl(null);
        setPdfBlob(null);
        setPdfModalLoading(false);
      }
    }, title: "Apercu PDF bon de commande", description: pdfFilename, size: "xxl", footer: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
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
    ] }), children: pdfModalLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-16", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : pdfDataUrl ? /* @__PURE__ */ jsx("iframe", { ref: pdfFrameRef, src: pdfDataUrl, title: "Apercu BCF PDF", className: "h-[70vh] w-full rounded-md border border-border" }) : /* @__PURE__ */ jsx("p", { className: "py-10 text-center text-sm text-muted-foreground", children: "Aucun PDF charge." }) })
  ] });
}
export {
  PurchasesPage as component
};
