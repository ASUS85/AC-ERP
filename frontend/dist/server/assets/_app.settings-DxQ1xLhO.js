import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { LoaderCircle, User, Building2, SlidersHorizontal, Shield, ScrollText, Camera, MonitorSmartphone } from "lucide-react";
import { P as PageHeader } from "./PageHeader-Dn6TWXax.js";
import { a as SectionCard, b as SearchableSelect } from "./widgets-BO9olZIU.js";
import { c as cn, u as useGlobalLoader } from "./router-DoJhw79x.js";
import { I as Input, B as Button } from "./input-Cd6riMgS.js";
import { L as Label } from "./label-CxdS1iA0.js";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-SMOPig5I.js";
import { g as getMe, c as getSessions, u as uploadAvatar, d as updateProfile, e as changePassword, h as revokeOtherSessions } from "./auth.service-BkxtYZYd.js";
import { g as getEntreprise, a as getSysteme, b as getJournal, r as resolveAvatarUrl, u as updateEntreprise, c as updateMaintenance, d as updateSysteme } from "./parametres.service-B9l6_aoS.js";
import { s as setStoredCurrency, A as AFRICAN_CURRENCIES, g as getCurrencyMeta } from "./currency-oCEgfK2m.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "react-dom";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-tabs";
import "./client-C7e4CO8z.js";
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
const today = () => {
  const now = /* @__PURE__ */ new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
};
const bounds = (date) => ({
  dateFrom: (/* @__PURE__ */ new Date(`${date}T00:00:00`)).toISOString(),
  dateTo: (/* @__PURE__ */ new Date(`${date}T23:59:59.999`)).toISOString()
});
const unwrap = (response) => response.data;
const errorMessage = (error, fallback) => {
  const message = error.response?.data?.error?.message;
  return typeof message === "string" ? message : fallback;
};
function SettingsPage() {
  const {
    runWithLoader
  } = useGlobalLoader();
  const [profile, setProfile] = useState(null);
  const [company, setCompany] = useState(null);
  const [system, setSystem] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [audits, setAudits] = useState([]);
  const [logDate, setLogDate] = useState(today);
  const [profileErrors, setProfileErrors] = useState({});
  const [companyErrors, setCompanyErrors] = useState({});
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: ""
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const isSuperAdmin = profile?.role?.nomRole === "SUPER_ADMIN";
  useEffect(() => {
    Promise.all([getMe(), getEntreprise(), getSysteme(), getSessions()]).then(([me, business, settings, activeSessions]) => {
      setProfile(unwrap(me));
      const loadedCompany = unwrap(business);
      setCompany(loadedCompany);
      setStoredCurrency(loadedCompany?.devise);
      setSystem(unwrap(settings));
      setSessions(unwrap(activeSessions) || []);
    }).catch(() => toast.error("Impossible de charger tous les paramètres")).finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    getJournal(bounds(logDate)).then((response) => setAudits(unwrap(response) || [])).catch(() => toast.error("Impossible de charger le journal"));
  }, [logDate]);
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);
  const saveProfile = async () => {
    if (!profile) return;
    const newErrors = {};
    if (!profile.nom.trim()) newErrors.nom = "Le nom est obligatoire";
    if (!profile.prenom.trim()) newErrors.prenom = "Le prénom est obligatoire";
    if (!profile.email.trim()) newErrors.email = "L’e-mail est obligatoire";
    setProfileErrors(newErrors);
    if (Object.keys(newErrors).length) return;
    try {
      const profilePayload = {
        ...profile
      };
      if (avatarFile) {
        const uploadResponse = await runWithLoader(uploadAvatar(avatarFile), {
          target: "main",
          label: "Import de la photo..."
        });
        profilePayload.avatar = unwrap(uploadResponse).avatar;
      }
      const response = await runWithLoader(updateProfile(profilePayload), {
        target: "main",
        label: "Enregistrement du profil..."
      });
      const updated = unwrap(response);
      setProfile(updated);
      setProfileErrors({});
      setAvatarFile(null);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview("");
      }
      localStorage.setItem("erp_user", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("erp:user-updated", {
        detail: updated
      }));
      toast.success("Profil enregistré");
    } catch (error) {
      toast.error(errorMessage(error, "Échec de l'enregistrement"));
    }
  };
  const saveCompany = async () => {
    if (!company) return;
    const newErrors = {};
    if (!company.raisonSociale.trim()) newErrors.raisonSociale = "La raison sociale est obligatoire";
    if (!company.devise.trim()) newErrors.devise = "La devise est obligatoire";
    if (!company.fuseauHoraire.trim()) newErrors.fuseauHoraire = "Le fuseau horaire est obligatoire";
    setCompanyErrors(newErrors);
    if (Object.keys(newErrors).length) return;
    try {
      const response = await updateEntreprise(company);
      const updatedCompany = unwrap(response);
      setCompany(updatedCompany);
      setStoredCurrency(updatedCompany?.devise);
      setCompanyErrors({});
      toast.success("Paramètres entreprise enregistrés");
    } catch {
      toast.error("Échec de l'enregistrement");
    }
  };
  const updateProfileField = (field, value) => {
    if (!profile) return;
    setProfile({
      ...profile,
      [field]: value
    });
    if (profileErrors[field]) {
      setProfileErrors((prev) => ({
        ...prev,
        [field]: ""
      }));
    }
  };
  const updateCompanyField = (field, value) => {
    if (!company) return;
    setCompany({
      ...company,
      [field]: value
    });
    if (companyErrors[field]) {
      setCompanyErrors((prev) => ({
        ...prev,
        [field]: ""
      }));
    }
  };
  const handleAvatarChange = (file) => {
    if (!file || !profile) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez choisir une image JPG, PNG ou équivalent");
      return;
    }
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
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
      toast.error(errorMessage(error, "Modification refusée"));
    }
  };
  const submitPassword = async () => {
    const newErrors = {};
    if (!passwords.current.trim()) newErrors.current = "Le mot de passe actuel est obligatoire";
    if (!passwords.next.trim()) newErrors.next = "Le nouveau mot de passe est obligatoire";
    if (!passwords.confirm.trim()) newErrors.confirm = "La confirmation est obligatoire";
    if (passwords.next && passwords.confirm && passwords.next !== passwords.confirm) {
      newErrors.confirm = "Les nouveaux mots de passe ne correspondent pas";
    }
    setPasswordErrors(newErrors);
    if (Object.keys(newErrors).length) return;
    try {
      await changePassword(passwords.current, passwords.next);
      setPasswords({
        current: "",
        next: "",
        confirm: ""
      });
      setPasswordErrors({});
      toast.success("Mot de passe mis à jour");
    } catch (error) {
      toast.error(errorMessage(error, "Échec du changement de mot de passe"));
    }
  };
  const revokeSessions = async () => {
    try {
      await revokeOtherSessions();
      const response = await getSessions();
      setSessions(unwrap(response) || []);
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
          /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsx(Label, { className: "mb-2 block", children: "Photo de profil" }),
            /* @__PURE__ */ jsxs("label", { className: "group relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-secondary text-muted-foreground shadow-sm transition-colors hover:border-primary hover:text-primary", children: [
              avatarPreview || profile.avatar ? /* @__PURE__ */ jsx("img", { src: avatarPreview || resolveAvatarUrl(profile.avatar), alt: "Photo de profil", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx(User, { className: "h-9 w-9" }),
              /* @__PURE__ */ jsx("span", { className: "absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 transition-opacity group-hover:opacity-100", children: /* @__PURE__ */ jsx(Camera, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsx(Input, { type: "file", accept: "image/png,image/jpeg,image/jpg,image/webp,image/gif", className: "sr-only", onChange: (event) => {
                handleAvatarChange(event.target.files?.[0]);
                event.target.value = "";
              } })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Field, { label: "Nom", value: profile.nom, placeholder: "Entrez votre nom", required: true, error: profileErrors.nom, onChange: (nom) => updateProfileField("nom", nom) }),
          /* @__PURE__ */ jsx(Field, { label: "Prénom", value: profile.prenom, placeholder: "Entrez votre prénom", required: true, error: profileErrors.prenom, onChange: (prenom) => updateProfileField("prenom", prenom) }),
          /* @__PURE__ */ jsx(Field, { label: "Adresse e-mail", type: "email", value: profile.email, placeholder: "exemple@ac-erp.com", required: true, error: profileErrors.email, onChange: (email) => updateProfileField("email", email) }),
          /* @__PURE__ */ jsx(Field, { label: "Téléphone", value: profile.telephone || "", placeholder: "Entrez votre numéro de téléphone", onChange: (telephone) => updateProfileField("telephone", telephone) }),
          /* @__PURE__ */ jsx(Field, { label: "Rôle", value: profile.role?.nomRole || "", placeholder: "Rôle attribué", disabled: true }),
          /* @__PURE__ */ jsx(Field, { label: "Statut", value: profile.statut || "", placeholder: "Statut du compte", disabled: true })
        ] }),
        /* @__PURE__ */ jsx(Button, { className: "mt-4", onClick: saveProfile, children: "Enregistrer" })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "company", children: /* @__PURE__ */ jsxs(SectionCard, { title: "Paramètres entreprise", description: "Informations utilisées sur les documents et rapports", children: [
        company && /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Field, { label: "Raison sociale", value: company.raisonSociale, placeholder: "Nom officiel de l’entreprise", required: true, error: companyErrors.raisonSociale, onChange: (raisonSociale) => updateCompanyField("raisonSociale", raisonSociale) }),
          /* @__PURE__ */ jsx(Field, { label: "Identifiant fiscal", value: company.numeroFiscal || "", placeholder: "Numéro fiscal ou NIU", onChange: (numeroFiscal) => updateCompanyField("numeroFiscal", numeroFiscal) }),
          /* @__PURE__ */ jsx(Field, { label: "Adresse", value: company.adresse || "", placeholder: "Adresse complète", onChange: (adresse) => updateCompanyField("adresse", adresse) }),
          /* @__PURE__ */ jsx(Field, { label: "Téléphone", value: company.telephone || "", placeholder: "Numéro de téléphone de l’entreprise", onChange: (telephone) => updateCompanyField("telephone", telephone) }),
          /* @__PURE__ */ jsx(Field, { label: "E-mail", type: "email", value: company.email || "", placeholder: "contact@entreprise.com", onChange: (email) => updateCompanyField("email", email) }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxs(Label, { children: [
              "Devise",
              /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsx(SearchableSelect, { value: company.devise, onValueChange: (devise) => updateCompanyField("devise", devise), options: AFRICAN_CURRENCIES.map((currency) => ({
              value: currency.code,
              label: `${currency.code} - ${currency.name} (${currency.symbol})`
            })), placeholder: "Selectionnez une devise", searchPlaceholder: "Rechercher une devise", emptyMessage: "Aucune devise trouvee" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Symbole utilise: ",
              getCurrencyMeta(company.devise).symbol
            ] }),
            companyErrors.devise && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: companyErrors.devise })
          ] }),
          /* @__PURE__ */ jsx(Field, { label: "Fuseau horaire", value: company.fuseauHoraire, placeholder: "Africa/Douala", required: true, error: companyErrors.fuseauHoraire, onChange: (fuseauHoraire) => updateCompanyField("fuseauHoraire", fuseauHoraire) }),
          /* @__PURE__ */ jsx(Field, { label: "Logo (URL)", value: company.logo || "", placeholder: "https://exemple.com/logo.png", onChange: (logo) => updateCompanyField("logo", logo) })
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
            /* @__PURE__ */ jsx(Field, { label: "Mot de passe actuel", type: "password", value: passwords.current, error: passwordErrors.current, placeholder: "Saisissez le mot de passe actuel", required: true, autoComplete: "off", onChange: (current) => {
              setPasswords({
                ...passwords,
                current
              });
              if (passwordErrors.current) setPasswordErrors((prev) => ({
                ...prev,
                current: ""
              }));
            } }),
            /* @__PURE__ */ jsx(Field, { label: "Nouveau mot de passe", type: "password", value: passwords.next, error: passwordErrors.next, placeholder: "Saisissez le nouveau mot de passe", required: true, autoComplete: "new-password", onChange: (next) => {
              setPasswords({
                ...passwords,
                next
              });
              if (passwordErrors.next) setPasswordErrors((prev) => ({
                ...prev,
                next: ""
              }));
            } }),
            /* @__PURE__ */ jsx(Field, { label: "Confirmer le mot de passe", type: "password", value: passwords.confirm, error: passwordErrors.confirm, placeholder: "Confirmez le nouveau mot de passe", required: true, autoComplete: "new-password", onChange: (confirm) => {
              setPasswords({
                ...passwords,
                confirm
              });
              if (passwordErrors.confirm) setPasswordErrors((prev) => ({
                ...prev,
                confirm: ""
              }));
            } })
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
                " ",
                "active",
                sessions.length > 1 ? "s" : ""
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Révoquez les jetons actifs sur les autres appareils" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", className: "mt-4 w-full", onClick: revokeSessions, children: "Déconnecter les autres sessions" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "log", children: /* @__PURE__ */ jsx(SectionCard, { title: "Journal d'activité", description: logDescription, action: /* @__PURE__ */ jsx(Input, { type: "date", value: logDate, onChange: (e) => setLogDate(e.target.value || today()), className: "w-auto", "aria-label": "Filtrer le journal par date" }), children: /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        audits.length === 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-5 text-center", children: [
          /* @__PURE__ */ jsx("img", { src: "/src/assets/sorry.svg", alt: "Aucun élément", className: "mb-3 w-28 opacity-90" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Aucun élément à afficher" })
        ] }),
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
  type = "text",
  error,
  autoComplete,
  placeholder,
  required = false
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxs(Label, { children: [
      label,
      required && /* @__PURE__ */ jsx("span", { className: "ml-1 text-destructive", children: "*" })
    ] }),
    /* @__PURE__ */ jsx(Input, { type, value, placeholder, disabled, autoComplete, "aria-invalid": Boolean(error), onChange: (e) => onChange?.(e.target.value) }),
    error && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: error })
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
