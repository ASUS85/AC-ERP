import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, Wallet, Receipt } from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard, Toolbar, Pagination, StatCard } from "@/components/erp/widgets";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { payments, fmtCurrency } from "@/lib/erp-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/payments")({
  head: () => ({ meta: [{ title: "Paiements — AC ERP" }] }),
  component: PaymentsPage,
});

type P = (typeof payments)[number];
const cols: Column<P>[] = [
  { key: "ref", header: "Référence", render: (p) => <span className="font-medium text-foreground">{p.ref}</span> },
  { key: "tiers", header: "Tiers" },
  { key: "methode", header: "Méthode" },
  { key: "type", header: "Type", render: (p) => <StatusBadge status={p.type} /> },
  {
    key: "montant",
    header: "Montant",
    align: "right",
    render: (p) => (
      <span className={cn("font-medium", p.type === "Reçu" ? "text-success" : "text-info")}>
        {p.type === "Reçu" ? "+" : "−"} {fmtCurrency(p.montant)}
      </span>
    ),
  },
  { key: "date", header: "Date", align: "right" },
];

function PaymentsPage() {
  return (
    <>
      <PageHeader title="Paiements" description="Paiements reçus, paiements effectués et reçus" breadcrumb={["Transactions", "Paiements"]} />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Encaissements" value="248 100 f" sub="ce mois" icon={<ArrowDownLeft className="h-5 w-5" />} />
        <StatCard label="Décaissements" value="186 500 f" sub="ce mois" icon={<ArrowUpRight className="h-5 w-5" />} />
        <StatCard label="Trésorerie nette" value="+61 600 f" delta="+8 %" up sub="solde du mois" icon={<Wallet className="h-5 w-5" />} />
        <StatCard label="Reçus émis" value="148" sub="documents" icon={<Receipt className="h-5 w-5" />} />
      </div>
      <SectionCard title="Historique des paiements">
        <div className="mb-4">
          <Toolbar placeholder="Rechercher un paiement…" />
        </div>
        <DataTable columns={cols} rows={payments} rowKey={(p) => p.ref} />
        <Pagination count={426} />
      </SectionCard>
    </>
  );
}