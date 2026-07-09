import { createFileRoute } from "@tanstack/react-router";
import {
  Warehouse,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard, Toolbar, StatCard } from "@/components/erp/widgets";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { Button } from "@/components/ui/button";
import { stockMovements, products } from "@/lib/erp-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/inventory")({
  head: () => ({ meta: [{ title: "Stocks — AC ERP" }] }),
  component: InventoryPage,
});

type M = (typeof stockMovements)[number];
const cols: Column<M>[] = [
  {
    key: "ref",
    header: "Référence",
    render: (m) => <span className="font-medium text-foreground">{m.ref}</span>,
  },
  { key: "produit", header: "Produit" },
  {
    key: "type",
    header: "Type",
    render: (m) => <StatusBadge status={m.type} />,
  },
  {
    key: "qte",
    header: "Quantité",
    align: "right",
    render: (m) => (
      <span
        className={cn(
          "font-medium",
          m.type === "Entrée" ? "text-success" : "text-info",
        )}
      >
        {m.type === "Entrée" ? "+" : "−"}
        {m.qte}
      </span>
    ),
  },
  { key: "depot", header: "Dépôt" },
  { key: "date", header: "Date", align: "right" },
];

const lowStock = products.filter((p) => p.statut !== "Actif");

function InventoryPage() {
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
              onClick={() => toast.info("Nouvelle entrée de stock")}
            >
              <ArrowDownToLine className="h-4 w-4" /> Entrée
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => toast.info("Nouvel inventaire")}
            >
              <ClipboardList className="h-4 w-4" /> Inventaire
            </Button>
          </>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Valeur du stock"
          value="512 300 f"
          delta="-2,8 %"
          sub="vs mois dernier"
          icon={<Warehouse className="h-5 w-5" />}
        />
        <StatCard
          label="Entrées (30j)"
          value="1 240"
          sub="unités reçues"
          icon={<ArrowDownToLine className="h-5 w-5" />}
        />
        <StatCard
          label="Sorties (30j)"
          value="982"
          sub="unités expédiées"
          icon={<ArrowUpFromLine className="h-5 w-5" />}
        />
        <StatCard
          label="Alertes rupture"
          value="3"
          sub="produits critiques"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          title="Mouvements de stock"
          description="Entrées et sorties récentes"
          className="lg:col-span-2"
        >
          <div className="mb-4">
            <Toolbar placeholder="Rechercher un mouvement…" />
          </div>
          <DataTable
            columns={cols}
            rows={stockMovements}
            rowKey={(m) => m.ref}
            withActions={false}
          />
        </SectionCard>
        <SectionCard
          title="Alertes de rupture"
          description="Produits à réapprovisionner"
        >
          <div className="space-y-3">
            {lowStock.map((p) => (
              <div
                key={p.ref}
                className="flex items-center justify-between gap-2 rounded-lg border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {p.nom}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Stock : {p.stock} unités
                  </p>
                </div>
                <StatusBadge status={p.statut} />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}
