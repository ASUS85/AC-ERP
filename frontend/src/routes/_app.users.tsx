import { createFileRoute } from "@tanstack/react-router";
import { Users, UserPlus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard, Toolbar, Pagination, StatCard } from "@/components/erp/widgets";
import { DataTable, type Column } from "@/components/erp/DataTable";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { Button } from "@/components/ui/button";
import { users } from "@/lib/erp-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/users")({
  head: () => ({ meta: [{ title: "Utilisateurs — AC ERP" }] }),
  component: UsersPage,
});

type U = (typeof users)[number];
const initials = (n: string) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const cols: Column<U>[] = [
  {
    key: "nom",
    header: "Utilisateur",
    render: (u) => (
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-white">{initials(u.nom)}</span>
        <div>
          <p className="font-medium text-foreground">{u.nom}</p>
          <p className="text-xs text-muted-foreground">{u.email}</p>
        </div>
      </div>
    ),
  },
  { key: "role", header: "Rôle", render: (u) => <span className="text-foreground">{u.role}</span> },
  { key: "dernier", header: "Dernière activité" },
  { key: "statut", header: "Statut", render: (u) => <StatusBadge status={u.statut} /> },
  {
    key: "act",
    header: "Actions",
    align: "right",
    render: () => (
      <div className="flex justify-end gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info("Modifier")}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => toast.error("Supprimer")}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

function UsersPage() {
  return (
    <>
      <PageHeader
        title="Utilisateurs"
        description="Gestion des comptes et accès"
        breadcrumb={["Administration", "Utilisateurs"]}
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => toast.info("Ajout d'un utilisateur")}>
            <UserPlus className="h-4 w-4" /> Ajouter un utilisateur
          </Button>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Utilisateurs" value="16" sub="comptes" icon={<Users className="h-5 w-5" />} />
        <StatCard label="Actifs" value="13" sub="connectés ce mois" icon={<Users className="h-5 w-5" />} />
        <StatCard label="Rôles" value="5" sub="définis" icon={<Users className="h-5 w-5" />} />
        <StatCard label="Invitations" value="2" sub="en attente" icon={<UserPlus className="h-5 w-5" />} />
      </div>
      <SectionCard title="Liste des utilisateurs">
        <div className="mb-4">
          <Toolbar placeholder="Rechercher un utilisateur…" />
        </div>
        <DataTable columns={cols} rows={users} rowKey={(u) => u.email} withActions={false} />
        <Pagination count={16} />
      </SectionCard>
    </>
  );
}