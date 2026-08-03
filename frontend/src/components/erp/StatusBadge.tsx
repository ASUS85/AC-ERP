import { cn } from "@/lib/utils";

const map: Record<string, string> = {
  actif: "bg-success/12 text-success border-success/20",
  valide: "bg-success/12 text-success border-success/20",
  validee: "bg-success/12 text-success border-success/20",
  payee: "bg-success/12 text-success border-success/20",
  recue: "bg-success/12 text-success border-success/20",
  recu: "bg-success/12 text-success border-success/20",

  "en attente": "bg-warning/15 text-warning-foreground border-warning/30",
  "en transit": "bg-warning/15 text-warning-foreground border-warning/30",
  "stock faible": "bg-warning/15 text-warning-foreground border-warning/30",
  "en pause": "bg-warning/15 text-warning-foreground border-warning/30",
  moyen: "bg-warning/15 text-warning-foreground border-warning/30",

  "en retard": "bg-destructive/10 text-destructive border-destructive/20",
  annulee: "bg-destructive/10 text-destructive border-destructive/20",
  annulée: "bg-destructive/10 text-destructive border-destructive/20",
  rupture: "bg-destructive/10 text-destructive border-destructive/20",
  critique: "bg-destructive/10 text-destructive border-destructive/20",
  eleve: "bg-destructive/10 text-destructive border-destructive/20",
  élevé: "bg-destructive/10 text-destructive border-destructive/20",
  inactif: "bg-destructive/10 text-destructive border-destructive/20",

  emis: "bg-info/12 text-info border-info/20",
  émis: "bg-info/12 text-info border-info/20",
  brouillon: "bg-muted text-muted-foreground border-border",
  soumis: "bg-info/12 text-info border-info/20",
  envoye: "bg-info/12 text-info border-info/20",
  "recu partiel": "bg-warning/15 text-warning-foreground border-warning/30",
  "recu total": "bg-success/12 text-success border-success/20",
  annule: "bg-destructive/10 text-destructive border-destructive/20",
  archive: "bg-secondary text-secondary-foreground border-border",
  archivé: "bg-secondary text-secondary-foreground border-border",
  entree: "bg-success/12 text-success border-success/20",
  entrée: "bg-success/12 text-success border-success/20",
  sortie: "bg-info/12 text-info border-info/20",
  faible: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status }: { status: string }) {
  const key = status
    ?.trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        map[key] ?? "bg-muted text-muted-foreground border-border",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
