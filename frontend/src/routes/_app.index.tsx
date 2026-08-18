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
import { useEffect, useState } from "react";
import {
  getDashboardPdf,
  getDashboardOverview,
  type DashboardOverview,
} from "@/lib/api/dashboard.service";
import { getStoredCurrency } from "@/lib/currency";
import { fmtCurrency } from "@/lib/erp-data";
import { toast } from "sonner";

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
  warning: "bg-warning/12 text-warning-foreground",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/12 text-info",
  success: "bg-success/12 text-success",
};

const pieColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-pop">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((p: any) => (
        <p
          key={p.dataKey}
          className="flex items-center gap-1.5 text-muted-foreground"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: p.color }}
          />
          {p.name}:{" "}
          <span className="font-medium text-foreground">
            {fmtCurrency(p.value)}
          </span>
        </p>
      ))}
    </div>
  );
}

function Dashboard() {
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
  const [exporting, setExporting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleCurrencyChange = () => setCurrencyCode(getStoredCurrency());

    window.addEventListener("erp:currency-changed", handleCurrencyChange);
    window.addEventListener("storage", handleCurrencyChange);

    async function loadDashboard() {
      try {
        setLoading(true);
        const response = await getDashboardOverview();
        if (response?.data) setDashboardData(response.data);
      } catch {
        toast.error("Impossible de charger le tableau de bord");
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      window.removeEventListener("erp:currency-changed", handleCurrencyChange);
      window.removeEventListener("storage", handleCurrencyChange);
    };
  }, [currencyCode]);

  const { kpis, salesTrend, topProducts, stockSplit, recentSales, alerts } =
    dashboardData;

  const exportDashboard = async () => {
    try {
      setExporting(true);
      const blob = (await getDashboardPdf()) as unknown as Blob;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dashboard-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("PDF du dashboard exporte");
    } catch {
      toast.error("Export PDF impossible");
    } finally {
      setExporting(false);
    }
  };

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
      toast.error("Impossible de generer l'apercu PDF");
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description="Vue decisionnelle de votre activite commerciale"
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
              Apercu
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={exportDashboard}
              disabled={loading || exporting}
            >
              <Download className="h-4 w-4" />{" "}
              {exporting ? "Export..." : "Exporter"}
            </Button>
            <Button size="sm" className="gap-1.5" asChild>
              <Link to="/sales">
                <Plus className="h-4 w-4" /> Nouvelle vente
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-lg border border-border bg-muted/40"
              />
            ))
          : kpis.map((k) => (
              <StatCard key={k.label} {...k} icon={kpiIcons[k.icon]} />
            ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          title="Evolution des ventes & achats"
          description="Chiffre d'affaires mensuel sur 12 mois"
          className="lg:col-span-2"
        >
          <ChartFrame loading={loading} className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesTrend}
                margin={{ left: -10, right: 8, top: 8 }}
              >
                <defs>
                  <linearGradient id="gVentes" x1="0" y1="0" x2="0" y2="1">
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
                  <linearGradient id="gAchats" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--chart-3)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chart-3)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
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
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="ventes"
                  name="Ventes"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  fill="url(#gVentes)"
                />
                <Area
                  type="monotone"
                  dataKey="achats"
                  name="Achats"
                  stroke="var(--chart-3)"
                  strokeWidth={2.5}
                  fill="url(#gAchats)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartFrame>
        </SectionCard>
        <SectionCard
          title="Repartition des stocks"
          description="Par categorie de produits"
        >
          <ChartFrame loading={loading} className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockSplit}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={88}
                  paddingAngle={3}
                >
                  {stockSplit.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                  formatter={(v: number, n: string) => [`${v} %`, n]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartFrame>
        </SectionCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          title="Produits les plus vendus"
          description="Top 5 ce mois-ci"
          className="lg:col-span-2"
        >
          <ChartFrame loading={loading} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ left: 40, right: 16 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  type="category"
                  dataKey="nom"
                  tickLine={false}
                  axisLine={false}
                  width={150}
                  fontSize={11}
                  stroke="var(--muted-foreground)"
                />
                <Tooltip
                  cursor={{ fill: "var(--secondary)" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="ventes"
                  name="Unites vendues"
                  fill="var(--chart-1)"
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </SectionCard>
        <SectionCard
          title="Alertes & notifications"
          description="Elements necessitant votre attention"
        >
          <div className="space-y-3">
            {alerts.map((a) => (
              <div
                key={a.title}
                className="flex items-start gap-3 rounded-lg border border-border p-3"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${alertStyles[a.type]}`}
                >
                  {alertIcons[a.icon]}
                </span>
                <div className="min-w-0">
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

      <div className="mt-4">
        <SectionCard
          title="Dernieres ventes"
          description="Activite recente"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/sales">Tout voir</Link>
            </Button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 font-medium">Reference</th>
                  <th className="pb-2 font-medium">Client</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 text-right font-medium">Montant</th>
                  <th className="pb-2 text-right font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((s) => (
                  <tr
                    key={s.ref}
                    className="border-b border-border/60 last:border-0 hover:bg-secondary/40"
                  >
                    <td className="py-3 font-medium text-foreground">
                      {s.ref}
                    </td>
                    <td className="py-3 text-muted-foreground">{s.client}</td>
                    <td className="py-3 text-muted-foreground">{s.date}</td>
                    <td className="py-3 text-right font-medium text-foreground">
                      {fmtCurrency(s.montant)}
                    </td>
                    <td className="py-3 text-right">
                      <StatusBadge status={s.statut} />
                    </td>
                  </tr>
                ))}
                {recentSales.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-5 text-center text-sm text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center py-5 text-center">
                        <img
                          src="/src/assets/sorry.svg"
                          alt="Aucun element"
                          className="mb-3 w-28 opacity-90"
                        />
                        <p className="text-sm font-medium text-muted-foreground">
                          Aucun element a afficher
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
        title="Apercu PDF"
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
                toast.success("PDF telecharge");
              }}
            >
              <Download className="mr-2 h-4 w-4" /> Telecharger
            </Button>
          </div>
        }
      >
        {previewUrl ? (
          <iframe
            src={previewUrl}
            className="h-[70vh] w-full rounded-lg border border-border"
            title="Apercu PDF dashboard"
          />
        ) : (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generation du
            PDF...
          </div>
        )}
      </AppModal>
    </>
  );
}
