import { useEffect, useMemo, useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  FolderTree,
  Folder,
  ChevronRight,
  ChevronDown,
  Loader2,
  Pencil,
  Trash2,
  Search,
  Plus,
  Check,
} from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard, Pagination, StatCard } from "@/components/erp/widgets";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { AppModal } from "@/components/erp/AppModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  createCategorie,
  updateCategorie,
  deleteCategorie,
  type CategoryPayload,
} from "@/lib/api/categories.service";
import { useCategoriesStore } from "@/stores/categories.store";
export const Route = createFileRoute("/_app/categories")({
  head: () => ({ meta: [{ title: "Categories — AC ERP" }] }),
  component: CategoriesPage,
});

type Categorie = {
  id: string;
  nom: string;
  description?: string | null;
  slug: string;
  icone?: string | null;
  idCategorieParent?: string | null;
  statut: "ACTIF" | "INACTIF";
  parent?: Categorie | null;
  enfants?: Categorie[];
  _count?: { produits: number; enfants: number };
};

type ArbreNode = {
  id: string;
  nom: string;
  _count?: { produits: number };
  enfants?: ArbreNode[];
};

const emptyForm: CategoryPayload = {
  nom: "",
  description: "",
  idCategorieParent: null,
  icone: "",
  statut: "ACTIF",
};

