import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Minus,
  Plus,
  Receipt,
  Search,
  ShoppingCart,
  Trash2,
  User,
  UserRound,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard, Pagination } from "@/components/erp/widgets";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { AppModal } from "@/components/erp/AppModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { fmtCurrency } from "@/lib/erp-data";
import {
  formatGroupedInputNumber,
  normalizeNumberInput,
} from "@/lib/number-input";
import { getClients } from "@/lib/api/clients.service";
import {
  getFactureById,
  getFacturePdf,
  getFactures,
} from "@/lib/api/factures.service";
import { getProduits } from "@/lib/api/produits.service";
import {
  createVenteDirecte,
  type VenteDirectePayload,
} from "@/lib/api/ventes.service";
import { createPaiement } from "@/lib/api/paiements.service";
import { toast } from "sonner";
import { resolveMediaUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/sales")({
  head: () => ({ meta: [{ title: "Ventes — AC ERP" }] }),
  component: SalesPage,
});

type ClientMode = "OCCASIONNEL" | "ENREGISTRE";
type PaymentMode = NonNullable<VenteDirectePayload["paiement"]>["modePaiement"];

type ProductApi = {
  id: string;
  reference: string;
  designation: string;
  photo?: string | null;
  prixVenteHt: number | string;
  tauxTva?: number | string;
  categorie?: { nom?: string | null } | null;
  stock?: { stockActuel?: number } | null;
};

type ClientApi = {
  id: string;
  nom: string;
  email?: string | null;
  telephone?: string | null;
  encoursActuel?: number;
  creditDisponible?: number;
  plafondCredit?: number | string;
};

type CartLine = {
  idProduit: string;
  reference: string;
  designation: string;
  prixVenteHt: number;
  tauxTva: number;
  stockActuel: number;
  quantite: number;
  remise: number;
};

type FactureApi = {
  id: string;
  numeroFacture: string;
  typeFacture?: string;
  statut: string;
  dateEmission?: string;
  totalTtc?: number | string;
  client?: { nom?: string | null } | null;
};

type SaleRow = {
  id: string;
  ref: string;
  client: string;
  date: string;
  dateIso: string;
  montant: number;
  statut: string;
  statutRaw: string;
};

type FactureDetailsApi = {
  id: string;
  numeroFacture: string;
  statut: string;
  dateEmission?: string;
  dateEcheance?: string;
  totalHt?: number | string;
  totalTva?: number | string;
  totalTtc?: number | string;
  montantPaye?: number | string;
  client?: { nom?: string | null } | null;
  paiements?: Array<{
    id: string;
    montant?: number | string;
    modePaiement?: string;
    datePaiement?: string;
  }>;
};

type ClientOccasionnelInfo = {
  nom: string;
  prenom: string;
  sexe: string;
  numeroCni: string;
  telephone: string;
};

const PAGE_SIZE = 10;

const paymentModes: Array<{ label: string; value: PaymentMode }> = [
  { label: "Espèces", value: "ESPECES" },
  { label: "Mobile money", value: "MOBILE_MONEY" },
  { label: "Carte", value: "CARTE" },
  { label: "Virement", value: "VIREMENT" },
  { label: "Chèque", value: "CHEQUE" },
  { label: "Compensation", value: "COMPENSATION" },
];

const statusLabels: Record<string, string> = {
  BROUILLON: "Brouillon",
  EMISE: "Emise",
  PARTIELLEMENT_PAYEE: "Partiellement payee",
  SOLDEE: "Soldee",
  ANNULEE: "Annulee",
  EN_RETARD: "En retard",
};

const toNumber = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString("fr-FR") : "-";

const toDateOnly = (value?: string) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const responseData = <T,>(response: unknown): T[] => {
  if (!response || typeof response !== "object" || !("data" in response)) {
    return [];
  }
  const data = (response as { data?: unknown }).data;
  return Array.isArray(data) ? (data as T[]) : [];
};

function lineHt(line: CartLine) {
  return line.prixVenteHt * line.quantite * (1 - line.remise / 100);
}

function lineTtc(line: CartLine) {
  return lineHt(line) * (1 + line.tauxTva / 100);
}

