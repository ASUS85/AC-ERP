import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  User,
  Building2,
  SlidersHorizontal,
  ScrollText,
  Shield,
  MonitorSmartphone,
  LoaderCircle,
  Camera,
} from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard } from "@/components/erp/widgets";
import { useGlobalLoader } from "@/components/erp/GlobalLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  changePassword,
  getMe,
  getSessions,
  revokeOtherSessions,
  updateProfile,
  uploadAvatar,
} from "@/lib/api/auth.service";
import { resolveAvatarUrl } from "@/lib/avatar";
import {
  getEntreprise,
  getJournal,
  getSysteme,
  updateEntreprise,
  updateMaintenance,
  updateSysteme,
} from "@/lib/api/parametres.service";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Paramètres — AC ERP" }] }),
  component: SettingsPage,
});

type Profile = {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  avatar?: string;
  statut?: string;
  role?: { nomRole: string };
};
type Company = {
  raisonSociale: string;
  numeroFiscal?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  devise: string;
  fuseauHoraire: string;
  logo?: string;
};
type SystemSettings = {
  notificationsEmail: boolean;
  alertesIa: boolean;
  facturationAutomatique: boolean;
  modeMaintenance: boolean;
};
type Audit = {
  id: string;
  action: string;
  module: string;
  newValues?: { status?: number };
  createdAt: string;
  utilisateur?: { nom: string; prenom: string; email: string };
};
type Session = { id: string; createdAt: string; expiresAt: string };
type ApiResponse<T> = { data: T };
type ApiError = { response?: { data?: { error?: { message?: unknown } } } };
type AvatarUploadResponse = { avatar: string };

const today = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
};
const bounds = (date: string) => ({
  dateFrom: new Date(`${date}T00:00:00`).toISOString(),
  dateTo: new Date(`${date}T23:59:59.999`).toISOString(),
});
const unwrap = <T,>(response: ApiResponse<T>) => response.data;
const errorMessage = (error: unknown, fallback: string) => {
  const message = (error as ApiError).response?.data?.error?.message;
  return typeof message === "string" ? message : fallback;
};

