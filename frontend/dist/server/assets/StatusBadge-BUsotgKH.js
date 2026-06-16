import { jsxs, jsx } from "react/jsx-runtime";
import { c as cn } from "./input-BiB-PFhx.js";
const map = {
  // success-like
  Payée: "bg-success/12 text-success border-success/20",
  Reçue: "bg-success/12 text-success border-success/20",
  Reçu: "bg-success/12 text-success border-success/20",
  Actif: "bg-success/12 text-success border-success/20",
  Validée: "bg-success/12 text-success border-success/20",
  // warning-like
  "En attente": "bg-warning/15 text-warning-foreground border-warning/30",
  "En transit": "bg-warning/15 text-warning-foreground border-warning/30",
  "Stock faible": "bg-warning/15 text-warning-foreground border-warning/30",
  "En pause": "bg-warning/15 text-warning-foreground border-warning/30",
  Moyen: "bg-warning/15 text-warning-foreground border-warning/30",
  // destructive-like
  "En retard": "bg-destructive/10 text-destructive border-destructive/20",
  Annulée: "bg-destructive/10 text-destructive border-destructive/20",
  Rupture: "bg-destructive/10 text-destructive border-destructive/20",
  Critique: "bg-destructive/10 text-destructive border-destructive/20",
  Élevé: "bg-destructive/10 text-destructive border-destructive/20",
  // info / neutral
  Émis: "bg-info/12 text-info border-info/20",
  Brouillon: "bg-muted text-muted-foreground border-border",
  Inactif: "bg-muted text-muted-foreground border-border",
  Entrée: "bg-success/12 text-success border-success/20",
  Sortie: "bg-info/12 text-info border-info/20",
  Faible: "bg-muted text-muted-foreground border-border"
};
function StatusBadge({ status }) {
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        map[status] ?? "bg-muted text-muted-foreground border-border"
      ),
      children: [
        /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-current opacity-70" }),
        status
      ]
    }
  );
}
export {
  StatusBadge as S
};
