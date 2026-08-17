import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Plus,
  FileEdit,
  CheckCircle2,
  Truck,
  PackageCheck,
  ReceiptText,
  Loader2,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Send,
  Copy,
  Download,
  Printer,
} from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard, Toolbar, Pagination } from "@/components/erp/widgets";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { AppModal } from "@/components/erp/AppModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { fmtCurrency } from "@/lib/erp-data";
import { cn } from "@/lib/utils";
import {
  formatGroupedInputNumber,
  formatGroupedNumber,
  normalizeNumberInput,
} from "@/lib/number-input";
import {
  createBonCommandeFournisseur,
  dupliquerBonCommandeFournisseur,
  envoyerBonCommandeFournisseur,
  getBonCommandeFournisseurById,
  getBonsCommandeFournisseur,
  getFacturesImporteesBcf,
  importerFactureFournisseurBcf,
  receptionBonCommandeFournisseur,
  telechargerBonCommandeFournisseurPdf,
  transitionBonCommandeFournisseur,
} from "@/lib/api/achats.service";
import { getFournisseurs } from "@/lib/api/fournisseurs.service";
import { getProduits } from "@/lib/api/produits.service";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/purchases")({
  head: () => ({ meta: [{ title: "Achats — AC ERP" }] }),
  component: PurchasesPage,
});

type BonCommandeApi = {
  id: string;
  numeroBcf: string;
  dateCommande?: string;
  totalTtc?: number | string;
  statut: string;
  fournisseur?: { raisonSociale?: string | null } | null;
  receptions?: Array<{
    id: string;
    dateReception?: string;
    statut: string;
    notes?: string | null;
    createdAt?: string;
    utilisateur?: {
      nom?: string | null;
      prenom?: string | null;
      email?: string | null;
    } | null;
    lignes?: Array<{
      id: string;
      quantiteRecue?: number;
      idLigneBcf?: string;
    }>;
  }>;
  lignes?: Array<{
    id: string;
    idProduit: string;
    quantiteCommandee: number;
    quantiteRecue: number;
    prixUnitaireHt: number | string;
    remise?: number | string;
    produit?: {
      id: string;
      designation: string;
      reference?: string;
      uniteMesure?: string;
      prixAchatHt?: number | string;
      tauxTva?: number | string;
    };
  }>;
};

type PurchaseRow = {
  id: string;
  ref: string;
  fournisseur: string;
  articles: number;
  date: string;
  montant: number;
  statut: string;
  statutRaw: string;
  factureRecue: boolean;
};

type ReceptionRow = {
  id: string;
  reference: string;
  date: string;
  fournisseur: string;
  utilisateur: string;
  lignes: number;
  quantiteRecue: number;
  statut: string;
  statutRaw: string;
};

type SupplierItem = {
  id: string;
  raisonSociale?: string | null;
};

type ProductItem = {
  id: string;
  reference?: string | null;
  designation: string;
  uniteMesure?: string | null;
  prixAchatHt?: number | string | null;
  tauxTva?: number | string | null;
};

type WizardGeneralForm = {
  idFournisseur: string;
  entrepot: string;
  dateBon: string;
  dateLivraisonSouhaitee: string;
  conditionsPaiement: string;
  conditionsLivraison: string;
  devise: string;
  priorite: string;
  commentaires: string;
};

type WizardLine = {
  id: string;
  idProduit: string;
  quantite: number;
  unite: string;
  prixUnitaireHt: number;
  remise: number;
  tva: number;
};

type ReceptionLine = {
  idLigneBcf: string;
  produit: string;
  quantiteCommandee: number;
  quantiteDejaRecue: number;
  restant: number;
  quantiteARecevoir: number;
};

type ImportedInvoiceItem = {
  id: string;
  numeroFacture: string;
  statut: string;
  totalTtc?: number | string;
  createdAt?: string;
  decision?: string;
  fileUrl?: string | null;
  originalFilename?: string | null;
};

type WizardGeneralErrors = Partial<Record<keyof WizardGeneralForm, string>>;

type WizardLineError = {
  idProduit?: string;
  quantite?: string;
  prixUnitaireHt?: string;
  remise?: string;
  tva?: string;
};

type ReceptionGeneralErrors = {
  date?: string;
};

type InvoiceFormErrors = Partial<
  Record<
    | "numeroFacture"
    | "dateFacture"
    | "dateEcheance"
    | "montantHt"
    | "tva"
    | "ttc"
    | "remise"
    | "transport"
    | "file",
    string
  >
>;

const UNIT_OPTIONS = [
  { value: "PIECE", label: "Piece" },
  { value: "KG", label: "Kg" },
  { value: "LITRE", label: "Litre" },
  { value: "METRE", label: "Metre" },
  { value: "M2", label: "M2" },
  { value: "BOITE", label: "Boite" },
  { value: "CARTON", label: "Carton" },
];

const toInputDate = (date: Date) => {
  const local = new Date(date);
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toISOString().slice(0, 10);
};

const PAGE_SIZE = 10;
const RECEPTION_PAGE_SIZE = 8;

const STATUS_LABELS: Record<string, string> = {
  BROUILLON: "Brouillon",
  SOUMIS: "Soumis",
  VALIDE: "Valide",
  ENVOYE: "Envoye",
  CONFIRME: "Confirme",
  REJETE: "Rejete",
  RECU_PARTIEL: "Recu partiel",
  RECU_TOTAL: "Recu total",
  ANNULE: "Annule",
};

const normalizeStatus = (status?: string) =>
  STATUS_LABELS[status || ""] || status || "-";

const INVOICE_ALLOWED_STATUSES = new Set(["RECU_PARTIEL", "RECU_TOTAL"]);

const canCreateInvoiceForStatus = (status?: string) =>
  INVOICE_ALLOWED_STATUSES.has(status || "");

const normalizeReceptionStatus = (status?: string) => {
  if (status === "CONFORME") return "Valide";
  if (status === "PARTIELLE") return "Brouillon";
  if (status === "NON_CONFORME") return "Annule";
  return status || "-";
};

const toNumber = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const computeTtcFromHtAndTva = (montantHt: string, tva: string) => {
  const ht = toNumber(montantHt, Number.NaN);
  const vat = toNumber(tva, Number.NaN);
  if (!Number.isFinite(ht) || !Number.isFinite(vat) || ht < 0 || vat < 0) {
    return "";
  }
  const ttc = ht + (ht * vat) / 100;
  return String(Math.round(ttc * 100) / 100);
};

