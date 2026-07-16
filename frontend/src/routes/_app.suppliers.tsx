import { createFileRoute } from "@tanstack/react-router";
import { Truck, Package, ShoppingCart } from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import {
  SectionCard,
  Toolbar,
  Pagination,
  StatCard,
} from "@/components/erp/widgets";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { suppliers, fmtCurrency } from "@/lib/erp-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/suppliers")({
  head: () => ({ meta: [{ title: "Fournisseurs — AC ERP" }] }),
  component: SuppliersPage,
});

type S = (typeof suppliers)[number];
const cols: Column<S>[] = [
  {
    key: "nom",
    header: "Fournisseur",
    render: (s) => (
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/15 text-warning-foreground">
          <Truck className="h-4 w-4" />
        </span>
        <div>
          <p className="font-medium text-foreground">{s.nom}</p>
          <p className="text-xs text-muted-foreground">{s.email}</p>
        </div>
      </div>
    ),
  },
  { key: "ville", header: "Ville" },
  { key: "commandes", header: "Commandes", align: "right" },
  {
    key: "total",
    header: "Total achats",
    align: "right",
    render: (s) => (
      <span className="font-medium text-foreground">
        {fmtCurrency(s.total)}
      </span>
    ),
  },
  {
    key: "statut",
    header: "Statut",
    align: "right",
    render: (s) => <StatusBadge status={s.statut} />,
  },
];

function SuppliersPage() {
  return (
    <>
      <PageHeader
        title="Fournisseurs"
        description="Coordonnées, commandes et statistiques"
        breadcrumb={["Gestion commerciale", "Fournisseurs"]}
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Fournisseurs"
          value="87"
          sub="actifs"
          icon={<Truck className="h-5 w-5" />}
        />
        <StatCard
          label="Commandes"
          value="152"
          sub="ce trimestre"
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <StatCard
          label="Volume d'achats"
          value={fmtCurrency(555600)}
          sub="cumulé"
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          label="Délai moyen"
          value="4,2 j"
          sub="de livraison"
          icon={<Truck className="h-5 w-5" />}
        />
      </div>
      <SectionCard title="Liste des fournisseurs">
        <div className="mb-4">
          <Toolbar
            placeholder="Rechercher un fournisseur…"
            addLabel="Ajouter un fournisseur"
            onAdd={() => toast.info("Ajout d'un fournisseur")}
          />
        </div>
        <DataTable columns={cols} rows={suppliers} rowKey={(s) => s.email} />
        <Pagination count={87} />
      </SectionCard>
    </>
  );
}