function CategoriesPage() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [allCategories, setAllCategories] = useState<Categorie[]>([]);
  const [arbre, setArbre] = useState<ArbreNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editing, setEditing] = useState<Categorie | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Categorie | null>(null);
  const [form, setForm] = useState<CategoryPayload>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const pageSize = 10;
  const fetchCategories = useCategoriesStore((state) => state.fetchList);
  const fetchCategoryTree = useCategoriesStore((state) => state.fetchTree);
  const invalidateCategories = useCategoriesStore((state) => state.invalidate);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, arbreRes, allCatRes] = await Promise.all([
        fetchCategories({ page, limit: pageSize, search: search || undefined }),
        fetchCategoryTree(),
        fetchCategories({ limit: 10000 }),
      ]);
      setCategories(((catRes as any)?.data || []) as Categorie[]);
      setMeta(
        (catRes as any)?.meta || {
          total: 0,
          page,
          limit: pageSize,
          totalPages: 1,
        },
      );
      setAllCategories(((allCatRes as any)?.data || []) as Categorie[]);
      setArbre(((arbreRes as any)?.data || []) as ArbreNode[]);
    } catch {
      toast.error("Impossible de charger les categories");
    } finally {
      setLoading(false);
    }
  }, [fetchCategories, fetchCategoryTree, page, search]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);
  useEffect(() => {
    setPage(1);
  }, [search]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const stats = useMemo(() => {
    const total = arbre.length;
    const totalProduits = arbre.reduce(
      (s, n) => s + (n._count?.produits || 0),
      0,
    );
    return { total, totalProduits };
  }, [arbre]);

  const setField = <K extends keyof CategoryPayload>(
    field: K,
    value: CategoryPayload[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const openCreateModal = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (cat: Categorie) => {
    setEditing(cat);
    setForm({
      nom: cat.nom || "",
      description: cat.description || "",
      idCategorieParent: cat.idCategorieParent || null,
      icone: cat.icone || "",
      statut: cat.statut,
    });
    setErrors({});
    setModalOpen(true);
  };

  const openDeleteModal = (cat: Categorie) => {
    setPendingDelete(cat);
    setDeleteModalOpen(true);
  };

  const validateForm = () => {
    const next: Record<string, string> = {};
    if (!form.nom.trim()) next.nom = "Le nom est obligatoire";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (editing) {
        await updateCategorie(editing.id, form);
        toast.success("Categorie modifiee");
      } else {
        await createCategorie(form);
        toast.success("Categorie ajoutee");
      }
      invalidateCategories();
      setModalOpen(false);
      await loadCategories();
    } catch (error: unknown) {
      const msg =
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Erreur lors de l'enregistrement";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteCategorie(pendingDelete.id);
      invalidateCategories();
      toast.success("Categorie supprimee");
      setDeleteModalOpen(false);
      setPendingDelete(null);
      await loadCategories();
    } catch (error: unknown) {
      const msg =
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Suppression impossible";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const parentOptions = allCategories
    .filter((c) => c.id !== editing?.id)
    .map((c) => ({ value: c.id, label: c.nom }));

  const cols: Column<Categorie>[] = [
    {
      key: "nom",
      header: "Categorie",
      render: (c) => (
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/12 text-info">
            <Folder className="h-4 w-4" />
          </span>
          <span className="font-medium text-foreground">{c.nom}</span>
        </div>
      ),
    },
    {
      key: "parent",
      header: "Parent",
      render: (c) => c.parent?.nom || "—",
    },
    {
      key: "description",
      header: "Description",
      render: (c) => c.description || "—",
    },
    {
      key: "statut",
      header: "Statut",
      align: "right",
      render: (c) => <StatusBadge status={c.statut} />,
    },
  ];

  /* ---------- Rendu recursif de l'arbre ---------- */
  const renderArbreNode = (node: ArbreNode, depth = 0) => {
    const hasChildren = node.enfants && node.enfants.length > 0;
    const isExpanded = expanded.has(node.id);
    return (
      <div key={node.id}>
        <button
          type="button"
          onClick={() => hasChildren && toggleExpand(node.id)}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary/60 ${depth > 0 ? "ml-4 border-l border-border pl-3" : ""}`}
        >
          <span className="flex items-center gap-2 text-foreground">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              )
            ) : (
              <span className="w-3.5" />
            )}
            <FolderTree className="h-4 w-4 text-primary" />
            {node.nom}
          </span>
          {node.enfants && node.enfants.length > 0 ? (
            <span className="text-xs text-muted-foreground">
              {node.enfants.length}
            </span>
          ) : null}
        </button>
        {hasChildren &&
          isExpanded &&
          node.enfants!.map((child) => renderArbreNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <>
      <PageHeader
        title="Categories"
        description="Organisation arborescente du catalogue"
        breadcrumb={["Gestion commerciale", "Categories"]}
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Categories"
          value={String(stats.total)}
          sub="racines"
          icon={<FolderTree className="h-5 w-5" />}
        />
        <StatCard
          label="Avec produits"
          value={String(stats.totalProduits)}
          sub="produits rattaches"
          icon={<Folder className="h-5 w-5" />}
        />
        <StatCard
          label="Sur cette page"
          value={String(meta.total)}
          sub="au total"
          icon={<Folder className="h-5 w-5" />}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Arborescence pliable */}
        <SectionCard
          title="Arborescence"
          description="Cliquez pour deplier / replier"
        >
          <div className="space-y-1">
            {arbre.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Aucune categorie racine
              </p>
            ) : (
              arbre.map((node) => renderArbreNode(node))
            )}
          </div>
        </SectionCard>

        {/* Tableau des categories */}
        <SectionCard
          title="Toutes les categories"
          className="lg:col-span-2"
          description={`${meta.total} categorie${meta.total > 1 ? "s" : ""}`}
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher une categorie..."
                className="h-9 pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              size="sm"
              className="gap-1.5 whitespace-nowrap"
              onClick={openCreateModal}
            >
              <Plus className="h-4 w-4" /> Nouvelle categorie
            </Button>
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <>
              <DataTable
                columns={cols}
                rows={categories}
                rowKey={(c) => c.id}
                rowActions={(cat) => [
                  {
                    label: "Modifier",
                    icon: <Pencil className="h-4 w-4" />,
                    onClick: () => openEditModal(cat),
                  },
                  {
                    label: "Supprimer",
                    icon: <Trash2 className="h-4 w-4" />,
                    destructive: true,
                    onClick: () => openDeleteModal(cat),
                  },
                ]}
              />
              <Pagination
                count={meta.total}
                currentPage={page}
                totalPages={meta.totalPages}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </>
          )}
        </SectionCard>
      </div>

      {/* Modale Create / Edit */}
      <AppModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Modifier une categorie" : "Ajouter une categorie"}
        description="Organisez votre catalogue par categories."
        size="lg"
        footer={
          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button disabled={submitting} onClick={() => void handleSubmit()}>
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {editing ? "Enregistrer" : "Creer"}
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nom" htmlFor="nom" error={errors.nom}>
            <span className="ml-1 text-destructive">*</span>
            <Input
              id="nom"
              value={form.nom}
              onChange={(e) => setField("nom", e.target.value)}
              placeholder="Nom de la categorie"
            />
          </Field>
          <Field label="Categorie parente" htmlFor="parent">
            <SearchableSelect
              value={form.idCategorieParent || ""}
              onValueChange={(value: string) =>
                setField("idCategorieParent", value || null)
              }
              options={parentOptions}
              placeholder="Selectionnez une categorie"
              searchPlaceholder="Rechercher une categorie"
              emptyMessage="Aucune categorie trouvee"
            />
          </Field>
          <Field label="Statut" htmlFor="statut">
            <Select
              value={form.statut}
              onValueChange={(value: "ACTIF" | "INACTIF") =>
                setField("statut", value)
              }
            >
              <SelectTrigger id="statut">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIF">Actif</SelectItem>
                <SelectItem value="INACTIF">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Icône" htmlFor="icone">
            <Input
              id="icone"
              value={form.icone || ""}
              onChange={(e) => setField("icone", e.target.value)}
              placeholder="Nom de l'icone"
            />
          </Field>
          <Field
            label="Description"
            htmlFor="description"
            className="md:col-span-2"
          >
            <Textarea
              id="description"
              value={form.description || ""}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Description facultative"
            />
          </Field>
        </div>
      </AppModal>

      {/* Modale Delete */}
      <AppModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Confirmer la suppression"
        description="La categorie sera supprimee definitivement."
        size="sm"
        footer={
          <div className="flex justify-between gap-2">
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
              ) : null}{" "}
              Supprimer
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          Voulez-vous vraiment supprimer{" "}
          <span className="font-semibold text-foreground">
            {pendingDelete?.nom}
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
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
