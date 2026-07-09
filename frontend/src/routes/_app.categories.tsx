import { createFileRoute } from "@tanstack/react-router";
import { FolderTree, Folder, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard, Toolbar } from "@/components/erp/widgets";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { categories } from "@/lib/erp-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/categories")({
  head: () => ({ meta: [{ title: "Catégories — AC ERP" }] }),
  component: CategoriesPage,
});

type C = (typeof categories)[number];
const cols: Column<C>[] = [
  {
    key: "nom",
    header: "Catégorie",
    render: (c) => (
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/12 text-info">
          <Folder className="h-4 w-4" />
        </span>
        <span className="font-medium text-foreground">{c.nom}</span>
      </div>
    ),
  },
  { key: "desc", header: "Description" },
  { key: "parent", header: "Parent" },
  {
    key: "produits",
    header: "Produits",
    align: "right",
    render: (c) => (
      <span className="font-medium text-foreground">{c.produits}</span>
    ),
  },
];

const tree = [
  {
    name: "Informatique",
    count: 642,
    children: ["Ordinateurs", "Composants", "Réseau"],
  },
  { name: "Accessoires", count: 458, children: ["Claviers & souris", "Audio"] },
  { name: "Mobilier", count: 214, children: ["Bureaux", "Sièges"] },
  {
    name: "Consommables",
    count: 392,
    children: ["Encre & toner", "Papeterie"],
  },
];

function CategoriesPage() {
  return (
    <>
      <PageHeader
        title="Catégories"
        description="Organisation arborescente du catalogue"
        breadcrumb={["Gestion commerciale", "Catégories"]}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          title="Arborescence"
          description="Structure des catégories"
        >
          <div className="space-y-1">
            {tree.map((t) => (
              <div key={t.name}>
                <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <FolderTree className="h-4 w-4 text-primary" /> {t.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t.count}
                  </span>
                </div>
                <ul className="ml-4 mt-1 space-y-0.5 border-l border-border pl-3">
                  {t.children.map((ch) => (
                    <li
                      key={ch}
                      className="flex items-center gap-1.5 py-1 text-sm text-muted-foreground"
                    >
                      <ChevronRight className="h-3.5 w-3.5" /> {ch}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Toutes les catégories" className="lg:col-span-2">
          <div className="mb-4">
            <Toolbar
              placeholder="Rechercher une catégorie…"
              addLabel="Nouvelle catégorie"
              onAdd={() => toast.info("Ajout de catégorie")}
            />
          </div>
          <DataTable columns={cols} rows={categories} rowKey={(c) => c.nom} />
        </SectionCard>
      </div>
    </>
  );
}
