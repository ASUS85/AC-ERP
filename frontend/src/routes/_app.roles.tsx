import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Save,
  Lock,
  CheckCircle2,
  XCircle,
  Search,
  CheckCheck,
  Layers,
  ChevronRight,
  Shield,
} from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { AppModal } from "@/components/erp/AppModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  createRole,
  deleteRole,
  getPermissions,
  getRoles,
  updateRole,
  updateRolePermissions,
  type PermissionItem,
  type RoleItem,
  type RolePayload,
} from "@/lib/api/roles.service";

export const Route = createFileRoute("/_app/roles")({
  head: () => ({ meta: [{ title: "Rôles & permissions — AC ERP" }] }),
  component: RolesPage,
});

const actionLabels: Record<string, string> = {
  lire: "Lire",
  creer: "Créer",
  modifier: "Modifier",
  supprimer: "Supprimer",
  ajuster: "Ajuster",
  inventaire: "Inventaire",
  valider: "Valider",
  receptionner: "Réceptionner",
  livrer: "Livrer",
  avoir: "Avoir",
  envoyer: "Envoyer",
  exporter: "Exporter",
  chat: "Chat",
  rapport: "Rapport",
};

const moduleLabels: Record<string, string> = {
  users: "Utilisateurs",
  roles: "Rôles",
  categories: "Catégories",
  produits: "Produits",
  clients: "Clients",
  fournisseurs: "Fournisseurs",
  stocks: "Stocks",
  achats: "Achats",
  ventes: "Ventes",
  factures: "Factures",
  paiements: "Paiements",
  rapports: "Rapports",
  dashboard: "Tableau de bord",
  ia: "Intelligence artificielle",
};

type ApiErrorLike = {
  message?: string;
  details?: unknown;
};

function toApiError(error: unknown): ApiErrorLike {
  return error && typeof error === "object" ? (error as ApiErrorLike) : {};
}

function RolesPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleSearchQuery, setRoleSearchQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [pendingDeleteRole, setPendingDeleteRole] = useState<RoleItem | null>(
    null,
  );

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);

  const [form, setForm] = useState<RolePayload>({
    nomRole: "",
    description: "",
    isSystemRole: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [permissionIds, setPermissionIds] = useState<string[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        getRoles(),
        getPermissions(),
      ]);
      const rolesData = Array.isArray(rolesResponse?.data)
        ? rolesResponse.data
        : [];
      const permissionsData = Array.isArray(permissionsResponse?.data)
        ? permissionsResponse.data
        : [];

      setRoles(rolesData);
      setPermissions(permissionsData);
      setSelectedRoleId((currentId) => {
        if (rolesData.some((role) => role.id === currentId)) return currentId;
        return rolesData[0]?.id ?? null;
      });
    } catch {
      toast.error("Impossible de charger les rôles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    const selectedRole = roles.find((role) => role.id === selectedRoleId);
    setPermissionIds(
      selectedRole?.permissions?.map(
        (entry) => entry.permission?.id ?? entry.idPermission,
      ) ?? [],
    );
  }, [roles, selectedRoleId]);

  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null;

  const filteredRoles = useMemo(() => {
    return roles.filter(
      (role) =>
        role.nomRole.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
        (role.description &&
          role.description
            .toLowerCase()
            .includes(roleSearchQuery.toLowerCase())),
    );
  }, [roles, roleSearchQuery]);

  const groupedPermissions = useMemo(() => {
    const grouped = new Map<string, PermissionItem[]>();
    permissions.forEach((permission) => {
      const items = grouped.get(permission.module) ?? [];
      items.push(permission);
      grouped.set(permission.module, items);
    });

    return Array.from(grouped.entries())
      .map(([module, items]) => ({
        module,
        label: moduleLabels[module] ?? module,
        items: items.sort((a, b) => a.action.localeCompare(b.action)),
      }))
      .filter(
        (g) =>
          g.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.module.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [permissions, searchQuery]);

  const openCreateModal = () => {
    setEditingRole(null);
    setErrors({});
    setForm({ nomRole: "", description: "", isSystemRole: false });
    setModalOpen(true);
  };

  const openEditModal = (role: RoleItem) => {
    setEditingRole(role);
    setErrors({});
    setForm({
      nomRole: role.nomRole,
      description: role.description ?? "",
      isSystemRole: role.isSystemRole ?? false,
    });
    setModalOpen(true);
  };

  const openDeleteModal = (role: RoleItem) => {
    setPendingDeleteRole(role);
    setDeleteModalOpen(true);
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.nomRole.trim())
      newErrors.nomRole = "Le nom du rôle est obligatoire";
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setSubmitting(true);
    try {
      if (editingRole) {
        await updateRole(editingRole.id, form);
        toast.success("Rôle mis à jour");
      } else {
        await createRole(form);
        toast.success("Rôle ajouté");
      }
      setModalOpen(false);
      setErrors({});
      await loadData();
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast.error(apiError.message || "Échec de l’opération");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDeleteRole) return;
    setDeleting(true);
    try {
      await deleteRole(pendingDeleteRole.id);
      toast.success("Rôle supprimé");
      setDeleteModalOpen(false);
      setPendingDeleteRole(null);
      await loadData();
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast.error(apiError.message || "Échec de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    setPermissionIds((current) =>
      checked
        ? [...current, permissionId]
        : current.filter((id) => id !== permissionId),
    );
  };

  const handleToggleModulePermissions = (moduleItems: PermissionItem[]) => {
    const moduleIds = moduleItems.map((item) => item.id);
    const allChecked = moduleIds.every((id) => permissionIds.includes(id));

    if (allChecked) {
      setPermissionIds((prev) => prev.filter((id) => !moduleIds.includes(id)));
    } else {
      setPermissionIds((prev) => Array.from(new Set([...prev, ...moduleIds])));
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    setSavingPermissions(true);
    try {
      await updateRolePermissions(selectedRoleId, permissionIds);
      toast.success("Permissions mises à jour avec succès");
      await loadData();
    } catch (error: unknown) {
      const apiError = toApiError(error);
      toast.error(apiError.message || "Échec de la sauvegarde");
    } finally {
      setSavingPermissions(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Rôles & permissions"
        description="Gérez la matrice d'accès métiers et les rôles utilisateurs"
        breadcrumb={["Administration", "Rôles"]}
        actions={
          <Button
            size="sm"
            className="gap-1.5 shadow-sm"
            onClick={openCreateModal}
          >
            <Plus className="h-4 w-4" /> Nouveau rôle
          </Button>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm">Chargement des données...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 items-start">
          {/* Card Rôles (Hauteur Fixe + Scroll interne) */}
          <div className="lg:col-span-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm h-[800px] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-border/50 shrink-0 bg-primary/10 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">
                  Rôles définis
                </h3>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {roles.length}
              </span>
            </div>

            <div className="relative my-3 shrink-0">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filtrer les rôles..."
                value={roleSearchQuery}
                onChange={(e) => setRoleSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5 overflow-y-auto min-h-0 flex-1 pr-1">
              {filteredRoles.map((role) => {
                const isActive = role.id === selectedRoleId;
                const permCount = role.permissions?.length ?? 0;

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all flex items-center justify-between group ${
                      isActive
                        ? "bg-primary/10 border-l-4 border-l-primary text-foreground shadow-xs"
                        : "hover:bg-muted/50 border-l-4 border-l-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="space-y-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium text-sm truncate ${isActive ? "text-primary font-semibold" : ""}`}
                        >
                          {role.nomRole}
                        </span>
                        {role.isSystemRole && (
                          <Lock className="h-3 w-3 text-amber-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {role.description || "Sans description"}
                      </p>
                      <div className="text-[11px] font-medium text-primary/80">
                        {permCount} permission{permCount > 1 ? "s" : ""}
                      </div>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        isActive
                          ? "text-primary translate-x-0.5"
                          : "text-muted-foreground/40 group-hover:text-muted-foreground"
                      }`}
                    />
                  </button>
                );
              })}

              {filteredRoles.length === 0 && (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Aucun rôle correspondant trouvé
                </div>
              )}
            </div>
          </div>

          {/* Card Permissions (Hauteur Fixe + Scroll interne) */}
          <div className="lg:col-span-9 rounded-xl border border-border/70 bg-card p-5 shadow-sm h-[800px] flex flex-col overflow-hidden">
            <div className="flex flex-wrap items-center justify-between border-b border-border/50 pb-4 shrink-0 gap-3">
              <div>
                <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                  Permissions :
                  {selectedRole && (
                    <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                      {selectedRole.nomRole}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configurez les accès spécifiques par module pour le rôle
                  sélectionné
                </p>
              </div>

              {selectedRole && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(selectedRole)}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" /> Modifier rôle
                  </Button>
                  {!selectedRole.isSystemRole && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => openDeleteModal(selectedRole)}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Supprimer
                    </Button>
                  )}
                  <Button
                    onClick={() => void handleSavePermissions()}
                    disabled={savingPermissions}
                    size="sm"
                    className="gap-1.5"
                  >
                    {savingPermissions ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Enregistrer
                  </Button>
                </div>
              )}
            </div>

            {selectedRole ? (
              <div className="flex flex-col flex-1 min-h-0 pt-4 space-y-4">
                <div className="relative shrink-0">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un module (ex: Ventes, Stocks...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 text-sm"
                  />
                </div>

                <div className="overflow-y-auto flex-1 min-h-0 pr-1 pb-2">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {groupedPermissions.map(({ module, label, items }) => {
                      const allModuleChecked = items.every((item) =>
                        permissionIds.includes(item.id),
                      );

                      return (
                        <div
                          key={module}
                          className="flex flex-col rounded-xl border border-border/70 bg-card p-4 transition-all hover:border-border"
                        >
                          <div className="flex items-center justify-between border-b border-border/50 pb-3">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground">
                                <Layers className="h-4 w-4 text-primary" />
                              </span>
                              <div>
                                <h4 className="font-semibold text-foreground text-sm">
                                  {label}
                                </h4>
                                <p className="text-[11px] text-muted-foreground">
                                  {items.length} action(s) disponible(s)
                                </p>
                              </div>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleToggleModulePermissions(items)
                              }
                              className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                            >
                              <CheckCheck className="mr-1 h-3.5 w-3.5" />
                              {allModuleChecked
                                ? "Tout désactiver"
                                : "Tout activer"}
                            </Button>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2 pt-1">
                            {items.map((permission) => {
                              const isChecked = permissionIds.includes(
                                permission.id,
                              );
                              const actionName =
                                actionLabels[permission.action] ??
                                permission.action;

                              return (
                                <button
                                  key={permission.id}
                                  type="button"
                                  onClick={() =>
                                    handlePermissionToggle(
                                      permission.id,
                                      !isChecked,
                                    )
                                  }
                                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                                    isChecked
                                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20"
                                      : "border-border/60 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted"
                                  }`}
                                >
                                  {isChecked ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                  ) : (
                                    <XCircle className="h-3.5 w-3.5 opacity-40" />
                                  )}
                                  {actionName}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {groupedPermissions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <p className="text-sm font-medium text-muted-foreground">
                        Aucun module trouvé pour "{searchQuery}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Aucun rôle sélectionné. Veuillez en créer ou en sélectionner
                  un.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Création / Edition */}
      <AppModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingRole ? "Modifier un rôle" : "Ajouter un rôle"}
        description={
          editingRole
            ? "Mettre à jour les informations de ce rôle métier."
            : "Créez un nouveau rôle métier pour définir des permissions."
        }
        size="md"
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
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingRole ? "Enregistrer" : "Créer"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="nomRole">
              Nom du rôle <span className="ml-1 text-destructive">*</span>
            </Label>
            <Input
              id="nomRole"
              placeholder="ex: Manager des Ventes"
              value={form.nomRole}
              onChange={(event) => {
                setForm({ ...form, nomRole: event.target.value });
                if (errors.nomRole)
                  setErrors((prev) => ({ ...prev, nomRole: "" }));
              }}
            />
            {errors.nomRole && (
              <p className="text-xs text-destructive">{errors.nomRole}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={form.description ?? ""}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              placeholder="Décrivez les responsabilités de ce rôle..."
            />
          </div>
        </div>
      </AppModal>

      {/* Modal Confirmation Suppression */}
      <AppModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Confirmer la suppression"
        description="Cette action est irréversible."
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
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer définitivement
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground py-2">
          Voulez-vous vraiment supprimer le rôle{" "}
          <span className="font-semibold text-foreground">
            {pendingDeleteRole?.nomRole}
          </span>{" "}
          ?
        </p>
      </AppModal>
    </>
  );
}
