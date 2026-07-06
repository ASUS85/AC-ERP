import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { User, Building2, SlidersHorizontal, ScrollText, Shield, MonitorSmartphone, LoaderCircle } from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard } from "@/components/erp/widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { changePassword, getMe, getSessions, revokeOtherSessions, updateProfile } from "@/lib/api/auth.service";
import { getEntreprise, getJournal, getSysteme, updateEntreprise, updateMaintenance, updateSysteme } from "@/lib/api/parametres.service";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Paramètres — AC ERP" }] }),
  component: SettingsPage,
});

type Profile = { nom: string; prenom: string; email: string; telephone?: string; avatar?: string; statut?: string; role?: { nomRole: string } };
type Company = { raisonSociale: string; numeroFiscal?: string; adresse?: string; telephone?: string; email?: string; devise: string; fuseauHoraire: string; logo?: string };
type SystemSettings = { notificationsEmail: boolean; alertesIa: boolean; facturationAutomatique: boolean; modeMaintenance: boolean };
type Audit = { id: string; action: string; module: string; newValues?: { status?: number }; createdAt: string; utilisateur?: { nom: string; prenom: string; email: string } };
type Session = { id: string; createdAt: string; expiresAt: string };

const today = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};
const bounds = (date: string) => ({ dateFrom: new Date(`${date}T00:00:00`).toISOString(), dateTo: new Date(`${date}T23:59:59.999`).toISOString() });
const unwrap = (response: any) => response.data;

