import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { LoaderCircle, User, Building2, SlidersHorizontal, Shield, ScrollText, MonitorSmartphone } from "lucide-react";
import { P as PageHeader } from "./PageHeader-JmieIep0.js";
import { a as SectionCard } from "./widgets-DEep6NAy.js";
import { B as Button, I as Input } from "./input-AeiaPT4J.js";
import { L as Label } from "./label-BDqSkCkP.js";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { c as cn } from "./router-DtcNlqbc.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-B4FgOFWL.js";
import { g as getMe, c as getSessions, u as updateProfile, d as changePassword, e as revokeOtherSessions } from "./auth.service-C3VxFeIr.js";
import { a as api } from "./client-DBXY_OFa.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "./dropdown-menu-CEa0MGsQ.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-tabs";
import "axios";
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
const getEntreprise = () => api.get("/parametres/entreprise");
const updateEntreprise = (data) => api.put("/parametres/entreprise", data);
const getSysteme = () => api.get("/parametres/systeme");
const updateSysteme = (data) => api.put("/parametres/systeme", data);
const updateMaintenance = (active) => api.patch("/parametres/systeme/maintenance", { active });
const getJournal = (params) => api.get("/parametres/journal", { params });
const today = () => {
  const now = /* @__PURE__ */ new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
};
const bounds = (date) => ({
  dateFrom: (/* @__PURE__ */ new Date(`${date}T00:00:00`)).toISOString(),
  dateTo: (/* @__PURE__ */ new Date(`${date}T23:59:59.999`)).toISOString()
});
const unwrap = (response) => response.data;
function SettingsPage() {
  const [profile, setProfile] = useState(null);
  const [company, setCompany] = useState(null);
  const [system, setSystem] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [audits, setAudits] = useState([]);
  const [logDate, setLogDate] = useState(today);
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: ""
  });
  const [loading, setLoading] = useState(true);
  const isSuperAdmin = profile?.role?.nomRole === "SUPER_ADMIN";
  useEffect(() => {
    Promise.all([getMe(), getEntreprise(), getSysteme(), getSessions()]).then(([me, business, settings, activeSessions]) => {
      setProfile(unwrap(me));
      setCompany(unwrap(business));
      setSystem(unwrap(settings));
      setSessions(unwrap(activeSessions) || []);
    }).catch(() => toast.error("Impossible de charger tous les paramètres")).finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    getJournal(bounds(logDate)).then((response) => setAudits(unwrap(response) || [])).catch(() => toast.error("Impossible de charger le journal"));
  }, [logDate]);
  const saveProfile = async () => {
    if (!profile) return;
    try {
      const response = await updateProfile(profile);
      const updated = unwrap(response);
      setProfile(updated);
      localStorage.setItem("erp_user", JSON.stringify(updated));
      toast.success("Profil enregistré");
    } catch (error) {
      toast.error(error?.response?.data?.error?.message || "Échec de l'enregistrement");
    }
  };
  const saveCompany = async () => {
    if (!company) return;
    try {
      setCompany(unwrap(await updateEntreprise(company)));
      toast.success("Paramètres entreprise enregistrés");
    } catch {
      toast.error("Échec de l'enregistrement");
    }
  };
  const toggleSystem = async (field, value) => {
    if (!system) return;
    try {
      const response = field === "modeMaintenance" ? await updateMaintenance(value) : await updateSysteme({
        [field]: value
      });
      setSystem(unwrap(response));
      toast.success("Paramètre mis à jour");
    } catch (error) {
      toast.error(error?.response?.data?.error?.message || "Modification refusée");
    }
  };
  const submitPassword = async () => {
    if (passwords.next !== passwords.confirm) return toast.error("Les nouveaux mots de passe ne correspondent pas");
    try {
      await changePassword(passwords.current, passwords.next);
      setPasswords({
        current: "",
        next: "",
        confirm: ""
      });
      toast.success("Mot de passe mis à jour");
    } catch (error) {
      toast.error(error?.response?.data?.error?.message || "Échec du changement de mot de passe");
    }
  };
  const revokeSessions = async () => {
    try {
      await revokeOtherSessions();
      setSessions([]);
      toast.success("Les autres sessions ont été déconnectées");
    } catch {
      toast.error("Impossible de révoquer les sessions");
    }
  };
  const logDescription = useMemo(() => `${audits.length} activité${audits.length > 1 ? "s" : ""} pour cette date`, [audits.length]);
  if (loading) return /* @__PURE__ */ jsx("div", { className: "flex min-h-64 items-center justify-center", children: /* @__PURE__ */ jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" }) });
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
        profile && /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Field, { label: "Prénom", value: profile.prenom, onChange: (prenom) => setProfile({
            ...profile,
            prenom
          }) }),
          /* @__PURE__ */ jsx(Field, { label: "Nom", value: profile.nom, onChange: (nom) => setProfile({
            ...profile,
            nom
          }) }),
          /* @__PURE__ */ jsx(Field, { label: "Adresse e-mail", type: "email", value: profile.email, onChange: (email) => setProfile({
            ...profile,
            email
          }) }),
          /* @__PURE__ */ jsx(Field, { label: "Téléphone", value: profile.telephone || "", onChange: (telephone) => setProfile({
            ...profile,
            telephone
          }) }),
          /* @__PURE__ */ jsx(Field, { label: "Avatar (URL)", value: profile.avatar || "", onChange: (avatar) => setProfile({
            ...profile,
            avatar
          }) }),
          /* @__PURE__ */ jsx(Field, { label: "Rôle", value: profile.role?.nomRole || "", disabled: true }),
          /* @__PURE__ */ jsx(Field, { label: "Statut", value: profile.statut || "", disabled: true })
        ] }),
        /* @__PURE__ */ jsx(Button, { className: "mt-4", onClick: saveProfile, children: "Enregistrer" })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "company", children: /* @__PURE__ */ jsxs(SectionCard, { title: "Paramètres entreprise", description: "Informations utilisées sur les documents et rapports", children: [
        company && /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Field, { label: "Raison sociale", value: company.raisonSociale, onChange: (raisonSociale) => setCompany({
            ...company,
            raisonSociale
          }) }),
          /* @__PURE__ */ jsx(Field, { label: "Identifiant fiscal", value: company.numeroFiscal || "", onChange: (numeroFiscal) => setCompany({
            ...company,
            numeroFiscal
          }) }),
          /* @__PURE__ */ jsx(Field, { label: "Adresse", value: company.adresse || "", onChange: (adresse) => setCompany({
            ...company,
            adresse
          }) }),
          /* @__PURE__ */ jsx(Field, { label: "Téléphone", value: company.telephone || "", onChange: (telephone) => setCompany({
            ...company,
            telephone
          }) }),
          /* @__PURE__ */ jsx(Field, { label: "E-mail", type: "email", value: company.email || "", onChange: (email) => setCompany({
            ...company,
            email
          }) }),
          /* @__PURE__ */ jsx(Field, { label: "Devise", value: company.devise, onChange: (devise) => setCompany({
            ...company,
            devise
          }) }),
          /* @__PURE__ */ jsx(Field, { label: "Fuseau horaire", value: company.fuseauHoraire, onChange: (fuseauHoraire) => setCompany({
            ...company,
            fuseauHoraire
          }) }),
          /* @__PURE__ */ jsx(Field, { label: "Logo (URL)", value: company.logo || "", onChange: (logo) => setCompany({
            ...company,
            logo
          }) })
        ] }),
        /* @__PURE__ */ jsx(Button, { className: "mt-4", onClick: saveCompany, children: "Enregistrer" })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "system", children: /* @__PURE__ */ jsx(SectionCard, { title: "Paramètres système", description: "Préférences globales de la plateforme", children: system && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx(Setting, { label: "Notifications par e-mail", description: "Recevoir les alertes importantes par e-mail", checked: system.notificationsEmail, onChange: (v) => toggleSystem("notificationsEmail", v) }),
        /* @__PURE__ */ jsx(Setting, { label: "Alertes IA proactives", description: "Prévisions et recommandations automatiques", checked: system.alertesIa, onChange: (v) => toggleSystem("alertesIa", v) }),
        /* @__PURE__ */ jsx(Setting, { label: "Facturation automatique", description: "Générer les factures à la validation des ventes", checked: system.facturationAutomatique, onChange: (v) => toggleSystem("facturationAutomatique", v) }),
        /* @__PURE__ */ jsx(Setting, { label: "Mode maintenance", description: isSuperAdmin ? "Bloque les écritures pour tous sauf le super administrateur" : "Seul le super administrateur peut modifier ce réglage", checked: system.modeMaintenance, disabled: !isSuperAdmin, onChange: (v) => toggleSystem("modeMaintenance", v) })
      ] }) }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "security", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxs(SectionCard, { title: "Sécurité", description: "Modification du mot de passe", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx(Field, { label: "Mot de passe actuel", type: "password", value: passwords.current, onChange: (current) => setPasswords({
              ...passwords,
              current
            }) }),
            /* @__PURE__ */ jsx(Field, { label: "Nouveau mot de passe", type: "password", value: passwords.next, onChange: (next) => setPasswords({
              ...passwords,
              next
            }) }),
            /* @__PURE__ */ jsx(Field, { label: "Confirmer le mot de passe", type: "password", value: passwords.confirm, onChange: (confirm) => setPasswords({
              ...passwords,
              confirm
            }) })
          ] }),
          /* @__PURE__ */ jsx(Button, { className: "mt-4", onClick: submitPassword, children: "Mettre à jour" })
        ] }),
        /* @__PURE__ */ jsxs(SectionCard, { title: "Sessions actives", description: "Contrôlez les connexions à votre compte", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-lg bg-secondary/50 p-4", children: [
            /* @__PURE__ */ jsx(MonitorSmartphone, { className: "h-8 w-8 text-primary" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium text-foreground", children: [
                sessions.length,
                " session",
                sessions.length > 1 ? "s" : "",
                " active",
                sessions.length > 1 ? "s" : ""
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Révoquez les jetons actifs sur les autres appareils" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", className: "mt-4 w-full", onClick: revokeSessions, children: "Déconnecter les autres sessions" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "log", children: /* @__PURE__ */ jsx(SectionCard, { title: "Journal d'activité", description: logDescription, action: /* @__PURE__ */ jsx(Input, { type: "date", value: logDate, onChange: (e) => setLogDate(e.target.value || today()), className: "w-auto", "aria-label": "Filtrer le journal par date" }), children: /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        audits.length === 0 && /* @__PURE__ */ jsx("p", { className: "py-8 text-center text-sm text-muted-foreground", children: "Aucune activité pour cette date." }),
        audits.map((audit) => {
          const actor = audit.utilisateur ? `${audit.utilisateur.prenom} ${audit.utilisateur.nom}` : "Système";
          return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border-b border-border/60 py-3 last:border-0", children: [
            /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-[10px] font-semibold text-white", children: actor.split(" ").map((w) => w[0]).join("").slice(0, 2) }),
            /* @__PURE__ */ jsxs("p", { className: "min-w-0 flex-1 text-sm text-foreground", children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: actor }),
              " ",
              /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                audit.action,
                " · ",
                audit.module
              ] })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "shrink-0 text-xs text-muted-foreground", children: new Date(audit.createdAt).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit"
            }) })
          ] }, audit.id);
        })
      ] }) }) })
    ] })
  ] });
}
function Field({
  label,
  value,
  onChange,
  disabled,
  type = "text"
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsx(Label, { children: label }),
    /* @__PURE__ */ jsx(Input, { type, value, disabled, onChange: (event) => onChange?.(event.target.value) })
  ] });
}
function Setting({
  label,
  description,
  checked,
  onChange,
  disabled
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 rounded-lg border border-border p-3.5", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground", children: label }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: description })
    ] }),
    /* @__PURE__ */ jsx(Switch, { checked, disabled, onCheckedChange: onChange })
  ] });
}
export {
  SettingsPage as component
};
