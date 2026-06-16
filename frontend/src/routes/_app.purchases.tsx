import { createFileRoute } from "@tanstack/react-router";
import { Plus, FileEdit, CheckCircle2, Truck, PackageCheck } from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard, Toolbar, Pagination } from "@/components/erp/widgets";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { Button } from "@/components/ui/button";
import { purchaseOrders, fmtCurrency } from "@/lib/erp-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/purchases")({
  head: () => ({ meta: [{ title: "Achats — AC ERP" }] }),
  component: PurchasesPage,
});

type O = (typeof purchaseOrders)[number];
const cols: Column<O>[] = [
  { key: "ref", header: "Bon de commande", render: (o) => <span className="font-medium text-foreground">{o.ref}</span> },
  { key: "fournisseur", header: "Fournisseur" },
  { key: "articles", header: "Articles", align: "right" },
  { key: "date", header: "Date" },
  { key: "montant", header: "Montant", align: "right", render: (o) => <span className="font-medium text-foreground">{fmtCurrency(o.montant)}</span> },
  { key: "statut", header: "Statut", align: "right", render: (o) => <StatusBadge status={o.statut} /> },
];

const steps = [
  { icon: FileEdit, label: "Brouillon", done: true },
  { icon: CheckCircle2, label: "Validation", done: true },
  { icon: Truck, label: "Commande envoyée", done: true },
  { icon: PackageCheck, label: "Réception", done: false },
];

function PurchasesPage() {
  return (
    <>
      <PageHeader
        title="Achats"
        description="Bons de commande, réceptions et validation fournisseurs"
        breadcrumb={["Transactions", "Achats"]}
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => toast.info("Nouveau bon de commande")}>
            <Plus className="h-4 w-4" /> Nouveau bon de commande
          </Button>
        }
      />
      <SectionCard title="Workflow d'achat" description="Cycle de vie d'un bon de commande" className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {steps.map((s, i) => (
            <div key={s.label} className="flex flex-1 items-center gap-3">
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-full ${s.done ? "bg-gradient-primary text-white" : "border-2 border-dashed border-border text-muted-foreground"}`}>
                  <s.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Étape {i + 1}</p>
                  <p className={`text-sm font-medium ${s.done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
                </div>
              </div>
              {i < steps.length - 1 && <div className={`hidden h-0.5 flex-1 sm:block ${s.done ? "bg-primary/40" : "bg-border"}`} />}
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Bons de commande">
        <div className="mb-4">
          <Toolbar placeholder="Rechercher un bon de commande…" />
        </div>
        <DataTable columns={cols} rows={purchaseOrders} rowKey={(o) => o.ref} />
        <Pagination count={64} />
      </SectionCard>
    </>
  );
}