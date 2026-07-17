import { useEffect, useMemo, useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Truck,
  Package,
  ShoppingCart,
  Loader2,
  Pencil,
  Search,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard, Pagination, StatCard } from "@/components/erp/widgets";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { AppModal } from "@/components/erp/AppModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  getFournisseurs,
  getFournisseurById,
  createFournisseur,
  updateFournisseur,
} from "@/lib/api/fournisseurs.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fmtCurrency } from "@/lib/erp-data";

export const Route = createFileRoute("/_app/suppliers")({
  head: () => ({ meta: [{ title: "Fournisseurs — AC ERP" }] }),
  component: SuppliersPage,
});

type Fournisseur = {
  id: string;
  codeFournisseur: string;
  raisonSociale: string;
  email: string;
  telephone: string;
  adresse?: string | null;
  ville?: string | null;
  pays?: string | null;
  numeroFiscal?: string | null;
  delaiLivraisonMoyen: number;
  conditionsPaiement?: string | null;
  statut: "ACTIF" | "INACTIF";
};

type ApiMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const emptyForm: {
  raisonSociale: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  pays: string;
  numeroFiscal: string;
  delaiLivraisonMoyen: number;
  conditionsPaiement: string;
  statut: "ACTIF" | "INACTIF";
} = {
  raisonSociale: "",
  email: "",
  telephone: "",
  adresse: "",
  ville: "",
  pays: "Cameroun",
  numeroFiscal: "",
  delaiLivraisonMoyen: 7,
  conditionsPaiement: "",
  statut: "ACTIF",
};

