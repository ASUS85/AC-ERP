import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard, StatCard } from "@/components/erp/widgets";
import { ChartFrame } from "@/components/erp/ChartFrame";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { fmtCurrency } from "@/lib/erp-data";
import { getPrevisions, type IaPrevisionsResponse } from "@/lib/api/ia.service";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ai")({
  head: () => ({ meta: [{ title: "Prévisions IA — AC ERP" }] }),
  component: AiPage,
});

function riskLevel(days: number | null) {
  if (days === null || days <= 7) return "Critique";
  if (days <= 14) return "Élevé";
  if (days <= 30) return "Moyen";
  return "Faible";
}

function AiPage() {
  const [previsions, setPrevisions] = useState<IaPrevisionsResponse>();
  const [loading, setLoading] = useState(true);
  const hasLoadedPrevisions = useRef(false);

  useEffect(() => {
    if (hasLoadedPrevisions.current) return;
    hasLoadedPrevisions.current = true;

    async function loadPrevisions() {
      try {
        const response = await getPrevisions();
        setPrevisions(response.data);
      } catch {
        toast.error("Impossible de charger les prévisions IA");
      } finally {
        setLoading(false);
      }
    }

    void loadPrevisions();
  }, []);

  const salesForecast = (previsions?.previsionsMensuelles ?? []).map(
    (forecast) => ({
      mois: new Intl.DateTimeFormat("fr-FR", {
        month: "short",
        year: "numeric",
      }).format(new Date(`${forecast.mois}-01T00:00:00`)),
      reel: null,
      prevu: forecast.montantPrevu,
    }),
  );
  const produitsRisque = previsions?.produitsRisque ?? [];
  const recommandations = previsions?.recommandations ?? [];

  return (
    <>
      <PageHeader
        title="Prévisions & intelligence artificielle"
        description="Anticipez ventes, stocks et risques"
        breadcrumb={["Intelligence", "Prévisions IA"]}
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="CA prévu (prochain mois)"
          value={
            loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              fmtCurrency(previsions?.caPrevu ?? 0)
            )
          }
          delta="Projection IA"
          up
          sub="sur les 6 prochains mois"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="Fiabilité du modèle"
          value={
            loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              `${previsions?.fiabilite ?? 0} %`
            )
          }
          sub="précision"
          icon={<BrainCircuit className="h-5 w-5" />}
        />
        <StatCard
          label="Produits à risque"
          value={
            loading ? (
              <Skeleton className="h-8 w-10" />
            ) : (
              String(produitsRisque.length)
            )
          }
          sub="rupture probable"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <StatCard
          label="Recommandations"
          value={
            loading ? (
              <Skeleton className="h-8 w-10" />
            ) : (
              String(recommandations.length)
            )
          }
          sub="actions suggérées"
          icon={<Lightbulb className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          title="Prévision des ventes"
          description="Projection sur 6 mois (modèle prédictif)"
          className="lg:col-span-2"
        >
          <ChartFrame loading={loading} className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesForecast}
                margin={{ left: -8, right: 8, top: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="mois"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="var(--muted-foreground)"
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => fmtCurrency(v)}
                />
                <Line
                  type="monotone"
                  dataKey="reel"
                  name="Réel"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="prevu"
                  name="Prévision IA"
                  stroke="var(--chart-3)"
                  strokeWidth={2.5}
                  strokeDasharray="6 4"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartFrame>
        </SectionCard>

        <SectionCard
          title="Recommandations IA"
          description="Actions prioritaires"
        >
          <div className="space-y-3">
            {recommandations.map((r) => (
              <div
                key={r}
                className="flex items-start gap-3 rounded-lg border border-border p-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-info/12 text-info">
                  <Lightbulb className="h-4 w-4" />
                </span>
                <p className="text-sm text-foreground">{r}</p>
              </div>
            ))}
            {!loading && recommandations.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Aucune recommandation disponible pour le moment.
              </p>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="mt-4">
        <SectionCard
          title="Risques de rupture de stock"
          description="Produits critiques détectés par l'IA"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2.5 font-medium first:pl-1">
                    Produit
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium">
                    Stock actuel
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium">
                    Rupture estimée
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium">
                    Niveau de risque
                  </th>
                </tr>
              </thead>
              <tbody>
                {produitsRisque.map((s) => (
                  <tr
                    key={s.idProduit}
                    className="border-b border-border/60 last:border-0 hover:bg-secondary/40"
                  >
                    <td className="px-3 py-3.5 font-medium text-foreground first:pl-1">
                      {s.produit}
                    </td>
                    <td className="px-3 py-3.5 text-right text-foreground">
                      {s.stockActuel} unités
                    </td>
                    <td className="px-3 py-3.5 text-right text-muted-foreground">
                      {s.joursAvantRupture === null
                        ? "À surveiller"
                        : s.joursAvantRupture <= 0
                          ? "Immédiate"
                          : `~ ${s.joursAvantRupture} jours`}
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <StatusBadge status={riskLevel(s.joursAvantRupture)} />
                    </td>
                  </tr>
                ))}
                {!loading && produitsRisque.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-8 text-center text-muted-foreground"
                    >
                      Aucun risque de rupture détecté.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
