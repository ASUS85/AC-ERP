import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Receipt,
  Loader2,
  FileText,
  User,
  Search,
} from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import {
  SectionCard,
  Toolbar,
  Pagination,
  StatCard,
} from "@/components/erp/widgets";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Input } from "@/components/ui/input";
import { AppModal } from "@/components/erp/AppModal";
import { Button } from "@/components/ui/button";
import { fmtCurrency } from "@/lib/erp-data";
import { getPaiements, type PaiementApi } from "@/lib/api/paiements.service";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/payments")({
  head: () => ({ meta: [{ title: "Paiements — AC ERP" }] }),
  component: PaymentsPage,
});

const PAGE_SIZE = 10;

function formatDate(dateStr?: string | Date) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PaymentsPage() {
  const [payments, setPayments] = useState<PaiementApi[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMode, setPaymentMode] = useState("");

  // Modal states
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaiementApi | null>(
    null,
  );

  const [errorMsg, setErrorMsg] = useState("");

  const loadData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await getPaiements({
        page,
        limit: PAGE_SIZE,
        search,
        ...(paymentDate ? { dateFrom: paymentDate } : {}),
        ...(paymentMode ? { modePaiement: paymentMode } : {}),
      });
      setPayments(res.data || []);
      setTotalItems(res.meta?.total || 0);
    } catch (error: any) {
      console.error("Erreur chargement paiements", error);
      setErrorMsg(error?.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, paymentDate, paymentMode]);

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const cols: Column<PaiementApi>[] = useMemo(
    () => [
      {
        key: "reference",
        header: "Réf. Facture",
        align: "left",
        render: (p) => (
          <span className="font-medium text-foreground">
            {p.facture?.numeroFacture || "N/A"}
          </span>
        ),
      },
      {
        key: "client",
        header: "Tiers",
        render: (p) =>
          p.facture?.typeFacture === "ACHAT"
            ? p.facture?.fournisseur?.raisonSociale || "Fournisseur"
            : p.facture?.client?.nom || p.utilisateur?.nom || "-",
      },
      {
        key: "modePaiement",
        header: "Méthode",
        render: (p) => p.modePaiement || "En attente",
      },
      {
        key: "montant",
        header: "Montant",
        align: "right",
        render: (p) =>
          p.facture?.typeFacture === "ACHAT" ? (
            <span className="font-medium text-destructive">
              - {fmtCurrency(Number(p.montant))}
            </span>
          ) : (
            <span className="font-medium text-success">
              + {fmtCurrency(Number(p.montant))}
            </span>
          ),
      },
      {
        key: "datePaiement",
        header: "Date",
        align: "right",
        render: (p) => formatDate(p.datePaiement),
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Paiements"
        description="Historique des encaissements et décaissements"
        breadcrumb={["Transactions", "Paiements"]}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Les stats sont gardées statiques pour l'instant afin de conserver le rendu visuel, à rendre dynamiques plus tard avec un endpoint de dashboard */}
        <StatCard
          label="Encaissements"
          value={fmtCurrency(248100)}
          sub="ce mois"
          icon={<ArrowDownLeft className="h-5 w-5" />}
        />
        <StatCard
          label="Décaissements"
          value={fmtCurrency(186500)}
          sub="ce mois"
          icon={<ArrowUpRight className="h-5 w-5" />}
        />
        <StatCard
          label="Trésorerie nette"
          value={`+${fmtCurrency(61600)}`}
          delta="+8 %"
          up
          sub="solde du mois"
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="Reçus émis"
          value="148"
          sub="documents"
          icon={<Receipt className="h-5 w-5" />}
        />
      </div>

      <SectionCard title="Historique des paiements">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rech. par facture, client, réf..."
              className="h-9 pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <SearchableSelect
              value={paymentMode}
              onValueChange={(val) => {
                setPaymentMode(val);
                setPage(1);
              }}
              options={[
                { label: "Tous les modes", value: "" },
                { label: "Espèces", value: "ESPECES" },
                { label: "Chèque", value: "CHEQUE" },
                { label: "Virement", value: "VIREMENT" },
                { label: "Mobile Money", value: "MOBILE_MONEY" },
                { label: "Carte", value: "CARTE" },
                { label: "Compensation", value: "COMPENSATION" },
              ]}
              placeholder="Mode de paiement..."
              searchPlaceholder="Rechercher..."
              className="w-[180px]"
            />
            <div className="w-[180px]">
              <Input
                type="date"
                value={paymentDate}
                onChange={(event) => {
                  setPaymentDate(event.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <DataTable
              columns={cols}
              rows={payments}
              rowKey={(p) => p.id}
              withActions={false}
              onRowClick={(p) => {
                setSelectedPayment(p);
                setDetailOpen(true);
              }}
            />
            <Pagination
              count={totalItems}
              currentPage={page}
              totalPages={totalPages}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </SectionCard>

      <AppModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title="Détail du paiement"
        description="Informations relatives au paiement sélectionné"
        size="xl"
        footer={
          <div className="flex justify-end w-full">
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Fermer
            </Button>
          </div>
        }
      >
        {selectedPayment ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm md:col-span-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {selectedPayment.facture?.typeFacture === "ACHAT"
                    ? "Montant Décaissé"
                    : "Montant Encaissé"}
                </p>
                <p
                  className={cn(
                    "text-3xl font-bold",
                    selectedPayment.facture?.typeFacture === "ACHAT"
                      ? "text-destructive"
                      : "text-success",
                  )}
                >
                  {selectedPayment.facture?.typeFacture === "ACHAT"
                    ? "- "
                    : "+ "}
                  {fmtCurrency(Number(selectedPayment.montant))}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm md:col-span-1 flex flex-col justify-center">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Réf. de transaction / Notes
                </p>
                <p className="text-lg font-medium text-foreground">
                  {selectedPayment.reference ||
                    selectedPayment.notes ||
                    "Aucune référence"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2 border-b pb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Informations Générales
                </h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-border/50">
                    <span className="text-muted-foreground">
                      Méthode de paiement :
                    </span>
                    <span className="font-semibold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      {selectedPayment.modePaiement || "En attente"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Date :</span>
                    <span className="font-medium">
                      {formatDate(selectedPayment.datePaiement)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border/50">
                    <span className="text-muted-foreground">
                      Facture liée :
                    </span>
                    <span className="font-medium">
                      {selectedPayment.facture?.numeroFacture || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2 border-b pb-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Acteurs
                </h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex flex-col gap-1 py-1 border-b border-border/50 pb-2">
                    <span className="text-muted-foreground text-xs uppercase">
                      {selectedPayment.facture?.typeFacture === "ACHAT"
                        ? "Fournisseur concerné"
                        : "Client concerné"}
                    </span>
                    <span className="font-medium">
                      {selectedPayment.facture?.typeFacture === "ACHAT"
                        ? selectedPayment.facture?.fournisseur?.raisonSociale ||
                          "Fournisseur"
                        : selectedPayment.facture?.client?.nom ||
                          "Client occasionnel"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 py-1 border-b border-border/50 pb-2">
                    <span className="text-muted-foreground text-xs uppercase">
                      Enregistré par
                    </span>
                    <span className="font-medium">
                      {selectedPayment.utilisateur?.nom}{" "}
                      {selectedPayment.utilisateur?.prenom}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center text-muted-foreground">
            Détail indisponible
          </div>
        )}
      </AppModal>
    </>
  );
}