function SuppliersPage() {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<ApiMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Fournisseur | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const pageSize = 10;

  const loadFournisseurs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getFournisseurs({
        page,
        limit: pageSize,
        search: search || undefined,
      });
      setFournisseurs(((response as any)?.data || []) as Fournisseur[]);
      setMeta(
        (response as any)?.meta || {
          total: 0,
          page,
          limit: pageSize,
          totalPages: 1,
        },
      );
    } catch {
      toast.error("Impossible de charger les fournisseurs");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void loadFournisseurs();
  }, [loadFournisseurs]);
  useEffect(() => {
    setPage(1);
  }, [search]);

  const setField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const stats = useMemo(() => {
    const total = meta.total;
    return {
      total,
      actifs: fournisseurs.filter((f) => f.statut === "ACTIF").length,
    };
  }, [meta.total, fournisseurs]);

  const openCreateModal = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = async (id: string) => {
    try {
      const response = await getFournisseurById(id);
      const f = ((response as any)?.data || {}) as Fournisseur;
      setEditing(f);
      setForm({
        raisonSociale: f.raisonSociale || "",
        email: f.email || "",
        telephone: f.telephone || "",
        adresse: f.adresse || "",
        ville: f.ville || "",
        pays: f.pays || "Cameroun",
        numeroFiscal: f.numeroFiscal || "",
        delaiLivraisonMoyen: f.delaiLivraisonMoyen || 7,
        conditionsPaiement: f.conditionsPaiement || "",
        statut: f.statut,
      });
      setErrors({});
      setModalOpen(true);
    } catch {
      toast.error("Impossible de charger le fournisseur");
    }
  };

  const validateForm = () => {
    const next: Record<string, string> = {};
    if (!form.raisonSociale.trim())
      next.raisonSociale = "La raison sociale est obligatoire";
    if (!form.email.trim()) next.email = "L'email est obligatoire";
    if (!form.telephone.trim()) next.telephone = "Le téléphone est obligatoire";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (editing) {
        await updateFournisseur(editing.id, form);
        toast.success("Fournisseur modifie");
      } else {
        await createFournisseur(form);
        toast.success("Fournisseur ajoute");
      }
      setModalOpen(false);
      await loadFournisseurs();
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

  const cols: Column<Fournisseur>[] = [
    {
      key: "raisonSociale",
      header: "Fournisseur",
      render: (s) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/15 text-warning-foreground">
            <Truck className="h-4 w-4" />
          </span>
          <div>
            <p className="font-medium text-foreground">{s.raisonSociale}</p>
            <p className="text-xs text-muted-foreground">{s.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "numeroFiscal",
      header: "N° Fiscal",
      render: (s) => s.numeroFiscal || "--/--",
    },
    { key: "ville", header: "Ville", render: (s) => s.ville || "—" },
    {
      key: "telephone",
      header: "Téléphone",
      render: (s) => s.telephone || "—",
    },
    {
      key: "telephone",
      header: "Adresse",
      render: (s) => s.adresse || "—",
    },
    {
      key: "statut",
      header: "Statut",
      align: "right",
      render: (s) => <StatusBadge status={s.statut} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Fournisseurs"
        description="Coordonnées, commandes et statistiques"
        breadcrumb={["Gestion commerciale", "Fournisseurs"]}
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Fournisseurs"
          value={String(meta.total)}
          sub="au total"
          icon={<Truck className="h-5 w-5" />}
        />
        <StatCard
          label="Actifs"
          value={String(stats.actifs)}
          sub="enregistres"
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          label="Sur cette page"
          value={String(fournisseurs.length)}
          sub={`page ${page}`}
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <StatCard
          label="Delai moyen"
          value="7 j"
          sub="par defaut"
          icon={<Truck className="h-5 w-5" />}
        />
      </div>
      <SectionCard
        title="Liste des fournisseurs"
        description={`${meta.total} fournisseur${meta.total > 1 ? "s" : ""}`}
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un fournisseur..."
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
            <Plus className="h-4 w-4" /> Ajouter un fournisseur
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
              rows={fournisseurs}
              rowKey={(s) => s.id}
              rowActions={(fournisseur) => [
                {
                  label: "Modifier",
                  icon: <Pencil className="h-4 w-4" />,
                  onClick: () => void openEditModal(fournisseur.id),
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

      <AppModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Modifier un fournisseur" : "Ajouter un fournisseur"}
        description="Renseignez les coordonnées du fournisseur."
        size="xl"
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
          <Field
            label="Raison sociale"
            htmlFor="raisonSociale"
            error={errors.raisonSociale}
          >
            <span class="ml-1 text-destructive">*</span>
            <Input
              id="raisonSociale"
              value={form.raisonSociale}
              onChange={(e) => setField("raisonSociale", e.target.value)}
              placeholder="Nom de l'entreprise"
            />
          </Field>
          <Field label="Email" htmlFor="email" error={errors.email}>
            <span class="ml-1 text-destructive">*</span>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="contact@fournisseur.com"
            />
          </Field>
          <Field label="Telephone" htmlFor="telephone" error={errors.telephone}>
            <span class="ml-1 text-destructive">*</span>
            <Input
              id="telephone"
              value={form.telephone}
              onChange={(e) => setField("telephone", e.target.value)}
              placeholder="+237 6XX XXX XXX"
            />
          </Field>
          <Field label="Ville" htmlFor="ville">
            <Input
              id="ville"
              value={form.ville}
              onChange={(e) => setField("ville", e.target.value)}
              placeholder="Douala"
            />
          </Field>
          <Field label="Pays" htmlFor="pays">
            <Input
              id="pays"
              value={form.pays}
              onChange={(e) => setField("pays", e.target.value)}
              placeholder="Cameroun"
            />
          </Field>
          <Field label="Identifiant fiscal" htmlFor="numeroFiscal">
            <Input
              id="numeroFiscal"
              value={form.numeroFiscal || ""}
              onChange={(e) => setField("numeroFiscal", e.target.value)}
              placeholder="N° de contribuable"
            />
          </Field>
          <Field label="Delai livraison (jours)" htmlFor="delaiLivraisonMoyen">
            <Input
              id="delaiLivraisonMoyen"
              type="number"
              min="1"
              value={form.delaiLivraisonMoyen}
              onChange={(e) =>
                setField("delaiLivraisonMoyen", Number(e.target.value) || 7)
              }
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
          <Field label="Adresse" htmlFor="adresse" className="md:col-span-2">
            <Input
              id="adresse"
              value={form.adresse}
              onChange={(e) => setField("adresse", e.target.value)}
              placeholder="Rue, quartier, immeuble..."
            />
          </Field>
          <Field
            label="Conditions de paiement"
            htmlFor="conditionsPaiement"
            className="md:col-span-2"
          >
            <Input
              id="conditionsPaiement"
              value={form.conditionsPaiement || ""}
              onChange={(e) => setField("conditionsPaiement", e.target.value)}
              placeholder="30 jours fin de mois, etc."
            />
          </Field>
        </div>
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
