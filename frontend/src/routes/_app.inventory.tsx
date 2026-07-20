import { useEffect, useMemo, useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Warehouse,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  ClipboardList,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard, Pagination, StatCard } from "@/components/erp/widgets";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { AppModal } from "@/components/erp/AppModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getStocks, getAlertes, getMouvements } from "@/lib/api/stocks.service";
import { fmtNumber, fmtCurrency } from "@/lib/erp-data";
import { getCurrencyMeta } from "@/lib/currency";

export const Route = createFileRoute("/_app/inventory")({
  head: () => ({ meta: [{ title: "Stocks — AC ERP" }] }),
  component: InventoryPage,
});

// ── Types ──
type StockItem = {
  id: string;
  stockActuel: number;
  stockReserve: number;
  produit: {
    id: string;
    reference: string;
    designation: string;
    stockMinimum: number;
    prixVenteHt: number | string;
    categorie?: { nom: string } | null;
  };
};

type Mouvement = {
  id: string;
  typeMouvement: string;
  quantite: number;
  stockAvant: number;
  stockApres: number;
  motif?: string | null;
  referenceDoc?: string | null;
  createdAt: string;
  produit: { reference: string; designation: string };
  utilisateur?: { nom: string; prenom: string } | null;
};

type Alerte = {
  id: string;
  stockActuel: number;
  stockReserve: number;
  produit: {
    id: string;
    reference: string;
    designation: string;
    stockMinimum: number;
  };
};

type Inventaire = {
  id: string;
  statut: "EN_COURS" | "VALIDE" | "ANNULE";
  dateDebut: string;
  dateFin?: string | null;
  createur?: { nom: string; prenom: string };
  lignes?: Array<{
    id: string;
    stockTheorique: number;
    stockReel?: number | null;
    produit?: { designation: string; reference: string };
  }>;
};

const typeStyle: Record<string, string> = {
  ENTREE_ACHAT: "text-success",
  SORTIE_VENTE: "text-info",
  AJUSTEMENT_POS: "text-success",
  AJUSTEMENT_NEG: "text-destructive",
  RETOUR_CLIENT: "text-success",
  RETOUR_FOURNISSEUR: "text-warning",
};

const typeLabels: Record<string, string> = {
  ENTREE_ACHAT: "Entrée achat",
  SORTIE_VENTE: "Sortie vente",
  AJUSTEMENT_POS: "Ajustement +",
  AJUSTEMENT_NEG: "Ajustement -",
  RETOUR_CLIENT: "Retour client",
  RETOUR_FOURNISSEUR: "Retour fourn.",
};

const PAGE_SIZE = 10;

