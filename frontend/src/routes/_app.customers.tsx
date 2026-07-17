import { useEffect, useMemo, useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Download,
  Loader2,
  Pencil,
  Trash2,
  Users,
  Contact,
  Wallet,
  FileDown,
  Search,
  Eye,
  Printer,
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
import { toast } from "sonner";
import { fmtCurrency } from "@/lib/erp-data";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  getClientsPdf,
  type ClientPayload,
} from "@/lib/api/clients.service";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_app/customers")({
  head: () => ({ meta: [{ title: "Clients — AC ERP" }] }),
  component: CustomersPage,
});

type ApiMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type Client = {
  id: string;
  codeClient: string;
  nom: string;
  email: string;
  telephone: string;
  ville: string;
  adresse: string;
  pays: string;
  type: "PARTICULIER" | "ENTREPRISE";
  statut: "ACTIF" | "INACTIF";
  plafondCredit: number | string;
  delaiPaiement: number;
  modePaiementDefaut: string;
};
const initials = (n: string) =>
  n
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
const cols: Column<Client>[] = [
  {
    key: "nom",
    header: "Client",
    render: (c) => (
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          {initials(c.nom)}
        </span>

        <div>
          <p className="font-medium">{c.nom}</p>

          <p className="text-xs text-muted-foreground">{c.email}</p>
        </div>
      </div>
    ),
  },

  {
    key: "ville",
    header: "Ville",
  },

  {
    key: "telephone",
    header: "Téléphone",
  },

  {
    key: "plafondCredit",
    header: "Crédit",
    align: "right",
    render: (c) => fmtCurrency(Number(c.plafondCredit || 0)),
  },

  {
    key: "statut",
    header: "Statut",
    align: "right",
    render: (c) => <StatusBadge status={c.statut} />,
  },
];

function CustomersPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);

  const [meta, setMeta] = useState<ApiMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [pendingDeleteClient, setPendingDeleteClient] = useState<Client | null>(
    null,
  );

  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [exportingPreview, setExportingPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadClients = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getClients({
        page,
        limit: 10,
        search: search || undefined,
        statut: statusFilter === "all" ? undefined : statusFilter,
        ville: cityFilter === "all" ? undefined : cityFilter,
      });

      setClients((response?.data || []) as Client[]);

      setMeta(
        response?.meta || {
          page,
          limit: 10,
          total: 0,
          totalPages: 1,
        },
      );
    } catch {
      toast.error("Impossible de charger les clients");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, cityFilter]);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, cityFilter]);

  const stats = useMemo(() => {
    const total = meta.total;
    const actifs = clients.filter((c: Client) => c.statut === "ACTIF").length;
    const inactifs = clients.filter(
      (c: Client) => c.statut === "INACTIF",
    ).length;
    const encours = clients.reduce(
      (sum, c) => sum + Number(c.plafondCredit || 0),
      0,
    );
    return { total, actifs, inactifs, encours };
  }, [clients, meta]);

  const uniqueCities = useMemo(() => {
    const cities = new Set(clients.map((c: Client) => c.ville).filter(Boolean));
    return Array.from(cities).sort();
  }, [clients]);

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.nom.trim()) nextErrors.nom = "Le nom est obligatoire";

    if (!form.email.trim()) nextErrors.email = "L'email est obligatoire";

    if (!form.telephone.trim())
      nextErrors.telephone = "Le téléphone est obligatoire";

    if (!form.ville.trim()) nextErrors.ville = "La ville est obligatoire";

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const setField = <K extends keyof ClientPayload>(
    field: K,
    value: ClientPayload[K],
  ) => {
    setForm((current: ClientPayload) => ({ ...current, [field]: value }));
    if (errors[field])
      setErrors((current: Record<string, string>) => ({
        ...current,
        [field]: "",
      }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      if (editingClient) {
        await updateClient(editingClient.id, form);

        toast.success("Client modifié");
      } else {
        await createClient(form);

        toast.success("Client ajouté");
      }

      setModalOpen(false);

      await loadClients();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (client: Client) => {
    setPendingDeleteClient(client);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingDeleteClient) return;
    setDeleting(true);
    try {
      await deleteClient(pendingDeleteClient.id);
      toast.success("Client supprimé");
      setDeleteModalOpen(false);
      setPendingDeleteClient(null);
      await loadClients();
    } catch {
      toast.error("Suppression impossible");
    } finally {
      setDeleting(false);
    }
  };

  const emptyForm: ClientPayload = {
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    ville: "",
    pays: "Cameroun",
    type: "ENTREPRISE",
    plafondCredit: 0,
    delaiPaiement: 0,
    modePaiementDefaut: "VIREMENT",
    statut: "ACTIF",
  };

  const [form, setForm] = useState<ClientPayload>(emptyForm);

  const openPreview = async () => {
    setPreviewLoading(true);
    // liberer l'ancienne URL si elle existe
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    try {
      const response = await getClientsPdf({
        search: search || undefined,
        statut: statusFilter === "all" ? undefined : statusFilter,
        ville: cityFilter === "all" ? undefined : cityFilter,
      });
      const blob = response as unknown as Blob;
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewOpen(true);
    } catch {
      toast.error("Impossible de generer l'apercu PDF");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleExportFromPreview = async () => {
    setExportingPreview(true);
    try {
      const response = await getClientsPdf({
        search: search || undefined,
        statut: statusFilter === "all" ? undefined : statusFilter,
        ville: cityFilter === "all" ? undefined : cityFilter,
      });
      const blob = response as unknown as Blob;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `clients-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Liste des clients exportee en PDF");
    } catch {
      toast.error("Export PDF impossible");
    } finally {
      setExportingPreview(false);
    }
  };

  const exportClients = async () => {
    setExporting(true);
    try {
      const response = await getClientsPdf({
        search: search || undefined,
        statut: statusFilter === "all" ? undefined : statusFilter,
        ville: cityFilter === "all" ? undefined : cityFilter,
      });
      const blob = response as unknown as Blob;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `clients-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Liste des clients exportée en PDF");
    } catch {
      toast.error("Export PDF impossible");
    } finally {
      setExporting(false);
    }
  };
  return (
    <>
      <PageHeader
        title="Clients"
        description="Fiches, soldes et historique d'achats"
        breadcrumb={["Gestion commerciale", "Clients"]}
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
              onClick={() => void exportClients()}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Exporter
            </Button>
          </>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Clients"
          value={String(meta.total)}
          sub="au total"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Actifs"
          value={String(stats.actifs)}
          sub="sur cette page"
          icon={<Contact className="h-5 w-5" />}
        />
        <StatCard
          label="Encours total"
          value={fmtCurrency(stats.encours)}
          sub="plafonds cumulés"
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="Inactifs"
          value={String(stats.inactifs)}
          sub="sur cette page"
          icon={<Users className="h-5 w-5" />}
        />
      </div>
      <SectionCard
        title="Liste des clients"
        description={`${meta.total} client${meta.total > 1 ? "s" : ""}`}
      >
        <div className="mb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Barre de recherche */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un client..."
                className="h-9 pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Actions droite */}
            <div className="flex items-center gap-2">
              {/* Filtre par statut */}
              <SearchableSelect
                value={statusFilter}
                onValueChange={setStatusFilter}
                options={[
                  { label: "Tous les statuts", value: "all" },
                  { label: "Actifs", value: "ACTIF" },
                  { label: "Inactifs", value: "INACTIF" },
                ]}
                placeholder="Tous les statuts"
                searchPlaceholder="Chercher un statut..."
                emptyMessage="Aucun statut trouvé"
                className="w-[180px]"
              />

              {/* Filtre par ville */}
              <SearchableSelect
                value={cityFilter}
                onValueChange={setCityFilter}
                options={[
                  { label: "Toutes les villes", value: "all" },
                  ...uniqueCities.map((city: string) => ({
                    label: city,
                    value: city,
                  })),
                ]}
                placeholder="Toutes les villes"
                searchPlaceholder="Chercher une ville..."
                emptyMessage="Aucune ville trouvée"
                className="w-[180px]"
              />

              {/* Bouton d'ajout */}
              <Button
                size="sm"
                className="gap-1.5 whitespace-nowrap"
                onClick={() => {
                  setEditingClient(null);
                  setForm(emptyForm);
                  setErrors({});
                  setModalOpen(true);
                }}
              >
                Ajouter un client
              </Button>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <>
            <DataTable
              columns={cols}
              rows={clients}
              rowKey={(c) => c.id}
              rowActions={(client) => [
                {
                  label: "Modifier",
                  icon: <Pencil className="h-4 w-4" />,
                  onClick: () => {
                    setEditingClient(client);

                    setForm({
                      nom: client.nom || "",
                      email: client.email || "",
                      telephone: client.telephone || "",
                      adresse: client.adresse || "",
                      ville: client.ville || "",
                      pays: client.pays || "Cameroun",
                      type: client.type,
                      plafondCredit: Number(client.plafondCredit || 0),
                      delaiPaiement: client.delaiPaiement || 0,
                      modePaiementDefaut: (client.modePaiementDefaut ||
                        "VIREMENT") as ClientPayload["modePaiementDefaut"],
                      statut: client.statut as ClientPayload["statut"],
                    });

                    setModalOpen(true);
                  },
                },

                {
                  label: "Supprimer",
                  icon: <Trash2 className="h-4 w-4" />,
                  destructive: true,
                  onClick: () => openDeleteModal(client),
                },
              ]}
            />
            <Pagination
              count={meta.total}
              currentPage={page}
              totalPages={meta.totalPages}
              pageSize={10}
              onPageChange={setPage}
            />
          </>
        )}
      </SectionCard>
      <AppModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingClient ? "Modifier un client" : "Ajouter un client"}
        description="Renseignez les informations du client."
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
              {editingClient ? "Enregistrer" : "Créer"}
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nom" htmlFor="nom" error={errors.nom}>
            <Input
              id="nom"
              value={form.nom}
              onChange={(e) => setField("nom", e.target.value)}
              placeholder="Nom du client"
            />
          </Field>

          <Field label="Email" htmlFor="email" error={errors.email}>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="email@exemple.com"
            />
          </Field>

          <Field label="Téléphone" htmlFor="telephone" error={errors.telephone}>
            <Input
              id="telephone"
              value={form.telephone}
              onChange={(e) => setField("telephone", e.target.value)}
              placeholder="+237 6XX XXX XXX"
            />
          </Field>

          <Field label="Ville" htmlFor="ville" error={errors.ville}>
            <Input
              id="ville"
              value={form.ville}
              onChange={(e) => setField("ville", e.target.value)}
              placeholder="Douala"
            />
          </Field>

          <Field label="Type" htmlFor="type" error={errors.type}>
            <Select
              value={form.type || ""}
              onValueChange={(value: string) =>
                setField("type", value as ClientPayload["type"])
              }
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PARTICULIER">Particulier</SelectItem>
                <SelectItem value="ENTREPRISE">Entreprise</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Statut" htmlFor="statut" error={errors.statut}>
            <Select
              value={form.statut || ""}
              onValueChange={(value: string) =>
                setField("statut", value as ClientPayload["statut"])
              }
            >
              <SelectTrigger id="statut">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIF">Actif</SelectItem>
                <SelectItem value="INACTIF">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Pays" htmlFor="pays" error={errors.pays}>
            <Input
              id="pays"
              value={form.pays || ""}
              onChange={(e) => setField("pays", e.target.value)}
              placeholder="Cameroun"
            />
          </Field>

          <Field
            label="Mode de paiement défaut"
            htmlFor="modePaiement"
            error={errors.modePaiementDefaut}
          >
            <Select
              value={form.modePaiementDefaut || ""}
              onValueChange={(value: string) =>
                setField(
                  "modePaiementDefaut",
                  value as ClientPayload["modePaiementDefaut"],
                )
              }
            >
              <SelectTrigger id="modePaiement">
                <SelectValue placeholder="Sélectionner un mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ESPECES">Espèces</SelectItem>
                <SelectItem value="CHEQUE">Chèque</SelectItem>
                <SelectItem value="VIREMENT">Virement</SelectItem>
                <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Plafond crédit"
            htmlFor="plafond"
            error={errors.plafondCredit}
          >
            <Input
              id="plafond"
              type="number"
              min="0"
              value={form.plafondCredit || ""}
              onChange={(e) =>
                setField("plafondCredit", Number(e.target.value) || 0)
              }
              placeholder="0"
            />
          </Field>

          <Field
            label="Délai paiement (jours)"
            htmlFor="delai"
            error={errors.delaiPaiement}
          >
            <Input
              id="delai"
              type="number"
              min="0"
              value={form.delaiPaiement || ""}
              onChange={(e) =>
                setField("delaiPaiement", Number(e.target.value) || 0)
              }
              placeholder="30"
            />
          </Field>

          <Field label="Adresse" htmlFor="adresse" error={errors.adresse}>
            <Input
              id="adresse"
              value={form.adresse || ""}
              onChange={(e) => setField("adresse", e.target.value)}
              placeholder="Rue, quartier, immeuble..."
            />
          </Field>
        </div>
      </AppModal>

      {/* Modale de prévisualisation — affiche le PDF genere */}
      <AppModal
        open={previewOpen}
        onOpenChange={(open) => {
          if (!open && previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewOpen(open);
        }}
        title="Apercu PDF"
        description="Visualisation du document tel qu'il sera exporte"
        position="center"
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
                link.download = `clients-${new Date().toISOString().slice(0, 10)}.pdf`;
                document.body.appendChild(link);
                link.click();
                link.remove();
                toast.success("PDF telecharge");
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Telecharger
            </Button>
          </div>
        }
      >
        {previewUrl ? (
          <iframe
            src={previewUrl}
            className="h-[70vh] w-full rounded-lg border border-border"
            title="Apercu PDF clients"
          />
        ) : (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generation du PDF...
          </div>
        )}
      </AppModal>

      <AppModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Confirmer la suppression"
        description="Le client sera supprimé définitivement."
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
            {pendingDeleteClient?.nom}
          </span>
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
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>

      {children}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
