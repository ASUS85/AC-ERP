import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  FileBarChart,
  FileText,
  Download,
  Sparkles,
  Receipt,
  ShoppingCart,
  Warehouse,
  Banknote,
  LoaderCircle,
} from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard } from "@/components/erp/widgets";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  genererRapport,
  telechargerRapportPdf,
  type IaRapport,
} from "@/lib/api/ia.service";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({ meta: [{ title: "Rapports — AC ERP" }] }),
  component: ReportsPage,
});

const types = [
  {
    id: "ventes",
    label: "Rapport des ventes",
    icon: Receipt,
    desc: "CA, marges et top produits",
  },
  {
    id: "achats",
    label: "Rapport des achats",
    icon: ShoppingCart,
    desc: "Commandes et fournisseurs",
  },
  {
    id: "stocks",
    label: "Rapport des stocks",
    icon: Warehouse,
    desc: "Valeur, mouvements et ruptures",
  },
  {
    id: "financier",
    label: "Rapport financier",
    icon: Banknote,
    desc: "Trésorerie et résultats",
  },
] as const;

const periodLabels = {
  semaine: "Cette semaine",
  mois: "Ce mois-ci",
  trimestre: "Ce trimestre",
  annee: "Cette année",
};

function ReportsPage() {
  const [selected, setSelected] = useState<IaRapport["typeRapport"]>("ventes");
  const [periode, setPeriode] = useState<IaRapport["periode"]>("mois");
  const [report, setReport] = useState<IaRapport>();
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const active = types.find((t) => t.id === selected)!;

  const generate = async () => {
    setGenerating(true);
    try {
      const response = await genererRapport(selected, periode);
      setReport(response.data);
      toast.success("Rapport généré à partir des données ERP");
    } catch (error) {
      const message =
        typeof error === "object" && error && "message" in error
          ? String(error.message)
          : "Impossible de générer le rapport";
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = async () => {
    if (!report || downloading) return;
    setDownloading(true);
    try {
      const blob = await telechargerRapportPdf(report.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rapport-${report.typeRapport}-${report.periode}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      toast.success("Rapport PDF téléchargé");
    } catch (error) {
      const message =
        typeof error === "object" && error && "message" in error
          ? String(error.message)
          : "Impossible de télécharger le rapport PDF";
      toast.error(message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Génération de rapports"
        description="Créez et exportez des rapports automatiques"
        breadcrumb={["Intelligence", "Rapports"]}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          title="Configuration"
          description="Choisissez le type de rapport"
        >
          <div className="space-y-2">
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelected(t.id);
                  setReport(undefined);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all",
                  selected === t.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-secondary/40",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg",
                    selected === t.id
                      ? "bg-gradient-primary text-white"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  <t.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-1.5">
            <Label>Période</Label>
            <Select
              value={periode}
              onValueChange={(value: IaRapport["periode"]) => {
                setPeriode(value);
                setReport(undefined);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semaine">Cette semaine</SelectItem>
                <SelectItem value="mois">Ce mois-ci</SelectItem>
                <SelectItem value="trimestre">Ce trimestre</SelectItem>
                <SelectItem value="annee">Cette année</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            className="mt-4 w-full gap-1.5"
            onClick={() => void generate()}
            disabled={generating}
          >
            {generating ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {generating ? "Génération en cours..." : "Générer le rapport"}
          </Button>
        </SectionCard>

        <SectionCard
          title="Prévisualisation"
          description={active.label}
          className="lg:col-span-2"
          action={
            report && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => void downloadReport()}
                disabled={downloading}
              >
                {downloading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Télécharger le PDF
              </Button>
            )
          }
        >
          {generating ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
              <Skeleton className="h-72 w-full" />
            </div>
          ) : !report ? (
            <div className="flex h-80 flex-col items-center justify-center gap-3 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                <FileBarChart className="h-7 w-7" />
              </span>
              <p className="text-sm text-muted-foreground">
                Configurez puis générez un rapport
                <br />
                pour afficher la prévisualisation.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {active.label}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Période : {periodLabels[report.periode]}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
              {report.html ? (
                <iframe
                  title={`Prévisualisation ${active.label}`}
                  srcDoc={report.html}
                  className="h-[620px] w-full bg-white"
                />
              ) : (
                <p className="p-5 text-sm leading-relaxed text-muted-foreground">
                  {report.contenu}
                </p>
              )}
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}
