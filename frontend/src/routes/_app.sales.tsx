import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Minus,
  Plus,
  Receipt,
  Search,
  ShoppingCart,
  Trash2,
  User,
  UserRound,
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
import { toast } from "sonner";

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
    const paid = toNumber(paidAmount);
    if (paid < 0 || paid > totals.totalTtc) {
      toast.error("Le montant payé est invalide");
      return false;
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
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SectionCard
              title="Catalogue"
              description="Cliquez pour ajouter au panier"
              className="lg:col-span-2"
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
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {filteredProducts.slice(0, 18).map((product) => {
                    const stock = toNumber(product.stock?.stockActuel);
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => addProduct(product)}
                        className="group rounded-lg border border-border p-3 text-left transition-all hover:border-primary/40 hover:shadow-card"
                      >
                        <div className="mb-2 flex h-16 items-center justify-center rounded-md bg-secondary/60 text-primary">
                          {product.photo ? (
                            <img
                              src={product.photo}
                              alt={product.designation}
                              className="h-full w-full rounded-md object-cover"
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
                    value={formatGroupedInputNumber(paidAmount)}
                    onChange={(event) =>
                      setPaidAmount(normalizeNumberInput(event.target.value))
                    }
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
          <div className="flex justify-end gap-2">
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
          <div className="flex justify-end gap-2">
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
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setHistoryDetailOpen(false)}
            >
              Fermer
            </Button>
            <Button
              onClick={() => void downloadHistoryDetailPdf()}
              disabled={!historyDetail?.id}
            >
              Télécharger la facture
            </Button>
          </div>
        }
      >
        {historyDetailLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : historyDetail ? (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <p>
                <strong>Client :</strong>{" "}
                {historyDetail.client?.nom || "Client occasionnel"}
              </p>
              <p>
                <strong>Statut :</strong>{" "}
                {statusLabels[historyDetail.statut] || historyDetail.statut}
              </p>
              <p>
                <strong>Date émission :</strong>{" "}
                {formatDate(historyDetail.dateEmission)}
              </p>
              <p>
                <strong>Date échéance :</strong>{" "}
                {formatDate(historyDetail.dateEcheance)}
              </p>
              <p>
                <strong>Total HT :</strong>{" "}
                {fmtCurrency(toNumber(historyDetail.totalHt))}
              </p>
              <p>
                <strong>TVA :</strong>{" "}
                {fmtCurrency(toNumber(historyDetail.totalTva))}
              </p>
              <p>
                <strong>Total TTC :</strong>{" "}
                {fmtCurrency(toNumber(historyDetail.totalTtc))}
              </p>
              <p>
                <strong>Montant payé :</strong>{" "}
                {fmtCurrency(toNumber(historyDetail.montantPaye))}
              </p>
              <p>
                <strong>Reste à payer :</strong>{" "}
                {fmtCurrency(
                  Math.max(
                    0,
                    toNumber(historyDetail.totalTtc) -
                      toNumber(historyDetail.montantPaye),
                  ),
                )}
              </p>
              <p>
                <strong>Mode paiement :</strong>{" "}
                {historyDetail.paiements?.[0]?.modePaiement || "-"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Détail indisponible pour cette facture.
          </p>
        )}
      </AppModal>
    </>
  );
}
