import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Printer,
  Download,
  FileText,
  Plus,
  Loader2,
  Send,
  Eye,
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
import { AppModal } from "@/components/erp/AppModal";
import { Button } from "@/components/ui/button";
import logo from "@/assets/erp-logo.png";
import { fmtCurrency } from "@/lib/erp-data";
import {
  envoyerFacture,
  getFactureById,
  getFacturePdf,
  getFactures,
} from "@/lib/api/factures.service";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/invoices")({
  head: () => ({ meta: [{ title: "Factures — AC ERP" }] }),
  component: InvoicesPage,
});

type FactureApi = {
  id: string;
  numeroFacture: string;
  statut: string;
  dateEcheance?: string;
  totalHt?: number | string;
  totalTva?: number | string;
  totalTtc?: number | string;
  client?: { nom?: string | null } | null;
  fournisseur?: { raisonSociale?: string | null } | null;
  lignes?: Array<{
    id: string;
    designation?: string | null;
    quantite?: number;
    prixUnitaireHt?: number | string;
    montantHt?: number | string;
    montantTtc?: number | string;
  }>;
};

type InvoiceRow = {
  id: string;
  ref: string;
  tiers: string;
  echeance: string;
  montant: number;
  statut: string;
  statutRaw: string;
};

const cols: Column<InvoiceRow>[] = [
  {
    key: "ref",
    header: "N facture",
    render: (i) => <span className="font-medium text-foreground">{i.ref}</span>,
  },
  { key: "tiers", header: "Client / Fournisseur" },
  { key: "echeance", header: "Échéance" },
  {
    key: "montant",
    header: "Montant",
    align: "right",
    render: (i) => (
      <span className="font-medium text-foreground">
        {fmtCurrency(i.montant)}
      </span>
    ),
  },
  {
    key: "statut",
    header: "Statut",
    align: "right",
    render: (i) => <StatusBadge status={i.statut} />,
  },
];

const PAGE_SIZE = 10;

const STATUS_LABELS: Record<string, string> = {
  BROUILLON: "Brouillon",
  EMISE: "Emise",
  PARTIELLEMENT_PAYEE: "Partiellement payee",
  SOLDEE: "Soldee",
  ANNULEE: "Annulee",
  EN_RETARD: "En retard",
};

const normalizeStatus = (status?: string) =>
  STATUS_LABELS[status || ""] || status || "-";

const toNumber = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("fr-FR");
};

function InvoicesPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );
  const [preview, setPreview] = useState<FactureApi | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [rowActionPendingById, setRowActionPendingById] = useState<
    Record<string, string>
  >({});
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfModalLoading, setPdfModalLoading] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFilename, setPdfFilename] = useState("facture.pdf");
  const pdfFrameRef = useRef<HTMLIFrameElement | null>(null);

  const loadRows = async () => {
    setLoading(true);
    try {
      const response = (await getFactures({ page: 1, limit: 1000 })) as {
        data?: FactureApi[];
      };
      const factures = Array.isArray(response?.data) ? response.data : [];
      const mapped = factures.map((item) => ({
        id: item.id,
        ref: item.numeroFacture,
        tiers: item.client?.nom || item.fournisseur?.raisonSociale || "-",
        echeance: formatDate(item.dateEcheance),
        montant: toNumber(item.totalTtc, 0),
        statut: normalizeStatus(item.statut),
        statutRaw: item.statut,
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

  const loadPreview = async (invoiceId: string) => {
    setPreviewLoading(true);
    try {
      const response = (await getFactureById(invoiceId)) as {
        data?: FactureApi;
      };
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
    if (
      !selectedInvoiceId ||
      !rows.some((row) => row.id === selectedInvoiceId)
    ) {
      setSelectedInvoiceId(rows[0].id);
      return;
    }
    void loadPreview(selectedInvoiceId);
  }, [rows, selectedInvoiceId]);

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
        r.tiers.toLowerCase().includes(q);
      const statusMatch = !statusFilter || r.statut === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [rows, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const paginatedRows = useMemo(
    () => filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredRows, page],
  );

  const stats = useMemo(() => {
    const totalFacture = rows.reduce((acc, row) => acc + row.montant, 0);
    const totalPayees = rows
      .filter((row) => row.statutRaw === "SOLDEE")
      .reduce((acc, row) => acc + row.montant, 0);
    const totalEnAttente = rows
      .filter((row) => ["EMISE", "PARTIELLEMENT_PAYEE"].includes(row.statutRaw))
      .reduce((acc, row) => acc + row.montant, 0);
    const totalEnRetard = rows
      .filter((row) => row.statutRaw === "EN_RETARD")
      .reduce((acc, row) => acc + row.montant, 0);
    const countRetard = rows.filter(
      (row) => row.statutRaw === "EN_RETARD",
    ).length;

    return {
      totalFacture,
      totalPayees,
      totalEnAttente,
      totalEnRetard,
      countRetard,
    };
  }, [rows]);

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

  const blobToDataUrl = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("PDF_READ_FAILED"));
      reader.readAsDataURL(blob);
    });

  const openPdf = async (invoiceId: string) => {
    setPdfModalLoading(true);
    setPdfModalOpen(true);
    try {
      const blob = (await getFacturePdf(invoiceId)) as Blob;
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

  const sendInvoice = async (invoiceId: string) => {
    try {
      await envoyerFacture(invoiceId);
      toast.success("Facture envoyee");
      await loadRows();
    } catch (error: unknown) {
      const maybeMessage =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: unknown }).message || "")
          : "";
      toast.error(maybeMessage.trim() || "Envoi de facture impossible");
    }
  };

  const actionsByStatus = (row: InvoiceRow) => {
    const makeAction = (
      key: string,
      label: string,
      icon: ReactNode,
      action: () => Promise<void>,
    ) => {
      const isRunning = rowActionPendingById[row.id] === key;
      return {
        label,
        icon: isRunning ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          icon
        ),
        onClick: () => void executeRowActionWithLoader(row.id, key, action),
      };
    };

    const common = [
      makeAction(
        "preview",
        "Apercu",
        <Eye className="mr-2 h-4 w-4" />,
        async () => {
          setSelectedInvoiceId(row.id);
          await loadPreview(row.id);
        },
      ),
      makeAction(
        "download",
        "Telecharger PDF",
        <Download className="mr-2 h-4 w-4" />,
        () => openPdf(row.id),
      ),
    ];

    if (["ANNULEE", "SOLDEE"].includes(row.statutRaw)) {
      return common;
    }

    return [
      ...common,
      makeAction(
        "send",
        "Envoyer par email",
        <Send className="mr-2 h-4 w-4" />,
        () => sendInvoice(row.id),
      ),
    ];
  };

  const previewLines = preview?.lignes || [];
  const computedHt = previewLines.reduce(
    (sum, line) => sum + toNumber(line.montantHt, 0),
    0,
  );
  const previewHt = toNumber(preview?.totalHt, computedHt);
  const previewTtc = toNumber(preview?.totalTtc, previewHt);
  const previewTva = toNumber(preview?.totalTva, previewTtc - previewHt);
  const selectedPreviewRef = preview?.numeroFacture || "-";
  const selectedPreviewTier =
    preview?.client?.nom || preview?.fournisseur?.raisonSociale || "-";
  const selectedPreviewEcheance = formatDate(preview?.dateEcheance);

  return (
    <>
      <PageHeader
        title="Factures"
        description="Liste, détails, impression PDF et statuts de paiement"
        breadcrumb={["Transactions", "Factures"]}
        actions={
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => toast.info("Nouvelle facture")}
          >
            <Plus className="h-4 w-4" /> Nouvelle facture
          </Button>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total facturé"
          value={fmtCurrency(stats.totalFacture)}
          sub="toutes factures"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="Payées"
          value={fmtCurrency(stats.totalPayees)}
          sub="encaissées"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="En attente"
          value={fmtCurrency(stats.totalEnAttente)}
          sub="à venir"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="En retard"
          value={fmtCurrency(stats.totalEnRetard)}
          sub={`${stats.countRetard} facture${stats.countRetard > 1 ? "s" : ""}`}
          icon={<FileText className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <SectionCard title="Liste des factures" className="lg:col-span-3">
          <div className="mb-4">
            <Toolbar
              placeholder="Rechercher une facture..."
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
                columns={cols}
                rows={paginatedRows}
                rowKey={(i) => i.id}
                rowActions={actionsByStatus}
                isRowActionLoading={(i) => Boolean(rowActionPendingById[i.id])}
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

        <SectionCard
          title="Aperçu facture"
          description={selectedPreviewRef}
          className="lg:col-span-2"
          action={
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={!selectedInvoiceId || previewLoading}
                onClick={() =>
                  selectedInvoiceId ? void openPdf(selectedInvoiceId) : null
                }
              >
                <Printer className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={!selectedInvoiceId || previewLoading}
                onClick={() =>
                  selectedInvoiceId ? void openPdf(selectedInvoiceId) : null
                }
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          }
        >
          <div className="rounded-lg border border-border bg-card p-5 text-sm">
            {previewLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : null}

            {!previewLoading && !preview ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Selectionnez une facture pour voir son detail.
              </p>
            ) : null}

            {!previewLoading && preview ? (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={logo}
                      alt="Logo"
                      width={32}
                      height={32}
                      className="h-8 w-8"
                    />
                    <div>
                      <p className="font-display font-bold text-foreground">
                        AC ERP
                      </p>
                      <p className="text-xs text-muted-foreground">
                        12 rue du Commerce, Lyon
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">FACTURE</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedPreviewRef}
                    </p>
                  </div>
                </div>
                <div className="my-4 border-t border-border pt-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">
                    Facture a : {selectedPreviewTier}
                  </p>
                  <p>Lyon, France · Echeance : {selectedPreviewEcheance}</p>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Désignation</th>
                      <th className="pb-2 text-center font-medium">Qté</th>
                      <th className="pb-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewLines.map((l) => (
                      <tr key={l.id} className="border-b border-border/60">
                        <td className="py-2 text-foreground">
                          {l.designation || "Produit"}
                        </td>
                        <td className="py-2 text-center text-muted-foreground">
                          {toNumber(l.quantite, 0)}
                        </td>
                        <td className="py-2 text-right text-foreground">
                          {fmtCurrency(
                            toNumber(l.montantTtc, toNumber(l.montantHt, 0)),
                          )}
                        </td>
                      </tr>
                    ))}
                    {previewLines.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-4 text-center text-muted-foreground"
                        >
                          Aucune ligne de facture
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total HT</span>
                    <span>{fmtCurrency(previewHt)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>TVA</span>
                    <span>{fmtCurrency(previewTva)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-1 font-bold text-foreground">
                    <span>Total TTC</span>
                    <span>{fmtCurrency(previewTtc)}</span>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </SectionCard>
      </div>

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
        title="Apercu PDF facture"
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
            title="Apercu facture PDF"
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
