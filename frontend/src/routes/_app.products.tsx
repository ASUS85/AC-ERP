import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Download,
  FileDown,
  Loader2,
  Package,
  Pencil,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import {
  SectionCard,
  Toolbar,
  Pagination,
  StatCard,
} from "@/components/erp/widgets";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { AppModal } from "@/components/erp/AppModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { fmtCurrency, fmtNumber } from "@/lib/erp-data";
import { getCategories } from "@/lib/api/categories.service";
import {
  archiveProduit,
  createProduit,
  getProduits,
  updateProduit,
  type ProduitPayload,
} from "@/lib/api/produits.service";

export const Route = createFileRoute("/_app/products")({
  head: () => ({ meta: [{ title: "Produits — AC ERP" }] }),
  component: ProductsPage,
});

type ApiMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
type Category = { id: string; nom: string; statut?: string };
type Product = {
  id: string;
  reference: string;
  designation: string;
  description?: string | null;
  uniteMesure: ProduitPayload["uniteMesure"];
  prixAchatHt: number | string;
  prixVenteHt: number | string;
  tauxTva: number | string;
  stockMinimum: number;
  statut: "ACTIF" | "INACTIF" | "ARCHIVE";
  idCategorie: string;
  categorie?: Category | null;
  stock?: { stockActuel: number; stockReserve?: number } | null;
};

const emptyForm: ProduitPayload = {
  reference: "",
  designation: "",
  description: "",
  uniteMesure: "PIECE",
  prixAchatHt: 0,
  prixVenteHt: 0,
  tauxTva: 18,
  stockMinimum: 0,
  stockInitial: 0,
  idCategorie: "",
  statut: "ACTIF",
};

const units: Array<{ label: string; value: ProduitPayload["uniteMesure"] }> = [
  { label: "Pièce", value: "PIECE" },
  { label: "Kg", value: "KG" },
  { label: "Litre", value: "LITRE" },
  { label: "Mètre", value: "METRE" },
  { label: "M2", value: "M2" },
  { label: "Boîte", value: "BOITE" },
  { label: "Carton", value: "CARTON" },
];

type ApiErrorLike = { message?: string; details?: unknown };
const toApiError = (error: unknown): ApiErrorLike =>
  error && typeof error === "object" ? (error as ApiErrorLike) : {};

