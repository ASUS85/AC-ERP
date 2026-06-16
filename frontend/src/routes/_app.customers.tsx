import { createFileRoute } from "@tanstack/react-router";
import { Contact, Users, Wallet, Download } from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard, Toolbar, Pagination, StatCard } from "@/components/erp/widgets";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { Button } from "@/components/ui/button";
import { customers, fmtCurrency } from "@/lib/erp-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/customers")({
  head: () => ({ meta: [{ title: "Clients — AC ERP" }] }),
  component: CustomersPage,
});

type C = (typeof customers)[number];
const initials = (n: string) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const cols: Column<C>[] = [
  {
    key: "nom",
    header: "Client",
    render: (c) => (
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-white">
          {initials(c.nom)}
        </span>
        <div>
          <p className="font-medium text-foreground">{c.nom}</p>
          <p className="text-xs text-muted-foreground">{c.email}</p>
        </div>
      </div>
    ),
  },
  { key: "ville", header: "Ville" },
  { key: "achats", header: "Commandes", align: "right" },
  {
    key: "solde",
    header: "Solde",
    align: "right",
    render: (c) => (
      <span className={cn("font-medium", c.solde < 0 ? "text-destructive" : "text-foreground")}>{fmtCurrency(c.solde)}</span>
    ),
  },
  { key: "statut", header: "Statut", align: "right", render: (c) => <StatusBadge status={c.statut} /> },
];

function CustomersPage() {
  return (
    <>
      <PageHeader
        title="Clients"
        description="Fiches, soldes et historique d'achats"
        breadcrumb={["Gestion commerciale", "Clients"]}
        actions={
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" /> Exporter
          </Button>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Clients" value="642" sub="au total" icon={<Users className="h-5 w-5" />} />
        <StatCard label="Actifs" value="588" sub="ce trimestre" icon={<Contact className="h-5 w-5" />} />
        <StatCard label="Encours total" value="48 200 €" sub="à recouvrer" icon={<Wallet className="h-5 w-5" />} />
        <StatCard label="Nouveaux" value="24" delta="+12 %" up sub="ce mois" icon={<Users className="h-5 w-5" />} />
      </div>
      <SectionCard title="Liste des clients" description="642 clients">
        <div className="mb-4">
          <Toolbar placeholder="Rechercher un client…" addLabel="Ajouter un client" onAdd={() => toast.info("Ajout d'un client")} />
        </div>
        <DataTable columns={cols} rows={customers} rowKey={(c) => c.email} />
        <Pagination count={642} />
      </SectionCard>
    </>
  );
}