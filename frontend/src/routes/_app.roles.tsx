import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Check, X, Plus } from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard } from "@/components/erp/widgets";
import { Button } from "@/components/ui/button";
import { roles, permModules, permMatrix } from "@/lib/erp-data";

export const Route = createFileRoute("/_app/roles")({
  head: () => ({ meta: [{ title: "Rôles & permissions — AC ERP" }] }),
  component: RolesPage,
});

function RolesPage() {
  const roleNames = Object.keys(permMatrix);
  return (
    <>
      <PageHeader
        title="Rôles & permissions"
        description="Contrôle d'accès par module"
        breadcrumb={["Administration", "Rôles"]}
        actions={
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Nouveau rôle
          </Button>
        }
      />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {roles.map((r) => (
          <div key={r.nom} className="rounded-xl border border-border bg-card p-4 shadow-card">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <p className="mt-3 font-semibold text-foreground">{r.nom}</p>
            <p className="mt-1 text-xs text-muted-foreground">{r.desc}</p>
            <p className="mt-3 text-xs font-medium text-primary">{r.users} utilisateur(s)</p>
          </div>
        ))}
      </div>
      <SectionCard title="Matrice rôles / permissions" description="Permissions accordées par module">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2.5 font-medium">Module</th>
                {roleNames.map((r) => (
                  <th key={r} className="px-3 py-2.5 text-center font-medium">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permModules.map((m) => (
                <tr key={m} className="border-b border-border/60 last:border-0 hover:bg-secondary/40">
                  <td className="px-3 py-3 font-medium text-foreground">{m}</td>
                  {roleNames.map((r) => (
                    <td key={r} className="px-3 py-3 text-center">
                      {permMatrix[r][m] ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success/12 text-success">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          <X className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}