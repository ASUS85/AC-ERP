import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileBarChart, FileText, Download, Sparkles, Receipt, ShoppingCart, Warehouse, Banknote } from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard } from "@/components/erp/widgets";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({ meta: [{ title: "Rapports — AC ERP" }] }),
  component: ReportsPage,
});

const types = [
  { id: "sales", label: "Rapport des ventes", icon: Receipt, desc: "CA, marges et top produits" },
  { id: "purchases", label: "Rapport des achats", icon: ShoppingCart, desc: "Commandes et fournisseurs" },
  { id: "stock", label: "Rapport des stocks", icon: Warehouse, desc: "Valeur, mouvements et ruptures" },
  { id: "finance", label: "Rapport financier", icon: Banknote, desc: "Trésorerie et résultats" },
];

function ReportsPage() {
  const [selected, setSelected] = useState("sales");
  const [generated, setGenerated] = useState(false);
  const active = types.find((t) => t.id === selected)!;

  return (
    <>
      <PageHeader title="Génération de rapports" description="Créez et exportez des rapports automatiques" breadcrumb={["Intelligence", "Rapports"]} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard title="Configuration" description="Choisissez le type de rapport">
          <div className="space-y-2">
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelected(t.id);
                  setGenerated(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all",
                  selected === t.id ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/40",
                )}
              >
                <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", selected === t.id ? "bg-gradient-primary text-white" : "bg-secondary text-muted-foreground")}>
                  <t.icon className="h-4 w-4" />
                </span>
                <div><p className="text-sm font-medium text-foreground">{t.label}</p><p className="text-xs text-muted-foreground">{t.desc}</p></div>
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-1.5">
            <Label>Période</Label>
            <Select defaultValue="month">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Ce mois-ci</SelectItem>
                <SelectItem value="quarter">Ce trimestre</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="mt-4 w-full gap-1.5" onClick={() => { setGenerated(true); toast.success("Rapport généré"); }}>
            <Sparkles className="h-4 w-4" /> Générer le rapport
          </Button>
        </SectionCard>

        <SectionCard
          title="Prévisualisation"
          description={active.label}
          className="lg:col-span-2"
          action={
            generated && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success("PDF exporté")}>
                <Download className="h-4 w-4" /> Exporter PDF
              </Button>
            )
          }
        >
          {!generated ? (
            <div className="flex h-80 flex-col items-center justify-center gap-3 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                <FileBarChart className="h-7 w-7" />
              </span>
              <p className="text-sm text-muted-foreground">Configurez puis générez un rapport<br />pour afficher la prévisualisation.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border p-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">{active.label}</h3>
                  <p className="text-xs text-muted-foreground">Période : Juin 2026 · Généré le 10 juin 2026</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                {[
                  { k: "Total", v: "284 750 €" },
                  { k: "Croissance", v: "+12,4 %" },
                  { k: "Transactions", v: "1 248" },
                ].map((s) => (
                  <div key={s.k} className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">{s.k}</p>
                    <p className="text-lg font-bold text-foreground">{s.v}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Synthèse automatique : la période analysée affiche une performance solide avec une croissance de 12,4 %.
                Les indicateurs clés sont en progression, portés par le segment Informatique. Aucun risque financier majeur détecté.
              </p>
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}