function InventoryPage() {
  // ── États ──
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [mouvements, setMouvements] = useState<Mouvement[]>([]);
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [inventaires, setInventaires] = useState<Inventaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"stocks" | "mouvements" | "inventaires">(
    "stocks",
  );

  // Pagination stocks
  const [skPage, setSkPage] = useState(1);
  const [skMeta, setSkMeta] = useState({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
  });

  // Pagination mouvements
  const [mvPage, setMvPage] = useState(1);
  const [mvMeta, setMvMeta] = useState({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
  });

  // Pagination inventaires
  const [invPage, setInvPage] = useState(1);
  const [invMeta, setInvMeta] = useState({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
  });

  // Recherche
  const [search, setSearch] = useState("");
  const [searchStock, setSearchStock] = useState("");

  // Modale ajustement
  const [adjModalOpen, setAdjModalOpen] = useState(false);
  const [adjForm, setAdjForm] = useState({
    idProduit: "",
    quantite: 0,
    motif: "",
  });
  const [adjSubmitting, setAdjSubmitting] = useState(false);

  // Modale détail inventaire
  const [invDetailOpen, setInvDetailOpen] = useState(false);
  const [invDetail, setInvDetail] = useState<Inventaire | null>(null);

  // ── Produits pour select ajustement ──
  const [adjProduits, setAdjProduits] = useState<
    Array<{ id: string; label: string }>
  >([]);

  // ── Chargement ──
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [skRes, mvRes, alRes, invRes, prodRes] = await Promise.allSettled([
        getStocks({ page: skPage, limit: PAGE_SIZE }),
        getMouvements({
          page: mvPage,
          limit: PAGE_SIZE,
          search: search || undefined,
        }),
        getAlertes(),
        (async () => {
          const { default: api } = await import("@/lib/api/client");
          return api.get("/stocks/inventaires");
        })(),
        // Chargement de tous les produits pour le select de l'ajustement
        (async () => {
          const { default: api } = await import("@/lib/api/client");
          return api.get("/produits", {
            params: { limit: 10000, statut: "ACTIF" },
          });
        })(),
      ]);
      const stockData =
        skRes.status === "fulfilled" ? (skRes.value as any) : null;
      const movementData =
        mvRes.status === "fulfilled" ? (mvRes.value as any) : null;
      const alertData =
        alRes.status === "fulfilled" ? (alRes.value as any) : null;
      const inventaireData =
        invRes.status === "fulfilled" ? (invRes.value as any) : null;
      const productData =
        prodRes.status === "fulfilled" ? (prodRes.value as any) : null;

      setStocks((stockData?.data || []) as StockItem[]);
      setSkMeta(
        stockData?.meta || {
          total: 0,
          page: skPage,
          limit: PAGE_SIZE,
          totalPages: 1,
        },
      );
      setMouvements((movementData?.data || []) as Mouvement[]);
      setMvMeta(
        movementData?.meta || {
          total: 0,
          page: mvPage,
          limit: PAGE_SIZE,
          totalPages: 1,
        },
      );
      setAlertes((alertData?.data || []) as Alerte[]);
      setInventaires((inventaireData?.data || []) as Inventaire[]);
      setInvMeta({
        total: (inventaireData?.data || []).length,
        page: 1,
        limit: 10000,
        totalPages: 1,
      });
      const produitsRaw = productData?.data || [];
      setAdjProduits(
        produitsRaw.map((p: any) => ({
          id: p.id,
          label: `${p.designation} (${p.reference}) - stock: ${p.stock?.stockActuel ?? 0}`,
        })),
      );
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

  // ── Stats ──
  const stats = useMemo(() => {
    const valeur = stocks.reduce(
      (s, st) => s + Number(st.produit.prixVenteHt || 0) * st.stockActuel,
      0,
    );
    return { valeur, alertesCount: alertes.length };
  }, [stocks, alertes]);

  // ── Mutations ──
  const handleAjustement = async () => {
    if (!adjForm.idProduit || adjForm.quantite === 0) {
      toast.error("Selectionnez un produit et une quantite");
      return;
    }
    setAdjSubmitting(true);
    try {
      const { ajusterStock } = await import("@/lib/api/stocks.service");
      await ajusterStock(adjForm);
      toast.success("Stock ajuste");
      setAdjModalOpen(false);
      setAdjForm({ idProduit: "", quantite: 0, motif: "" });
      await loadAll();
    } catch (error: unknown) {
      const msg =
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Erreur lors de l'ajustement";
      toast.error(msg);
    } finally {
      setAdjSubmitting(false);
    }
  };

  const openInvDetail = async (id: string) => {
    try {
      const { default: api } = await import("@/lib/api/client");
      const res = await api.get(`/stocks/inventaires/${id}`);
      setInvDetail(((res as any)?.data || {}) as Inventaire);
      setInvDetailOpen(true);
    } catch {
      toast.error("Impossible de charger l'inventaire");
    }
  };

  // ── Filtrage local des stocks pour la recherche ──
  const filteredStocks = useMemo(() => {
    if (!searchStock) return stocks;
    const q = searchStock.toLowerCase();
    return stocks.filter(
      (s) =>
        s.produit.designation.toLowerCase().includes(q) ||
        s.produit.reference.toLowerCase().includes(q),
    );
  }, [stocks, searchStock]);

  // ── Colonnes ──
  const stockCols: Column<StockItem>[] = [
    {
      key: "produit",
      header: "Produit",
      render: (s) => (
        <div>
          <p className="font-medium text-foreground">{s.produit.designation}</p>
          <p className="text-xs text-muted-foreground">{s.produit.reference}</p>
        </div>
      ),
    },
    {
      key: "categorie",
      header: "Categorie",
      render: (s) => s.produit.categorie?.nom || "—",
    },
    {
      key: "stockActuel",
      header: "Stock",
      align: "right",
      render: (s) => (
        <span className="font-medium">{fmtNumber(s.stockActuel)}</span>
      ),
    },
    {
      key: "stockReserve",
      header: "Reserve",
      align: "right",
      render: (s) => fmtNumber(s.stockReserve),
    },
    {
      key: "stockMinimum",
      header: "Minimum",
      align: "right",
      render: (s) => fmtNumber(s.produit.stockMinimum),
    },
    {
      key: "statut",
      header: "Statut",
      align: "right",
      render: (s) => {
        const dispo = s.stockActuel - s.stockReserve;
        if (dispo <= 0) return <StatusBadge status="CRITIQUE" />;
        if (dispo <= s.produit.stockMinimum)
          return <StatusBadge status="VIGILANCE" />;
        return <StatusBadge status="ACTIF" />;
      },
    },
  ];

  const mvCols: Column<Mouvement>[] = [
    {
      key: "produit",
      header: "Produit",
      render: (m) => (
        <div>
          <p className="font-medium text-foreground">{m.produit.designation}</p>
          <p className="text-xs text-muted-foreground">{m.produit.reference}</p>
        </div>
      ),
    },
    {
      key: "typeMouvement",
      header: "Type",
      render: (m) => (
        <span className={cn("font-medium", typeStyle[m.typeMouvement] || "")}>
          {typeLabels[m.typeMouvement] || m.typeMouvement}
        </span>
      ),
    },
    {
      key: "quantite",
      header: "Quantite",
      align: "right",
      render: (m) => (
        <span
          className={cn(
            "font-medium",
            m.typeMouvement.includes("POS") ||
              m.typeMouvement.includes("ENTREE") ||
              m.typeMouvement.includes("RETOUR_CLIENT")
              ? "text-success"
              : "text-destructive",
          )}
        >
          {m.typeMouvement.includes("POS") ||
          m.typeMouvement.includes("ENTREE") ||
          m.typeMouvement.includes("RETOUR_CLIENT")
            ? "+"
            : "−"}
          {fmtNumber(m.quantite)}
        </span>
      ),
    },
    {
      key: "stockApres",
      header: "Stock final",
      align: "right",
      render: (m) => (
        <span className="text-foreground">{fmtNumber(m.stockApres)}</span>
      ),
    },
    { key: "motif", header: "Motif", render: (m) => m.motif || "—" },
    {
      key: "createdAt",
      header: "Date",
      align: "right",
      render: (m) => new Date(m.createdAt).toLocaleDateString("fr-FR"),
    },
  ];

  const invCols: Column<Inventaire>[] = [
    {
      key: "id",
      header: "N°",
      render: (i) => (
        <span className="font-medium text-foreground">#{i.id.slice(0, 8)}</span>
      ),
    },
    {
      key: "statut",
      header: "Statut",
      render: (i) => (
        <StatusBadge
          status={
            i.statut === "EN_COURS"
              ? "EN_ATTENTE"
              : i.statut === "VALIDE"
                ? "ACTIF"
                : "INACTIF"
          }
        />
      ),
    },
    {
      key: "dateDebut",
      header: "Date creation",
      render: (i) => new Date(i.dateDebut).toLocaleDateString("fr-FR"),
    },
    {
      key: "dateFin",
      header: "Date validation",
      render: (i) =>
        i.dateFin ? new Date(i.dateFin).toLocaleDateString("fr-FR") : "—",
    },
    {
      key: "lignes",
      header: "Lignes",
      align: "right",
      render: (i) => fmtNumber(i.lignes?.length || 0),
    },
  ];

  // ── Rendu ──
  const renderAlerteIcon = (stockActuel: number, stockMinimum: number) => {
    if (stockActuel <= 0)
      return <XCircle className="h-5 w-5 text-destructive" />;
    if (stockActuel <= stockMinimum / 2)
      return <AlertCircle className="h-5 w-5 text-warning" />;
    return <AlertTriangle className="h-5 w-5 text-info" />;
  };
  const renderAlerteSeverity = (stockActuel: number, stockMinimum: number) => {
    if (stockActuel <= 0) return "CRITIQUE";
    if (stockActuel <= stockMinimum / 2) return "VIGILANCE";
    return "OK";
  };

  // Pagination locale pour inventaires
  const totalInvPages = Math.ceil(inventaires.length / PAGE_SIZE);
  const paginatedInventaires = inventaires.slice(
    (invPage - 1) * PAGE_SIZE,
    invPage * PAGE_SIZE,
  );

  // Pagination locale pour l'onglet Stocks (après filtrage)
  const totalSkPages = Math.ceil(filteredStocks.length / PAGE_SIZE);
  const paginatedStocks = useMemo(
    () => filteredStocks.slice((skPage - 1) * PAGE_SIZE, skPage * PAGE_SIZE),
    [filteredStocks, skPage],
  );

  return (
    <>
      <PageHeader
        title="Gestion des stocks"
        description="Vue globale, mouvements et alertes de rupture"
        breadcrumb={["Gestion commerciale", "Stocks"]}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setAdjModalOpen(true)}
            >
              <ArrowDownToLine className="h-4 w-4" /> Ajustement
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={async () => {
                try {
                  const { default: api } = await import("@/lib/api/client");
                  await api.post("/stocks/inventaires");
                  toast.success("Inventaire cree");
                  await loadAll();
                } catch {
                  toast.error("Erreur lors de la creation");
                }
              }}
            >
              <ClipboardList className="h-4 w-4" /> Inventaire
            </Button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Valeur du stock"
          value={fmtCurrency(stats.valeur)}
          sub="prix de vente"
          icon={<Warehouse className="h-5 w-5" />}
        />
        <StatCard
          label="Produits en stock"
          value={String(skMeta.total)}
          sub="au total"
          icon={<Warehouse className="h-5 w-5" />}
        />
        <StatCard
          label="Mouvements"
          value={String(mvMeta.total)}
          sub="au total"
          icon={<ArrowUpFromLine className="h-5 w-5" />}
        />
        <StatCard
          label="Alertes"
          value={String(stats.alertesCount)}
          sub="produits critiques"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* ── Onglets stocks / mouvements / inventaires ── */}
        <SectionCard
          title={
            tab === "stocks"
              ? "Stock actuel"
              : tab === "mouvements"
                ? "Mouvements de stock"
                : "Inventaires physiques"
          }
          description={
            tab === "stocks"
              ? `${skMeta.total} produit${skMeta.total > 1 ? "s" : ""}`
              : tab === "mouvements"
                ? `${mvMeta.total} mouvement${mvMeta.total > 1 ? "s" : ""}`
                : `${invMeta.total} inventaire${invMeta.total > 1 ? "s" : ""}`
          }
          className="lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="relative w-full max-w-xs">
              <input
                placeholder={
                  tab === "stocks"
                    ? "Rechercher un produit..."
                    : tab === "mouvements"
                      ? "Rechercher un mouvement..."
                      : "Rechercher un inventaire..."
                }
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 pl-8 text-sm shadow-sm outline-none focus:ring-2 focus:ring-ring"
                value={tab === "stocks" ? searchStock : search}
                onChange={(e) => {
                  if (tab === "stocks") {
                    setSearchStock(e.target.value);
                    setSkPage(1);
                  } else setSearch(e.target.value);
                }}
              />
            </div>
            <div className="flex gap-1 rounded-lg border border-border p-0.5">
              {(["stocks", "mouvements", "inventaires"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    if (t === "stocks") setSkPage(1);
                    if (t === "inventaires") setInvPage(1);
                  }}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    tab === t
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t === "stocks"
                    ? "Stocks"
                    : t === "mouvements"
                      ? "Mouvements"
                      : "Inventaires"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin" />
            </div>
          ) : tab === "stocks" ? (
            <>
              <DataTable
                columns={stockCols}
                rows={paginatedStocks}
                rowKey={(s) => s.id}
                withActions={false}
              />
              <Pagination
                count={filteredStocks.length}
                currentPage={skPage}
                totalPages={totalSkPages}
                pageSize={PAGE_SIZE}
                onPageChange={setSkPage}
              />
            </>
          ) : tab === "mouvements" ? (
            <>
              <DataTable
                columns={mvCols}
                rows={mouvements}
                rowKey={(m) => m.id}
                withActions={false}
              />
              <Pagination
                count={mvMeta.total}
                currentPage={mvPage}
                totalPages={mvMeta.totalPages}
                pageSize={PAGE_SIZE}
                onPageChange={setMvPage}
              />
            </>
          ) : (
            <>
              <DataTable
                columns={invCols}
                rows={paginatedInventaires}
                rowKey={(i) => i.id}
                rowActions={(inv) => [
                  {
                    label: "Voir details",
                    icon: <Eye className="h-4 w-4" />,
                    onClick: () => void openInvDetail(inv.id),
                  },
                ]}
              />
              <Pagination
                count={inventaires.length}
                currentPage={invPage}
                totalPages={totalInvPages}
                pageSize={PAGE_SIZE}
                onPageChange={setInvPage}
              />
            </>
          )}
        </SectionCard>

        {/* ── Alertes ── */}
        <SectionCard
          title="Alertes de rupture"
          description={`${alertes.length} produit${alertes.length > 1 ? "s" : ""} sous seuil`}
        >
          <div className="space-y-3">
            {alertes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CheckCircle2 className="mb-2 h-8 w-8 text-success" />
                <p className="text-sm font-medium text-muted-foreground">
                  Aucune alerte
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Tous les stocks sont a un niveau satisfaisant.
                </p>
              </div>
            ) : (
              alertes.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 rounded-lg border border-border p-3"
                >
                  <span className="mt-0.5 shrink-0">
                    {renderAlerteIcon(a.stockActuel, a.produit.stockMinimum)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {a.produit.designation}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ref. {a.produit.reference} · Min. {a.produit.stockMinimum}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {fmtNumber(a.stockActuel)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        en stock
                      </span>
                      <StatusBadge
                        status={renderAlerteSeverity(
                          a.stockActuel,
                          a.produit.stockMinimum,
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      {/* ── Modale Ajustement avec SearchableSelect ── */}
      <AppModal
        open={adjModalOpen}
        onOpenChange={setAdjModalOpen}
        title="Ajustement de stock"
        description="Entrez une quantite positive ou negative."
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setAdjModalOpen(false)}
              disabled={adjSubmitting}
            >
              Annuler
            </Button>
            <Button
              disabled={adjSubmitting}
              onClick={() => void handleAjustement()}
            >
              {adjSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}{" "}
              Ajuster
            </Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Produit</Label>
            <SearchableSelect
              value={adjForm.idProduit}
              onValueChange={(idProduit) =>
                setAdjForm((prev) => ({ ...prev, idProduit }))
              }
              options={adjProduits.map((p) => ({
                value: p.id,
                label: p.label,
              }))}
              placeholder="Selectionnez un produit"
              searchPlaceholder="Rechercher un produit"
              emptyMessage="Aucun produit trouve"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adj-qte">Quantite</Label>
            <Input
              id="adj-qte"
              type="number"
              value={adjForm.quantite}
              onChange={(e) =>
                setAdjForm((p) => ({
                  ...p,
                  quantite: Number(e.target.value) || 0,
                }))
              }
              placeholder="Positif = entree, negatif = sortie"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adj-motif">Motif</Label>
            <Textarea
              id="adj-motif"
              value={adjForm.motif}
              onChange={(e) =>
                setAdjForm((p) => ({ ...p, motif: e.target.value }))
              }
              placeholder="Raison de l'ajustement"
            />
          </div>
        </div>
      </AppModal>

      {/* ── Modale Detail Inventaire ── */}
      <AppModal
        open={invDetailOpen}
        onOpenChange={setInvDetailOpen}
        title="Detail de l'inventaire"
        description={
          invDetail
            ? `Cree le ${new Date(invDetail.dateDebut).toLocaleDateString("fr-FR")}`
            : ""
        }
        size="xl"
        footer={
          invDetail?.statut === "EN_COURS" ? (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setInvDetailOpen(false)}>
                Fermer
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const { default: api } = await import("@/lib/api/client");
                    await api.post(
                      `/stocks/inventaires/${invDetail.id}/valider`,
                    );
                    toast.success("Inventaire valide");
                    setInvDetailOpen(false);
                    await loadAll();
                  } catch {
                    toast.error("Erreur lors de la validation");
                  }
                }}
              >
                <CheckCircle2 className="mr-1.5 h-4 w-4" /> Valider
              </Button>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setInvDetailOpen(false)}>
                Fermer
              </Button>
            </div>
          )
        }
      >
        {invDetail && (
          <div className="space-y-2">
            {invDetail.lignes?.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {l.produit?.designation || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {l.produit?.reference}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground">
                    Theorique:{" "}
                    <span className="font-medium">{l.stockTheorique}</span>
                  </p>
                  <p className="text-sm text-foreground">
                    Reel:{" "}
                    <span className="font-medium">{l.stockReel ?? "—"}</span>
                  </p>
                  {l.stockReel != null && (
                    <p
                      className={cn(
                        "text-xs font-medium",
                        l.stockReel - l.stockTheorique !== 0
                          ? "text-destructive"
                          : "text-success",
                      )}
                    >
                      Ecart: {l.stockReel - l.stockTheorique > 0 ? "+" : ""}
                      {l.stockReel - l.stockTheorique}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </AppModal>
    </>
  );
}
