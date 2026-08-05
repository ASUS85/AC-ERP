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
  Check,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard } from "@/components/erp/widgets";
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

const actionOrder = [
  "lire",
  "creer",
  "modifier",
  "supprimer",
  "ajuster",
  "inventaire",
  "valider",
  "receptionner",
  "livrer",
  "avoir",
  "envoyer",
  "exporter",
  "chat",
  "rapport",
];

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
        ? rolesResponse.data.filter((role: RoleItem) => !role?.isSystemRole)
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
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [permissions]);

  const actionColumns = useMemo(
    () =>
      Array.from(
        new Set(permissions.map((permission) => permission.action)),
      ).sort((a, b) => {
        const indexA = actionOrder.indexOf(a);
        const indexB = actionOrder.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      }),
    [permissions],
  );

  const permissionsByModuleAction = useMemo(() => {
    const matrix = new Map<string, Map<string, PermissionItem>>();
    permissions.forEach((permission) => {
      const modulePermissions =
        matrix.get(permission.module) ?? new Map<string, PermissionItem>();
      modulePermissions.set(permission.action, permission);
      matrix.set(permission.module, modulePermissions);
    });
    return matrix;
  }, [permissions]);

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
    if (Object.keys(newErrors).length) {
      return;
    }

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
    setPermissionIds((current) => {
      if (!checked) return current.filter((value) => value !== permissionId);
      return current.includes(permissionId)
        ? current
        : [...current, permissionId];
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    setSavingPermissions(true);
    try {
      await updateRolePermissions(selectedRoleId, permissionIds);
      toast.success("Permissions mises à jour");
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
        description="Définissez les accès et les permissions métiers"
        breadcrumb={["Administration", "Rôles"]}
        actions={
          <Button size="sm" className="gap-1.5" onClick={openCreateModal}>
            <Plus className="h-4 w-4" /> Nouveau rôle
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Chargement…
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {roles.map((role) => {
              const isActive = role.id === selectedRoleId;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`rounded-sm border p-4 text-left shadow-card transition ${isActive ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ShieldCheck className="h-5 w-5" />
                    </span>
                    {role.isSystemRole ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : null}
                  </div>
                  <p className="mt-3 font-semibold text-foreground">
                    {role.nomRole}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {role.description || "Aucune description"}
                  </p>
                  <p className="mt-3 text-xs font-medium text-primary">
                    {role.permissions?.length ?? 0} permission(s)
                  </p>
                </button>
              );
            })}
          </div>

          <SectionCard
            title={
              selectedRole
                ? `Permissions — ${selectedRole.nomRole}`
                : "Permissions"
            }
            description="Activez ou désactivez les accès pour chaque module"
            action={
              selectedRole ? (
                <Button
                  onClick={() => void handleSavePermissions()}
                  disabled={savingPermissions}
                  size="sm"
                >
                  {savingPermissions ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Enregistrer
                </Button>
              ) : null
            }
          >
            {selectedRole ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-secondary/30 p-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {selectedRole.nomRole}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedRole.description || "Aucune description"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(selectedRole)}
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => openDeleteModal(selectedRole)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                        <th className="w-44 px-3 py-2.5 font-semibold">
                          Module
                        </th>
                        {actionColumns.map((action) => (
                          <th
                            key={action}
                            className="px-3 py-2.5 text-center font-semibold"
                          >
                            {actionLabels[action] ?? action}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {groupedPermissions.map(({ module, label }) => (
                        <tr
                          key={module}
                          className="border-b border-border/60 last:border-0 hover:bg-secondary/40"
                        >
                          <td className="px-3 py-3 font-medium text-foreground">
                            {label}
                          </td>
                          {actionColumns.map((action) => {
                            const permission = permissionsByModuleAction
                              .get(module)
                              ?.get(action);
                            const isChecked = permission
                              ? permissionIds.includes(permission.id)
                              : false;

                            return (
                              <td
                                key={`${module}-${action}`}
                                className="px-3 py-3 text-center"
                              >
                                {permission ? (
                                  <button
                                    type="button"
                                    aria-pressed={isChecked}
                                    aria-label={`${isChecked ? "Retirer" : "Ajouter"} la permission ${actionLabels[action] ?? action} pour ${label}`}
                                    onClick={() =>
                                      handlePermissionToggle(
                                        permission.id,
                                        !isChecked,
                                      )
                                    }
                                    className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full transition ${
                                      isChecked
                                        ? "bg-success/15 text-success hover:bg-success/25"
                                        : "bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                    }`}
                                  >
                                    {isChecked ? (
                                      <Check className="h-4 w-4" />
                                    ) : (
                                      <X className="h-4 w-4" />
                                    )}
                                  </button>
                                ) : (
                                  <span className="text-xs font-medium text-muted-foreground">
                                    -//-
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucun rôle disponible pour l’instant.
              </p>
            )}
          </SectionCard>
        </>
      )}

      <AppModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingRole ? "Modifier un rôle" : "Ajouter un rôle"}
        description={
          editingRole
            ? "Mettre à jour les informations du rôle."
            : "Créez un nouveau rôle métier."
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
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {editingRole ? "Enregistrer" : "Créer"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomRole">
              Nom du rôle <span class="ml-1 text-destructive">*</span>
            </Label>
            <Input
              id="nomRole"
              value={form.nomRole}
              onChange={(event) => {
                setForm({ ...form, nomRole: event.target.value });
                if (errors.nomRole)
                  setErrors((prev) => ({ ...prev, nomRole: "" }));
              }}
            />
            {errors.nomRole ? (
              <p className="text-xs text-destructive">{errors.nomRole}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description ?? ""}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              placeholder="Décrivez le rôle et son usage"
            />
          </div>
        </div>
      </AppModal>

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
            {pendingDeleteRole?.nomRole}
          </span>{" "}
          ?
        </p>
      </AppModal>
    </>
  );
}
