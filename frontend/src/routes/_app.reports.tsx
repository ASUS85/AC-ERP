import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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

const currentYear = new Date().getFullYear();

const months = [
  { value: "1", label: "Janvier" },
  { value: "2", label: "Février" },
  { value: "3", label: "Mars" },
  { value: "4", label: "Avril" },
  { value: "5", label: "Mai" },
  { value: "6", label: "Juin" },
  { value: "7", label: "Juillet" },
  { value: "8", label: "Août" },
  { value: "9", label: "Septembre" },
  { value: "10", label: "Octobre" },
  { value: "11", label: "Novembre" },
  { value: "12", label: "Décembre" },
];

function formatDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function ReportsPage() {
  const [selected, setSelected] = useState<IaRapport["typeRapport"]>("ventes");
  const [annee, setAnnee] = useState("");
  const [mois, setMois] = useState("");
  const [semaine, setSemaine] = useState("");
  const [jour, setJour] = useState("");

  const [filterError, setFilterError] = useState<
    "annee" | "mois" | "semaine" | null
  >(null);
  const [report, setReport] = useState<IaRapport>();
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const active = types.find((t) => t.id === selected)!;

  const years = useMemo(() => {
    return Array.from({ length: 10 }, (_, index) =>
      String(currentYear - index),
    );
  }, []);

  const weeks = useMemo(() => {
    if (!annee || !mois) return [];

    const year = Number(annee);
    const month = Number(mois);
    const daysInMonth = new Date(year, month, 0).getDate();

    const ranges = [];

    for (let start = 1; start <= daysInMonth; start += 7) {
      const end = Math.min(start + 6, daysInMonth);

      ranges.push({
        value: `${start}-${end}`,
        label: `Semaine ${start}-${end}`,
        start,
        end,
      });
    }

    return ranges;
  }, [annee, mois]);

  const days = useMemo(() => {
    if (!annee || !mois || !semaine) return [];

    const year = Number(annee);
    const month = Number(mois);
    const [start, end] = semaine.split("-").map(Number);

    return Array.from({ length: end - start + 1 }, (_, index) => {
      const dayNumber = start + index;
      const date = new Date(year, month - 1, dayNumber);

      return {
        value: String(dayNumber),
        label: date.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
        }),
      };
    });
  }, [annee, mois, semaine]);

  const periodLabel = useMemo(() => {
    if (!annee) return "";

    if (jour && mois) {
      const month = months.find((month) => month.value === mois);

      const date = new Date(Number(annee), Number(mois) - 1, Number(jour));

      return date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    if (semaine && mois) {
      const month = months.find((month) => month.value === mois);
      return `Semaine ${semaine} — ${month?.label} ${annee}`;
    }

    if (mois) {
      const month = months.find((month) => month.value === mois);
      return `${month?.label} ${annee}`;
    }

    return `Année ${annee}`;
  }, [annee, mois, semaine, jour]);

  const generate = async () => {
    if (!annee) {
      setFilterError("annee");
      return;
    }

    let dateDebut: string;
    let dateFin: string;

    const year = Number(annee);

    if (jour && mois && semaine) {
      const date = new Date(year, Number(mois) - 1, Number(jour));

      dateDebut = formatDate(date);
      dateFin = formatDate(date);
    } else if (semaine && mois) {
      const month = Number(mois);
      const [start, end] = semaine.split("-").map(Number);

      dateDebut = formatDate(new Date(year, month - 1, start));
      dateFin = formatDate(new Date(year, month - 1, end));
    } else if (mois) {
      const month = Number(mois);

      dateDebut = formatDate(new Date(year, month - 1, 1));
      dateFin = formatDate(new Date(year, month, 0));
    } else {
      dateDebut = `${year}-01-01`;
      dateFin = `${year}-12-31`;
    }

    setGenerating(true);

    try {
      const response = await genererRapport(selected, {
        dateDebut,
        dateFin,
      });

      setReport(response.data);
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
      link.download = `rapport-${report.typeRapport}-${annee}${mois ? `-${mois}` : ""}${semaine ? `-S${semaine}` : ""}${jour ? `-${jour}` : ""}.pdf`;
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
          headerGradient
        >
          <div className="space-y-2">
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelected(t.id);
                  setReport(undefined);
                  setAnnee("");
                  setMois("");
                  setSemaine("");
                  setJour("");
                  setFilterError(null);
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
          <div className="mt-4 overflow-hidden rounded-lg border border-border/70">
            <div className="bg-primary/5 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">
                Période du rapport
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Affinez progressivement la période à analyser.
              </p>
            </div>

            <div className="grid gap-3 p-4 md:grid-cols-2">
              {/* Année */}
              <div className="space-y-1.5">
                <Label>Année</Label>
                <Select
                  value={annee}
                  onValueChange={(value) => {
                    setAnnee(value);
                    setMois("");
                    setSemaine("");
                    setJour("");
                    setFilterError(null);
                    setReport(undefined);
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      filterError === "annee" &&
                        "border-destructive ring-1 ring-destructive",
                    )}
                  >
                    <SelectValue placeholder="Sélectionner une année" />
                  </SelectTrigger>

                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mois */}
              <div className="space-y-1.5">
                <Label>Mois</Label>
                <Select
                  value={mois}
                  onOpenChange={(open) => {
                    if (open && !annee) {
                      setFilterError("annee");
                    }
                  }}
                  onValueChange={(value) => {
                    if (!annee) {
                      setFilterError("annee");
                      return;
                    }

                    setMois(value);
                    setSemaine("");
                    setJour("");
                    setFilterError(null);
                    setReport(undefined);
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      filterError === "annee" &&
                        !annee &&
                        "border-destructive ring-1 ring-destructive",
                    )}
                  >
                    <SelectValue placeholder="Sélectionner un mois" />
                  </SelectTrigger>

                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Semaine */}
              {/* Semaine */}
              <div className="space-y-1.5">
                <Label>Semaine</Label>
                <Select
                  value={semaine}
                  onOpenChange={(open) => {
                    if (!open) return;

                    if (!annee) {
                      setFilterError("annee");
                      return;
                    }

                    if (!mois) {
                      setFilterError("mois");
                    }
                  }}
                  onValueChange={(value) => {
                    if (!annee) {
                      setFilterError("annee");
                      return;
                    }

                    if (!mois) {
                      setFilterError("mois");
                      return;
                    }

                    setSemaine(value);
                    setJour("");
                    setFilterError(null);
                    setReport(undefined);
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      filterError === "annee" &&
                        "border-destructive ring-1 ring-destructive",
                      filterError === "mois" &&
                        "border-destructive ring-1 ring-destructive",
                    )}
                  >
                    <SelectValue placeholder="Sélectionner une semaine" />
                  </SelectTrigger>

                  <SelectContent>
                    {weeks.map((week) => (
                      <SelectItem key={week.value} value={week.value}>
                        {week.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Jour */}
              {/* Jour */}
              <div className="space-y-1.5">
                <Label>Jour</Label>
                <Select
                  value={jour}
                  onOpenChange={(open) => {
                    if (!open) return;

                    if (!annee) {
                      setFilterError("annee");
                      return;
                    }

                    if (!mois) {
                      setFilterError("mois");
                      return;
                    }

                    if (!semaine) {
                      setFilterError("semaine");
                    }
                  }}
                  onValueChange={(value) => {
                    if (!annee) {
                      setFilterError("annee");
                      return;
                    }

                    if (!mois) {
                      setFilterError("mois");
                      return;
                    }

                    if (!semaine) {
                      setFilterError("semaine");
                      return;
                    }

                    setJour(value);
                    setFilterError(null);
                    setReport(undefined);
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      filterError === "semaine" &&
                        "border-destructive ring-1 ring-destructive",
                    )}
                  >
                    <SelectValue placeholder="Sélectionner un jour" />
                  </SelectTrigger>

                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
          headerGradient
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
                    Période : {periodLabel}
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