function SettingsPage() {
  const { runWithLoader } = useGlobalLoader();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [system, setSystem] = useState<SystemSettings | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [logDate, setLogDate] = useState(today);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>(
    {},
  );
  const [companyErrors, setCompanyErrors] = useState<Record<string, string>>(
    {},
  );
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = profile?.role?.nomRole === "SUPER_ADMIN";

  useEffect(() => {
    Promise.all([getMe(), getEntreprise(), getSysteme(), getSessions()])
      .then(([me, business, settings, activeSessions]) => {
        setProfile(unwrap(me as ApiResponse<Profile>));
        setCompany(unwrap(business as ApiResponse<Company>));
        setSystem(unwrap(settings as ApiResponse<SystemSettings>));
        setSessions(unwrap(activeSessions as ApiResponse<Session[]>) || []);
      })
      .catch(() => toast.error("Impossible de charger tous les paramètres"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getJournal(bounds(logDate))
      .then((response) =>
        setAudits(unwrap(response as ApiResponse<Audit[]>) || []),
      )
      .catch(() => toast.error("Impossible de charger le journal"));
  }, [logDate]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const saveProfile = async () => {
    if (!profile) return;
    const newErrors: Record<string, string> = {};
    if (!profile.nom.trim()) newErrors.nom = "Le nom est obligatoire";
    if (!profile.prenom.trim()) newErrors.prenom = "Le prénom est obligatoire";
    if (!profile.email.trim()) newErrors.email = "L’e-mail est obligatoire";
    setProfileErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    try {
      const profilePayload = { ...profile };
      if (avatarFile) {
        const uploadResponse = await runWithLoader(uploadAvatar(avatarFile), {
          target: "main",
          label: "Import de la photo...",
        });
        profilePayload.avatar = unwrap(
          uploadResponse as ApiResponse<AvatarUploadResponse>,
        ).avatar;
      }

      const response = await runWithLoader(updateProfile(profilePayload), {
        target: "main",
        label: "Enregistrement du profil...",
      });
      const updated = unwrap(response as ApiResponse<Profile>);
      setProfile(updated);
      setProfileErrors({});
      setAvatarFile(null);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview("");
      }
      localStorage.setItem("erp_user", JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent("erp:user-updated", { detail: updated }),
      );
      toast.success("Profil enregistré");
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Échec de l'enregistrement"));
    }
  };

  const saveCompany = async () => {
    if (!company) return;
    const newErrors: Record<string, string> = {};
    if (!company.raisonSociale.trim())
      newErrors.raisonSociale = "La raison sociale est obligatoire";
    if (!company.devise.trim()) newErrors.devise = "La devise est obligatoire";
    if (!company.fuseauHoraire.trim())
      newErrors.fuseauHoraire = "Le fuseau horaire est obligatoire";
    setCompanyErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    try {
      const response = await updateEntreprise(company);
      setCompany(unwrap(response as ApiResponse<Company>));
      setCompanyErrors({});
      toast.success("Paramètres entreprise enregistrés");
    } catch {
      toast.error("Échec de l'enregistrement");
    }
  };

  const updateProfileField = (field: keyof Profile, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
    if (profileErrors[field]) {
      setProfileErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const updateCompanyField = (field: keyof Company, value: string) => {
    if (!company) return;
    setCompany({ ...company, [field]: value });
    if (companyErrors[field]) {
      setCompanyErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAvatarChange = (file?: File) => {
    if (!file || !profile) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez choisir une image JPG, PNG ou équivalent");
      return;
    }

    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const toggleSystem = async (field: keyof SystemSettings, value: boolean) => {
    if (!system) return;
    try {
      const response =
        field === "modeMaintenance"
          ? await updateMaintenance(value)
          : await updateSysteme({ [field]: value });
      setSystem(unwrap(response as ApiResponse<SystemSettings>));
      toast.success("Paramètre mis à jour");
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Modification refusée"));
    }
  };

  const submitPassword = async () => {
    const newErrors: Record<string, string> = {};
    if (!passwords.current.trim())
      newErrors.current = "Le mot de passe actuel est obligatoire";
    if (!passwords.next.trim())
      newErrors.next = "Le nouveau mot de passe est obligatoire";
    if (!passwords.confirm.trim())
      newErrors.confirm = "La confirmation est obligatoire";
    if (
      passwords.next &&
      passwords.confirm &&
      passwords.next !== passwords.confirm
    ) {
      newErrors.confirm = "Les nouveaux mots de passe ne correspondent pas";
    }
    setPasswordErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    try {
      await changePassword(passwords.current, passwords.next);
      setPasswords({ current: "", next: "", confirm: "" });
      setPasswordErrors({});
      toast.success("Mot de passe mis à jour");
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Échec du changement de mot de passe"));
    }
  };

  const revokeSessions = async () => {
    try {
      await revokeOtherSessions();
      const response = await getSessions();
      setSessions(unwrap(response as ApiResponse<Session[]>) || []);
      toast.success("Les autres sessions ont été déconnectées");
    } catch {
      toast.error("Impossible de révoquer les sessions");
    }
  };

  const logDescription = useMemo(
    () =>
      `${audits.length} activité${audits.length > 1 ? "s" : ""} pour cette date`,
    [audits.length],
  );
  if (loading)
    return (
      <div className="flex min-h-64 items-center justify-center">
        <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <>
      <PageHeader
        title="Paramètres & configuration"
        description="Profil, entreprise, système et sécurité"
        breadcrumb={["Administration", "Paramètres"]}
      />
      <Tabs defaultValue="profile">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="profile" className="gap-1.5">
            <User className="h-4 w-4" /> Profil
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-1.5">
            <Building2 className="h-4 w-4" /> Entreprise
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-1.5">
            <SlidersHorizontal className="h-4 w-4" /> Système
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5">
            <Shield className="h-4 w-4" /> Sécurité
          </TabsTrigger>
          <TabsTrigger value="log" className="gap-1.5">
            <ScrollText className="h-4 w-4" /> Journal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <SectionCard
            title="Profil utilisateur"
            description="Vos informations personnelles"
          >
            {profile && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label className="mb-2 block">Photo de profil</Label>
                  <label className="group relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-secondary text-muted-foreground shadow-sm transition-colors hover:border-primary hover:text-primary">
                    {avatarPreview || profile.avatar ? (
                      <img
                        src={avatarPreview || resolveAvatarUrl(profile.avatar)}
                        alt="Photo de profil"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-9 w-9" />
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 transition-opacity group-hover:opacity-100">
                      <Camera className="h-5 w-5" />
                    </span>
                    <Input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                      className="sr-only"
                      onChange={(event) => {
                        handleAvatarChange(event.target.files?.[0]);
                        event.target.value = "";
                      }}
                    />
                  </label>
                </div>
                <Field
                  label="Nom"
                  value={profile.nom}
                  placeholder="Entrez votre nom"
                  required
                  error={profileErrors.nom}
                  onChange={(nom) => updateProfileField("nom", nom)}
                />
                <Field
                  label="Prénom"
                  value={profile.prenom}
                  placeholder="Entrez votre prénom"
                  required
                  error={profileErrors.prenom}
                  onChange={(prenom) => updateProfileField("prenom", prenom)}
                />
                <Field
                  label="Adresse e-mail"
                  type="email"
                  value={profile.email}
                  placeholder="exemple@ac-erp.com"
                  required
                  error={profileErrors.email}
                  onChange={(email) => updateProfileField("email", email)}
                />
                <Field
                  label="Téléphone"
                  value={profile.telephone || ""}
                  placeholder="Entrez votre numéro de téléphone"
                  onChange={(telephone) =>
                    updateProfileField("telephone", telephone)
                  }
                />
                <Field
                  label="Rôle"
                  value={profile.role?.nomRole || ""}
                  placeholder="Rôle attribué"
                  disabled
                />
                <Field
                  label="Statut"
                  value={profile.statut || ""}
                  placeholder="Statut du compte"
                  disabled
                />
              </div>
            )}
            <Button className="mt-4" onClick={saveProfile}>
              Enregistrer
            </Button>
          </SectionCard>
        </TabsContent>

        <TabsContent value="company">
          <SectionCard
            title="Paramètres entreprise"
            description="Informations utilisées sur les documents et rapports"
          >
            {company && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Raison sociale"
                  value={company.raisonSociale}
                  placeholder="Nom officiel de l’entreprise"
                  required
                  error={companyErrors.raisonSociale}
                  onChange={(raisonSociale) =>
                    updateCompanyField("raisonSociale", raisonSociale)
                  }
                />
                <Field
                  label="Identifiant fiscal"
                  value={company.numeroFiscal || ""}
                  placeholder="Numéro fiscal ou NIU"
                  onChange={(numeroFiscal) =>
                    updateCompanyField("numeroFiscal", numeroFiscal)
                  }
                />
                <Field
                  label="Adresse"
                  value={company.adresse || ""}
                  placeholder="Adresse complète"
                  onChange={(adresse) => updateCompanyField("adresse", adresse)}
                />
                <Field
                  label="Téléphone"
                  value={company.telephone || ""}
                  placeholder="Numéro de téléphone de l’entreprise"
                  onChange={(telephone) =>
                    updateCompanyField("telephone", telephone)
                  }
                />
                <Field
                  label="E-mail"
                  type="email"
                  value={company.email || ""}
                  placeholder="contact@entreprise.com"
                  onChange={(email) => updateCompanyField("email", email)}
                />
                <Field
                  label="Devise"
                  value={company.devise}
                  placeholder="XAF"
                  required
                  error={companyErrors.devise}
                  onChange={(devise) => updateCompanyField("devise", devise)}
                />
                <Field
                  label="Fuseau horaire"
                  value={company.fuseauHoraire}
                  placeholder="Africa/Douala"
                  required
                  error={companyErrors.fuseauHoraire}
                  onChange={(fuseauHoraire) =>
                    updateCompanyField("fuseauHoraire", fuseauHoraire)
                  }
                />
                <Field
                  label="Logo (URL)"
                  value={company.logo || ""}
                  placeholder="https://exemple.com/logo.png"
                  onChange={(logo) => updateCompanyField("logo", logo)}
                />
              </div>
            )}
            <Button className="mt-4" onClick={saveCompany}>
              Enregistrer
            </Button>
          </SectionCard>
        </TabsContent>

        <TabsContent value="system">
          <SectionCard
            title="Paramètres système"
            description="Préférences globales de la plateforme"
          >
            {system && (
              <div className="space-y-4">
                <Setting
                  label="Notifications par e-mail"
                  description="Recevoir les alertes importantes par e-mail"
                  checked={system.notificationsEmail}
                  onChange={(v) => toggleSystem("notificationsEmail", v)}
                />
                <Setting
                  label="Alertes IA proactives"
                  description="Prévisions et recommandations automatiques"
                  checked={system.alertesIa}
                  onChange={(v) => toggleSystem("alertesIa", v)}
                />
                <Setting
                  label="Facturation automatique"
                  description="Générer les factures à la validation des ventes"
                  checked={system.facturationAutomatique}
                  onChange={(v) => toggleSystem("facturationAutomatique", v)}
                />
                <Setting
                  label="Mode maintenance"
                  description={
                    isSuperAdmin
                      ? "Bloque les écritures pour tous sauf le super administrateur"
                      : "Seul le super administrateur peut modifier ce réglage"
                  }
                  checked={system.modeMaintenance}
                  disabled={!isSuperAdmin}
                  onChange={(v) => toggleSystem("modeMaintenance", v)}
                />
              </div>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard
              title="Sécurité"
              description="Modification du mot de passe"
            >
              <div className="space-y-3">
                <Field
                  label="Mot de passe actuel"
                  type="password"
                  value={passwords.current}
                  error={passwordErrors.current}
                  placeholder="Saisissez le mot de passe actuel"
                  required
                  autoComplete="off"
                  onChange={(current) => {
                    setPasswords({ ...passwords, current });
                    if (passwordErrors.current)
                      setPasswordErrors((prev) => ({ ...prev, current: "" }));
                  }}
                />
                <Field
                  label="Nouveau mot de passe"
                  type="password"
                  value={passwords.next}
                  error={passwordErrors.next}
                  placeholder="Saisissez le nouveau mot de passe"
                  required
                  autoComplete="new-password"
                  onChange={(next) => {
                    setPasswords({ ...passwords, next });
                    if (passwordErrors.next)
                      setPasswordErrors((prev) => ({ ...prev, next: "" }));
                  }}
                />
                <Field
                  label="Confirmer le mot de passe"
                  type="password"
                  value={passwords.confirm}
                  error={passwordErrors.confirm}
                  placeholder="Confirmez le nouveau mot de passe"
                  required
                  autoComplete="new-password"
                  onChange={(confirm) => {
                    setPasswords({ ...passwords, confirm });
                    if (passwordErrors.confirm)
                      setPasswordErrors((prev) => ({ ...prev, confirm: "" }));
                  }}
                />
              </div>
              <Button className="mt-4" onClick={submitPassword}>
                Mettre à jour
              </Button>
            </SectionCard>
            <SectionCard
              title="Sessions actives"
              description="Contrôlez les connexions à votre compte"
            >
              <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
                <MonitorSmartphone className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {sessions.length} session{sessions.length > 1 ? "s" : ""}{" "}
                    active{sessions.length > 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Révoquez les jetons actifs sur les autres appareils
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={revokeSessions}
              >
                Déconnecter les autres sessions
              </Button>
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="log">
          <SectionCard
            title="Journal d'activité"
            description={logDescription}
            action={
              <Input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value || today())}
                className="w-auto"
                aria-label="Filtrer le journal par date"
              />
            }
          >
            <div className="space-y-1">
              {audits.length === 0 && (
                <div className="flex flex-col items-center justify-center py-5 text-center">
                  <img
                    src="/src/assets/sorry.svg"
                    alt="Aucun élément"
                    className="mb-3 w-28 opacity-90"
                  />
                  <p className="text-sm font-medium text-muted-foreground">
                    Aucun élément à afficher
                  </p>
                </div>
              )}
              {audits.map((audit) => {
                const actor = audit.utilisateur
                  ? `${audit.utilisateur.prenom} ${audit.utilisateur.nom}`
                  : "Système";
                return (
                  <div
                    key={audit.id}
                    className="flex items-center gap-3 border-b border-border/60 py-3 last:border-0"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-[10px] font-semibold text-white">
                      {actor
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                    <p className="min-w-0 flex-1 text-sm text-foreground">
                      <span className="font-medium">{actor}</span>{" "}
                      <span className="text-muted-foreground">
                        {audit.action} · {audit.module}
                      </span>
                    </p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(audit.createdAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </>
  );
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
  required = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  type?: string;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>

      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange?.(e.target.value)}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
function Setting({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3.5">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
      />
    </div>
  );
}