const makeLineId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function PurchasesPage() {
  const todayDate = toInputDate(new Date());
  const tomorrowDate = toInputDate(
    new Date(new Date().setDate(new Date().getDate() + 1)),
  );

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<PurchaseRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [confirmationChecked, setConfirmationChecked] = useState(false);

  const [generalForm, setGeneralForm] = useState<WizardGeneralForm>({
    idFournisseur: "",
    entrepot: "",
    dateBon: todayDate,
    dateLivraisonSouhaitee: "",
    conditionsPaiement: "",
    conditionsLivraison: "",
    devise: "XOF",
    priorite: "NORMALE",
    commentaires: "",
  });
  const [lines, setLines] = useState<WizardLine[]>([]);
  const [generalErrors, setGeneralErrors] = useState<WizardGeneralErrors>({});
  const [linesError, setLinesError] = useState("");
  const [lineErrorsById, setLineErrorsById] = useState<
    Record<string, WizardLineError>
  >({});
  const [confirmationError, setConfirmationError] = useState("");

  const [receptionOpen, setReceptionOpen] = useState(false);
  const [receptionStep, setReceptionStep] = useState(1);
  const [receptionSubmitting, setReceptionSubmitting] = useState(false);
  const [receptionGeneralForm, setReceptionGeneralForm] = useState({
    date: todayDate,
    observations: "",
  });
  const [receptionGeneralErrors, setReceptionGeneralErrors] =
    useState<ReceptionGeneralErrors>({});
  const [receptionLinesError, setReceptionLinesError] = useState("");
  const [rowActionPendingById, setRowActionPendingById] = useState<
    Record<string, string>
  >({});
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfModalLoading, setPdfModalLoading] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFilename, setPdfFilename] = useState("bon-commande.pdf");
  const pdfFrameRef = useRef<HTMLIFrameElement | null>(null);
  const [receptionOrder, setReceptionOrder] = useState<{
    id: string;
    ref: string;
    lines: ReceptionLine[];
  } | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importOrder, setImportOrder] = useState<{
    id: string;
    ref: string;
  } | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreviewUrl, setImportPreviewUrl] = useState<string | null>(null);
  const [importSubmitting, setImportSubmitting] = useState(false);
  const [importedInvoices, setImportedInvoices] = useState<
    ImportedInvoiceItem[]
  >([]);
  const [importedInvoicesLoading, setImportedInvoicesLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsOrder, setDetailsOrder] = useState<BonCommandeApi | null>(null);
  const [receptionRowsSearch, setReceptionRowsSearch] = useState("");
  const [receptionRowsStatusFilter, setReceptionRowsStatusFilter] =
    useState("");
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
    observations: "",
  });
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoiceFormErrors, setInvoiceFormErrors] = useState<InvoiceFormErrors>(
    {},
  );

  const validateReceptionStep1 = () => {
    const nextErrors: ReceptionGeneralErrors = {};
    if (!receptionGeneralForm.date) {
      nextErrors.date = "Ce champ est requis";
    }
    setReceptionGeneralErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateReceptionStep2 = () => {
    const hasAnyQty =
      receptionOrder?.lines.some((line) => line.quantiteARecevoir > 0) ?? false;
    if (!hasAnyQty) {
      setReceptionLinesError("Saisissez au moins une quantite recue");
      return false;
    }
    setReceptionLinesError("");
    return true;
  };

  const validateInvoiceStep1 = () => {
    const nextErrors: InvoiceFormErrors = {};
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
      commentaires: "",
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
      const response = (await getBonsCommandeFournisseur()) as {
        data?: BonCommandeApi[];
      };
      const bcf = Array.isArray(response?.data) ? response.data : [];
      const rowsWithInvoiceState = await Promise.all(
        bcf.map(async (item) => {
          let factureRecue = item.statut === "FACTURE_RECU";

          if (!factureRecue) {
            try {
              const invoiceResponse = (await getFacturesImporteesBcf(
                item.id,
              )) as {
                data?: ImportedInvoiceItem[];
              };
              factureRecue = Array.isArray(invoiceResponse?.data)
                ? invoiceResponse.data.length > 0
                : false;
            } catch {
              factureRecue = false;
            }
          }

          return {
            id: item.id,
            ref: item.numeroBcf,
            fournisseur: item.fournisseur?.raisonSociale || "-",
            articles: item.lignes?.length || 0,
            date: item.dateCommande
              ? new Date(item.dateCommande).toLocaleDateString("fr-FR")
              : "-",
            montant: Number(item.totalTtc || 0),
            statut: normalizeStatus(item.statut),
            statutRaw: item.statut,
            factureRecue,
          };
        }),
      );

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
        const [suppliersRes, productsRes] = await Promise.all([
          getFournisseurs({ limit: 1000 }),
          getProduits({ limit: 1000, statut: "ACTIF" }),
        ]);
        setSuppliers(
          Array.isArray(suppliersRes?.data) ? suppliersRes.data : [],
        );
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

  useEffect(() => {
    setReceptionRowsPage(1);
  }, [receptionRowsSearch, receptionRowsStatusFilter]);

  const filterOptions = useMemo(
    () => [
      { label: "Tous les statuts", value: "" },
      ...Array.from(new Set(rows.map((r) => r.statut)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "fr"))
        .map((status) => ({ label: status, value: status })),
    ],
    [rows],
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const searchMatch =
        !q ||
        r.ref.toLowerCase().includes(q) ||
        r.fournisseur.toLowerCase().includes(q);
      const statusMatch = !statusFilter || r.statut === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [rows, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const paginatedRows = useMemo(
    () => filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredRows, page],
  );

  const receptionRows = useMemo<ReceptionRow[]>(() => {
    if (!detailsOrder) return [];
    const supplierName = detailsOrder.fournisseur?.raisonSociale || "-";
    return (detailsOrder.receptions || []).map((item, index) => {
      const userName = item.utilisateur
        ? [item.utilisateur.prenom, item.utilisateur.nom]
            .filter(Boolean)
            .join(" ")
        : "-";
      const quantiteRecue = (item.lignes || []).reduce(
        (acc, line) => acc + toNumber(line.quantiteRecue, 0),
        0,
      );
      return {
        id: item.id,
        reference: `REC-${String(index + 1).padStart(3, "0")}`,
        date: item.dateReception
          ? new Date(item.dateReception).toLocaleDateString("fr-FR")
          : "-",
        fournisseur: supplierName,
        utilisateur: userName || "-",
        lignes: item.lignes?.length || 0,
        quantiteRecue,
        statut: normalizeReceptionStatus(item.statut),
        statutRaw: item.statut,
      };
    });
  }, [detailsOrder]);

  const receptionFilterOptions = useMemo(
    () => [
      { label: "Tous les statuts", value: "" },
      ...Array.from(new Set(receptionRows.map((row) => row.statutRaw)))
        .filter(Boolean)
        .map((status) => ({
          label: normalizeReceptionStatus(status),
          value: status,
        })),
    ],
    [receptionRows],
  );

  const filteredReceptionRows = useMemo(() => {
    const q = receptionRowsSearch.trim().toLowerCase();
    return receptionRows.filter((row) => {
      const searchMatch =
        !q ||
        row.reference.toLowerCase().includes(q) ||
        row.fournisseur.toLowerCase().includes(q) ||
        row.utilisateur.toLowerCase().includes(q);
      const statusMatch =
        !receptionRowsStatusFilter ||
        row.statutRaw === receptionRowsStatusFilter;
      return searchMatch && statusMatch;
    });
  }, [receptionRows, receptionRowsSearch, receptionRowsStatusFilter]);

  const receptionTotalPages = Math.max(
    1,
    Math.ceil(filteredReceptionRows.length / RECEPTION_PAGE_SIZE),
  );

  const paginatedReceptionRows = useMemo(
    () =>
      filteredReceptionRows.slice(
        (receptionRowsPage - 1) * RECEPTION_PAGE_SIZE,
        receptionRowsPage * RECEPTION_PAGE_SIZE,
      ),
    [filteredReceptionRows, receptionRowsPage],
  );

  const openInvoiceWizard = async (orderId?: string) => {
    const selectedOrderId = orderId || detailsOrder?.id;
    if (!selectedOrderId) return;

    const row = rows.find((item) => item.id === selectedOrderId);
    const targetStatus = row?.statutRaw || detailsOrder?.statut;

    if (!canCreateInvoiceForStatus(targetStatus)) {
      toast.warning(
        "Reception valide requise avant la creation de la facture fournisseur",
      );
      return;
    }

    if (!detailsOrder || detailsOrder.id !== selectedOrderId) {
      await openDetailsModal(selectedOrderId);
    }
    setImportOrder({ id: selectedOrderId, ref: row?.ref || "BCF" });
    setInvoiceWizardStep(1);
    setInvoiceWizardOpen(true);
  };

  const purchaseColumns: Column<PurchaseRow>[] = [
    {
      key: "ref",
      header: "Bon de commande",
      render: (o) => (
        <span className="font-medium text-foreground">{o.ref}</span>
      ),
    },
    { key: "fournisseur", header: "Fournisseur" },
    { key: "articles", header: "Articles", align: "right" },
    { key: "date", header: "Date" },
    {
      key: "montant",
      header: "Montant",
      align: "right",
      render: (o) => (
        <span className="font-medium text-foreground">
          {fmtCurrency(o.montant)}
        </span>
      ),
    },
    {
      key: "statut",
      header: "Statut",
      align: "right",
      render: (o) => <StatusBadge status={o.statut} />,
    },
    {
      key: "factureRecue",
      header: "Facture recue",
      align: "center",
      render: (o) => {
        const canCreateInvoice = canCreateInvoiceForStatus(o.statutRaw);

        return (
          <div
            className="flex flex-col items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Switch
              checked={o.factureRecue}
              disabled={!canCreateInvoice}
              onCheckedChange={() => {
                if (!canCreateInvoice) return;
                void openInvoiceWizard(o.id);
              }}
              aria-label={`Facture recue pour ${o.ref}`}
            />
            {!canCreateInvoice ? (
              <p className="text-center text-[11px] leading-tight text-amber-600">
                Reception valide requise
              </p>
            ) : null}
          </div>
        );
      },
    },
  ];

  const receptionColumns = useMemo<Column<ReceptionRow>[]>(
    () => [
      { key: "reference", header: "Reference" },
      { key: "date", header: "Date" },
      { key: "fournisseur", header: "Fournisseur" },
      { key: "utilisateur", header: "Utilisateur" },
      { key: "lignes", header: "Lignes", align: "right" },
      {
        key: "quantiteRecue",
        header: "Quantite recue",
        align: "right",
      },
      {
        key: "statut",
        header: "Statut",
        align: "right",
        render: (row) => <StatusBadge status={row.statut} />,
      },
    ],
    [],
  );

  const steps = useMemo(() => {
    const byStatus = (targets: string[]) =>
      rows.filter((r) => targets.includes(r.statutRaw)).length;

    const countBrouillon = byStatus(["BROUILLON"]);
    const countValidation = byStatus(["SOUMIS", "VALIDE"]);
    const countEnvoye = byStatus(["ENVOYE", "CONFIRME"]);
    const countReception = byStatus(["RECU_PARTIEL", "RECU_TOTAL"]);

    return [
      {
        icon: FileEdit,
        label: `Brouillon (${countBrouillon})`,
        done: countBrouillon > 0,
      },
      {
        icon: CheckCircle2,
        label: `Validation (${countValidation})`,
        done: countValidation > 0,
      },
      {
        icon: Truck,
        label: `Commande envoyee (${countEnvoye})`,
        done: countEnvoye > 0,
      },
      {
        icon: PackageCheck,
        label: `Reception (${countReception})`,
        done: countReception > 0,
      },
    ];
  }, [rows]);

  const productMap = useMemo(() => {
    const map = new Map<string, ProductItem>();
    for (const p of products) map.set(p.id, p);
    return map;
  }, [products]);

  const supplierOptions = useMemo(
    () =>
      suppliers.map((s) => ({
        value: s.id,
        label: s.raisonSociale || "Fournisseur",
      })),
    [suppliers],
  );

  const productOptions = useMemo(
    () =>
      products.map((p) => ({
        value: p.id,
        label: `${p.designation} (${p.reference || "-"})`,
      })),
    [products],
  );

  const lineCalculations = useMemo(
    () =>
      lines.map((line) => {
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
          ttc,
        };
      }),
    [lines],
  );

  const totals = useMemo(
    () =>
      lineCalculations.reduce(
        (acc, line) => {
          acc.totalHt += line.netHt;
          acc.totalRemise += line.remiseMontant;
          acc.totalTva += line.tvaMontant;
          acc.totalTtc += line.ttc;
          return acc;
        },
        { totalHt: 0, totalRemise: 0, totalTva: 0, totalTtc: 0 },
      ),
    [lineCalculations],
  );

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: makeLineId(),
        idProduit: "",
        quantite: 1,
        unite: "PIECE",
        prixUnitaireHt: 0,
        remise: 0,
        tva: 18,
      },
    ]);
    setLinesError("");
  };

  const updateLine = (lineId: string, patch: Partial<WizardLine>) => {
    setLines((prev) =>
      prev.map((line) => (line.id === lineId ? { ...line, ...patch } : line)),
    );

    setLineErrorsById((prev) => {
      const current = prev[lineId];
      if (!current) return prev;
      const next = { ...current };
      if (patch.idProduit !== undefined) delete next.idProduit;
      if (patch.quantite !== undefined) delete next.quantite;
      if (patch.prixUnitaireHt !== undefined) delete next.prixUnitaireHt;
      if (patch.remise !== undefined) delete next.remise;
      if (patch.tva !== undefined) delete next.tva;
      if (Object.keys(next).length === 0) {
        const { [lineId]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [lineId]: next };
    });
  };

  const removeLine = (lineId: string) => {
    setLines((prev) => prev.filter((line) => line.id !== lineId));
    setLineErrorsById((prev) => {
      const { [lineId]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const setGeneralField = <K extends keyof WizardGeneralForm>(
    key: K,
    value: WizardGeneralForm[K],
  ) => {
    setGeneralForm((prev) => ({ ...prev, [key]: value }));
    if (generalErrors[key]) {
      setGeneralErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validateStep1 = () => {
    const next: WizardGeneralErrors = {};
    if (!generalForm.idFournisseur) next.idFournisseur = "Ce champ est requis";
    if (!generalForm.entrepot.trim()) next.entrepot = "Ce champ est requis";
    if (!generalForm.dateLivraisonSouhaitee)
      next.dateLivraisonSouhaitee = "Ce champ est requis";
    if (
      generalForm.dateLivraisonSouhaitee &&
      generalForm.dateLivraisonSouhaitee <= todayDate
    ) {
      next.dateLivraisonSouhaitee =
        "La date de livraison doit etre strictement posterieure a aujourd'hui";
    }
    if (!generalForm.conditionsPaiement.trim())
      next.conditionsPaiement = "Ce champ est requis";
    if (!generalForm.conditionsLivraison.trim())
      next.conditionsLivraison = "Ce champ est requis";
    if (!generalForm.devise) next.devise = "Ce champ est requis";
    if (!generalForm.priorite) next.priorite = "Ce champ est requis";
    setGeneralErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2 = () => {
    const nextLineErrors: Record<string, WizardLineError> = {};

    if (lines.length === 0) {
      setLinesError("Ajoutez au moins une ligne produit");
      setLineErrorsById({});
      return false;
    }

    setLinesError("");
    for (const line of lines) {
      const lineError: WizardLineError = {};
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
      // Pas de toast pour les champs requis: l'UI inline les affiche deja.
      if (
        generalForm.dateLivraisonSouhaitee &&
        generalForm.dateLivraisonSouhaitee <= todayDate
      ) {
        toast.warning(
          "La date de livraison doit etre strictement posterieure a aujourd'hui",
        );
      }
      return;
    }

    if (createStep === 2 && !validateStep2()) {
      if (lines.length > 0) {
        const invalidLineIndex = lines.findIndex((line) => {
          return (
            line.quantite <= 0 ||
            line.prixUnitaireHt < 0 ||
            line.remise < 0 ||
            line.remise > 100 ||
            line.tva < 0 ||
            line.tva > 100
          );
        });
        if (invalidLineIndex >= 0) {
          toast.warning(
            `Regle metier invalide sur la ligne ${invalidLineIndex + 1}: quantite > 0, prix >= 0, remise et TVA entre 0 et 100`,
          );
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

    const notes = [
      `Entrepot: ${generalForm.entrepot}`,
      `Date bon: ${generalForm.dateBon}`,
      `Conditions paiement: ${generalForm.conditionsPaiement}`,
      `Conditions livraison: ${generalForm.conditionsLivraison}`,
      `Devise: ${generalForm.devise}`,
      `Priorite: ${generalForm.priorite}`,
      generalForm.commentaires
        ? `Commentaires: ${generalForm.commentaires}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const payload = {
      idFournisseur: generalForm.idFournisseur,
      dateLivraisonPrevue: generalForm.dateLivraisonSouhaitee,
      notes,
      lignes: lines.map((line) => ({
        idProduit: line.idProduit,
        quantiteCommandee: toNumber(line.quantite, 0),
        prixUnitaireHt: toNumber(line.prixUnitaireHt, 0),
        remise: toNumber(line.remise, 0),
        tauxTva: toNumber(line.tva, 18),
      })),
    };

    setCreateSubmitting(true);
    try {
      await createBonCommandeFournisseur(payload);
      toast.success("Bon d'achat cree avec le statut BROUILLON");
      setCreateOpen(false);
      resetCreateWizard();
      await loadRows();
    } catch (error: unknown) {
      const maybeMessage =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: unknown }).message || "")
          : "";
      toast.error(maybeMessage.trim() || "Impossible de creer le bon d'achat");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const buildReceptionLinesFromOrder = (
    order: BonCommandeApi,
  ): ReceptionLine[] =>
    (order.lignes || []).map((line) => {
      const commandee = toNumber(line.quantiteCommandee, 0);
      const dejaRecue = toNumber(line.quantiteRecue, 0);
      const restant = Math.max(0, commandee - dejaRecue);
      return {
        idLigneBcf: line.id,
        produit: `${line.produit?.designation || "Produit"} (${line.produit?.reference || "-"})`,
        quantiteCommandee: commandee,
        quantiteDejaRecue: dejaRecue,
        restant,
        quantiteARecevoir: 0,
      };
    });

  const openDetailsModal = async (orderId: string) => {
    setDetailsLoading(true);
    try {
      const response = (await getBonCommandeFournisseurById(orderId)) as {
        data?: BonCommandeApi;
      };
      const order = response?.data;
      if (!order) {
        toast.error("Bon de commande introuvable");
        return;
      }
      try {
        const imported = (await getFacturesImporteesBcf(order.id)) as {
          data?: ImportedInvoiceItem[];
        };
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

  const openReceptionModal = async (orderId?: string) => {
    const selectedOrderId = orderId || detailsOrder?.id;
    if (!selectedOrderId) return;

    try {
      const response = (await getBonCommandeFournisseurById(
        selectedOrderId,
      )) as {
        data?: BonCommandeApi;
      };
      const order = response?.data;
      if (!order) {
        toast.error("Bon de commande introuvable");
        return;
      }
      const receptionLines = buildReceptionLinesFromOrder(order);
      setReceptionOrder({
        id: order.id,
        ref: order.numeroBcf,
        lines: receptionLines,
      });
      setReceptionGeneralForm({ date: todayDate, observations: "" });
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
    const lignes = receptionOrder.lines
      .filter((line) => line.quantiteARecevoir > 0)
      .map((line) => ({
        idLigneBcf: line.idLigneBcf,
        quantiteRecue: Math.min(line.quantiteARecevoir, line.restant),
        conforme: true,
      }));

    if (lignes.length === 0) {
      toast.error("Saisissez au moins une quantite recue");
      return;
    }

    setReceptionSubmitting(true);
    try {
      await receptionBonCommandeFournisseur(receptionOrder.id, { lignes });
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

  const sendToSupplier = async (orderId: string) => {
    try {
      await envoyerBonCommandeFournisseur(orderId);
      toast.success("Bon envoye au fournisseur");
      await loadRows();
    } catch (error: unknown) {
      const maybeMessage =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: unknown }).message || "")
          : "";
      toast.error(
        maybeMessage.trim() || "Impossible d'envoyer le bon au fournisseur",
      );
    }
  };

  const transitionOrder = async (
    orderId: string,
    action: "SUBMIT" | "VALIDATE" | "BACK_TO_DRAFT" | "CANCEL",
    successMessage: string,
  ) => {
    try {
      await transitionBonCommandeFournisseur(orderId, action);
      toast.success(successMessage);
      await loadRows();
    } catch (error: unknown) {
      const maybeMessage =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: unknown }).message || "")
          : "";
      toast.error(maybeMessage.trim() || "Operation impossible sur ce statut");
    }
  };

  const duplicateOrder = async (orderId: string) => {
    try {
      await dupliquerBonCommandeFournisseur(orderId);
      toast.success("Bon de commande duplique en brouillon");
      await loadRows();
    } catch (error: unknown) {
      const maybeMessage =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: unknown }).message || "")
          : "";
      toast.error(maybeMessage.trim() || "Duplication impossible");
    }
  };

  const blobToDataUrl = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("PDF_READ_FAILED"));
      reader.readAsDataURL(blob);
    });

  const openPdfOrder = async (orderId: string) => {
    setPdfModalLoading(true);
    setPdfModalOpen(true);
    try {
      const blob = (await telechargerBonCommandeFournisseurPdf(
        orderId,
      )) as Blob;
      const dataUrl = await blobToDataUrl(blob);
      const numero = rows.find((row) => row.id === orderId)?.ref || "bcf";
      setPdfFilename(`${numero}.pdf`);
      setPdfBlob(blob);
      setPdfDataUrl(dataUrl);
    } catch (error: unknown) {
      const maybeMessage =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: unknown }).message || "")
          : "";
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
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  };

  const printCurrentPdf = () => {
    try {
      pdfFrameRef.current?.contentWindow?.focus();
      pdfFrameRef.current?.contentWindow?.print();
    } catch {
      toast.error("Impossible de lancer l'impression");
    }
  };

  const openImportInvoiceModal = async (orderId: string) => {
    const row = rows.find((item) => item.id === orderId);
    setImportOrder({ id: orderId, ref: row?.ref || "BCF" });
    setImportOpen(true);
    setImportFile(null);
    if (importPreviewUrl) {
      URL.revokeObjectURL(importPreviewUrl);
      setImportPreviewUrl(null);
    }
    setImportedInvoicesLoading(true);
    try {
      const response = (await getFacturesImporteesBcf(orderId)) as {
        data?: ImportedInvoiceItem[];
      };
      setImportedInvoices(Array.isArray(response?.data) ? response.data : []);
    } catch (error: unknown) {
      const maybeMessage =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: unknown }).message || "")
          : "";
      toast.error(
        maybeMessage.trim() || "Impossible de charger les factures importees",
      );
      setImportedInvoices([]);
    } finally {
      setImportedInvoicesLoading(false);
    }
  };

  const onImportFileChange = (file: File | null) => {
    setImportFile(file);
    if (importPreviewUrl) {
      URL.revokeObjectURL(importPreviewUrl);
      setImportPreviewUrl(null);
    }
    if (file && file.type === "application/pdf") {
      setImportPreviewUrl(URL.createObjectURL(file));
    }
  };

  const submitImportInvoiceDecision = async (
    decision: "VALIDER" | "REJETER",
  ) => {
    if (!importOrder?.id) return;
    if (!importFile) {
      toast.error("Selectionnez d'abord un fichier PDF, DOC ou DOCX");
      return;
    }

    setImportSubmitting(true);
    try {
      const response = (await importerFactureFournisseurBcf(importOrder.id, {
        file: importFile,
        decision,
      })) as { data?: { numeroFacture?: string } };

      const numero = response?.data?.numeroFacture;
      toast.success(
        numero
          ? `Facture importee ${decision.toLowerCase()}: ${numero}`
          : `Facture importee ${decision.toLowerCase()}`,
      );

      onImportFileChange(null);

      const listResponse = (await getFacturesImporteesBcf(importOrder.id)) as {
        data?: ImportedInvoiceItem[];
      };
      setImportedInvoices(
        Array.isArray(listResponse?.data) ? listResponse.data : [],
      );
      await loadRows();
    } catch (error: unknown) {
      const maybeMessage =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: unknown }).message || "")
          : "";
      toast.error(maybeMessage.trim() || "Import de facture impossible");
    } finally {
      setImportSubmitting(false);
    }
  };

  const executeRowActionWithLoader = async (
    rowId: string,
    actionKey: string,
    action: () => Promise<void>,
  ) => {
    let shouldRun = true;
    setRowActionPendingById((prev) => {
      if (prev[rowId]) {
        shouldRun = false;
        return prev;
      }
      return { ...prev, [rowId]: actionKey };
    });

    if (!shouldRun) return;

    try {
      await action();
    } finally {
      setRowActionPendingById((prev) => {
        const { [rowId]: _removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const actionsByStatus = (row: PurchaseRow) => {
    const makeAction = (
      key: string,
      label: string,
      icon: ReactNode,
      action: () => Promise<void>,
      destructive = false,
    ) => {
      const isRunning = rowActionPendingById[row.id] === key;
      return {
        label,
        icon: isRunning ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          icon
        ),
        destructive,
        onClick: () => void executeRowActionWithLoader(row.id, key, action),
      };
    };

    if (row.statutRaw === "BROUILLON") {
      return [
        makeAction(
          "submit",
          "Soumettre",
          <ArrowRight className="mr-2 h-4 w-4" />,
          () => transitionOrder(row.id, "SUBMIT", "Bon soumis pour validation"),
        ),
        makeAction(
          "cancel",
          "Annuler",
          <Trash2 className="mr-2 h-4 w-4" />,
          () => transitionOrder(row.id, "CANCEL", "Bon annule"),
          true,
        ),
        makeAction(
          "duplicate",
          "Dupliquer",
          <Copy className="mr-2 h-4 w-4" />,
          () => duplicateOrder(row.id),
        ),
        makeAction(
          "export-pdf",
          "Exporter PDF",
          <Download className="mr-2 h-4 w-4" />,
          () => openPdfOrder(row.id),
        ),
      ];
    }

    if (row.statutRaw === "SOUMIS") {
      return [
        makeAction(
          "validate",
          "Valider",
          <CheckCircle2 className="mr-2 h-4 w-4" />,
          () => transitionOrder(row.id, "VALIDATE", "Bon valide"),
        ),
        makeAction(
          "cancel",
          "Annuler",
          <Trash2 className="mr-2 h-4 w-4" />,
          () => transitionOrder(row.id, "CANCEL", "Bon annule"),
          true,
        ),
        makeAction(
          "back-to-draft",
          "Retour au brouillon",
          <ArrowLeft className="mr-2 h-4 w-4" />,
          () =>
            transitionOrder(
              row.id,
              "BACK_TO_DRAFT",
              "Bon retourne au brouillon",
            ),
        ),
        makeAction(
          "duplicate",
          "Dupliquer",
          <Copy className="mr-2 h-4 w-4" />,
          () => duplicateOrder(row.id),
        ),
      ];
    }

    if (row.statutRaw === "VALIDE") {
      return [
        makeAction(
          "send",
          "Envoyer au fournisseur",
          <Send className="mr-2 h-4 w-4" />,
          () => sendToSupplier(row.id),
        ),
        makeAction(
          "download-pdf",
          "Telecharger PDF",
          <Download className="mr-2 h-4 w-4" />,
          () => openPdfOrder(row.id),
        ),
        /* makeAction(
          "print",
          "Imprimer",
          <Printer className="mr-2 h-4 w-4" />,
          () => openPdfOrder(row.id, true),
        ), */
        makeAction(
          "cancel",
          "Annuler",
          <Trash2 className="mr-2 h-4 w-4" />,
          () => transitionOrder(row.id, "CANCEL", "Bon annule"),
          true,
        ),
      ];
    }

    if (row.statutRaw === "ENVOYE") {
      return [
        makeAction(
          "resend",
          "Relancer le fournisseur",
          <Send className="mr-2 h-4 w-4" />,
          () => sendToSupplier(row.id),
        ),
        makeAction(
          "details",
          "Voir le detail",
          <FileEdit className="mr-2 h-4 w-4" />,
          () => openReceptionModal(row.id),
        ),
        makeAction(
          "cancel",
          "Annuler",
          <Trash2 className="mr-2 h-4 w-4" />,
          () => transitionOrder(row.id, "CANCEL", "Bon annule"),
          true,
        ),
        makeAction(
          "create-reception",
          "Creer une reception",
          <PackageCheck className="mr-2 h-4 w-4" />,
          () => openReceptionModal(row.id),
        ),
        makeAction(
          "download-pdf",
          "Telecharger PDF",
          <Download className="mr-2 h-4 w-4" />,
          () => openPdfOrder(row.id),
        ),
      ];
    }

    if (row.statutRaw === "CONFIRME") {
      return [
        /* makeAction(
          "details",
          "Voir le detail",
          <FileEdit className="mr-2 h-4 w-4" />,
          () => openReceptionModal(row.id),
        ), */
        makeAction(
          "create-reception",
          "Creer une reception",
          <PackageCheck className="mr-2 h-4 w-4" />,
          () => openReceptionModal(row.id),
        ),
        makeAction(
          "download-pdf",
          "Telecharger PDF",
          <Download className="mr-2 h-4 w-4" />,
          () => openPdfOrder(row.id),
        ),
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
        makeAction(
          "import-invoice",
          "Ajouter facture fournisseur",
          <FileEdit className="mr-2 h-4 w-4" />,
          () => openInvoiceWizard(row.id),
        ),
        makeAction(
          "new-reception",
          "Nouvelle reception",
          <PackageCheck className="mr-2 h-4 w-4" />,
          () => openReceptionModal(row.id),
        ),
        /*  makeAction(
          "remaining-quantities",
          "Voir les quantites restantes",
          <FileEdit className="mr-2 h-4 w-4" />,
          () => openReceptionModal(row.id),
        ), */
        makeAction(
          "download-pdf",
          "Telecharger PDF",
          <Download className="mr-2 h-4 w-4" />,
          () => openPdfOrder(row.id),
        ),
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
        makeAction(
          "import-invoice",
          "Ajouter facture fournisseur",
          <FileEdit className="mr-2 h-4 w-4" />,
          () => openInvoiceWizard(row.id),
        ),
        makeAction(
          "download-pdf",
          "Telecharger PDF",
          <Download className="mr-2 h-4 w-4" />,
          () => openPdfOrder(row.id),
        ),
        /*  makeAction(
          "print",
          "Imprimer",
          <Printer className="mr-2 h-4 w-4" />,
          () => openPdfOrder(row.id, true),
        ), */
        makeAction(
          "duplicate",
          "Dupliquer",
          <Copy className="mr-2 h-4 w-4" />,
          () => duplicateOrder(row.id),
        ),
      ];
    }

    if (row.statutRaw === "ANNULE") {
      return [
        makeAction(
          "duplicate",
          "Dupliquer",
          <Copy className="mr-2 h-4 w-4" />,
          () => duplicateOrder(row.id),
        ),
        makeAction(
          "download-pdf",
          "Telecharger PDF",
          <Download className="mr-2 h-4 w-4" />,
          () => openPdfOrder(row.id),
        ),
      ];
    }

    if (row.statutRaw === "REJETE") {
      return [
        makeAction(
          "duplicate",
          "Dupliquer",
          <Copy className="mr-2 h-4 w-4" />,
          () => duplicateOrder(row.id),
        ),
        makeAction(
          "download-pdf",
          "Telecharger PDF",
          <Download className="mr-2 h-4 w-4" />,
          () => openPdfOrder(row.id),
        ),
      ];
    }

    return [];
  };

  return (
    <>
      <PageHeader
        title="Achats"
        description="Bons de commande, réceptions et validation fournisseurs"
        breadcrumb={["Transactions", "Achats"]}
        actions={
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => {
              resetCreateWizard();
              setCreateOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Nouveau bon de commande
          </Button>
        }
      />
      <SectionCard
        title="Workflow d'achat"
        description="Cycle de vie d'un bon de commande"
        className="mb-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {steps.map((s, i) => (
            <div key={s.label} className="flex flex-1 items-center gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${s.done ? "bg-gradient-primary text-white" : "border-2 border-dashed border-border text-muted-foreground"}`}
                >
                  <s.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Étape {i + 1}</p>
                  <p
                    className={`text-sm font-medium ${s.done ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {s.label}
                  </p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`hidden h-0.5 flex-1 sm:block ${s.done ? "bg-primary/40" : "bg-border"}`}
                />
              )}
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Bons de commande">
        <div className="mb-4">
          <Toolbar
            placeholder="Rechercher un bon de commande..."
            searchValue={search}
            onSearchChange={setSearch}
            filterOptions={filterOptions}
            selectedFilter={statusFilter}
            onFilterChange={setStatusFilter}
            filterPlaceholder="Filtrer par statut"
            filterSearchPlaceholder="Rechercher un statut"
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <DataTable
              columns={purchaseColumns}
              rows={paginatedRows}
              rowKey={(o) => o.id}
              rowActions={actionsByStatus}
              isRowActionLoading={(o) => Boolean(rowActionPendingById[o.id])}
              onRowClick={(row) => {
                void openDetailsModal(row.id);
              }}
            />
            <Pagination
              count={filteredRows.length}
              currentPage={page}
              totalPages={totalPages}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </SectionCard>

      <AppModal
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          if (!open) setDetailsOrder(null);
        }}
        title={detailsOrder ? `Bon ${detailsOrder.numeroBcf}` : "Detail bon"}
        description="Receptions independantes et facture fournisseur"
        size="xxl"
        footer={
          <div className="flex items-center justify-end">
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Fermer
            </Button>
          </div>
        }
      >
        {detailsLoading ? (
          <div className="flex justify-center py-14">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : detailsOrder ? (
          <div className="space-y-6">
            {canCreateInvoiceForStatus(detailsOrder.statut) ? null : (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Creation de facture disponible apres une reception valide
                (partielle ou totale).
              </div>
            )}
            <PageHeader
              title={`Receptions - ${detailsOrder.numeroBcf}`}
              description="Pilotage des receptions et facture fournisseur"
              breadcrumb={["Achats", "Bon de commande", "Receptions"]}
              actions={
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!canCreateInvoiceForStatus(detailsOrder.statut)}
                    onClick={() => void openInvoiceWizard(detailsOrder.id)}
                  >
                    <ReceiptText className="mr-1 h-4 w-4" /> Ajouter facture
                  </Button>
                  <Button
                    size="sm"
                    disabled={detailsOrder.statut === "RECU_TOTAL"}
                    title={
                      detailsOrder.statut === "RECU_TOTAL"
                        ? "Reception deja totale"
                        : undefined
                    }
                    onClick={() => void openReceptionModal(detailsOrder.id)}
                  >
                    <Plus className="mr-1 h-4 w-4" /> Nouvelle reception
                  </Button>
                </div>
              }
            />

            <SectionCard title="Liste des receptions">
              <div className="mb-4">
                <Toolbar
                  placeholder="Rechercher une reception..."
                  searchValue={receptionRowsSearch}
                  onSearchChange={setReceptionRowsSearch}
                  filterOptions={receptionFilterOptions}
                  selectedFilter={receptionRowsStatusFilter}
                  onFilterChange={setReceptionRowsStatusFilter}
                  filterPlaceholder="Filtrer par statut"
                  filterSearchPlaceholder="Rechercher un statut"
                />
              </div>

              <DataTable
                columns={receptionColumns}
                rows={paginatedReceptionRows}
                rowKey={(row) => row.id}
                withActions={false}
              />

              <Pagination
                count={filteredReceptionRows.length}
                currentPage={receptionRowsPage}
                totalPages={receptionTotalPages}
                pageSize={RECEPTION_PAGE_SIZE}
                onPageChange={setReceptionRowsPage}
              />
            </SectionCard>
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Aucun detail disponible.
          </p>
        )}
      </AppModal>

      <AppModal
        open={createOpen}
        onOpenChange={(open) => {
          if (!createSubmitting) setCreateOpen(open);
        }}
        title="Creation du bon d'achat"
        description="Wizard en 3 etapes: informations, produits, verification"
        size="xxl"
        footer={
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={createSubmitting}
            >
              Annuler
            </Button>
            <div className="flex items-center gap-2">
              {createStep > 1 ? (
                <Button
                  variant="outline"
                  onClick={previousStep}
                  disabled={createSubmitting}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" /> Retour
                </Button>
              ) : null}
              {createStep < 3 ? (
                <Button onClick={nextStep} disabled={createSubmitting}>
                  Suivant <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => void createBonCommande()}
                  disabled={createSubmitting || !confirmationChecked}
                >
                  {createSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Creer le bon
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="mb-5 flex items-center gap-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${createStep >= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {step}
              </span>
              {step < 3 ? <span className="h-0.5 w-8 bg-border" /> : null}
            </div>
          ))}
        </div>

        {createStep === 1 ? (
          <div className="grid h-[560px] content-start gap-4 overflow-y-auto pr-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Fournisseur
                <span className="ml-1 text-destructive">*</span>
              </Label>
              <div
                className={cn(
                  generalErrors.idFournisseur
                    ? "rounded-md border border-destructive p-1"
                    : "",
                )}
              >
                <SearchableSelect
                  portalMode="body"
                  value={generalForm.idFournisseur}
                  onValueChange={(value) =>
                    setGeneralField("idFournisseur", value)
                  }
                  options={supplierOptions}
                  placeholder="Selectionner un fournisseur"
                  searchPlaceholder="Rechercher un fournisseur"
                  emptyMessage="Aucun fournisseur"
                />
              </div>
              {generalErrors.idFournisseur ? (
                <p className="text-xs text-destructive">
                  {generalErrors.idFournisseur}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="entrepot">
                Entrepot
                <span className="ml-1 text-destructive">*</span>
              </Label>
              <Input
                id="entrepot"
                value={generalForm.entrepot}
                onChange={(e) => setGeneralField("entrepot", e.target.value)}
                className={cn(
                  generalErrors.entrepot ? "border-destructive" : "",
                )}
                placeholder="Entrepot principal"
              />
              {generalErrors.entrepot ? (
                <p className="text-xs text-destructive">
                  {generalErrors.entrepot}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>
                Date du bon
                <span className="ml-1 text-destructive">*</span>
              </Label>
              <div className="flex h-9 items-center rounded-md border border-input bg-muted/40 px-3 text-sm text-foreground">
                {generalForm.dateBon
                  ? new Date(generalForm.dateBon).toLocaleDateString("fr-FR")
                  : "-"}
              </div>
              <p className="text-xs text-muted-foreground">
                La date du bon est automatiquement definie a la date actuelle.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-livraison">
                Date souhaitee de livraison
                <span className="ml-1 text-destructive">*</span>
              </Label>
              <Input
                id="date-livraison"
                type="date"
                min={tomorrowDate}
                value={generalForm.dateLivraisonSouhaitee}
                onChange={(e) =>
                  setGeneralField("dateLivraisonSouhaitee", e.target.value)
                }
                className={cn(
                  generalErrors.dateLivraisonSouhaitee
                    ? "border-destructive"
                    : "",
                )}
              />
              {generalErrors.dateLivraisonSouhaitee ? (
                <p className="text-xs text-destructive">
                  {generalErrors.dateLivraisonSouhaitee}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cond-paiement">
                Conditions de paiement
                <span className="ml-1 text-destructive">*</span>
              </Label>
              <Input
                id="cond-paiement"
                value={generalForm.conditionsPaiement}
                onChange={(e) =>
                  setGeneralField("conditionsPaiement", e.target.value)
                }
                className={cn(
                  generalErrors.conditionsPaiement ? "border-destructive" : "",
                )}
                placeholder="Ex: 30 jours fin de mois"
              />
              {generalErrors.conditionsPaiement ? (
                <p className="text-xs text-destructive">
                  {generalErrors.conditionsPaiement}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cond-livraison">
                Conditions de livraison
                <span className="ml-1 text-destructive">*</span>
              </Label>
              <Input
                id="cond-livraison"
                value={generalForm.conditionsLivraison}
                onChange={(e) =>
                  setGeneralField("conditionsLivraison", e.target.value)
                }
                className={cn(
                  generalErrors.conditionsLivraison ? "border-destructive" : "",
                )}
                placeholder="Ex: Franco entrepot"
              />
              {generalErrors.conditionsLivraison ? (
                <p className="text-xs text-destructive">
                  {generalErrors.conditionsLivraison}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>
                Devise
                <span className="ml-1 text-destructive">*</span>
              </Label>
              <div
                className={cn(
                  generalErrors.devise
                    ? "rounded-md border border-destructive p-1"
                    : "",
                )}
              >
                <SearchableSelect
                  portalMode="body"
                  value={generalForm.devise}
                  onValueChange={(value) => setGeneralField("devise", value)}
                  options={[
                    { value: "XOF", label: "XOF" },
                    { value: "EUR", label: "EUR" },
                    { value: "USD", label: "USD" },
                  ]}
                  placeholder="Selectionner une devise"
                  searchPlaceholder="Rechercher une devise"
                  emptyMessage="Aucune devise"
                />
              </div>
              {generalErrors.devise ? (
                <p className="text-xs text-destructive">
                  {generalErrors.devise}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>
                Priorite
                <span className="ml-1 text-destructive">*</span>
              </Label>
              <div
                className={cn(
                  generalErrors.priorite
                    ? "rounded-md border border-destructive p-1"
                    : "",
                )}
              >
                <SearchableSelect
                  portalMode="body"
                  value={generalForm.priorite}
                  onValueChange={(value) => setGeneralField("priorite", value)}
                  options={[
                    { value: "BASSE", label: "Basse" },
                    { value: "NORMALE", label: "Normale" },
                    { value: "HAUTE", label: "Haute" },
                    { value: "URGENTE", label: "Urgente" },
                  ]}
                  placeholder="Selectionner une priorite"
                  searchPlaceholder="Rechercher une priorite"
                  emptyMessage="Aucune priorite"
                />
              </div>
              {generalErrors.priorite ? (
                <p className="text-xs text-destructive">
                  {generalErrors.priorite}
                </p>
              ) : null}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="commentaires">Commentaires</Label>
              <Textarea
                id="commentaires"
                value={generalForm.commentaires}
                onChange={(e) =>
                  setGeneralForm((prev) => ({
                    ...prev,
                    commentaires: e.target.value,
                  }))
                }
                placeholder="Commentaires internes"
              />
            </div>
          </div>
        ) : null}

        {createStep === 2 ? (
          <div className="h-[560px] space-y-4 overflow-y-auto pr-1">
            {linesError ? (
              <p className="text-sm text-destructive">{linesError}</p>
            ) : null}

            <div className="flex justify-end">
              <Button variant="outline" onClick={addLine}>
                <Plus className="mr-1 h-4 w-4" /> Ajouter une ligne
              </Button>
            </div>

            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full min-w-[980px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-2 py-2">
                      Produit<span className="ml-1 text-destructive">*</span>
                    </th>
                    <th className="px-2 py-2">
                      Quantite<span className="ml-1 text-destructive">*</span>
                    </th>
                    <th className="px-2 py-2">Unite</th>
                    <th className="px-2 py-2">Prix unitaire HT</th>
                    <th className="px-2 py-2">Remise %</th>
                    <th className="px-2 py-2">TVA %</th>
                    <th className="px-2 py-2 text-right">Total HT</th>
                    <th className="px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {lineCalculations.map((line) => (
                    <tr key={line.id} className="border-b border-border/60">
                      <td className="px-2 py-2">
                        <div
                          className={cn(
                            lineErrorsById[line.id]?.idProduit
                              ? "rounded-md border border-destructive p-1"
                              : "",
                          )}
                        >
                          <SearchableSelect
                            portalMode="body"
                            value={line.idProduit}
                            onValueChange={(value) => {
                              const product = productMap.get(value);
                              updateLine(line.id, {
                                idProduit: value,
                                unite: product?.uniteMesure || "PIECE",
                                prixUnitaireHt: toNumber(
                                  product?.prixAchatHt,
                                  0,
                                ),
                                tva: toNumber(product?.tauxTva, 18),
                              });
                            }}
                            options={productOptions}
                            placeholder="Selectionner un produit"
                            searchPlaceholder="Rechercher un produit"
                            emptyMessage="Aucun produit"
                          />
                        </div>
                        {lineErrorsById[line.id]?.idProduit ? (
                          <p className="mt-1 text-xs text-destructive">
                            {lineErrorsById[line.id].idProduit}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={formatGroupedInputNumber(
                            String(line.quantite),
                          )}
                          className={cn(
                            lineErrorsById[line.id]?.quantite
                              ? "border-destructive"
                              : "",
                          )}
                          onChange={(e) =>
                            updateLine(line.id, {
                              quantite: Math.max(
                                0,
                                toNumber(
                                  normalizeNumberInput(e.target.value),
                                  0,
                                ),
                              ),
                            })
                          }
                        />
                        {lineErrorsById[line.id]?.quantite ? (
                          <p className="mt-1 text-xs text-destructive">
                            {lineErrorsById[line.id].quantite}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-2 py-2">
                        <SearchableSelect
                          portalMode="body"
                          value={line.unite}
                          onValueChange={(value) =>
                            updateLine(line.id, { unite: value })
                          }
                          options={UNIT_OPTIONS}
                          placeholder="Selectionner une unite"
                          searchPlaceholder="Rechercher une unite"
                          emptyMessage="Aucune unite"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={formatGroupedInputNumber(
                            String(line.prixUnitaireHt),
                          )}
                          className={cn(
                            lineErrorsById[line.id]?.prixUnitaireHt
                              ? "border-destructive"
                              : "",
                          )}
                          onChange={(e) =>
                            updateLine(line.id, {
                              prixUnitaireHt: Math.max(
                                0,
                                toNumber(
                                  normalizeNumberInput(e.target.value),
                                  0,
                                ),
                              ),
                            })
                          }
                        />
                        {lineErrorsById[line.id]?.prixUnitaireHt ? (
                          <p className="mt-1 text-xs text-destructive">
                            {lineErrorsById[line.id].prixUnitaireHt}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={formatGroupedInputNumber(String(line.remise))}
                          className={cn(
                            lineErrorsById[line.id]?.remise
                              ? "border-destructive"
                              : "",
                          )}
                          onChange={(e) =>
                            updateLine(line.id, {
                              remise: Math.min(
                                100,
                                Math.max(
                                  0,
                                  toNumber(
                                    normalizeNumberInput(e.target.value),
                                    0,
                                  ),
                                ),
                              ),
                            })
                          }
                        />
                        {lineErrorsById[line.id]?.remise ? (
                          <p className="mt-1 text-xs text-destructive">
                            {lineErrorsById[line.id].remise}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={formatGroupedInputNumber(String(line.tva))}
                          className={cn(
                            lineErrorsById[line.id]?.tva
                              ? "border-destructive"
                              : "",
                          )}
                          onChange={(e) =>
                            updateLine(line.id, {
                              tva: Math.min(
                                100,
                                Math.max(
                                  0,
                                  toNumber(
                                    normalizeNumberInput(e.target.value),
                                    0,
                                  ),
                                ),
                              ),
                            })
                          }
                        />
                        {lineErrorsById[line.id]?.tva ? (
                          <p className="mt-1 text-xs text-destructive">
                            {lineErrorsById[line.id].tva}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-2 py-2 text-right font-medium">
                        {fmtCurrency(line.netHt)}
                      </td>
                      <td className="px-2 py-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLine(line.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Total HT</p>
                <p className="font-semibold">{fmtCurrency(totals.totalHt)}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Total remise</p>
                <p className="font-semibold">
                  {fmtCurrency(totals.totalRemise)}
                </p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Total TVA</p>
                <p className="font-semibold">{fmtCurrency(totals.totalTva)}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Total TTC</p>
                <p className="font-semibold">{fmtCurrency(totals.totalTtc)}</p>
              </div>
            </div>
          </div>
        ) : null}

        {createStep === 3 ? (
          <div className="h-[560px] space-y-4 overflow-y-auto pr-1">
            <div className="rounded-md border border-border p-4">
              <h4 className="mb-2 text-sm font-semibold">
                Informations generales
              </h4>
              <div className="grid gap-2 text-sm md:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">Fournisseur:</span>{" "}
                  {supplierOptions.find(
                    (s) => s.value === generalForm.idFournisseur,
                  )?.label || "-"}
                </p>
                <p>
                  <span className="text-muted-foreground">Entrepot:</span>{" "}
                  {generalForm.entrepot || "-"}
                </p>
                <p>
                  <span className="text-muted-foreground">Date bon:</span>{" "}
                  {generalForm.dateBon || "-"}
                </p>
                <p>
                  <span className="text-muted-foreground">Date livraison:</span>{" "}
                  {generalForm.dateLivraisonSouhaitee || "-"}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    Conditions paiement:
                  </span>{" "}
                  {generalForm.conditionsPaiement || "-"}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    Conditions livraison:
                  </span>{" "}
                  {generalForm.conditionsLivraison || "-"}
                </p>
                <p>
                  <span className="text-muted-foreground">Devise:</span>{" "}
                  {generalForm.devise || "-"}
                </p>
                <p>
                  <span className="text-muted-foreground">Priorite:</span>{" "}
                  {generalForm.priorite || "-"}
                </p>
                <p className="md:col-span-2">
                  <span className="text-muted-foreground">Commentaires:</span>{" "}
                  {generalForm.commentaires || "-"}
                </p>
              </div>
            </div>

            <div className="rounded-md border border-border p-4">
              <h4 className="mb-2 text-sm font-semibold">Produits</h4>
              <div className="space-y-2">
                {lineCalculations.map((line) => {
                  const product = productMap.get(line.idProduit);
                  return (
                    <div
                      key={line.id}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                    >
                      <p>
                        {product?.designation || "Produit"} (
                        {product?.reference || "-"}) · {line.quantite}{" "}
                        {line.unite}
                      </p>
                      <p className="font-medium">{fmtCurrency(line.netHt)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Total HT</p>
                <p className="font-semibold">{fmtCurrency(totals.totalHt)}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Total remise</p>
                <p className="font-semibold">
                  {fmtCurrency(totals.totalRemise)}
                </p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Total TVA</p>
                <p className="font-semibold">{fmtCurrency(totals.totalTva)}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Total TTC</p>
                <p className="font-semibold">{fmtCurrency(totals.totalTtc)}</p>
              </div>
            </div>

            <div className="rounded-md border border-border p-3">
              <p className="text-sm font-medium">
                Statut apres creation: BROUILLON
              </p>
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={confirmationChecked}
                  onChange={(e) => {
                    setConfirmationChecked(e.target.checked);
                    if (e.target.checked) setConfirmationError("");
                  }}
                />
                Je confirme les informations du bon d'achat.
              </label>
              {confirmationError ? (
                <p className="mt-1 text-xs text-destructive">
                  {confirmationError}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </AppModal>

      <AppModal
        open={receptionOpen}
        onOpenChange={(open) => {
          if (!receptionSubmitting) setReceptionOpen(open);
          if (!open) {
            setReceptionOrder(null);
            setReceptionGeneralErrors({});
            setReceptionLinesError("");
          }
        }}
        title="Nouvelle reception"
        description={
          receptionOrder
            ? `Bon ${receptionOrder.ref} - wizard de reception`
            : ""
        }
        size="xxl"
        footer={
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              disabled={receptionSubmitting}
              onClick={() => {
                setReceptionOpen(false);
                setReceptionOrder(null);
              }}
            >
              Annuler
            </Button>
            <div className="flex items-center gap-2">
              {receptionStep > 1 ? (
                <Button
                  variant="outline"
                  disabled={receptionSubmitting}
                  onClick={() =>
                    setReceptionStep((prev) => Math.max(1, prev - 1))
                  }
                >
                  <ArrowLeft className="mr-1 h-4 w-4" /> Retour
                </Button>
              ) : null}
              {receptionStep < 3 ? (
                <Button
                  disabled={receptionSubmitting}
                  onClick={() => {
                    if (receptionStep === 1 && !validateReceptionStep1()) {
                      return;
                    }
                    if (receptionStep === 2 && !validateReceptionStep2()) {
                      return;
                    }
                    setReceptionStep((prev) => Math.min(3, prev + 1));
                  }}
                >
                  Suivant <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  disabled={receptionSubmitting}
                  onClick={() => void submitReception()}
                >
                  {receptionSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Valider la reception
                </Button>
              )}
            </div>
          </div>
        }
      >
        {receptionOrder ? (
          <div className="space-y-4">
            <div className="mb-2 flex items-center gap-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${receptionStep >= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {step}
                  </span>
                  {step < 3 ? <span className="h-0.5 w-8 bg-border" /> : null}
                </div>
              ))}
            </div>

            {receptionStep === 1 ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Fournisseur</Label>
                  <Input
                    value={
                      detailsOrder?.fournisseur?.raisonSociale ||
                      rows.find((item) => item.id === receptionOrder.id)
                        ?.fournisseur ||
                      "-"
                    }
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bon de commande</Label>
                  <Input value={receptionOrder.ref} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reception-date">Date</Label>
                  <Input
                    id="reception-date"
                    type="date"
                    className={cn(
                      receptionGeneralErrors.date ? "border-destructive" : "",
                    )}
                    value={receptionGeneralForm.date}
                    onChange={(e) =>
                      setReceptionGeneralForm((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  />
                  {receptionGeneralErrors.date ? (
                    <p className="text-xs text-destructive">
                      {receptionGeneralErrors.date}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="reception-observations">Observations</Label>
                  <Textarea
                    id="reception-observations"
                    value={receptionGeneralForm.observations}
                    onChange={(e) =>
                      setReceptionGeneralForm((prev) => ({
                        ...prev,
                        observations: e.target.value,
                      }))
                    }
                    placeholder="Observations de reception"
                  />
                </div>
              </div>
            ) : null}

            {receptionStep === 2 ? (
              <div className="space-y-3">
                {receptionLinesError ? (
                  <p className="text-xs text-destructive">
                    {receptionLinesError}
                  </p>
                ) : null}
                {receptionOrder.lines.map((line) => (
                  <div
                    key={line.idLigneBcf}
                    className="grid gap-2 rounded-md border border-border p-3 md:grid-cols-[2fr_1fr_1fr_1fr_1fr]"
                  >
                    <div>
                      <p className="text-sm font-medium">{line.produit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Commandee</p>
                      <p className="text-sm font-semibold">
                        {line.quantiteCommandee}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Deja recue
                      </p>
                      <p className="text-sm font-semibold">
                        {line.quantiteDejaRecue}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Reste</p>
                      <p className="text-sm font-semibold">{line.restant}</p>
                    </div>
                    <div>
                      <Label htmlFor={`recv-${line.idLigneBcf}`}>
                        Recu maintenant
                      </Label>
                      <Input
                        id={`recv-${line.idLigneBcf}`}
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        value={formatGroupedInputNumber(
                          String(line.quantiteARecevoir),
                        )}
                        onChange={(e) => {
                          const value = Math.max(
                            0,
                            Math.min(
                              line.restant,
                              toNumber(normalizeNumberInput(e.target.value), 0),
                            ),
                          );
                          setReceptionOrder((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  lines: prev.lines.map((l) =>
                                    l.idLigneBcf === line.idLigneBcf
                                      ? { ...l, quantiteARecevoir: value }
                                      : l,
                                  ),
                                }
                              : prev,
                          );
                          setReceptionLinesError("");
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {receptionStep === 3 ? (
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-md border border-border p-3">
                  <p className="text-xs text-muted-foreground">
                    Nombre de produits
                  </p>
                  <p className="text-lg font-semibold">
                    {receptionOrder.lines.length}
                  </p>
                </div>
                <div className="rounded-md border border-border p-3">
                  <p className="text-xs text-muted-foreground">
                    Quantite totale recue
                  </p>
                  <p className="text-lg font-semibold">
                    {receptionOrder.lines.reduce(
                      (acc, line) => acc + line.quantiteARecevoir,
                      0,
                    )}
                  </p>
                </div>
                <div className="rounded-md border border-border p-3">
                  <p className="text-xs text-muted-foreground">
                    Valeur reception
                  </p>
                  <p className="text-lg font-semibold">
                    {fmtCurrency(
                      receptionOrder.lines.reduce((acc, line) => {
                        const sourceLine = detailsOrder?.lignes?.find(
                          (item) => item.id === line.idLigneBcf,
                        );
                        return (
                          acc +
                          line.quantiteARecevoir *
                            toNumber(sourceLine?.prixUnitaireHt, 0)
                        );
                      }, 0),
                    )}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </AppModal>

      <AppModal
        open={invoiceWizardOpen}
        onOpenChange={(open) => {
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
        }}
        title="Creation facture fournisseur"
        description={
          importOrder
            ? `Bon ${importOrder.ref} - wizard facture fournisseur`
            : ""
        }
        size="xxl"
        position="center"
        footer={
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              disabled={invoiceWizardSubmitting}
              onClick={() => setInvoiceWizardOpen(false)}
            >
              Annuler
            </Button>
            <div className="flex items-center gap-2">
              {invoiceWizardStep > 1 ? (
                <Button
                  variant="outline"
                  disabled={invoiceWizardSubmitting}
                  onClick={() =>
                    setInvoiceWizardStep((prev) => Math.max(1, prev - 1))
                  }
                >
                  <ArrowLeft className="mr-1 h-4 w-4" /> Retour
                </Button>
              ) : null}
              {invoiceWizardStep < 3 ? (
                <Button
                  disabled={invoiceWizardSubmitting}
                  onClick={() => {
                    if (invoiceWizardStep === 1 && !validateInvoiceStep1()) {
                      return;
                    }
                    if (invoiceWizardStep === 2 && !importFile) {
                      setInvoiceFormErrors((prev) => ({
                        ...prev,
                        file: "Le fichier PDF est requis",
                      }));
                      return;
                    }
                    setInvoiceFormErrors((prev) => ({
                      ...prev,
                      file: undefined,
                    }));
                    setInvoiceWizardStep((prev) => Math.min(3, prev + 1));
                  }}
                >
                  Suivant <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  disabled={invoiceWizardSubmitting || !importFile}
                  onClick={async () => {
                    setInvoiceWizardSubmitting(true);
                    await submitImportInvoiceDecision("VALIDER");
                    setInvoiceWizardSubmitting(false);
                    setInvoiceWizardOpen(false);
                    if (importOrder?.id) {
                      await openDetailsModal(importOrder.id);
                      await loadRows();
                    }
                  }}
                >
                  {invoiceWizardSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Valider la facture
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="mb-2 flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${invoiceWizardStep >= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {step}
                </span>
                {step < 3 ? <span className="h-0.5 w-8 bg-border" /> : null}
              </div>
            ))}
          </div>

          {invoiceWizardStep === 1 ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invoice-number">Numero facture</Label>
                <Input
                  id="invoice-number"
                  placeholder="Ex: FAC-2026-0001"
                  className={cn(
                    invoiceFormErrors.numeroFacture ? "border-destructive" : "",
                  )}
                  value={invoiceForm.numeroFacture}
                  onChange={(e) =>
                    setInvoiceForm((prev) => ({
                      ...prev,
                      numeroFacture: e.target.value,
                    }))
                  }
                />
                {invoiceFormErrors.numeroFacture ? (
                  <p className="text-xs text-destructive">
                    {invoiceFormErrors.numeroFacture}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-date">Date facture</Label>
                <Input
                  id="invoice-date"
                  type="date"
                  className={cn(
                    invoiceFormErrors.dateFacture ? "border-destructive" : "",
                  )}
                  value={invoiceForm.dateFacture}
                  onChange={(e) =>
                    setInvoiceForm((prev) => ({
                      ...prev,
                      dateFacture: e.target.value,
                    }))
                  }
                />
                {invoiceFormErrors.dateFacture ? (
                  <p className="text-xs text-destructive">
                    {invoiceFormErrors.dateFacture}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-due">Date echeance</Label>
                <Input
                  id="invoice-due"
                  type="date"
                  className={cn(
                    invoiceFormErrors.dateEcheance ? "border-destructive" : "",
                  )}
                  value={invoiceForm.dateEcheance}
                  onChange={(e) =>
                    setInvoiceForm((prev) => ({
                      ...prev,
                      dateEcheance: e.target.value,
                    }))
                  }
                />
                {invoiceFormErrors.dateEcheance ? (
                  <p className="text-xs text-destructive">
                    {invoiceFormErrors.dateEcheance}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-ht">Montant HT</Label>
                <Input
                  id="invoice-ht"
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  className={cn(
                    invoiceFormErrors.montantHt ? "border-destructive" : "",
                  )}
                  value={formatGroupedInputNumber(invoiceForm.montantHt)}
                  onChange={(e) => {
                    const montantHt = normalizeNumberInput(e.target.value);
                    setInvoiceForm((prev) => ({
                      ...prev,
                      montantHt,
                      ttc: computeTtcFromHtAndTva(montantHt, prev.tva),
                    }));
                  }}
                />
                {invoiceFormErrors.montantHt ? (
                  <p className="text-xs text-destructive">
                    {invoiceFormErrors.montantHt}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-tva">TVA</Label>
                <Input
                  id="invoice-tva"
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  className={cn(
                    invoiceFormErrors.tva ? "border-destructive" : "",
                  )}
                  value={formatGroupedInputNumber(invoiceForm.tva)}
                  onChange={(e) => {
                    const tva = normalizeNumberInput(e.target.value);
                    setInvoiceForm((prev) => ({
                      ...prev,
                      tva,
                      ttc: computeTtcFromHtAndTva(prev.montantHt, tva),
                    }));
                  }}
                />
                {invoiceFormErrors.tva ? (
                  <p className="text-xs text-destructive">
                    {invoiceFormErrors.tva}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-ttc">TTC</Label>
                <Input
                  id="invoice-ttc"
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  readOnly
                  className={cn(
                    "bg-muted/40",
                    invoiceFormErrors.ttc ? "border-destructive" : "",
                  )}
                  value={formatGroupedInputNumber(invoiceForm.ttc)}
                />
                {invoiceFormErrors.ttc ? (
                  <p className="text-xs text-destructive">
                    {invoiceFormErrors.ttc}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-remise">Remise</Label>
                <Input
                  id="invoice-remise"
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  className={cn(
                    invoiceFormErrors.remise ? "border-destructive" : "",
                  )}
                  value={formatGroupedInputNumber(invoiceForm.remise)}
                  onChange={(e) =>
                    setInvoiceForm((prev) => ({
                      ...prev,
                      remise: normalizeNumberInput(e.target.value),
                    }))
                  }
                />
                {invoiceFormErrors.remise ? (
                  <p className="text-xs text-destructive">
                    {invoiceFormErrors.remise}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-transport">Transport</Label>
                <Input
                  id="invoice-transport"
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  className={cn(
                    invoiceFormErrors.transport ? "border-destructive" : "",
                  )}
                  value={formatGroupedInputNumber(invoiceForm.transport)}
                  onChange={(e) =>
                    setInvoiceForm((prev) => ({
                      ...prev,
                      transport: normalizeNumberInput(e.target.value),
                    }))
                  }
                />
                {invoiceFormErrors.transport ? (
                  <p className="text-xs text-destructive">
                    {invoiceFormErrors.transport}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="invoice-observations">Observations</Label>
                <Textarea
                  id="invoice-observations"
                  placeholder="Commentaires sur la facture fournisseur"
                  value={invoiceForm.observations}
                  onChange={(e) =>
                    setInvoiceForm((prev) => ({
                      ...prev,
                      observations: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          ) : null}

          {invoiceWizardStep === 2 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="supplier-invoice-file">Fichier PDF</Label>
                <Input
                  id="supplier-invoice-file"
                  type="file"
                  accept="application/pdf,.pdf"
                  className={cn(
                    invoiceFormErrors.file ? "border-destructive" : "",
                  )}
                  onChange={(e) => {
                    onImportFileChange(e.target.files?.[0] || null);
                    setInvoiceFormErrors((prev) => ({
                      ...prev,
                      file: undefined,
                    }));
                  }}
                />
                {invoiceFormErrors.file ? (
                  <p className="text-xs text-destructive">
                    {invoiceFormErrors.file}
                  </p>
                ) : null}
                {importFile ? (
                  <p className="text-xs text-muted-foreground">
                    {importFile.name} ·{" "}
                    {(importFile.size / 1024 / 1024).toFixed(2)} Mo
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Importez le PDF de facture fournisseur.
                  </p>
                )}
              </div>
              <div className="rounded-md border border-border p-2">
                {importFile &&
                importFile.type === "application/pdf" &&
                importPreviewUrl ? (
                  <iframe
                    src={importPreviewUrl}
                    title="Apercu facture fournisseur"
                    className="h-[58vh] w-full rounded-md"
                  />
                ) : (
                  <div className="flex h-[58vh] items-center justify-center text-sm text-muted-foreground">
                    Selectionnez un PDF pour afficher l'apercu.
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {invoiceWizardStep === 3 ? (
            <div className="space-y-3">
              <div className="rounded-md border border-border p-3">
                <p className="text-sm font-semibold">Revue generale</p>
                <div className="mt-2 grid gap-2 text-sm md:grid-cols-2">
                  <p>
                    <span className="text-muted-foreground">Numero:</span>{" "}
                    {invoiceForm.numeroFacture || "-"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Date:</span>{" "}
                    {invoiceForm.dateFacture || "-"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Echeance:</span>{" "}
                    {invoiceForm.dateEcheance || "-"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Montant HT:</span>{" "}
                    {formatGroupedNumber(invoiceForm.montantHt)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">TVA:</span>{" "}
                    {formatGroupedNumber(invoiceForm.tva)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">TTC:</span>{" "}
                    {formatGroupedNumber(invoiceForm.ttc)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                La validation cree la facture fournisseur et la dette associee
                dans le workflow existant.
              </p>
            </div>
          ) : null}
        </div>
      </AppModal>

      <AppModal
        open={pdfModalOpen}
        onOpenChange={(open) => {
          setPdfModalOpen(open);
          if (!open) {
            setPdfDataUrl(null);
            setPdfBlob(null);
            setPdfModalLoading(false);
          }
        }}
        title="Apercu PDF bon de commande"
        description={pdfFilename}
        size="xxl"
        footer={
          <div className="flex items-center justify-between gap-2">
            <Button variant="outline" onClick={() => setPdfModalOpen(false)}>
              Fermer
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={printCurrentPdf}
                disabled={!pdfDataUrl || pdfModalLoading}
              >
                <Printer className="mr-2 h-4 w-4" /> Imprimer
              </Button>
              <Button
                onClick={downloadCurrentPdf}
                disabled={!pdfBlob || pdfModalLoading}
              >
                <Download className="mr-2 h-4 w-4" /> Telecharger
              </Button>
            </div>
          </div>
        }
      >
        {pdfModalLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : pdfDataUrl ? (
          <iframe
            ref={pdfFrameRef}
            src={pdfDataUrl}
            title="Apercu BCF PDF"
            className="h-[70vh] w-full rounded-md border border-border"
          />
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Aucun PDF charge.
          </p>
        )}
      </AppModal>
    </>
  );
}
