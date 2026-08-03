import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { FileEdit, CheckCircle2, Truck, PackageCheck, Plus, Loader2, Trash2, ArrowLeft, ArrowRight, Copy, Download, Send, Printer } from "lucide-react";
import { P as PageHeader } from "./PageHeader-Dn6TWXax.js";
import { a as SectionCard, T as Toolbar, P as Pagination, b as SearchableSelect } from "./widgets-B15eBu3V.js";
import { D as DataTable } from "./DataTable-DtkNYCOC.js";
import { S as StatusBadge } from "./StatusBadge-_upedsR8.js";
import { A as AppModal } from "./AppModal-DIyCFok9.js";
import { B as Button, I as Input } from "./input-BqFX9Wm1.js";
import { L as Label } from "./label-DAred2wv.js";
import { T as Textarea } from "./textarea-BWJ_OpXt.js";
import { f as fmtCurrency } from "./erp-data-BPnqaKp2.js";
import { i as api, c as cn } from "./router-Dv1ROSYY.js";
import { g as getFournisseurs } from "./fournisseurs.service-ZwYi7zPw.js";
import { g as getProduits } from "./produits.service-CoUIPk6-.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "react-dom";
import "./dropdown-menu-BUWemafZ.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-dialog";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "./currency-BGNe4_9Y.js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "zod";
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
const creerFactureAchatDepuisBcf = (id, data) => api.post(`/achats/bons-commande/${id}/facture`, {});
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
const cols = [{
  key: "ref",
  header: "Bon de commande",
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
}];
const PAGE_SIZE = 10;
const STATUS_LABELS = {
  BROUILLON: "Brouillon",
  SOUMIS: "Soumis",
  VALIDE: "Valide",
  ENVOYE: "Envoye",
  RECU_PARTIEL: "Recu partiel",
  RECU_TOTAL: "Recu total",
  ANNULE: "Annule"
};
const normalizeStatus = (status) => STATUS_LABELS[status || ""] || status || "-";
const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
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
  const [receptionSubmitting, setReceptionSubmitting] = useState(false);
  const [receptionOrder, setReceptionOrder] = useState(null);
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
      setRows(bcf.map((item) => ({
        id: item.id,
        ref: item.numeroBcf,
        fournisseur: item.fournisseur?.raisonSociale || "-",
        articles: item.lignes?.length || 0,
        date: item.dateCommande ? new Date(item.dateCommande).toLocaleDateString("fr-FR") : "-",
        montant: Number(item.totalTtc || 0),
        statut: normalizeStatus(item.statut),
        statutRaw: item.statut
      })));
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
        }), getProduits({
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
  }, [createOpen]);
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);
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
  const steps = useMemo(() => {
    const byStatus = (targets) => rows.filter((r) => targets.includes(r.statutRaw)).length;
    const countBrouillon = byStatus(["BROUILLON"]);
    const countValidation = byStatus(["SOUMIS", "VALIDE"]);
    const countEnvoye = byStatus(["ENVOYE"]);
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
  const openReceptionModal = async (orderId) => {
    try {
      const response = await getBonCommandeFournisseurById(orderId);
      const order = response?.data;
      if (!order) {
        toast.error("Bon de commande introuvable");
        return;
      }
      const receptionLines = (order.lignes || []).map((line) => {
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
      setReceptionOrder({
        id: order.id,
        ref: order.numeroBcf,
        lines: receptionLines
      });
      setReceptionOpen(true);
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
      await loadRows();
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
  const openPdfOrder = async (orderId, print = false) => {
    try {
      const blob = await telechargerBonCommandeFournisseurPdf(orderId);
      const fileUrl = URL.createObjectURL(blob);
      const win = window.open(fileUrl, "_blank", "noopener,noreferrer");
      if (!win) {
        URL.revokeObjectURL(fileUrl);
        toast.warning("Autorisez les popups pour ouvrir le PDF");
        return;
      }
      if (print) {
        setTimeout(() => {
          try {
            win.focus();
            win.print();
          } catch {
          }
        }, 400);
      }
      setTimeout(() => URL.revokeObjectURL(fileUrl), 6e4);
    } catch (error) {
      const maybeMessage = error && typeof error === "object" && "message" in error ? String(error.message || "") : "";
      toast.error(maybeMessage.trim() || "Impossible de generer le PDF");
    }
  };
  const createSupplierInvoice = async (orderId) => {
    try {
      const response = await creerFactureAchatDepuisBcf(orderId);
      const numero = response?.data?.numeroFacture;
      toast.success(numero ? `Facture achat creee: ${numero}` : "Facture achat creee");
    } catch (error) {
      const maybeMessage = error && typeof error === "object" && "message" in error ? String(error.message || "") : "";
      toast.error(maybeMessage.trim() || "Creation de facture impossible");
    }
  };
  const actionsByStatus = (row) => {
    if (row.statutRaw === "BROUILLON") {
      return [{
        label: "Soumettre",
        icon: /* @__PURE__ */ jsx(ArrowRight, { className: "mr-2 h-4 w-4" }),
        onClick: () => void transitionOrder(row.id, "SUBMIT", "Bon soumis pour validation")
      }, {
        label: "Annuler",
        icon: /* @__PURE__ */ jsx(Trash2, { className: "mr-2 h-4 w-4" }),
        destructive: true,
        onClick: () => void transitionOrder(row.id, "CANCEL", "Bon annule")
      }, {
        label: "Dupliquer",
        icon: /* @__PURE__ */ jsx(Copy, { className: "mr-2 h-4 w-4" }),
        onClick: () => void duplicateOrder(row.id)
      }, {
        label: "Exporter PDF",
        icon: /* @__PURE__ */ jsx(Download, { className: "mr-2 h-4 w-4" }),
        onClick: () => void openPdfOrder(row.id)
      }];
    }
    if (row.statutRaw === "SOUMIS") {
      return [{
        label: "Valider",
        icon: /* @__PURE__ */ jsx(CheckCircle2, { className: "mr-2 h-4 w-4" }),
        onClick: () => void transitionOrder(row.id, "VALIDATE", "Bon valide")
      }, {
        label: "Annuler",
        icon: /* @__PURE__ */ jsx(Trash2, { className: "mr-2 h-4 w-4" }),
        destructive: true,
        onClick: () => void transitionOrder(row.id, "CANCEL", "Bon annule")
      }, {
        label: "Retour au brouillon",
        icon: /* @__PURE__ */ jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }),
        onClick: () => void transitionOrder(row.id, "BACK_TO_DRAFT", "Bon retourne au brouillon")
      }, {
        label: "Dupliquer",
        icon: /* @__PURE__ */ jsx(Copy, { className: "mr-2 h-4 w-4" }),
        onClick: () => void duplicateOrder(row.id)
      }];
    }
    if (row.statutRaw === "VALIDE") {
      return [{
        label: "Envoyer au fournisseur",
        icon: /* @__PURE__ */ jsx(Send, { className: "mr-2 h-4 w-4" }),
        onClick: () => void sendToSupplier(row.id)
      }, {
        label: "Telecharger PDF",
        icon: /* @__PURE__ */ jsx(Download, { className: "mr-2 h-4 w-4" }),
        onClick: () => void openPdfOrder(row.id)
      }, {
        label: "Imprimer",
        icon: /* @__PURE__ */ jsx(Printer, { className: "mr-2 h-4 w-4" }),
        onClick: () => void openPdfOrder(row.id, true)
      }, {
        label: "Annuler",
        icon: /* @__PURE__ */ jsx(Trash2, { className: "mr-2 h-4 w-4" }),
        destructive: true,
        onClick: () => void transitionOrder(row.id, "CANCEL", "Bon annule")
      }];
    }
    if (row.statutRaw === "ENVOYE") {
      return [{
        label: "Relancer le fournisseur",
        icon: /* @__PURE__ */ jsx(Send, { className: "mr-2 h-4 w-4" }),
        onClick: () => void sendToSupplier(row.id)
      }, {
        label: "Voir le detail",
        icon: /* @__PURE__ */ jsx(FileEdit, { className: "mr-2 h-4 w-4" }),
        onClick: () => void openReceptionModal(row.id)
      }, {
        label: "Annuler",
        icon: /* @__PURE__ */ jsx(Trash2, { className: "mr-2 h-4 w-4" }),
        destructive: true,
        onClick: () => void transitionOrder(row.id, "CANCEL", "Bon annule")
      }, {
        label: "Creer une reception",
        icon: /* @__PURE__ */ jsx(PackageCheck, { className: "mr-2 h-4 w-4" }),
        onClick: () => void openReceptionModal(row.id)
      }, {
        label: "Telecharger PDF",
        icon: /* @__PURE__ */ jsx(Download, { className: "mr-2 h-4 w-4" }),
        onClick: () => void openPdfOrder(row.id)
      }];
    }
    if (row.statutRaw === "RECU_PARTIEL") {
      return [{
        label: "Creer facture achat",
        icon: /* @__PURE__ */ jsx(FileEdit, { className: "mr-2 h-4 w-4" }),
        onClick: () => void createSupplierInvoice(row.id)
      }, {
        label: "Nouvelle reception",
        icon: /* @__PURE__ */ jsx(PackageCheck, { className: "mr-2 h-4 w-4" }),
        onClick: () => void openReceptionModal(row.id)
      }, {
        label: "Voir les quantites restantes",
        icon: /* @__PURE__ */ jsx(FileEdit, { className: "mr-2 h-4 w-4" }),
        onClick: () => void openReceptionModal(row.id)
      }, {
        label: "Telecharger PDF",
        icon: /* @__PURE__ */ jsx(Download, { className: "mr-2 h-4 w-4" }),
        onClick: () => void openPdfOrder(row.id)
      }, {
        label: "Imprimer",
        icon: /* @__PURE__ */ jsx(Printer, { className: "mr-2 h-4 w-4" }),
        onClick: () => void openPdfOrder(row.id, true)
      }];
    }
    if (row.statutRaw === "RECU_TOTAL") {
      return [{
        label: "Creer facture achat",
        icon: /* @__PURE__ */ jsx(FileEdit, { className: "mr-2 h-4 w-4" }),
        onClick: () => void createSupplierInvoice(row.id)
      }, {
        label: "Telecharger PDF",
        icon: /* @__PURE__ */ jsx(Download, { className: "mr-2 h-4 w-4" }),
        onClick: () => void openPdfOrder(row.id)
      }, {
        label: "Imprimer",
        icon: /* @__PURE__ */ jsx(Printer, { className: "mr-2 h-4 w-4" }),
        onClick: () => void openPdfOrder(row.id, true)
      }, {
        label: "Dupliquer",
        icon: /* @__PURE__ */ jsx(Copy, { className: "mr-2 h-4 w-4" }),
        onClick: () => void duplicateOrder(row.id)
      }];
    }
    if (row.statutRaw === "ANNULE") {
      return [{
        label: "Dupliquer",
        icon: /* @__PURE__ */ jsx(Copy, { className: "mr-2 h-4 w-4" }),
        onClick: () => void duplicateOrder(row.id)
      }, {
        label: "Telecharger PDF",
        icon: /* @__PURE__ */ jsx(Download, { className: "mr-2 h-4 w-4" }),
        onClick: () => void openPdfOrder(row.id)
      }];
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
    /* @__PURE__ */ jsx(SectionCard, { title: "Workflow d'achat", description: "Cycle de vie d'un bon de commande", className: "mb-6", children: /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center", children: steps.map((s, i) => /* @__PURE__ */ jsxs("div", { className: "flex flex-1 items-center gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: `flex h-10 w-10 items-center justify-center rounded-full ${s.done ? "bg-gradient-primary text-white" : "border-2 border-dashed border-border text-muted-foreground"}`, children: /* @__PURE__ */ jsx(s.icon, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Étape ",
            i + 1
          ] }),
          /* @__PURE__ */ jsx("p", { className: `text-sm font-medium ${s.done ? "text-foreground" : "text-muted-foreground"}`, children: s.label })
        ] })
      ] }),
      i < steps.length - 1 && /* @__PURE__ */ jsx("div", { className: `hidden h-0.5 flex-1 sm:block ${s.done ? "bg-primary/40" : "bg-border"}` })
    ] }, s.label)) }) }),
    /* @__PURE__ */ jsxs(SectionCard, { title: "Bons de commande", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(Toolbar, { placeholder: "Rechercher un bon de commande...", searchValue: search, onSearchChange: setSearch, filterOptions, selectedFilter: statusFilter, onFilterChange: setStatusFilter, filterPlaceholder: "Filtrer par statut", filterSearchPlaceholder: "Rechercher un statut" }) }),
      loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(DataTable, { columns: cols, rows: paginatedRows, rowKey: (o) => o.id, rowActions: actionsByStatus }),
        /* @__PURE__ */ jsx(Pagination, { count: filteredRows.length, currentPage: page, totalPages, pageSize: PAGE_SIZE, onPageChange: setPage })
      ] })
    ] }),
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
            /* @__PURE__ */ jsx("th", { className: "px-2 py-2", children: "Unite" }),
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
              /* @__PURE__ */ jsx(Input, { type: "number", min: 0, value: line.quantite, className: cn(lineErrorsById[line.id]?.quantite ? "border-destructive" : ""), onChange: (e) => updateLine(line.id, {
                quantite: Math.max(0, toNumber(e.target.value, 0))
              }) }),
              lineErrorsById[line.id]?.quantite ? /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-destructive", children: lineErrorsById[line.id].quantite }) : null
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-2 py-2", children: /* @__PURE__ */ jsx(SearchableSelect, { portalMode: "body", value: line.unite, onValueChange: (value) => updateLine(line.id, {
              unite: value
            }), options: UNIT_OPTIONS, placeholder: "Selectionner une unite", searchPlaceholder: "Rechercher une unite", emptyMessage: "Aucune unite" }) }),
            /* @__PURE__ */ jsxs("td", { className: "px-2 py-2", children: [
              /* @__PURE__ */ jsx(Input, { type: "number", min: 0, value: line.prixUnitaireHt, className: cn(lineErrorsById[line.id]?.prixUnitaireHt ? "border-destructive" : ""), onChange: (e) => updateLine(line.id, {
                prixUnitaireHt: Math.max(0, toNumber(e.target.value, 0))
              }) }),
              lineErrorsById[line.id]?.prixUnitaireHt ? /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-destructive", children: lineErrorsById[line.id].prixUnitaireHt }) : null
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "px-2 py-2", children: [
              /* @__PURE__ */ jsx(Input, { type: "number", min: 0, max: 100, value: line.remise, className: cn(lineErrorsById[line.id]?.remise ? "border-destructive" : ""), onChange: (e) => updateLine(line.id, {
                remise: Math.min(100, Math.max(0, toNumber(e.target.value, 0)))
              }) }),
              lineErrorsById[line.id]?.remise ? /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-destructive", children: lineErrorsById[line.id].remise }) : null
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "px-2 py-2", children: [
              /* @__PURE__ */ jsx(Input, { type: "number", min: 0, max: 100, value: line.tva, className: cn(lineErrorsById[line.id]?.tva ? "border-destructive" : ""), onChange: (e) => updateLine(line.id, {
                tva: Math.min(100, Math.max(0, toNumber(e.target.value, 0)))
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
      if (!open) setReceptionOrder(null);
    }, title: "Reception des marchandises", description: receptionOrder ? `Bon ${receptionOrder.ref} - saisir les quantites recues` : "", size: "xl", footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", disabled: receptionSubmitting, onClick: () => {
        setReceptionOpen(false);
        setReceptionOrder(null);
      }, children: "Fermer" }),
      /* @__PURE__ */ jsxs(Button, { disabled: receptionSubmitting, onClick: () => void submitReception(), children: [
        receptionSubmitting ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
        "Enregistrer la reception"
      ] })
    ] }), children: receptionOrder ? /* @__PURE__ */ jsx("div", { className: "space-y-3", children: receptionOrder.lines.map((line) => /* @__PURE__ */ jsxs("div", { className: "grid gap-2 rounded-md border border-border p-3 md:grid-cols-[2fr_1fr_1fr_1fr]", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: line.produit }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Commandee: ",
          line.quantiteCommandee,
          " · Deja recue:",
          " ",
          line.quantiteDejaRecue
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Restant" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: line.restant })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: `recv-${line.idLigneBcf}`, children: "Quantite recue" }),
        /* @__PURE__ */ jsx(Input, { id: `recv-${line.idLigneBcf}`, type: "number", min: 0, max: line.restant, value: line.quantiteARecevoir, onChange: (e) => {
          const value = Math.max(0, Math.min(line.restant, toNumber(e.target.value, 0)));
          setReceptionOrder((prev) => prev ? {
            ...prev,
            lines: prev.lines.map((l) => l.idLigneBcf === line.idLigneBcf ? {
              ...l,
              quantiteARecevoir: value
            } : l)
          } : prev);
        } })
      ] })
    ] }, line.idLigneBcf)) }) : null })
  ] });
}
export {
  PurchasesPage as component
};
