import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { User, Building2, SlidersHorizontal, Shield, ScrollText, DatabaseBackup } from "lucide-react";
import { P as PageHeader } from "./PageHeader-JmieIep0.js";
import { a as SectionCard } from "./widgets-Cox8fFgr.js";
import { c as cn, I as Input, B as Button } from "./input-DooCX65b.js";
import { L as Label } from "./label-J69NRFJS.js";
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CWj6n63f.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@radix-ui/react-tabs";
const Switch = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SwitchPrimitives.Root,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsx(
      SwitchPrimitives.Thumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = SwitchPrimitives.Root.displayName;
const activity = [{
  a: "Sophie Martin",
  t: "a validé la facture FAC-2026-148",
  time: "Il y a 12 min"
}, {
  a: "Karim Benali",
  t: "a créé la vente VTE-2048",
  time: "Il y a 1 h"
}, {
  a: "Léa Dubois",
  t: "a enregistré un paiement de 4 280 €",
  time: "Il y a 2 h"
}, {
  a: "Nadia Haddad",
  t: "a passé le bon de commande ACH-1182",
  time: "Hier"
}];
function SettingsPage() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Paramètres & configuration", description: "Profil, entreprise, système et sécurité", breadcrumb: ["Administration", "Paramètres"] }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "profile", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "mb-4 flex-wrap", children: [
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "profile", className: "gap-1.5", children: [
          /* @__PURE__ */ jsx(User, { className: "h-4 w-4" }),
          " Profil"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "company", className: "gap-1.5", children: [
          /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4" }),
          " Entreprise"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "system", className: "gap-1.5", children: [
          /* @__PURE__ */ jsx(SlidersHorizontal, { className: "h-4 w-4" }),
          " Système"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "security", className: "gap-1.5", children: [
          /* @__PURE__ */ jsx(Shield, { className: "h-4 w-4" }),
          " Sécurité"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "log", className: "gap-1.5", children: [
          /* @__PURE__ */ jsx(ScrollText, { className: "h-4 w-4" }),
          " Journal"
        ] })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "profile", children: /* @__PURE__ */ jsxs(SectionCard, { title: "Profil utilisateur", description: "Vos informations personnelles", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { children: "Nom complet" }),
            /* @__PURE__ */ jsx(Input, { defaultValue: "Sophie Martin" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { children: "Adresse e-mail" }),
            /* @__PURE__ */ jsx(Input, { defaultValue: "s.martin@acerp.fr" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { children: "Téléphone" }),
            /* @__PURE__ */ jsx(Input, { defaultValue: "+33 6 12 34 56 78" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { children: "Rôle" }),
            /* @__PURE__ */ jsx(Input, { defaultValue: "Administrateur", disabled: true })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Button, { className: "mt-4", onClick: () => toast.success("Profil enregistré"), children: "Enregistrer" })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "company", children: /* @__PURE__ */ jsxs(SectionCard, { title: "Paramètres entreprise", description: "Coordonnées de l'entreprise", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { children: "Raison sociale" }),
            /* @__PURE__ */ jsx(Input, { defaultValue: "AC ERP SAS" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { children: "N° TVA" }),
            /* @__PURE__ */ jsx(Input, { defaultValue: "FR 12 345 678 901" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { children: "Adresse" }),
            /* @__PURE__ */ jsx(Input, { defaultValue: "12 rue du Commerce, Lyon" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { children: "Devise" }),
            /* @__PURE__ */ jsx(Input, { defaultValue: "EUR (€)" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Button, { className: "mt-4", onClick: () => toast.success("Paramètres enregistrés"), children: "Enregistrer" })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "system", children: /* @__PURE__ */ jsx(SectionCard, { title: "Paramètres système", description: "Préférences de la plateforme", children: /* @__PURE__ */ jsx("div", { className: "space-y-4", children: [{
        t: "Notifications par e-mail",
        d: "Recevoir les alertes importantes par e-mail",
        on: true
      }, {
        t: "Alertes IA proactives",
        d: "Prévisions et recommandations automatiques",
        on: true
      }, {
        t: "Facturation automatique",
        d: "Générer les factures à la validation des ventes",
        on: true
      }, {
        t: "Mode maintenance",
        d: "Restreindre l'accès aux administrateurs",
        on: false
      }].map((s) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 rounded-lg border border-border p-3.5", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground", children: s.t }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: s.d })
        ] }),
        /* @__PURE__ */ jsx(Switch, { defaultChecked: s.on })
      ] }, s.t)) }) }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "security", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxs(SectionCard, { title: "Sécurité", description: "Mot de passe et authentification", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx(Label, { children: "Mot de passe actuel" }),
              /* @__PURE__ */ jsx(Input, { type: "password", defaultValue: "********" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx(Label, { children: "Nouveau mot de passe" }),
              /* @__PURE__ */ jsx(Input, { type: "password" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-lg border border-border p-3.5", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground", children: "Double authentification (2FA)" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Sécurité renforcée à la connexion" })
              ] }),
              /* @__PURE__ */ jsx(Switch, { defaultChecked: true })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { className: "mt-4", onClick: () => toast.success("Sécurité mise à jour"), children: "Mettre à jour" })
        ] }),
        /* @__PURE__ */ jsxs(SectionCard, { title: "Sauvegardes", description: "Gestion des sauvegardes de données", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-lg bg-secondary/50 p-4", children: [
            /* @__PURE__ */ jsx(DatabaseBackup, { className: "h-8 w-8 text-primary" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground", children: "Dernière sauvegarde" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "10 juin 2026 à 03:00 · Automatique quotidienne" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "mt-4 w-full gap-1.5", onClick: () => toast.success("Sauvegarde lancée"), children: [
            /* @__PURE__ */ jsx(DatabaseBackup, { className: "h-4 w-4" }),
            " Sauvegarder maintenant"
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "log", children: /* @__PURE__ */ jsx(SectionCard, { title: "Journal d'activité", description: "Historique des actions récentes", children: /* @__PURE__ */ jsx("div", { className: "space-y-1", children: activity.map((a) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border-b border-border/60 py-3 last:border-0", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-[10px] font-semibold text-white", children: a.a.split(" ").map((w) => w[0]).join("") }),
        /* @__PURE__ */ jsxs("p", { className: "flex-1 text-sm text-foreground", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: a.a }),
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: a.t })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: a.time })
      ] }, a.t)) }) }) })
    ] })
  ] });
}
export {
  SettingsPage as component
};
