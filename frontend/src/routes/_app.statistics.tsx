import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Pie,
  PieChart,
} from "recharts";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard, StatCard } from "@/components/erp/widgets";
import { ChartFrame } from "@/components/erp/ChartFrame";
import { fmtCurrency } from "@/lib/erp-data";
import {
  getDashboardOverview,
  type DashboardOverview,
} from "@/lib/api/dashboard.service";
import { getStoredCurrency } from "@/lib/currency";
import {
  Loader2,
  TrendingUp,
  ShoppingCart,
  Warehouse,
  Banknote,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/statistics")({
  head: () => ({ meta: [{ title: "Statistiques — AC ERP" }] }),
  component: StatsPage,
});

const pieColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];
const grid = "var(--border)";
const axis = "var(--muted-foreground)";

function StatsPage() {
  const [currencyCode, setCurrencyCode] = useState(() => getStoredCurrency());
  const [dashboardData, setDashboardData] = useState<DashboardOverview>({
    kpis: [],
    salesTrend: [],
    topProducts: [],
    stockSplit: [],
    recentSales: [],
    alerts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCurrencyChange = () => setCurrencyCode(getStoredCurrency());

    window.addEventListener("erp:currency-changed", handleCurrencyChange);
    window.addEventListener("storage", handleCurrencyChange);

    async function loadStatistics() {
      try {
        setLoading(true);
        const response = await getDashboardOverview();
        if (response?.data) setDashboardData(response.data);
      } catch {
        toast.error("Impossible de charger les statistiques");
      } finally {
        setLoading(false);
      }
    }

    void loadStatistics();

    return () => {
      window.removeEventListener("erp:currency-changed", handleCurrencyChange);
      window.removeEventListener("storage", handleCurrencyChange);
    };
  }, [currencyCode]);

  const { salesTrend, topProducts, stockSplit, globalStats } = dashboardData;
  const stats = globalStats;
  const stockRotation =
    stats && stats.valeurStock > 0 ? stats.totalAchats / stats.valeurStock : 0;

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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Ventes vs achats" description="Comparatif mensuel">
          <ChartFrame loading={loading} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesTrend} margin={{ left: -10, right: 8 }}>
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
                  contentStyle={{
                    borderRadius: 12,
                    border: `1px solid ${grid}`,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => fmtCurrency(v)}
                />
                <Bar
                  dataKey="ventes"
                  name="Ventes"
                  fill="var(--chart-1)"
                  radius={[4, 4, 0, 0]}
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
          title="Évolution du chiffre d'affaires"
          description="Tendance annuelle"
        >
          <ChartFrame loading={loading} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend} margin={{ left: -10, right: 8 }}>
                <defs>
                  <linearGradient id="gStat" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--chart-1)"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chart-1)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
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
                  contentStyle={{
                    borderRadius: 12,
                    border: `1px solid ${grid}`,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => fmtCurrency(v)}
                />
                <Area
                  type="monotone"
                  dataKey="ventes"
                  name="CA"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  fill="url(#gStat)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartFrame>
        </SectionCard>

        <SectionCard title="Répartition des stocks" description="Par catégorie">
          <ChartFrame loading={loading} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockSplit}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                >
                  {stockSplit.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: `1px solid ${grid}`,
                    fontSize: 12,
                  }}
                  formatter={(v: number, n: string) => [`${v} %`, n]}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartFrame>
        </SectionCard>

        <SectionCard title="Top produits" description="Meilleures ventes">
          <ChartFrame loading={loading} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ left: 40, right: 16 }}
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
                  width={150}
                  fontSize={10}
                  stroke={axis}
                />
                <Tooltip
                  cursor={{ fill: "var(--secondary)" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: `1px solid ${grid}`,
                    fontSize: 12,
                  }}
                />
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
      </div>
    </>
  );
}