const responseData = <T,>(response: any): T[] =>
  Array.isArray(response?.data) ? response.data : [];

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<ApiMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pendingDeleteProduct, setPendingDeleteProduct] =
    useState<Product | null>(null);
  const [form, setForm] = useState<ProduitPayload>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const pageSize = 10;

  const loadCategories = async () => {
    const response = await getCategories({ limit: 500, statut: "ACTIF" });
    setCategories(responseData<Category>(response));
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await getProduits({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        categorieId: categoryFilter === "all" ? undefined : categoryFilter,
      });
      setProducts(responseData<Product>(response));
      setMeta(
        response?.meta || { total: 0, page, limit: pageSize, totalPages: 1 },
      );
    } catch {
      toast.error("Impossible de charger les produits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories().catch(() =>
      toast.error("Impossible de charger les catégories"),
    );
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [page, search, categoryFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter]);

  const stats = useMemo(() => {
    const total = meta.total;
    const actifs = products.filter((p) => p.statut === "ACTIF").length;
    const stockFaible = products.filter(
      (p) => Number(p.stock?.stockActuel || 0) <= Number(p.stockMinimum || 0),
    ).length;
    const ruptures = products.filter(
      (p) => Number(p.stock?.stockActuel || 0) <= 0,
    ).length;
    return { total, actifs, stockFaible, ruptures };
  }, [meta.total, products]);

  const filterOptions = [
    { label: "Toutes les catégories", value: "all" },
    ...categories.map((category) => ({
      label: category.nom,
      value: category.id,
    })),
  ];

  const setField = <K extends keyof ProduitPayload>(
    field: K,
    value: ProduitPayload[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: "" }));
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setErrors({});
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setErrors({});
    setForm({
      reference: product.reference || "",
      designation: product.designation || "",
      description: product.description || "",
      uniteMesure: product.uniteMesure || "PIECE",
      prixAchatHt: Number(product.prixAchatHt || 0),
      prixVenteHt: Number(product.prixVenteHt || 0),
      tauxTva: Number(product.tauxTva || 18),
      stockMinimum: Number(product.stockMinimum || 0),
      idCategorie: product.idCategorie || product.categorie?.id || "",
      statut: product.statut || "ACTIF",
    });
    setModalOpen(true);
  };

  const openDeleteModal = (product: Product) => {
    setPendingDeleteProduct(product);
    setDeleteModalOpen(true);
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.designation.trim())
      nextErrors.designation = "La désignation est obligatoire";
    if (!form.uniteMesure) nextErrors.uniteMesure = "L’unité est obligatoire";
    if (!form.idCategorie)
      nextErrors.idCategorie = "La catégorie est obligatoire";
    if (Number(form.prixAchatHt) < 0)
      nextErrors.prixAchatHt = "Le prix d’achat doit être positif";
    if (Number(form.prixVenteHt) <= 0)
      nextErrors.prixVenteHt = "Le prix de vente est obligatoire";
    if (Number(form.tauxTva || 0) < 0)
      nextErrors.tauxTva = "La TVA doit être positive";
    if (Number(form.stockMinimum || 0) < 0)
      nextErrors.stockMinimum = "Le stock minimum doit être positif";
    if (!editingProduct && Number(form.stockInitial || 0) < 0)
      nextErrors.stockInitial = "Le stock initial doit être positif";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        reference: form.reference?.trim() || undefined,
        description: form.description?.trim() || undefined,
        prixAchatHt: Number(form.prixAchatHt),
        prixVenteHt: Number(form.prixVenteHt),
        tauxTva: Number(form.tauxTva || 0),
        stockMinimum: Number(form.stockMinimum || 0),
        ...(!editingProduct
          ? { stockInitial: Number(form.stockInitial || 0) }
          : {}),
      };
      if (editingProduct) {
        await updateProduit(editingProduct.id, payload);
        toast.success("Produit modifié");
      } else {
        await createProduit(payload);
        toast.success("Produit ajouté");
      }
      setModalOpen(false);
      await loadProducts();
    } catch (error: unknown) {
      const apiError = toApiError(error);
      const details = apiError.details || {};
      const fieldErrors =
        details && typeof details === "object"
          ? Object.entries(details).reduce<Record<string, string>>(
              (acc, [key, value]) => {
                if (typeof value === "string") acc[key] = value;
                return acc;
              },
              {},
            )
          : {};
      setErrors(fieldErrors);
      toast.error(apiError.message || "Échec de l’enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDeleteProduct) return;
    setDeleting(true);
    try {
      await archiveProduit(pendingDeleteProduct.id);
      toast.success("Produit archivé");
      setDeleteModalOpen(false);
      setPendingDeleteProduct(null);
      await loadProducts();
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast.error(apiError.message || "Suppression impossible");
    } finally {
      setDeleting(false);
    }
  };

  const exportProducts = async () => {
    setExporting(true);
    try {
      const response = await getProduits({
        limit: 10000,
        search: search.trim() || undefined,
        categorieId: categoryFilter === "all" ? undefined : categoryFilter,
      });
      const rows = responseData<Product>(response);
      const csvRows = [
        [
          "Référence",
          "Désignation",
          "Catégorie",
          "Unité",
          "Prix achat HT",
          "Prix vente HT",
          "TVA",
          "Stock",
          "Stock minimum",
          "Statut",
        ],
        ...rows.map((product) => [
          product.reference,
          product.designation,
          product.categorie?.nom || "",
          product.uniteMesure,
          String(product.prixAchatHt),
          String(product.prixVenteHt),
          String(product.tauxTva),
          String(product.stock?.stockActuel || 0),
          String(product.stockMinimum || 0),
          product.statut,
        ]),
      ];
      const csv = csvRows
        .map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"),
        )
        .join("\n");
      const blob = new Blob([`\uFEFF${csv}`], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `produits-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Liste des produits exportée");
    } catch {
      toast.error("Export impossible");
    } finally {
      setExporting(false);
    }
  };

  const cols: Column<Product>[] = [
    {
      key: "designation",
      header: "Produit",
      render: (product) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Package className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {product.designation}
            </p>
            <p className="text-xs text-muted-foreground">{product.reference}</p>
          </div>
        </div>
      ),
    },
    {
      key: "categorie",
      header: "Catégorie",
      render: (product) => product.categorie?.nom || "—",
    },
    {
      key: "prixVenteHt",
      header: "Prix",
      align: "right",
      render: (product) => (
        <span className="font-medium text-foreground">
          {fmtCurrency(Number(product.prixVenteHt || 0))}
        </span>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      align: "right",
      render: (product) => (
        <span className="text-foreground">
          {fmtNumber(Number(product.stock?.stockActuel || 0))}
        </span>
      ),
    },
    {
      key: "statut",
      header: "Statut",
      align: "right",
      render: (product) => <StatusBadge status={product.statut} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Produits"
        description="Catalogue et gestion des articles"
        breadcrumb={["Gestion commerciale", "Produits"]}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => void exportProducts()}
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Exporter
          </Button>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total produits"
          value={String(stats.total)}
          sub="en catalogue"
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          label="Actifs"
          value={String(stats.actifs)}
          sub="sur cette page"
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          label="Stock faible"
          value={String(stats.stockFaible)}
          sub="à réapprovisionner"
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          label="Ruptures"
          value={String(stats.ruptures)}
          sub="indisponibles"
          icon={<Package className="h-5 w-5" />}
        />
      </div>
      <SectionCard
        title="Catalogue produits"
        description={`${meta.total} produit${meta.total > 1 ? "s" : ""}`}
      >
        <div className="mb-4">
          <Toolbar
            placeholder="Rechercher un produit…"
            addLabel="Ajouter un produit"
            searchValue={search}
            onSearchChange={setSearch}
            filterOptions={filterOptions}
            selectedFilter={categoryFilter}
            onFilterChange={setCategoryFilter}
            onAdd={openCreateModal}
          />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Chargement…
          </div>
        ) : (
          <DataTable
            columns={cols}
            rows={products}
            rowKey={(product) => product.id}
            rowActions={(product) => [
              {
                label: "Modifier",
                icon: <Pencil className="h-4 w-4" />,
                onClick: () => openEditModal(product),
              },
              {
                label: "Supprimer",
                icon: <Trash2 className="h-4 w-4" />,
                destructive: true,
                onClick: () => openDeleteModal(product),
              },
            ]}
          />
        )}
        <Pagination
          count={meta.total}
          currentPage={page}
          totalPages={meta.totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </SectionCard>

      <AppModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingProduct ? "Modifier un produit" : "Ajouter un produit"}
        description="Renseignez les informations du catalogue."
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button onClick={() => void handleSubmit()} disabled={submitting}>
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {editingProduct ? "Enregistrer" : "Créer"}
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Référence" htmlFor="reference" error={errors.reference}>
            <Input
              id="reference"
              value={form.reference || ""}
              onChange={(e) => setField("reference", e.target.value)}
              placeholder="Automatique si vide"
            />
          </Field>
          <Field
            label="Désignation"
            htmlFor="designation"
            error={errors.designation}
          >
            <Input
              id="designation"
              value={form.designation}
              onChange={(e) => setField("designation", e.target.value)}
              placeholder="Nom du produit"
            />
          </Field>
          <Field
            label="Catégorie"
            htmlFor="categorie"
            error={errors.idCategorie}
          >
            <Select
              value={form.idCategorie}
              onValueChange={(value) => setField("idCategorie", value)}
            >
              <SelectTrigger id="categorie">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Unité" htmlFor="uniteMesure" error={errors.uniteMesure}>
            <Select
              value={form.uniteMesure}
              onValueChange={(value: ProduitPayload["uniteMesure"]) =>
                setField("uniteMesure", value)
              }
            >
              <SelectTrigger id="uniteMesure">
                <SelectValue placeholder="Sélectionner une unité" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field
            label="Prix d’achat HT"
            htmlFor="prixAchatHt"
            error={errors.prixAchatHt}
          >
            <Input
              id="prixAchatHt"
              type="number"
              min="0"
              value={form.prixAchatHt}
              onChange={(e) => setField("prixAchatHt", Number(e.target.value))}
            />
          </Field>
          <Field
            label="Prix de vente HT"
            htmlFor="prixVenteHt"
            error={errors.prixVenteHt}
          >
            <Input
              id="prixVenteHt"
              type="number"
              min="0"
              value={form.prixVenteHt}
              onChange={(e) => setField("prixVenteHt", Number(e.target.value))}
            />
          </Field>
          <Field label="Taux TVA (%)" htmlFor="tauxTva" error={errors.tauxTva}>
            <Input
              id="tauxTva"
              type="number"
              min="0"
              value={form.tauxTva}
              onChange={(e) => setField("tauxTva", Number(e.target.value))}
            />
          </Field>
          <Field
            label="Stock minimum"
            htmlFor="stockMinimum"
            error={errors.stockMinimum}
          >
            <Input
              id="stockMinimum"
              type="number"
              min="0"
              value={form.stockMinimum}
              onChange={(e) => setField("stockMinimum", Number(e.target.value))}
            />
          </Field>
          {!editingProduct ? (
            <Field
              label="Stock initial"
              htmlFor="stockInitial"
              error={errors.stockInitial}
            >
              <Input
                id="stockInitial"
                type="number"
                min="0"
                value={form.stockInitial}
                onChange={(e) =>
                  setField("stockInitial", Number(e.target.value))
                }
              />
            </Field>
          ) : null}
          <Field label="Statut" htmlFor="statut" error={errors.statut}>
            <Select
              value={form.statut || "ACTIF"}
              onValueChange={(value: ProduitPayload["statut"]) =>
                setField("statut", value)
              }
            >
              <SelectTrigger id="statut">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIF">Actif</SelectItem>
                <SelectItem value="INACTIF">Inactif</SelectItem>
                <SelectItem value="ARCHIVE">Archivé</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field
            label="Description"
            htmlFor="description"
            error={errors.description}
            className="md:col-span-2"
          >
            <Textarea
              id="description"
              value={form.description || ""}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Description courte du produit"
            />
          </Field>
        </div>
      </AppModal>

      <AppModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Confirmer la suppression"
        description="Le produit sera archivé s’il peut être retiré du catalogue."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Supprimer
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          Voulez-vous vraiment supprimer{" "}
          <span className="font-semibold text-foreground">
            {pendingDeleteProduct?.designation}
          </span>{" "}
          ?
        </p>
      </AppModal>
    </>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className || ""}`}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
