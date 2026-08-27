import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Banknote,
  Receipt,
  Users,
  Package,
  Warehouse,
  Truck,
  Download,
  Plus,
  AlertTriangle,
  FileWarning,
  Sparkles,
  Target,
  Eye,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { StatCard, SectionCard } from "@/components/erp/widgets";
import { ChartFrame } from "@/components/erp/ChartFrame";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { AppModal } from "@/components/erp/AppModal";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { getDashboardPdf } from "@/lib/api/dashboard.service";
import { getStoredCurrency } from "@/lib/currency";
import { fmtCurrency } from "@/lib/erp-data";
import { toast } from "sonner";
import {
  EMPTY_DASHBOARD_OVERVIEW,
  useDashboardStore,
} from "@/stores/dashboard.store";
import { getLast12CompletedMonths } from "@/components/helper/getlast12Monts";
export const Route = createFileRoute("/_app/")({
  head: () => ({ meta: [{ title: "Tableau de bord — AC ERP" }] }),
  component: Dashboard,
});

const kpiIcons: Record<string, React.ReactNode> = {
  revenue: <Banknote className="h-5 w-5" />,
  sales: <Receipt className="h-5 w-5" />,
  customers: <Users className="h-5 w-5" />,
  products: <Package className="h-5 w-5" />,
  stock: <Warehouse className="h-5 w-5" />,
  suppliers: <Truck className="h-5 w-5" />,
};

const alertIcons: Record<string, React.ReactNode> = {
  stock: <AlertTriangle className="h-4 w-4" />,
  invoice: <FileWarning className="h-4 w-4" />,
  ai: <Sparkles className="h-4 w-4" />,
  goal: <Target className="h-4 w-4" />,
};

const alertStyles: Record<string, string> = {
  warning: "bg-warning/12 text-warning-foreground border-warning/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-info/12 text-info border-info/20",
  success: "bg-success/12 text-success border-success/20",
};

