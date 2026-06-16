import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Minus, Trash2, ShoppingCart, Receipt } from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard, Pagination } from "@/components/erp/widgets";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { salesOrders, products, fmtCurrency } from "@/lib/erp-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/sales")({
  head: () => ({ meta: [{ title: "Ventes — AC ERP" }] }),
  component: SalesPage,
});

type O = (typeof salesOrders)[number];
const cols: Column<O>[] = [
  { key: "ref", header: "Vente", render: (o) => <span className="font-medium text-foreground">{o.ref}</span> },
  { key: "client", header: "Client" },
  { key: "articles", header: "Articles", align: "right" },
  { key: "date", header: "Date" },
  { key: "montant", header: "Montant", align: "right", render: (o) => <span className="font-medium text-foreground">{fmtCurrency(o.montant)}</span> },
  { key: "statut", header: "Statut", align: "right", render: (o) => <StatusBadge status={o.statut} /> },
];

function SalesPage() {
  const [cart, setCart] = useState<{ ref: string; nom: string; prix: number; qte: number }[]>([
    { ref: "PRD-001", nom: "Ordinateur portable Pro 15", prix: 1299, qte: 1 },
    { ref: "PRD-002", nom: "Casque sans fil ANC", prix: 199, qte: 2 },
  ]);
  const add = (p: (typeof products)[number]) =>
    setCart((c) => {
      const ex = c.find((i) => i.ref === p.ref);
      if (ex) return c.map((i) => (i.ref === p.ref ? { ...i, qte: i.qte + 1 } : i));
      return [...c, { ref: p.ref, nom: p.nom, prix: p.prix, qte: 1 }];
    });
  const setQte = (ref: string, d: number) =>
    setCart((c) => c.map((i) => (i.ref === ref ? { ...i, qte: Math.max(1, i.qte + d) } : i)));
  const remove = (ref: string) => setCart((c) => c.filter((i) => i.ref !== ref));
  const total = cart.reduce((s, i) => s + i.prix * i.qte, 0);
  const tva = total * 0.2;

  return (
    <>
      <PageHeader title="Ventes" description="Création de ventes, panier et facturation" breadcrumb={["Transactions", "Ventes"]} />
      <Tabs defaultValue="new">
        <TabsList className="mb-4">
          <TabsTrigger value="new" className="gap-1.5">
            <ShoppingCart className="h-4 w-4" /> Nouvelle vente
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-1.5">
            <Receipt className="h-4 w-4" /> Historique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SectionCard title="Catalogue" description="Cliquez pour ajouter au panier" className="lg:col-span-2">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {products.slice(0, 9).map((p) => (
                  <button
                    key={p.ref}
                    onClick={() => add(p)}
                    className="group rounded-lg border border-border p-3 text-left transition-all hover:border-primary/40 hover:shadow-card"
                  >
                    <div className="mb-2 flex h-16 items-center justify-center rounded-md bg-secondary/60 text-primary">
                      <ShoppingCart className="h-6 w-6 opacity-70" />
                    </div>
                    <p className="line-clamp-1 text-sm font-medium text-foreground">{p.nom}</p>
                    <p className="text-sm font-semibold text-primary">{fmtCurrency(p.prix)}</p>
                  </button>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Panier" description={`${cart.length} article(s)`}>
              <div className="space-y-3">
                {cart.map((i) => (
                  <div key={i.ref} className="flex items-center gap-2 rounded-lg border border-border p-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{i.nom}</p>
                      <p className="text-xs text-muted-foreground">{fmtCurrency(i.prix)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => setQte(i.ref, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{i.qte}</span>
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => setQte(i.ref, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <button onClick={() => remove(i.ref)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Sous-total</span>
                  <span>{fmtCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>TVA (20 %)</span>
                  <span>{fmtCurrency(tva)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-foreground">
                  <span>Total TTC</span>
                  <span>{fmtCurrency(total + tva)}</span>
                </div>
              </div>
              <Button className="mt-4 w-full" onClick={() => toast.success("Vente validée", { description: "Facture générée automatiquement." })}>
                Valider & facturer
              </Button>
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="list">
          <SectionCard title="Historique des ventes">
            <DataTable columns={cols} rows={salesOrders} rowKey={(o) => o.ref} />
            <Pagination count={1248} />
          </SectionCard>
        </TabsContent>
      </Tabs>
    </>
  );
}