function SalesPage() {
  const [products, setProducts] = useState<ProductApi[]>([]);
  const [clients, setClients] = useState<ClientApi[]>([]);
  const [historyRows, setHistoryRows] = useState<SaleRow[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
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
  const [clientMode, setClientMode] = useState<ClientMode>("OCCASIONNEL");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("ESPECES");
  const [paidAmount, setPaidAmount] = useState("");
  const [showOccasionalInfo, setShowOccasionalInfo] = useState(false);
  const [clientOccasionnelInfo, setClientOccasionnelInfo] =
    useState<ClientOccasionnelInfo>({
      nom: "",
      prenom: "",
      sexe: "",
      numeroCni: "",
      telephone: "",
    });
  const [createdInvoice, setCreatedInvoice] = useState<FactureApi | null>(null);
  const [historyDetailOpen, setHistoryDetailOpen] = useState(false);
  const [historyDetailLoading, setHistoryDetailLoading] = useState(false);
  const [historyDetail, setHistoryDetail] = useState<FactureDetailsApi | null>(
    null,
  );

  const [addPaymentModalOpen, setAddPaymentModalOpen] = useState(false);
  const [newPaymentAmount, setNewPaymentAmount] = useState("");
  const [newPaymentMode, setNewPaymentMode] = useState<PaymentMode>("ESPECES");
  const [newPaymentDate, setNewPaymentDate] = useState("");
  const [newPaymentRef, setNewPaymentRef] = useState("");
  const [newPaymentNotes, setNewPaymentNotes] = useState("");
  const [addPaymentSubmitting, setAddPaymentSubmitting] = useState(false);

  const cols: Column<SaleRow>[] = [
    {
      key: "ref",
      header: "Facture",
      render: (row) => (
        <span className="font-medium text-foreground">{row.ref}</span>
      ),
    },
    { key: "client", header: "Client" },
    { key: "date", header: "Date" },
    {
      key: "montant",
      header: "Montant",
      align: "right",
      render: (row) => (
        <span className="font-medium text-foreground">
          {fmtCurrency(row.montant)}
        </span>
      ),
    },
    {
      key: "statut",
      header: "Statut",
      align: "right",
      render: (row) => <StatusBadge status={row.statut} />,
    },
  ];

  const loadProducts = async () => {
    const response = await getProduits({ limit: 500, statut: "ACTIF" });
    setProducts(responseData<ProductApi>(response));
  };

  const loadClients = async () => {
    const response = await getClients({ limit: 500, statut: "ACTIF" });
    setClients(responseData<ClientApi>(response));
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await getFactures({ page: 1, limit: 1000 });
      const factures = responseData<FactureApi>(response).filter(
        (facture) => !facture.typeFacture || facture.typeFacture === "VENTE",
      );
      setHistoryRows(
        factures.map((facture) => ({
          id: facture.id,
          ref: facture.numeroFacture,
          client: facture.client?.nom || "Client occasionnel",
          date: formatDate(facture.dateEmission),
          dateIso: toDateOnly(facture.dateEmission),
          montant: toNumber(facture.totalTtc),
          statut: statusLabels[facture.statut] || facture.statut,
          statutRaw: facture.statut,
        })),
      );
    } catch {
      setHistoryRows([]);
      toast.error("Impossible de charger l'historique des ventes");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadProducts(), loadClients()])
      .catch(() => toast.error("Impossible de charger les données de vente"))
      .finally(() => setLoading(false));
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
        telephone: "",
      });
    }
  }, [clientMode]);

  const totals = useMemo(() => {
    const totalHt = cart.reduce((sum, line) => sum + lineHt(line), 0);
    const totalTtc = cart.reduce((sum, line) => sum + lineTtc(line), 0);
    return { totalHt, totalTva: totalTtc - totalHt, totalTtc };
  }, [cart]);

  useEffect(() => {
    if (!paidAmount || toNumber(paidAmount) === 0) {
      setPaidAmount(totals.totalTtc ? String(Math.round(totals.totalTtc)) : "");
    }
  }, [totals.totalTtc, paidAmount]);

  const categoryOptions = useMemo(
    () => [
      { value: "", label: "Toutes les categories" },
      ...Array.from(
        new Set(
          products
            .map((product) => product.categorie?.nom || "")
            .filter((name) => name.length > 0),
        ),
      )
        .sort((a, b) => a.localeCompare(b, "fr"))
        .map((name) => ({ value: name, label: name })),
    ],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase();
    const selectedCategory = catalogCategory;
    return products.filter((product) => {
      const categoryName = product.categorie?.nom || "";
      const categoryMatch =
        !selectedCategory || categoryName === selectedCategory;
      if (!categoryMatch) return false;
      if (!query) return true;
      return (
        product.designation.toLowerCase().includes(query) ||
        product.reference.toLowerCase().includes(query)
      );
    });
  }, [products, catalogSearch, catalogCategory]);

  const filteredHistory = useMemo(() => {
    const query = historySearch.trim().toLowerCase();
    return historyRows.filter((row) => {
      const dateMatch = !historyDate || row.dateIso === historyDate;
      if (!dateMatch) return false;
      if (!query) return true;
      return (
        row.ref.toLowerCase().includes(query) ||
        row.client.toLowerCase().includes(query)
      );
    });
  }, [historyRows, historySearch, historyDate]);

  const historyTotalPages = Math.max(
    1,
    Math.ceil(filteredHistory.length / PAGE_SIZE),
  );
  const paginatedHistory = filteredHistory.slice(
    (historyPage - 1) * PAGE_SIZE,
    historyPage * PAGE_SIZE,
  );

  const addProduct = (product: ProductApi) => {
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
        return current.map((line) =>
          line.idProduit === product.id
            ? { ...line, quantite: line.quantite + 1 }
            : line,
        );
      }
      return [
        ...current,
        {
          idProduit: product.id,
          reference: product.reference,
          designation: product.designation,
          prixVenteHt: toNumber(product.prixVenteHt),
          tauxTva: toNumber(product.tauxTva),
          stockActuel,
          quantite: 1,
          remise: 0,
        },
      ];
    });
  };

  const setQuantity = (idProduit: string, delta: number) => {
    setCart((current) =>
      current.map((line) => {
        if (line.idProduit !== idProduit) return line;
        const next = Math.max(
          1,
          Math.min(line.stockActuel, line.quantite + delta),
        );
        return { ...line, quantite: next };
      }),
    );
  };

  const removeLine = (idProduit: string) =>
    setCart((current) =>
      current.filter((line) => line.idProduit !== idProduit),
    );

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
      toast.error(
        "Un client occasionnel doit payer l'intégralité de la facture",
      );
      return false;
    }
    if (clientMode === "ENREGISTRE" && selectedClient) {
      const resteAPayer = totals.totalTtc - paid;
      if (
        resteAPayer > 0 &&
        selectedClient.creditDisponible !== undefined &&
        resteAPayer > selectedClient.creditDisponible
      ) {
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

  const hasOccasionalInfo = useMemo(
    () =>
      Object.values(clientOccasionnelInfo).some(
        (value) => String(value || "").trim().length > 0,
      ),
    [clientOccasionnelInfo],
  );

  const submitSale = async () => {
    if (!validateBeforeConfirm()) return;
    setSubmitting(true);
    try {
      const paid = toNumber(paidAmount);
      const payload: VenteDirectePayload = {
        typeClient: clientMode,
        idClient: clientMode === "ENREGISTRE" ? selectedClientId : null,
        clientOccasionnelInfo:
          clientMode === "OCCASIONNEL" && hasOccasionalInfo
            ? {
                nom: clientOccasionnelInfo.nom.trim() || undefined,
                prenom: clientOccasionnelInfo.prenom.trim() || undefined,
                sexe: clientOccasionnelInfo.sexe.trim() || undefined,
                numeroCni: clientOccasionnelInfo.numeroCni.trim() || undefined,
                telephone: clientOccasionnelInfo.telephone.trim() || undefined,
              }
            : undefined,
        lignes: cart.map((line) => ({
          idProduit: line.idProduit,
          quantite: line.quantite,
          remise: line.remise,
          tauxTva: line.tauxTva,
        })),
        paiement:
          paid > 0
            ? {
                montant: paid,
                modePaiement: paymentMode,
                notes: "Paiement vente directe",
              }
            : undefined,
      };
      const response = (await createVenteDirecte(payload)) as {
        data?: FactureApi;
      };
      setCreatedInvoice(response?.data || null);
      setCart([]);
      setPaidAmount("");
      setShowOccasionalInfo(false);
      setClientOccasionnelInfo({
        nom: "",
        prenom: "",
        sexe: "",
        numeroCni: "",
        telephone: "",
      });
      setConfirmOpen(false);
      setSuccessOpen(true);
      await Promise.all([loadProducts(), loadHistory()]);
      toast.success("Vente validée", {
        description: "La facture de vente a été générée.",
      });
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: unknown }).message || "")
          : "";
      toast.error(message || "Impossible de valider la vente");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadInvoicePdf = async () => {
    if (!createdInvoice?.id) return;
    try {
      const blob = (await getFacturePdf(createdInvoice.id)) as Blob;
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

  const openHistoryDetail = async (row: SaleRow) => {
    setHistoryDetailOpen(true);
    setHistoryDetailLoading(true);
    try {
      const response = (await getFactureById(row.id)) as {
        data?: FactureDetailsApi;
      };
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
      const blob = (await getFacturePdf(historyDetail.id)) as Blob;
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
        datePaiement: newPaymentDate || new Date().toISOString(),
        referenceDocument: newPaymentRef || undefined,
        notes: newPaymentNotes || undefined,
      });

      toast.success("Paiement ajouté avec succès");
      setAddPaymentModalOpen(false);
      setNewPaymentAmount("");
      setNewPaymentDate("");
      setNewPaymentRef("");
      setNewPaymentNotes("");

      // Refresh details and history
      void openHistoryDetail({ id: historyDetail.id } as SaleRow);
      void loadHistory();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'ajout du paiement");
    } finally {
      setAddPaymentSubmitting(false);
    }
  };

  const selectedClient = clients.find(
    (client) => client.id === selectedClientId,
  );

  return (
    <>
      <PageHeader
        title="Ventes"
        description="Création de ventes directes, panier et facturation"
        breadcrumb={["Transactions", "Ventes"]}
      />
      <Tabs defaultValue="new">
        <TabsList className="mb-4">
          <TabsTrigger value="new" className="gap-1.5">
            <ShoppingCart className="h-4 w-4" /> Nouvelle vente
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-1.5">
            <Receipt className="h-4 w-4" /> Historique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <div className="grid grid-cols-1 gap-4 lg:h-[calc(100dvh-12rem)] lg:grid-cols-3">
            <SectionCard
              title="Catalogue"
              description="Cliquez pour ajouter au panier"
              className="min-h-0 lg:col-span-2 lg:h-full"
              contentClassName="flex min-h-0 flex-1 flex-col"
            >
              <div className="mb-4 flex items-center gap-2">
                <div className="relative w-full">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un produit..."
                    className="pl-9"
                    value={catalogSearch}
                    onChange={(event) => setCatalogSearch(event.target.value)}
                  />
                </div>
                <div className="w-full max-w-xs">
                  <SearchableSelect
                    value={catalogCategory}
                    onValueChange={setCatalogCategory}
                    options={categoryOptions}
                    placeholder="Trier par categorie"
                    searchPlaceholder="Rechercher une categorie"
                    emptyMessage="Aucune categorie"
                  />
                </div>
              </div>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
                  {filteredProducts.slice(0, 18).map((product) => {
                    const stock = toNumber(product.stock?.stockActuel);
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => addProduct(product)}
                        className="group rounded-lg border border-border p-3 text-left transition-all hover:border-primary/40 hover:shadow-card"
                      >
                        <div className="mb-2 flex h-16 items-center justify-center overflow-hidden rounded-md bg-secondary/60 text-primary">
                          {product.photo ? (
                            <img
                              src={resolveMediaUrl(product.photo)}
                              alt={product.designation}
                              className="h-full w-full rounded-md object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <ShoppingCart className="h-6 w-6 opacity-70" />
                          )}
                        </div>
                        <p className="line-clamp-1 text-sm font-medium text-foreground">
                          {product.designation}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.reference} · Stock {stock}
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          {fmtCurrency(toNumber(product.prixVenteHt))}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Panier"
              description={`${cart.length} article(s)`}
              className="min-h-0 lg:h-full"
              contentClassName="min-h-0 overflow-y-auto"
            >
              <div className="mb-4 space-y-3 rounded-lg border border-border p-3">
                <Label>Client</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={
                      clientMode === "OCCASIONNEL" ? "default" : "outline"
                    }
                    className="gap-1.5"
                    onClick={() => setClientMode("OCCASIONNEL")}
                  >
                    <User className="h-4 w-4" /> Occasionnel
                  </Button>
                  <Button
                    type="button"
                    variant={
                      clientMode === "ENREGISTRE" ? "default" : "outline"
                    }
                    className="gap-1.5"
                    onClick={() => setClientMode("ENREGISTRE")}
                  >
                    <UserRound className="h-4 w-4" /> Enregistré
                  </Button>
                </div>
                {clientMode === "ENREGISTRE" ? (
                  <div className="space-y-2">
                    <SearchableSelect
                      value={selectedClientId}
                      onValueChange={setSelectedClientId}
                      placeholder="Sélectionner un client"
                      searchPlaceholder="Rechercher un client..."
                      emptyMessage="Aucun client trouvé"
                      options={clients.map((client) => ({
                        value: client.id,
                        label: client.nom,
                      }))}
                    />
                    {selectedClient && (
                      <div className="rounded border bg-muted/50 p-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Plafond de crédit:
                          </span>
                          <span className="font-medium">
                            {selectedClient.plafondCredit
                              ? fmtCurrency(
                                  Number(selectedClient.plafondCredit),
                                )
                              : "Non défini"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Encours actuel:
                          </span>
                          <span className="font-medium">
                            {fmtCurrency(selectedClient.encoursActuel || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-border mt-1 pt-1">
                          <span className="text-muted-foreground">
                            Crédit disponible:
                          </span>
                          <span
                            className={cn(
                              "font-bold",
                              (selectedClient.creditDisponible ?? 0) > 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-destructive",
                            )}
                          >
                            {selectedClient.creditDisponible !== undefined
                              ? fmtCurrency(selectedClient.creditDisponible)
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="space-y-3">
                {cart.map((line) => (
                  <div
                    key={line.idProduit}
                    className="rounded-lg border border-border p-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {line.designation}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {fmtCurrency(line.prixVenteHt)} · TVA {line.tauxTva}%
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setQuantity(line.idProduit, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-7 text-center text-sm font-medium">
                          {line.quantite}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setQuantity(line.idProduit, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(line.idProduit)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {cart.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                    Aucun article dans le panier.
                  </p>
                ) : null}
              </div>

              <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Total HT</span>
                  <span>{fmtCurrency(totals.totalHt)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>TVA</span>
                  <span>{fmtCurrency(totals.totalTva)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-foreground">
                  <span>Total TTC</span>
                  <span>{fmtCurrency(totals.totalTtc)}</span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Label>Mode de paiement</Label>
                  <SearchableSelect
                    value={paymentMode}
                    onValueChange={(value) =>
                      setPaymentMode(value as PaymentMode)
                    }
                    options={paymentModes}
                    placeholder="Mode de paiement"
                    searchPlaceholder="Rechercher un mode..."
                    emptyMessage="Aucun mode trouvé"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paidAmount">Montant payé</Label>
                  <Input
                    id="paidAmount"
                    type="text"
                    inputMode="decimal"
                    value={formatGroupedInputNumber(
                      fmtCurrency(totals.totalTtc),
                      { allowNegative: false },
                    )}
                    onChange={(event) =>
                      setPaidAmount(
                        normalizeNumberInput(event.target.value, {
                          allowNegative: false,
                        }),
                      )
                    }
                    placeholder="Montant payé"
                  />
                </div>
                {clientMode === "OCCASIONNEL" ? (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowOccasionalInfo((prev) => !prev)}
                    >
                      {showOccasionalInfo
                        ? "Masquer les infos personnelles"
                        : "Ajouter des infos personnelles"}
                    </Button>
                    {showOccasionalInfo ? (
                      <div className="space-y-2 rounded-lg border border-border p-3">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <Input
                            placeholder="Nom"
                            value={clientOccasionnelInfo.nom}
                            onChange={(event) =>
                              setClientOccasionnelInfo((prev) => ({
                                ...prev,
                                nom: event.target.value,
                              }))
                            }
                          />
                          <Input
                            placeholder="Prénom"
                            value={clientOccasionnelInfo.prenom}
                            onChange={(event) =>
                              setClientOccasionnelInfo((prev) => ({
                                ...prev,
                                prenom: event.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-1">
                          <Input
                            placeholder="Numéro de CNI"
                            value={clientOccasionnelInfo.numeroCni}
                            onChange={(event) =>
                              setClientOccasionnelInfo((prev) => ({
                                ...prev,
                                numeroCni: event.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <Input
                            placeholder="Sexe"
                            value={clientOccasionnelInfo.sexe}
                            onChange={(event) =>
                              setClientOccasionnelInfo((prev) => ({
                                ...prev,
                                sexe: event.target.value,
                              }))
                            }
                          />
                          <Input
                            placeholder="Numéro de téléphone"
                            value={clientOccasionnelInfo.telephone}
                            onChange={(event) =>
                              setClientOccasionnelInfo((prev) => ({
                                ...prev,
                                telephone: event.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <Button className="mt-4 w-full" onClick={openConfirm}>
                Valider & facturer
              </Button>
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="list">
          <SectionCard title="Historique des ventes">
            <div className="mb-4 flex items-center gap-2">
              <div className="relative w-full max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une facture..."
                  className="pl-9"
                  value={historySearch}
                  onChange={(event) => setHistorySearch(event.target.value)}
                />
              </div>
              <div className="w-full max-w-xs">
                <Input
                  type="date"
                  value={historyDate}
                  onChange={(event) => setHistoryDate(event.target.value)}
                />
              </div>
            </div>
            {historyLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <DataTable
                  columns={cols}
                  rows={paginatedHistory}
                  rowKey={(row) => row.id}
                  withActions={false}
                  onRowClick={(row) => {
                    void openHistoryDetail(row);
                  }}
                />
                <Pagination
                  count={filteredHistory.length}
                  currentPage={historyPage}
                  totalPages={historyTotalPages}
                  pageSize={PAGE_SIZE}
                  onPageChange={setHistoryPage}
                />
              </>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>

      <AppModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirmer la vente"
        description="La facture et les mouvements de stock seront créés après validation."
        size="lg"
        footer={
          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button onClick={() => void submitSale()} disabled={submitting}>
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Valider la vente
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-sm">
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs uppercase text-muted-foreground">Client</p>
            <p className="mt-1 font-medium text-foreground">
              {clientMode === "ENREGISTRE"
                ? selectedClient?.nom || "Client enregistré"
                : "Client occasionnel"}
            </p>
          </div>
          <div className="space-y-2">
            {cart.map((line) => (
              <div
                key={line.idProduit}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {line.designation}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {line.quantite} x {fmtCurrency(line.prixVenteHt)}
                  </p>
                </div>
                <span className="font-semibold text-foreground">
                  {fmtCurrency(lineTtc(line))}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-1 border-t border-border pt-3">
            <div className="flex justify-between text-muted-foreground">
              <span>Total HT</span>
              <span>{fmtCurrency(totals.totalHt)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>TVA</span>
              <span>{fmtCurrency(totals.totalTva)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-foreground">
              <span>Total TTC</span>
              <span>{fmtCurrency(totals.totalTtc)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Montant payé</span>
              <span>{fmtCurrency(toNumber(paidAmount))}</span>
            </div>
          </div>
        </div>
      </AppModal>

      <AppModal
        open={successOpen}
        onOpenChange={setSuccessOpen}
        title="Vente facturée"
        description={createdInvoice?.numeroFacture || "Facture générée"}
        size="sm"
        footer={
          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={() => setSuccessOpen(false)}>
              Fermer
            </Button>
            <Button onClick={() => void downloadInvoicePdf()}>
              Télécharger PDF
            </Button>
          </div>
        }
      >
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            La vente a été enregistrée et la facture est disponible dans
            l'historique des factures.
          </p>
          <p className="font-semibold text-foreground">
            {fmtCurrency(toNumber(createdInvoice?.totalTtc))}
          </p>
        </div>
      </AppModal>

      <AppModal
        open={historyDetailOpen}
        onOpenChange={setHistoryDetailOpen}
        title="Détail de la facture"
        description={historyDetail?.numeroFacture || "Facture"}
        size="xl"
        footer={
          <div className="flex justify-end w-full">
            <Button
              variant="outline"
              onClick={() => setHistoryDetailOpen(false)}
            >
              Fermer
            </Button>
          </div>
        }
      >
        {historyDetailLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : historyDetail ? (
          <Tabs defaultValue="details" className="w-full">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
              <TabsList>
                <TabsTrigger value="details">Détails</TabsTrigger>
                <TabsTrigger value="paiements">Paiements</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void downloadHistoryDetailPdf()}
                  disabled={!historyDetail?.id}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Télécharger
                </Button>
                {(historyDetail.statut === "PARTIELLEMENT_PAYEE" ||
                  historyDetail.statut === "EMISE") && (
                  <Button
                    size="sm"
                    onClick={() => setAddPaymentModalOpen(true)}
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Ajouter un paiement
                  </Button>
                )}
              </div>
            </div>

            <TabsContent value="details">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Total TTC
                    </p>
                    <p className="text-2xl font-bold">
                      {fmtCurrency(toNumber(historyDetail.totalTtc))}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Montant Payé
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {fmtCurrency(toNumber(historyDetail.montantPaye))}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Reste à payer
                    </p>
                    <p className="text-2xl font-bold text-destructive">
                      {fmtCurrency(
                        Math.max(
                          0,
                          toNumber(historyDetail.totalTtc) -
                            toNumber(historyDetail.montantPaye),
                        ),
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 border-b pb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Informations Client
                    </h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">Nom :</span>
                        <span className="font-medium">
                          {historyDetail.client?.nom || "Client occasionnel"}
                        </span>
                      </div>
                      {historyDetail.client?.telephone && (
                        <div className="flex justify-between items-center py-1">
                          <span className="text-muted-foreground">
                            Téléphone :
                          </span>
                          <span>{historyDetail.client.telephone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 border-b pb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      Détails Facture
                    </h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">Statut :</span>
                        <span className="font-medium bg-muted px-2 py-0.5 rounded-md text-xs uppercase tracking-wider">
                          {statusLabels[historyDetail.statut] ||
                            historyDetail.statut}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">
                          Date d'émission :
                        </span>
                        <span>{formatDate(historyDetail.dateEmission)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">
                          Échéance :
                        </span>
                        <span>{formatDate(historyDetail.dateEcheance)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">
                          Mode de paiement :
                        </span>
                        <span>
                          {historyDetail.paiements?.[0]?.modePaiement || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="paiements">
              {historyDetail.paiements && historyDetail.paiements.length > 0 ? (
                <div className="rounded-md border border-border">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Mode</th>
                        <th className="px-4 py-3 font-medium">Référence</th>
                        <th className="px-4 py-3 font-medium text-right">
                          Montant
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {historyDetail.paiements.map((p) => (
                        <tr
                          key={p.id}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            {formatDate(p.datePaiement)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                              {p.modePaiement}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {p.referenceDocument || "-"}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-green-600 dark:text-green-400">
                            {fmtCurrency(toNumber(p.montant))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed">
                  <Wallet className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
                  <p className="text-sm font-medium text-foreground">
                    Aucun paiement
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Il n'y a pas encore de paiement enregistré pour cette
                    facture.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mb-3 opacity-50" />
            <p>Détail indisponible pour cette facture.</p>
          </div>
        )}
      </AppModal>

      <AppModal
        open={addPaymentModalOpen}
        onOpenChange={setAddPaymentModalOpen}
        title="Ajouter un paiement"
        description="Enregistrer un nouveau paiement pour cette facture"
        size="md"
        footer={
          <div className="flex justify-between gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => setAddPaymentModalOpen(false)}
              disabled={addPaymentSubmitting}
            >
              Annuler
            </Button>
            <Button
              onClick={() => void handleAddPayment()}
              disabled={addPaymentSubmitting}
            >
              {addPaymentSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirmer le paiement
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Montant à payer</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={formatGroupedInputNumber(newPaymentAmount)}
                onChange={(e) => {
                  const val = normalizeNumberInput(e.target.value);
                  if (val === "" || !isNaN(Number(val))) {
                    setNewPaymentAmount(val);
                  }
                }}
                placeholder="Montant..."
              />
            </div>
            <div className="space-y-2">
              <Label>Mode de paiement</Label>
              <SearchableSelect
                value={newPaymentMode}
                onValueChange={(val) => setNewPaymentMode(val as PaymentMode)}
                options={paymentModes}
                placeholder="Mode..."
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date du paiement</Label>
              <Input
                type="date"
                value={newPaymentDate}
                onChange={(e) => setNewPaymentDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Référence</Label>
              <Input
                value={newPaymentRef}
                onChange={(e) => setNewPaymentRef(e.target.value)}
                placeholder="N° chèque, transaction..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input
              value={newPaymentNotes}
              onChange={(e) => setNewPaymentNotes(e.target.value)}
              placeholder="Commentaires éventuels"
            />
          </div>
        </div>
      </AppModal>
    </>
  );
}
