import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Users, UserPlus, Pencil, Trash2, Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  createUser,
  deleteUser,
  getRoles,
  getUsers,
  updateUser,
  type UserPayload,
} from "@/lib/api/users.service";
import { useAuthStore } from "@/stores/auth.store";

export const Route = createFileRoute("/_app/users")({
  head: () => ({ meta: [{ title: "Utilisateurs — AC ERP" }] }),
  component: UsersPage,
});

type UserRow = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  statut: string;
  telephone: string;
  role?: { id: string; nomRole: string; isSystemRole?: boolean } | null;
};

const initials = (n: string) =>
  n
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

function UsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<{ id: string; nomRole: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<UserRow | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<UserPayload>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    idRole: "",
    statut: "ACTIF",
  });
  const [initialForm, setInitialForm] = useState<UserPayload>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    idRole: "",
    statut: "ACTIF",
  });

  const [noChangesAlert, setNoChangesAlert] = useState(false);

  const currentUser = useAuthStore((state) => state.user);
  const currentUserRole = currentUser?.role?.nomRole;

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        getUsers(),
        getRoles(),
      ]);
      const usersData = Array.isArray(usersResponse?.data)
        ? usersResponse.data
        : [];
      const allRoles = Array.isArray(rolesResponse?.data)
        ? rolesResponse.data
        : [];
      const rolesData = allRoles.filter((role: any) => {
        if (currentUserRole === "SUPER_ADMIN") return true;
        if (currentUserRole === "ADMIN") return role?.nomRole !== "SUPER_ADMIN";
        return (
          !role?.isSystemRole &&
          role?.nomRole !== "SUPER_ADMIN" &&
          role?.nomRole !== "ADMIN"
        );
      });
      setRows(usersData);
      setRoles(rolesData);
    } catch {
      toast.error("Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [currentUserRole]);

  const openCreateModal = () => {
    setEditingUser(null);
    setErrors({});

    const values: UserPayload = {
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      idRole: "",
      statut: "ACTIF",
    };

    setForm(values);
    setInitialForm(values);
    setNoChangesAlert(false);
    setModalOpen(true);
  };

  const openDeleteModal = (user: UserRow) => {
    setPendingDeleteUser(user);
    setDeleteModalOpen(true);
  };

  const openEditModal = (user: UserRow) => {
    const values: UserPayload = {
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone || "",
      idRole: user.role?.id || "",
      statut: (user.statut as UserPayload["statut"]) || "ACTIF",
    };

    setEditingUser(user);
    setErrors({});
    setForm(values);
    setInitialForm(values);
    setNoChangesAlert(false);
    setModalOpen(true);
  };

  const hasFormChanges = () => {
    return (
      form.nom !== initialForm.nom ||
      form.prenom !== initialForm.prenom ||
      form.email !== initialForm.email ||
      form.telephone !== initialForm.telephone ||
      form.idRole !== initialForm.idRole ||
      form.statut !== initialForm.statut
    );
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!form.nom.trim()) newErrors.nom = "Le nom est obligatoire";
    if (!form.prenom.trim()) newErrors.prenom = "Le prénom est obligatoire";
    if (!form.email.trim()) newErrors.email = "L’email est obligatoire";
    if (!form.idRole) newErrors.idRole = "Le rôle est obligatoire";

    setErrors(newErrors);

    if (Object.keys(newErrors).length) {
      return;
    }

    if (editingUser && !hasFormChanges()) {
      setNoChangesAlert(true);
      return;
    }

    setNoChangesAlert(false);
    setSubmitting(true);

    try {
      if (editingUser) {
        await updateUser(editingUser.id, form);
        toast.success("Utilisateur modifié");
      } else {
        await createUser(form);
        toast.success("Utilisateur ajouté");
      }

      setModalOpen(false);
      setErrors({});
      await loadData();
    } catch (error: any) {
      const message = error?.message || "Échec de l’opération";
      const details = error?.details || {};

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
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDeleteUser) return;
    setDeleting(true);
    try {
      await deleteUser(pendingDeleteUser.id);
      toast.success("Utilisateur supprimé");
      setDeleteModalOpen(false);
      setPendingDeleteUser(null);
      await loadData();
    } catch (error: any) {
      toast.error(error?.message || "Échec de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  const filterOptions = [
    { label: "Tous", value: "all" },
    { label: "Actifs", value: "ACTIF" },
    { label: "Inactifs", value: "INACTIF" },
    { label: "Bloqués", value: "BLOQUE" },
  ];

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return rows.filter((user) => {
      const matchesStatus =
        statusFilter === "all" || user.statut === statusFilter;
      const matchesSearch =
        !normalizedSearch ||
        `${user.prenom} ${user.nom}`.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });
  }, [rows, search, statusFilter]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const pagedUsers = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const cols: Column<UserRow>[] = useMemo(
    () => [
      {
        key: "nom",
        header: "Utilisateur",
        align: "left",
        render: (u) => (
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-white">
              {initials(`${u.prenom} ${u.nom}`)}
            </span>
            <div>
              <p className="font-medium text-foreground">{`${u.prenom} ${u.nom}`}</p>
              <p className="text-xs text-muted-foreground">{u.email}</p>
            </div>
          </div>
        ),
      },
      {
        key: "role",
        header: "Rôle",
        render: (u) => (
          <span className="text-foreground">{u.role?.nomRole || "—"}</span>
        ),
      },
      {
        key: "statut",
        header: "Statut",
        render: (u) => <StatusBadge status={u.statut} />,
      },
      {
        key: "act",
        header: "Actions",
        align: "right",
        render: (u) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => openEditModal(u)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => openDeleteModal(u)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [roles],
  );

  return (
    <>
      <PageHeader
        title="Utilisateurs"
        description="Gestion des comptes et accès"
        breadcrumb={["Administration", "Utilisateurs"]}
        actions={
          <Button size="sm" className="gap-1.5" onClick={openCreateModal}>
            <UserPlus className="h-4 w-4" /> Ajouter un utilisateur
          </Button>
        }
      />
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard
          label="Utilisateurs"
          value={String(rows.length)}
          sub="comptes"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Actifs"
          value={String(rows.filter((u) => u.statut === "ACTIF").length)}
          sub="comptes actifs"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Rôles"
          value={String(roles.length)}
          sub="définis"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Inactifs"
          value={String(rows.filter((u) => u.statut !== "ACTIF").length)}
          sub="comptes non actifs"
          icon={<UserPlus className="h-5 w-5" />}
        />
      </div>
      <SectionCard title="Liste des utilisateurs">
        <div className="mb-4">
          <Toolbar
            placeholder="Rechercher un utilisateur…"
            searchValue={search}
            onSearchChange={setSearch}
            filterOptions={filterOptions}
            selectedFilter={statusFilter}
            onFilterChange={setStatusFilter}
          />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Chargement…
          </div>
        ) : (
          <DataTable
            columns={cols}
            rows={pagedUsers}
            rowKey={(u) => u.id}
            withActions={false}
          />
        )}
        <Pagination
          count={filteredUsers.length}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </SectionCard>

      <AppModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={
          editingUser ? "Modifier un utilisateur" : "Ajouter un utilisateur"
        }
        description={
          editingUser
            ? "Mettez à jour les informations de l’utilisateur."
            : "Créez un nouveau compte utilisateur."
        }
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
            <Button onClick={() => void handleSubmit()} disabled={submitting}>
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {editingUser ? "Enregistrer" : "Créer"}
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nom">
              Nom <span className="ml-1 text-destructive">*</span>
            </Label>
            <Input
              id="nom"
              value={form.nom}
              onChange={(e) => {
                setForm({ ...form, nom: e.target.value });
                setNoChangesAlert(false);
                if (errors.nom) setErrors((prev) => ({ ...prev, nom: "" }));
              }}
              placeholder="Entrez le nom"
            />
            {errors.nom ? (
              <p className="text-xs text-destructive">{errors.nom}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="prenom">
              Prénom <span className="ml-1 text-destructive">*</span>
            </Label>
            <Input
              id="prenom"
              value={form.prenom}
              onChange={(e) => {
                setForm({ ...form, prenom: e.target.value });
                setNoChangesAlert(false);
                if (errors.prenom)
                  setErrors((prev) => ({ ...prev, prenom: "" }));
              }}
              placeholder="Entrez le prénom"
            />
            {errors.prenom ? (
              <p className="text-xs text-destructive">{errors.prenom}</p>
            ) : null}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">
              Email <span className="ml-1 text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                setNoChangesAlert(false);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              placeholder="Entrez l'adresse email"
            />
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone</Label>
            <Input
              id="telephone"
              value={form.telephone || ""}
              onChange={(e) => {
                setForm({ ...form, telephone: e.target.value });
                setNoChangesAlert(false);
              }}
              placeholder="Entrez le numéro de téléphone"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">
              Rôle <span className="ml-1 text-destructive">*</span>
            </Label>
            <Select
              value={form.idRole}
              onValueChange={(value) => {
                setForm({ ...form, idRole: value });
                setNoChangesAlert(false);
                if (errors.idRole)
                  setErrors((prev) => ({ ...prev, idRole: "" }));
              }}
            >
              <SelectTrigger id="role">
                <SelectValue
                  placeholder={
                    loading ? "Chargement des rôles..." : "Sélectionner un rôle"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chargement des rôles...
                  </div>
                ) : roles.length > 0 ? (
                  roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.nomRole.replace(/_/g, " ")}
                    </SelectItem>
                  ))
                ) : (
                  <div className="py-3 text-center text-sm text-muted-foreground">
                    Aucun rôle disponible
                  </div>
                )}
              </SelectContent>
            </Select>
            {errors.idRole ? (
              <p className="text-xs text-destructive">{errors.idRole}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="statut">
              Statut <span className="ml-1 text-destructive">*</span>
            </Label>
            <Select
              value={form.statut}
              onValueChange={(value: UserPayload["statut"]) => {
                setForm({ ...form, statut: value });
                setNoChangesAlert(false);
              }}
            >
              <SelectTrigger id="statut">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIF">Actif</SelectItem>
                <SelectItem value="INACTIF">Inactif</SelectItem>
                <SelectItem value="BLOQUE">Bloqué</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {noChangesAlert && (
          <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-900/20 dark:text-amber-300">
            Aucune modification détectée. Veuillez modifier au moins une valeur
            avant d’enregistrer.
          </div>
        )}
      </AppModal>

      <AppModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Confirmer la suppression"
        description="Cette action est irréversible."
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
              ) : null}
              Supprimer
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          Voulez-vous vraiment supprimer{" "}
          <span className="font-semibold text-foreground">
            {pendingDeleteUser?.prenom} {pendingDeleteUser?.nom}
          </span>{" "}
          ?
        </p>
      </AppModal>
    </>
  );
}
