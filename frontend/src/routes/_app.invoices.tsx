import { createFileRoute } from "@tanstack/react-router";
import { Printer, Download, FileText, Plus } from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import {
  SectionCard,
  Toolbar,
  Pagination,
  StatCard,
} from "@/components/erp/widgets";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { Button } from "@/components/ui/button";
import logo from "@/assets/erp-logo.png";
import { invoices, fmtCurrency } from "@/lib/erp-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/invoices")({
  head: () => ({ meta: [{ title: "Factures — AC ERP" }] }),
  component: InvoicesPage,
});

type I = (typeof invoices)[number];
const cols: Column<I>[] = [
  {
    key: "ref",
    header: "N° facture",
    render: (i) => <span className="font-medium text-foreground">{i.ref}</span>,
  },
  { key: "client", header: "Client" },
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

const lines = [
  { d: "Ordinateur portable Pro 15", q: 2, pu: 1299 },
  { d: "Casque sans fil ANC", q: 2, pu: 199 },
  { d: "Souris ergonomique", q: 4, pu: 49 },
];

function InvoicesPage() {
  const ht = lines.reduce((s, l) => s + l.q * l.pu, 0);
  const tva = ht * 0.2;
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
          value="284 750 f"
          sub="ce mois"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="Payées"
          value="248 100 f"
          sub="encaissées"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="En attente"
          value="18 230 f"
          sub="à venir"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="En retard"
          value="18 420 f"
          sub="5 factures"
          icon={<FileText className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <SectionCard title="Liste des factures" className="lg:col-span-3">
          <div className="mb-4">
            <Toolbar placeholder="Rechercher une facture…" />
          </div>
          <DataTable columns={cols} rows={invoices} rowKey={(i) => i.ref} />
          <Pagination count={312} />
        </SectionCard>

        <SectionCard
          title="Aperçu facture"
          description="FAC-2026-148"
          className="lg:col-span-2"
          action={
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => toast.info("Impression…")}
              >
                <Printer className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => toast.success("PDF exporté")}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          }
        >
          <div className="rounded-lg border border-border bg-card p-5 text-sm">
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
                <p className="text-xs text-muted-foreground">FAC-2026-148</p>
              </div>
            </div>
            <div className="my-4 border-t border-border pt-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">
                Facturé à : TechnoPlus SARL
              </p>
              <p>Lyon, France · Échéance : 05 juin 2026</p>
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
                {lines.map((l) => (
                  <tr key={l.d} className="border-b border-border/60">
                    <td className="py-2 text-foreground">{l.d}</td>
                    <td className="py-2 text-center text-muted-foreground">
                      {l.q}
                    </td>
                    <td className="py-2 text-right text-foreground">
                      {fmtCurrency(l.q * l.pu)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Total HT</span>
                <span>{fmtCurrency(ht)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>TVA 20 %</span>
                <span>{fmtCurrency(tva)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1 font-bold text-foreground">
                <span>Total TTC</span>
                <span>{fmtCurrency(ht + tva)}</span>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
