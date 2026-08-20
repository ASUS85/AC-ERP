import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard, StatCard } from "@/components/erp/widgets";
import { ChartFrame } from "@/components/erp/ChartFrame";
import { fmtCurrency } from "@/lib/erp-data";
import { getStoredCurrency } from "@/lib/currency";
import {
  Loader2,
  TrendingUp,
  ShoppingCart,
  Warehouse,
  Banknote,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getTopClients } from "@/lib/api/dashboard.service";
import { getRapportAchats, getRapportVentes } from "@/lib/api/rapports.service";
import {
  EMPTY_DASHBOARD_OVERVIEW,
  useDashboardStore,
} from "@/stores/dashboard.store";

export const Route = createFileRoute("/_app/statistics")({
  head: () => ({ meta: [{ title: "Statistiques — AC ERP" }] }),
  component: StatsPage,
});

type TopClient = {
  client: string;
  chiffreAffaires: number;
};

type RapportFacture = {
  dateEmission?: string;
  totalTtc?: number | string;
  montantPaye?: number | string;
};

type DailyPoint = {
  date: string;
  ventes: number;
  achats: number;
  marge: number;
  paiements: number;
};

const pieColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];
const grid = "var(--border)";
const axis = "var(--muted-foreground)";

const toNumber = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const responseData = <T,>(response: unknown): T[] => {
  if (!response || typeof response !== "object" || !("data" in response)) {
    return [];
  }
  const data = (response as { data?: unknown }).data;
  return Array.isArray(data) ? (data as T[]) : [];
};

const dateInputValue = (date: Date) => date.toISOString().slice(0, 10);

const dayKey = (value?: string) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const shortDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });

function StatsPage() {
  const [currencyCode, setCurrencyCode] = useState(() => getStoredCurrency());
  const [topClients, setTopClients] = useState<TopClient[]>([]);
  const [dailyData, setDailyData] = useState<DailyPoint[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const dashboardData = useDashboardStore((state) => state.data);
  const loading = useDashboardStore((state) => state.loading);
  const fetchOverview = useDashboardStore((state) => state.fetchOverview);

  useEffect(() => {
    const handleCurrencyChange = () => setCurrencyCode(getStoredCurrency());

    window.addEventListener("erp:currency-changed", handleCurrencyChange);
    window.addEventListener("storage", handleCurrencyChange);

    void fetchOverview().catch(() =>
      toast.error("Impossible de charger les statistiques"),
    );

    return () => {
      window.removeEventListener("erp:currency-changed", handleCurrencyChange);
      window.removeEventListener("storage", handleCurrencyChange);
    };
  }, [currencyCode, fetchOverview]);

  useEffect(() => {
    let active = true;
    const end = new Date();
    const start = new Date(end.getFullYear() - 1, 0, 1);

    setAnalyticsLoading(true);
    Promise.all([
      getTopClients(),
      getRapportVentes({
        dateDebut: dateInputValue(start),
        dateFin: dateInputValue(end),
      }),
      getRapportAchats({
        dateDebut: dateInputValue(start),
        dateFin: dateInputValue(end),
      }),
    ])
      .then(([clientsResponse, ventesResponse, achatsResponse]) => {
        if (!active) return;

        setTopClients(responseData<TopClient>(clientsResponse));

        const grouped = new Map<string, DailyPoint>();
        const ensureDay = (date: string) => {
          const current = grouped.get(date);
          if (current) return current;
          const next = { date, ventes: 0, achats: 0, marge: 0, paiements: 0 };
          grouped.set(date, next);
          return next;
        };

        responseData<RapportFacture>(ventesResponse).forEach((facture) => {
          const date = dayKey(facture.dateEmission);
          if (!date) return;
          const point = ensureDay(date);
          point.ventes += toNumber(facture.totalTtc);
          point.paiements += toNumber(facture.montantPaye);
        });

        responseData<RapportFacture>(achatsResponse).forEach((facture) => {
          const date = dayKey(facture.dateEmission);
          if (!date) return;
          const point = ensureDay(date);
          point.achats += toNumber(facture.totalTtc);
        });

        setDailyData(
          Array.from(grouped.values())
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((point) => ({
              ...point,
              marge: point.ventes - point.achats,
            })),
        );
      })
      .catch(() =>
        toast.error("Impossible de charger les séries analytiques détaillées"),
      )
      .finally(() => active && setAnalyticsLoading(false));

    return () => {
      active = false;
    };
  }, []);

  const { salesTrend, topProducts, stockSplit, globalStats } =
    dashboardData || EMPTY_DASHBOARD_OVERVIEW;
  const stats = globalStats;
  const chartLoading = loading || analyticsLoading;
  const stockRotation =
    stats && stats.valeurStock > 0 ? stats.totalAchats / stats.valeurStock : 0;

  const monthlyData = useMemo(
    () =>
      salesTrend.map((item) => ({
        ...item,
        marge: toNumber(item.ventes) - toNumber(item.achats),
      })),
    [salesTrend],
  );

  const financeStructure = useMemo(
    () => [
      { name: "CA", value: stats?.totalVentes ?? 0 },
      { name: "Achats", value: stats?.totalAchats ?? 0 },
      { name: "Marge", value: stats?.margeBrute ?? 0 },
      { name: "Paiements", value: stats?.paiementsRecus ?? 0 },
    ],
    [stats],
  );

  return (
    <>
      <PageHeader
        title="Statistiques & analyses"
        description="Indicateurs ventes, achats, stocks et finances"
        breadcrumb={["Intelligence", "Statistiques"]}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex h-32 items-center justify-center rounded-lg border border-border bg-muted/40"
            >
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              label="Ventes (an)"
              value={fmtCurrency(stats?.totalVentes ?? 0, currencyCode)}
              sub={`cumulé ${stats?.annee ?? new Date().getFullYear()}`}
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <StatCard
              label="Achats (an)"
              value={fmtCurrency(stats?.totalAchats ?? 0, currencyCode)}
              sub={`cumulé ${stats?.annee ?? new Date().getFullYear()}`}
              icon={<ShoppingCart className="h-5 w-5" />}
            />
            <StatCard
              label="Marge brute"
              value={`${(stats?.margeBrutePourcentage ?? 0).toFixed(1).replace(".", ",")} %`}
              sub={fmtCurrency(stats?.margeBrute ?? 0, currencyCode)}
              icon={<Banknote className="h-5 w-5" />}
            />
            <StatCard
              label="Rotation stock"
              value={`${stockRotation.toFixed(1).replace(".", ",")}x`}
              sub="par an"
              icon={<Warehouse className="h-5 w-5" />}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          title="CA mensuel"
          description="Chiffre d'affaires"
          headerGradient
        >
          <ChartFrame loading={loading} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ left: -10, right: 8 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={grid}
                  vertical={false}
                />
                <XAxis
                  dataKey="mois"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke={axis}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke={axis}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  formatter={(v: number) => fmtCurrency(v, currencyCode)}
                />
                <Area
                  type="monotone"
                  dataKey="ventes"
                  name="CA"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  fill="var(--chart-1)"
                  fillOpacity={0.18}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartFrame>
        </SectionCard>

        <SectionCard
          title="Achats mensuels"
          description="Dépenses fournisseurs"
          headerGradient
        >
          <ChartFrame loading={loading} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ left: -10, right: 8 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={grid}
                  vertical={false}
                />
                <XAxis
                  dataKey="mois"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke={axis}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke={axis}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  formatter={(v: number) => fmtCurrency(v, currencyCode)}
                />
                <Bar
                  dataKey="achats"
                  name="Achats"
                  fill="var(--chart-3)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </SectionCard>

        <SectionCard
          title="Marge mensuelle"
          description="Ventes moins achats"
          headerGradient
        >
          <ChartFrame loading={loading} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ left: -10, right: 8 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={grid}
                  vertical={false}
                />
                <XAxis
                  dataKey="mois"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke={axis}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke={axis}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  formatter={(v: number) => fmtCurrency(v, currencyCode)}
                />
                <Bar
                  dataKey="marge"
                  name="Marge"
                  fill="var(--chart-2)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </SectionCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard
          title="Ventes vs achats"
          description="Comparatif mensuel"
          headerGradient
        >
          <ChartFrame loading={loading} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={monthlyData}
                margin={{ left: -10, right: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={grid}
                  vertical={false}
                />
                <XAxis
                  dataKey="mois"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke={axis}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke={axis}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  formatter={(v: number) => fmtCurrency(v, currencyCode)}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="achats"
                  name="Achats"
                  fill="var(--chart-3)"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="ventes"
                  name="Ventes"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartFrame>
        </SectionCard>

        <SectionCard
          title="Structure financière"
          description="CA, achats, marge et paiements"
          headerGradient
        >
          <ChartFrame loading={loading} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={financeStructure}
                margin={{ left: -10, right: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={grid}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke={axis}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke={axis}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  formatter={(v: number) => fmtCurrency(v, currencyCode)}
                />
                <Bar dataKey="value" name="Montant" radius={[4, 4, 0, 0]}>
                  {financeStructure.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </SectionCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          title="Top produits"
          description="Unités vendues"
          headerGradient
        >
          <ChartFrame loading={loading} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ left: 32, right: 16 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={grid}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke={axis}
                />
                <YAxis
                  type="category"
                  dataKey="nom"
                  tickLine={false}
                  axisLine={false}
                  width={130}
                  fontSize={10}
                  stroke={axis}
                />
                <Tooltip cursor={{ fill: "var(--secondary)" }} />
                <Bar
                  dataKey="ventes"
                  name="Unités"
                  fill="var(--chart-2)"
                  radius={[0, 4, 4, 0]}
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </SectionCard>

        <SectionCard
          title="Top clients"
          description="Chiffre d'affaires"
          headerGradient
        >
          <ChartFrame loading={chartLoading} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topClients}
                layout="vertical"
                margin={{ left: 32, right: 16 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={grid}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke={axis}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <YAxis
                  type="category"
                  dataKey="client"
                  tickLine={false}
                  axisLine={false}
                  width={130}
                  fontSize={10}
                  stroke={axis}
                />
                <Tooltip
                  formatter={(v: number) => fmtCurrency(v, currencyCode)}
                  cursor={{ fill: "var(--secondary)" }}
                />
                <Bar
                  dataKey="chiffreAffaires"
                  name="CA"
                  fill="var(--chart-1)"
                  radius={[0, 4, 4, 0]}
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </SectionCard>

        <SectionCard
          title="Répartition des stocks"
          description="Par catégorie"
          headerGradient
        >
          <ChartFrame loading={loading} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockSplit}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={82}
                  paddingAngle={3}
                >
                  {stockSplit.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number, n: string) => [`${v} %`, n]} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartFrame>
        </SectionCard>
      </div>

      <div className="mt-4">
        <SectionCard
          title="Historique journalier de l'activité"
          description="Ventes, achats, marge et paiements sur longue période"
          headerGradient
        >
          <ChartFrame loading={chartLoading} className="h-[520px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={dailyData}
                margin={{ left: -10, right: 20, top: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={grid}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  minTickGap={28}
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke={axis}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke={axis}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  labelFormatter={(label) =>
                    new Date(`${label}T00:00:00`).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  }
                  formatter={(v: number) => fmtCurrency(v, currencyCode)}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="ventes"
                  name="Ventes"
                  stroke="var(--chart-1)"
                  fill="var(--chart-1)"
                  fillOpacity={0.12}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="achats"
                  name="Achats"
                  stroke="var(--chart-3)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="marge"
                  name="Marge"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="paiements"
                  name="Paiements"
                  stroke="var(--chart-4)"
                  strokeWidth={1.8}
                  dot={false}
                  isAnimationActive={false}
                />
                <Brush
                  dataKey="date"
                  height={28}
                  stroke="var(--primary)"
                  tickFormatter={shortDate}
                  travellerWidth={10}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartFrame>
        </SectionCard>
      </div>
    </>
  );
}
