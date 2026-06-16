import { createFileRoute } from "@tanstack/react-router";
import { Download, Package } from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard, Toolbar, Pagination, StatCard } from "@/components/erp/widgets";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { Button } from "@/components/ui/button";
import { products, fmtCurrency, fmtNumber } from "@/lib/erp-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/products")({
  head: () => ({ meta: [{ title: "Produits — AC ERP" }] }),
  component: ProductsPage,
});

type P = (typeof products)[number];
const cols: Column<P>[] = [
  {
    key: "nom",
    header: "Produit",
    render: (p) => (
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Package className="h-4 w-4" />
        </span>
        <div>
          <p className="font-medium text-foreground">{p.nom}</p>
          <p className="text-xs text-muted-foreground">{p.ref}</p>
        </div>
      </div>
    ),
  },
  { key: "cat", header: "Catégorie" },
  { key: "prix", header: "Prix", align: "right", render: (p) => <span className="font-medium text-foreground">{fmtCurrency(p.prix)}</span> },
  { key: "stock", header: "Stock", align: "right", render: (p) => <span className="text-foreground">{fmtNumber(p.stock)}</span> },
  { key: "statut", header: "Statut", align: "right", render: (p) => <StatusBadge status={p.statut} /> },
];

function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Produits"
        description="Catalogue et gestion des articles"
        breadcrumb={["Gestion commerciale", "Produits"]}
        actions={
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" /> Exporter
          </Button>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total produits" value="1 894" sub="en catalogue" icon={<Package className="h-5 w-5" />} />
        <StatCard label="Actifs" value="1 712" sub="disponibles" icon={<Package className="h-5 w-5" />} />
        <StatCard label="Stock faible" value="9" sub="à réapprovisionner" icon={<Package className="h-5 w-5" />} />
        <StatCard label="Ruptures" value="3" sub="indisponibles" icon={<Package className="h-5 w-5" />} />
      </div>
      <SectionCard title="Catalogue produits" description="1 894 produits" action={undefined}>
        <div className="mb-4">
          <Toolbar placeholder="Rechercher un produit…" addLabel="Ajouter un produit" onAdd={() => toast.info("Formulaire d'ajout de produit")} />
        </div>
        <DataTable columns={cols} rows={products} rowKey={(p) => p.ref} />
        <Pagination count={1894} />
      </SectionCard>
    </>
  );
}