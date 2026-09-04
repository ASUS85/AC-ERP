import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { ArrowDownLeft, ArrowUpRight, Wallet, Receipt, Search, Loader2, FileText, User } from "lucide-react";
import { P as PageHeader } from "./PageHeader-D6EtHCBB.js";
import { S as StatCard, a as SectionCard, b as SearchableSelect, P as Pagination } from "./widgets-BODimdeo.js";
import { D as DataTable } from "./DataTable-uvObVBw4.js";
import { I as Input, B as Button } from "./input-Di0llSdw.js";
import { A as AppModal } from "./AppModal-CzTwj6St.js";
import { f as fmtCurrency } from "./erp-data-lC_Sts2J.js";
import { g as getPaiements } from "./paiements.service-DRXWWyrK.js";
import { c as cn } from "./router-DmDzdhp9.js";
import "@tanstack/react-router";
import "react-dom";
import "./dropdown-menu-BuEf9IEp.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-dialog";
import "./currency-BmQmAj7J.js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "sonner";
import "zod";
import "zustand";
import "axios";
const PAGE_SIZE = 10;
function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const loadData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await getPaiements({
        page,
        limit: PAGE_SIZE,
        search,
        ...paymentDate ? {
          dateFrom: paymentDate
        } : {},
        ...paymentMode ? {
          modePaiement: paymentMode
        } : {}
      });
      setPayments(res.data || []);
      setTotalItems(res.meta?.total || 0);
    } catch (error) {
      console.error("Erreur chargement paiements", error);
      setErrorMsg(error?.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void loadData();
  }, [page, search, paymentDate, paymentMode]);
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const cols = useMemo(() => [{
    key: "reference",
    header: "Réf. Facture",
    align: "left",
    render: (p) => /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: p.facture?.numeroFacture || "N/A" })
  }, {
    key: "client",
    header: "Tiers",
    render: (p) => p.facture?.typeFacture === "ACHAT" ? p.facture?.fournisseur?.raisonSociale || "Fournisseur" : p.facture?.client?.nom || p.utilisateur?.nom || "-"
  }, {
    key: "modePaiement",
    header: "Méthode",
    render: (p) => p.modePaiement || "En attente"
  }, {
    key: "montant",
    header: "Montant",
    align: "right",
    render: (p) => p.facture?.typeFacture === "ACHAT" ? /* @__PURE__ */ jsxs("span", { className: "font-medium text-destructive", children: [
      "- ",
      fmtCurrency(Number(p.montant))
    ] }) : /* @__PURE__ */ jsxs("span", { className: "font-medium text-success", children: [
      "+ ",
      fmtCurrency(Number(p.montant))
    ] })
  }, {
    key: "datePaiement",
    header: "Date",
    align: "right",
    render: (p) => formatDate(p.datePaiement)
  }], []);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Paiements", description: "Historique des encaissements et décaissements", breadcrumb: ["Transactions", "Paiements"] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Encaissements", value: fmtCurrency(248100), sub: "ce mois", icon: /* @__PURE__ */ jsx(ArrowDownLeft, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Décaissements", value: fmtCurrency(186500), sub: "ce mois", icon: /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Trésorerie nette", value: `+${fmtCurrency(61600)}`, delta: "+8 %", up: true, sub: "solde du mois", icon: /* @__PURE__ */ jsx(Wallet, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx(StatCard, { label: "Reçus émis", value: "148", sub: "documents", icon: /* @__PURE__ */ jsx(Receipt, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs(SectionCard, { title: "Historique des paiements", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative w-full sm:max-w-xs", children: [
          /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsx(Input, { placeholder: "Rech. par facture, client, réf...", className: "h-9 pl-9", value: search, onChange: (e) => {
            setSearch(e.target.value);
            setPage(1);
          } })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(SearchableSelect, { value: paymentMode, onValueChange: (val) => {
            setPaymentMode(val);
            setPage(1);
          }, options: [{
            label: "Tous les modes",
            value: ""
          }, {
            label: "Espèces",
            value: "ESPECES"
          }, {
            label: "Chèque",
            value: "CHEQUE"
          }, {
            label: "Virement",
            value: "VIREMENT"
          }, {
            label: "Mobile Money",
            value: "MOBILE_MONEY"
          }, {
            label: "Carte",
            value: "CARTE"
          }, {
            label: "Compensation",
            value: "COMPENSATION"
          }], placeholder: "Mode de paiement...", searchPlaceholder: "Rechercher...", className: "w-[180px]" }),
          /* @__PURE__ */ jsx("div", { className: "w-[180px]", children: /* @__PURE__ */ jsx(Input, { type: "date", value: paymentDate, onChange: (event) => {
            setPaymentDate(event.target.value);
            setPage(1);
          } }) })
        ] })
      ] }),
      loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(DataTable, { columns: cols, rows: payments, rowKey: (p) => p.id, withActions: false, onRowClick: (p) => {
          setSelectedPayment(p);
          setDetailOpen(true);
        } }),
        /* @__PURE__ */ jsx(Pagination, { count: totalItems, currentPage: page, totalPages, pageSize: PAGE_SIZE, onPageChange: setPage })
      ] })
    ] }),
    /* @__PURE__ */ jsx(AppModal, { open: detailOpen, onOpenChange: setDetailOpen, title: "Détail du paiement", description: "Informations relatives au paiement sélectionné", size: "xl", footer: /* @__PURE__ */ jsx("div", { className: "flex justify-end w-full", children: /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setDetailOpen(false), children: "Fermer" }) }), children: selectedPayment ? /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-4 shadow-sm md:col-span-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-muted-foreground mb-1", children: selectedPayment.facture?.typeFacture === "ACHAT" ? "Montant Décaissé" : "Montant Encaissé" }),
          /* @__PURE__ */ jsxs("p", { className: cn("text-3xl font-bold", selectedPayment.facture?.typeFacture === "ACHAT" ? "text-destructive" : "text-success"), children: [
            selectedPayment.facture?.typeFacture === "ACHAT" ? "- " : "+ ",
            fmtCurrency(Number(selectedPayment.montant))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-4 shadow-sm md:col-span-1 flex flex-col justify-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-muted-foreground mb-1", children: "Réf. de transaction / Notes" }),
          /* @__PURE__ */ jsx("p", { className: "text-lg font-medium text-foreground", children: selectedPayment.reference || selectedPayment.notes || "Aucune référence" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-foreground flex items-center gap-2 border-b pb-2", children: [
            /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4 text-muted-foreground" }),
            "Informations Générales"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-1 border-b border-border/50", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Méthode de paiement :" }),
              /* @__PURE__ */ jsx("span", { className: "font-semibold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-md", children: selectedPayment.modePaiement || "En attente" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-1 border-b border-border/50", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Date :" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatDate(selectedPayment.datePaiement) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-1 border-b border-border/50", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Facture liée :" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: selectedPayment.facture?.numeroFacture || "N/A" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-foreground flex items-center gap-2 border-b pb-2", children: [
            /* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-muted-foreground" }),
            "Acteurs"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 py-1 border-b border-border/50 pb-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-xs uppercase", children: selectedPayment.facture?.typeFacture === "ACHAT" ? "Fournisseur concerné" : "Client concerné" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: selectedPayment.facture?.typeFacture === "ACHAT" ? selectedPayment.facture?.fournisseur?.raisonSociale || "Fournisseur" : selectedPayment.facture?.client?.nom || "Client occasionnel" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 py-1 border-b border-border/50 pb-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-xs uppercase", children: "Enregistré par" }),
              /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
                selectedPayment.utilisateur?.nom,
                " ",
                selectedPayment.utilisateur?.prenom
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsx("div", { className: "py-10 text-center text-muted-foreground", children: "Détail indisponible" }) })
  ] });
}
export {
  PaymentsPage as component
};