const pieColors = [
  "#2563eb",
  "#0d9488",
  "#d97706",
  "#16a34a",
  "#dc2626",
  "#8b5cf6",
];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/80 bg-popover/95 p-3 text-xs shadow-xl backdrop-blur-md">
      <p className="mb-1.5 font-semibold text-foreground">{label}</p>
      {payload.map((p: any) => (
        <p
          key={p.dataKey || p.name}
          className="flex items-center gap-2 py-0.5 text-muted-foreground"
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: p.color || p.fill }}
          />
          <span className="capitalize">{p.name || p.dataKey}:</span>
          <span className="font-semibold text-foreground">
            {typeof p.value === "number" ? fmtCurrency(p.value) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

function Dashboard() {
  const [currencyCode, setCurrencyCode] = useState(() => getStoredCurrency());
  const dashboardData = useDashboardStore((state) => state.data);
  const loading = useDashboardStore((state) => state.loading);
  const fetchOverview = useDashboardStore((state) => state.fetchOverview);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleCurrencyChange = () => setCurrencyCode(getStoredCurrency());

    window.addEventListener("erp:currency-changed", handleCurrencyChange);
    window.addEventListener("storage", handleCurrencyChange);

    void fetchOverview().catch(() =>
      toast.error("Impossible de charger le tableau de bord"),
    );

    return () => {
      window.removeEventListener("erp:currency-changed", handleCurrencyChange);
      window.removeEventListener("storage", handleCurrencyChange);
    };
  }, [currencyCode, fetchOverview]);

  const { kpis, salesTrend, topProducts, stockSplit, recentSales, alerts } =
    dashboardData || EMPTY_DASHBOARD_OVERVIEW;

  // Calcul combiné pour la section Marge / Ventes / Achats
  const margeTrend = useMemo(
    () =>
      salesTrend.map((t) => {
        const v = Number(t.ventes || 0);
        const a = Number(t.achats || 0);
        return {
          mois: t.mois,
          ventes: v,
          achats: a,
          marge: v - a,
        };
      }),
    [salesTrend],
  );

  const margeTrendCompleted = useMemo(
    () => getLast12CompletedMonths(margeTrend, "mois"),
    [salesTrend],
  );
  const salesTrendCompleted = useMemo(
    () => getLast12CompletedMonths(salesTrend, "mois"),
    [salesTrend],
  );

  const totalStockUnits = useMemo(
    () => stockSplit.reduce((acc, curr) => acc + (curr.value || 0), 0),
    [stockSplit],
  );

  const statusSplit = useMemo(() => {
    const counts = new Map<string, number>();
    recentSales.forEach((s) => {
      counts.set(s.statut, (counts.get(s.statut) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [recentSales]);

  const visibleAlerts = useMemo(
    () =>
      alerts
        .map((alert, index) => ({
          alert,
          index,
          createdTime: alert.createdAt
            ? new Date(alert.createdAt).getTime()
            : Number.NaN,
        }))
        .sort((a, b) => {
          if (Number.isNaN(a.createdTime) || Number.isNaN(b.createdTime)) {
            return a.index - b.index;
          }
          return a.createdTime - b.createdTime;
        })
        .slice(-3)
        .map(({ alert }) => alert),
    [alerts],
  );

  const openPreview = async () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewLoading(true);
    try {
      const blob = (await getDashboardPdf()) as unknown as Blob;
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewOpen(true);
    } catch {
      toast.error("Impossible de générer l'aperçu PDF");
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description="Vue décisionnelle de votre activité commerciale"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => void openPreview()}
              disabled={previewLoading}
            >
              {previewLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Aperçu
            </Button>
            <Button size="sm" className="gap-1.5 shadow-sm" asChild>
              <Link to="/sales">
                <Plus className="h-4 w-4" /> Nouvelle vente
              </Link>
            </Button>
          </>
        }
      />

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl border border-border/60 bg-muted/30"
              />
            ))
          : kpis.map((k) => (
              <StatCard key={k.label} {...k} icon={kpiIcons[k.icon]} />
            ))}
      </div>

      {/* Ligne 1 des Graphes */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          title="Évolution des ventes & achats"
          description="Chiffre d'affaires mensuel des derniers mois"
          headerGradient
        >
          <ChartFrame loading={loading} className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesTrendCompleted}
                margin={{ left: -10, right: 8, top: 12, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gVentes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gAchats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  opacity={0.5}
                  vertical={false}
                />
                <XAxis
                  dataKey="mois"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="var(--muted-foreground)"
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                />
                <Area
                  type="monotone"
                  dataKey="ventes"
                  name="Ventes"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fill="url(#gVentes)"
                />
                <Area
                  type="monotone"
                  dataKey="achats"
                  name="Achats"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fill="url(#gAchats)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartFrame>
        </SectionCard>

        {/* Donut Données de Stock avec Compteur central */}
        <SectionCard
          title="Répartition des stocks"
          description="Par catégorie de produits"
          headerGradient
        >
          <ChartFrame loading={loading} className="relative h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockSplit}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  cornerRadius={4}
                >
                  {stockSplit.map((_, i) => (
                    <Cell
                      key={i}
                      fill={pieColors[i % pieColors.length]}
                      stroke="var(--background)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
                />
              </PieChart>
            </ResponsiveContainer>
            {!loading && totalStockUnits > 0 && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
                <span className="text-xl font-bold text-foreground">
                  {totalStockUnits}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Produits
                </span>
              </div>
            )}
          </ChartFrame>
        </SectionCard>

        {/* Multi-Bars Marge / Ventes / Achats */}
        <SectionCard
          title="Marge mensuelle"
          description="Aperçu comparatif des derniers mois"
          headerGradient
        >
          <ChartFrame loading={loading} className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={margeTrendCompleted}
                margin={{ left: -10, right: 8, top: 12, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  opacity={0.5}
                  vertical={false}
                />
                <XAxis
                  dataKey="mois"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="var(--muted-foreground)"
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                />
                <Bar
                  dataKey="marge"
                  name="Marge"
                  fill="#0d9488"
                  radius={[4, 4, 0, 0]}
                  barSize={10}
                />
                <Bar
                  dataKey="ventes"
                  name="Ventes"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                  barSize={10}
                />
                <Bar
                  dataKey="achats"
                  name="Achats"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  barSize={10}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </SectionCard>
      </div>

      {/* Ligne 2 des Graphes */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          title="Produits les plus vendus"
          description="Top 5 du mois"
          headerGradient
        >
          <ChartFrame loading={loading} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ left: 10, right: 16, top: 10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  opacity={0.5}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  type="category"
                  dataKey="nom"
                  tickLine={false}
                  axisLine={false}
                  width={110}
                  fontSize={11}
                  stroke="var(--muted-foreground)"
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="ventes"
                  name="Unités vendues"
                  fill="#2563eb"
                  radius={[0, 4, 4, 0]}
                  barSize={14}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </SectionCard>

        <SectionCard
          title="Ventes récentes par statut"
          description="Répartition actuelle"
          headerGradient
        >
          <ChartFrame loading={loading} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusSplit}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  cornerRadius={4}
                >
                  {statusSplit.map((_, i) => (
                    <Cell
                      key={i}
                      fill={pieColors[i % pieColors.length]}
                      stroke="var(--background)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartFrame>
        </SectionCard>

        <SectionCard
          title="Alertes & notifications"
          description="Éléments nécessitant votre attention"
          headerGradient
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/notifications">Tout voir</Link>
            </Button>
          }
        >
          <div className="grid grid-cols-1 gap-2.5">
            {visibleAlerts.map((a) => (
              <div
                key={a.title}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-sm transition-all hover:border-border"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${alertStyles[a.type]}`}
                >
                  {alertIcons[a.icon]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {a.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{a.text}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Tableau des ventes */}
      <div className="mt-4">
        <SectionCard
          title="Dernières ventes"
          description="Activité récente"
          headerGradient
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/sales">Tout voir</Link>
            </Button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/80 bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-2.5 font-semibold">Référence</th>
                  <th className="px-3 py-2.5 font-semibold">Client</th>
                  <th className="px-3 py-2.5 font-semibold">Date</th>
                  <th className="px-3 py-2.5 text-right font-semibold">
                    Montant
                  </th>
                  <th className="px-3 py-2.5 text-right font-semibold">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((s) => (
                  <tr
                    key={s.ref}
                    className="border-b border-border/40 transition-colors hover:bg-muted/30 last:border-0"
                  >
                    <td className="px-3 py-3 font-mono font-medium text-foreground">
                      {s.ref}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {s.client}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {s.date}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-foreground">
                      {fmtCurrency(s.montant)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <StatusBadge status={s.statut} />
                    </td>
                  </tr>
                ))}
                {recentSales.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center text-center">
                        <img
                          src="/src/assets/sorry.svg"
                          alt="Aucun élément"
                          className="mb-3 w-24 opacity-80"
                        />
                        <p className="text-sm font-medium text-muted-foreground">
                          Aucun élément à afficher
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <AppModal
        open={previewOpen}
        onOpenChange={(open) => {
          if (!open && previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewOpen(open);
        }}
        title="Aperçu PDF"
        description="Rapport du tableau de bord"
        size="xxl"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewOpen(false);
              }}
            >
              Fermer
            </Button>
            <Button
              onClick={() => {
                if (!previewUrl) return;
                const link = document.createElement("a");
                link.href = previewUrl;
                link.download = `dashboard-${new Date().toISOString().slice(0, 10)}.pdf`;
                document.body.appendChild(link);
                link.click();
                link.remove();
                toast.success("PDF téléchargé");
              }}
            >
              <Download className="mr-2 h-4 w-4" /> Télécharger
            </Button>
          </div>
        }
      >
        {previewUrl ? (
          <iframe
            src={previewUrl}
            className="h-[70vh] w-full rounded-lg border border-border"
            title="Aperçu PDF dashboard"
          />
        ) : (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Génération du
            PDF...
          </div>
        )}
      </AppModal>
    </>
  );
}