function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [system, setSystem] = useState<SystemSettings | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [logDate, setLogDate] = useState(today);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = profile?.role?.nomRole === "SUPER_ADMIN";

  useEffect(() => {
    Promise.all([getMe(), getEntreprise(), getSysteme(), getSessions()])
      .then(([me, business, settings, activeSessions]: any[]) => {
        setProfile(unwrap(me)); setCompany(unwrap(business)); setSystem(unwrap(settings)); setSessions(unwrap(activeSessions) || []);
      })
      .catch(() => toast.error("Impossible de charger tous les paramètres"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getJournal(bounds(logDate)).then((response: any) => setAudits(unwrap(response) || [])).catch(() => toast.error("Impossible de charger le journal"));
  }, [logDate]);

  const saveProfile = async () => {
    if (!profile) return;
    try {
      const response: any = await updateProfile(profile);
      const updated = unwrap(response); setProfile(updated); localStorage.setItem("erp_user", JSON.stringify(updated));
      toast.success("Profil enregistré");
    } catch (error: any) { toast.error(error?.response?.data?.error?.message || "Échec de l'enregistrement"); }
  };

  const saveCompany = async () => {
    if (!company) return;
    try { setCompany(unwrap(await updateEntreprise(company) as any)); toast.success("Paramètres entreprise enregistrés"); }
    catch { toast.error("Échec de l'enregistrement"); }
  };

  const toggleSystem = async (field: keyof SystemSettings, value: boolean) => {
    if (!system) return;
    try {
      const response: any = field === "modeMaintenance" ? await updateMaintenance(value) : await updateSysteme({ [field]: value });
      setSystem(unwrap(response)); toast.success("Paramètre mis à jour");
    } catch (error: any) { toast.error(error?.response?.data?.error?.message || "Modification refusée"); }
  };

  const submitPassword = async () => {
    if (passwords.next !== passwords.confirm) return toast.error("Les nouveaux mots de passe ne correspondent pas");
    try { await changePassword(passwords.current, passwords.next); setPasswords({ current: "", next: "", confirm: "" }); toast.success("Mot de passe mis à jour"); }
    catch (error: any) { toast.error(error?.response?.data?.error?.message || "Échec du changement de mot de passe"); }
  };

  const revokeSessions = async () => {
    try { await revokeOtherSessions(); const response: any = await getSessions(); setSessions(unwrap(response) || []); toast.success("Les autres sessions ont été déconnectées"); }
    catch { toast.error("Impossible de révoquer les sessions"); }
  };

  const logDescription = useMemo(() => `${audits.length} activité${audits.length > 1 ? "s" : ""} pour cette date`, [audits.length]);
  if (loading) return <div className="flex min-h-64 items-center justify-center"><LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <>
      <PageHeader title="Paramètres & configuration" description="Profil, entreprise, système et sécurité" breadcrumb={["Administration", "Paramètres"]} />
      <Tabs defaultValue="profile">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="profile" className="gap-1.5"><User className="h-4 w-4" /> Profil</TabsTrigger>
          <TabsTrigger value="company" className="gap-1.5"><Building2 className="h-4 w-4" /> Entreprise</TabsTrigger>
          <TabsTrigger value="system" className="gap-1.5"><SlidersHorizontal className="h-4 w-4" /> Système</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5"><Shield className="h-4 w-4" /> Sécurité</TabsTrigger>
          <TabsTrigger value="log" className="gap-1.5"><ScrollText className="h-4 w-4" /> Journal</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <SectionCard title="Profil utilisateur" description="Vos informations personnelles">
            {profile && <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Prénom" value={profile.prenom} onChange={(prenom) => setProfile({ ...profile, prenom })} />
              <Field label="Nom" value={profile.nom} onChange={(nom) => setProfile({ ...profile, nom })} />
              <Field label="Adresse e-mail" type="email" value={profile.email} onChange={(email) => setProfile({ ...profile, email })} />
              <Field label="Téléphone" value={profile.telephone || ""} onChange={(telephone) => setProfile({ ...profile, telephone })} />
              <Field label="Avatar (URL)" value={profile.avatar || ""} onChange={(avatar) => setProfile({ ...profile, avatar })} />
              <Field label="Rôle" value={profile.role?.nomRole || ""} disabled />
              <Field label="Statut" value={profile.statut || ""} disabled />
            </div>}
            <Button className="mt-4" onClick={saveProfile}>Enregistrer</Button>
          </SectionCard>
        </TabsContent>

        <TabsContent value="company">
          <SectionCard title="Paramètres entreprise" description="Informations utilisées sur les documents et rapports">
            {company && <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Raison sociale" value={company.raisonSociale} onChange={(raisonSociale) => setCompany({ ...company, raisonSociale })} />
              <Field label="Identifiant fiscal" value={company.numeroFiscal || ""} onChange={(numeroFiscal) => setCompany({ ...company, numeroFiscal })} />
              <Field label="Adresse" value={company.adresse || ""} onChange={(adresse) => setCompany({ ...company, adresse })} />
              <Field label="Téléphone" value={company.telephone || ""} onChange={(telephone) => setCompany({ ...company, telephone })} />
              <Field label="E-mail" type="email" value={company.email || ""} onChange={(email) => setCompany({ ...company, email })} />
              <Field label="Devise" value={company.devise} onChange={(devise) => setCompany({ ...company, devise })} />
              <Field label="Fuseau horaire" value={company.fuseauHoraire} onChange={(fuseauHoraire) => setCompany({ ...company, fuseauHoraire })} />
              <Field label="Logo (URL)" value={company.logo || ""} onChange={(logo) => setCompany({ ...company, logo })} />
            </div>}
            <Button className="mt-4" onClick={saveCompany}>Enregistrer</Button>
          </SectionCard>
        </TabsContent>

        <TabsContent value="system">
          <SectionCard title="Paramètres système" description="Préférences globales de la plateforme">
            {system && <div className="space-y-4">
              <Setting label="Notifications par e-mail" description="Recevoir les alertes importantes par e-mail" checked={system.notificationsEmail} onChange={(v) => toggleSystem("notificationsEmail", v)} />
              <Setting label="Alertes IA proactives" description="Prévisions et recommandations automatiques" checked={system.alertesIa} onChange={(v) => toggleSystem("alertesIa", v)} />
              <Setting label="Facturation automatique" description="Générer les factures à la validation des ventes" checked={system.facturationAutomatique} onChange={(v) => toggleSystem("facturationAutomatique", v)} />
              <Setting label="Mode maintenance" description={isSuperAdmin ? "Bloque les écritures pour tous sauf le super administrateur" : "Seul le super administrateur peut modifier ce réglage"} checked={system.modeMaintenance} disabled={!isSuperAdmin} onChange={(v) => toggleSystem("modeMaintenance", v)} />
            </div>}
          </SectionCard>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Sécurité" description="Modification du mot de passe">
              <div className="space-y-3">
                <Field label="Mot de passe actuel" type="password" value={passwords.current} onChange={(current) => setPasswords({ ...passwords, current })} />
                <Field label="Nouveau mot de passe" type="password" value={passwords.next} onChange={(next) => setPasswords({ ...passwords, next })} />
                <Field label="Confirmer le mot de passe" type="password" value={passwords.confirm} onChange={(confirm) => setPasswords({ ...passwords, confirm })} />
              </div>
              <Button className="mt-4" onClick={submitPassword}>Mettre à jour</Button>
            </SectionCard>
            <SectionCard title="Sessions actives" description="Contrôlez les connexions à votre compte">
              <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
                <MonitorSmartphone className="h-8 w-8 text-primary" />
                <div><p className="text-sm font-medium text-foreground">{sessions.length} session{sessions.length > 1 ? "s" : ""} active{sessions.length > 1 ? "s" : ""}</p><p className="text-xs text-muted-foreground">Révoquez les jetons actifs sur les autres appareils</p></div>
              </div>
              <Button variant="outline" className="mt-4 w-full" onClick={revokeSessions}>Déconnecter les autres sessions</Button>
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="log">
          <SectionCard title="Journal d'activité" description={logDescription} action={<Input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value || today())} className="w-auto" aria-label="Filtrer le journal par date" />}>
            <div className="space-y-1">
              {audits.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Aucune activité pour cette date.</p>}
              {audits.map((audit) => {
                const actor = audit.utilisateur ? `${audit.utilisateur.prenom} ${audit.utilisateur.nom}` : "Système";
                return <div key={audit.id} className="flex items-center gap-3 border-b border-border/60 py-3 last:border-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-[10px] font-semibold text-white">{actor.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
                  <p className="min-w-0 flex-1 text-sm text-foreground"><span className="font-medium">{actor}</span> <span className="text-muted-foreground">{audit.action} · {audit.module}</span></p>
                  <span className="shrink-0 text-xs text-muted-foreground">{new Date(audit.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>;
              })}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </>
  );
}

function Field({ label, value, onChange, disabled, type = "text" }: { label: string; value: string; onChange?: (value: string) => void; disabled?: boolean; type?: string }) {
  return <div className="space-y-1.5"><Label>{label}</Label><Input type={type} value={value} disabled={disabled} onChange={(event) => onChange?.(event.target.value)} /></div>;
}

function Setting({ label, description, checked, onChange, disabled }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3.5"><div><p className="text-sm font-medium text-foreground">{label}</p><p className="text-xs text-muted-foreground">{description}</p></div><Switch checked={checked} disabled={disabled} onCheckedChange={onChange} /></div>;
}
