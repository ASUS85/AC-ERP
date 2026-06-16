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
import { salesTrend, stockSplit, topProducts, fmtCurrency } from "@/lib/erp-data";
import { TrendingUp, ShoppingCart, Warehouse, Banknote } from "lucide-react";

export const Route = createFileRoute("/_app/statistics")({
  head: () => ({ meta: [{ title: "Statistiques — AC ERP" }] }),
  component: StatsPage,
});

const pieColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const grid = "var(--border)";
const axis = "var(--muted-foreground)";

function StatsPage() {
  return (
    <>
      <PageHeader title="Statistiques & analyses" description="Indicateurs ventes, achats, stocks et finances" breadcrumb={["Intelligence", "Statistiques"]} />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Ventes (an)" value="780 300 €" delta="+14 %" up sub="cumulé 2026" icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Achats (an)" value="439 400 €" delta="+9 %" up sub="cumulé 2026" icon={<ShoppingCart className="h-5 w-5" />} />
        <StatCard label="Marge brute" value="43,7 %" delta="+2,1 pts" up sub="moyenne" icon={<Banknote className="h-5 w-5" />} />
        <StatCard label="Rotation stock" value="6,2x" sub="par an" icon={<Warehouse className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Ventes vs achats" description="Comparatif mensuel">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesTrend} margin={{ left: -10, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                <XAxis dataKey="mois" tickLine={false} axisLine={false} fontSize={11} stroke={axis} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke={axis} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${grid}`, fontSize: 12 }} formatter={(v: number) => fmtCurrency(v)} />
                <Bar dataKey="ventes" name="Ventes" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="achats" name="Achats" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Évolution du chiffre d'affaires" description="Tendance annuelle">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend} margin={{ left: -10, right: 8 }}>
                <defs>
                  <linearGradient id="gStat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                <XAxis dataKey="mois" tickLine={false} axisLine={false} fontSize={11} stroke={axis} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke={axis} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${grid}`, fontSize: 12 }} formatter={(v: number) => fmtCurrency(v)} />
                <Area type="monotone" dataKey="ventes" name="CA" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#gStat)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Répartition des stocks" description="Par catégorie">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stockSplit} dataKey="value" nameKey="name" outerRadius={90}>
                  {stockSplit.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${grid}`, fontSize: 12 }} formatter={(v: number, n: string) => [`${v} %`, n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Top produits" description="Meilleures ventes">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 40, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} stroke={axis} />
                <YAxis type="category" dataKey="nom" tickLine={false} axisLine={false} width={150} fontSize={10} stroke={axis} />
                <Tooltip cursor={{ fill: "var(--secondary)" }} contentStyle={{ borderRadius: 12, border: `1px solid ${grid}`, fontSize: 12 }} />
                <Bar dataKey="ventes" name="Unités" fill="var(--chart-2)" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </>
  );
}