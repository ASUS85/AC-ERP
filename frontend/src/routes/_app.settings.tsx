import { createFileRoute } from "@tanstack/react-router";
import { User, Building2, SlidersHorizontal, ScrollText, Shield, DatabaseBackup } from "lucide-react";
import { PageHeader } from "@/components/erp/PageHeader";
import { SectionCard } from "@/components/erp/widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Paramètres — AC ERP" }] }),
  component: SettingsPage,
});

const activity = [
  { a: "Sophie Martin", t: "a validé la facture FAC-2026-148", time: "Il y a 12 min" },
  { a: "Karim Benali", t: "a créé la vente VTE-2048", time: "Il y a 1 h" },
  { a: "Léa Dubois", t: "a enregistré un paiement de 4 280 €", time: "Il y a 2 h" },
  { a: "Nadia Haddad", t: "a passé le bon de commande ACH-1182", time: "Hier" },
];

function SettingsPage() {
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Nom complet</Label><Input defaultValue="Sophie Martin" /></div>
              <div className="space-y-1.5"><Label>Adresse e-mail</Label><Input defaultValue="s.martin@acerp.fr" /></div>
              <div className="space-y-1.5"><Label>Téléphone</Label><Input defaultValue="+33 6 12 34 56 78" /></div>
              <div className="space-y-1.5"><Label>Rôle</Label><Input defaultValue="Administrateur" disabled /></div>
            </div>
            <Button className="mt-4" onClick={() => toast.success("Profil enregistré")}>Enregistrer</Button>
          </SectionCard>
        </TabsContent>

        <TabsContent value="company">
          <SectionCard title="Paramètres entreprise" description="Coordonnées de l'entreprise">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Raison sociale</Label><Input defaultValue="AC ERP SAS" /></div>
              <div className="space-y-1.5"><Label>N° TVA</Label><Input defaultValue="FR 12 345 678 901" /></div>
              <div className="space-y-1.5"><Label>Adresse</Label><Input defaultValue="12 rue du Commerce, Lyon" /></div>
              <div className="space-y-1.5"><Label>Devise</Label><Input defaultValue="EUR (€)" /></div>
            </div>
            <Button className="mt-4" onClick={() => toast.success("Paramètres enregistrés")}>Enregistrer</Button>
          </SectionCard>
        </TabsContent>

        <TabsContent value="system">
          <SectionCard title="Paramètres système" description="Préférences de la plateforme">
            <div className="space-y-4">
              {[
                { t: "Notifications par e-mail", d: "Recevoir les alertes importantes par e-mail", on: true },
                { t: "Alertes IA proactives", d: "Prévisions et recommandations automatiques", on: true },
                { t: "Facturation automatique", d: "Générer les factures à la validation des ventes", on: true },
                { t: "Mode maintenance", d: "Restreindre l'accès aux administrateurs", on: false },
              ].map((s) => (
                <div key={s.t} className="flex items-center justify-between gap-4 rounded-lg border border-border p-3.5">
                  <div><p className="text-sm font-medium text-foreground">{s.t}</p><p className="text-xs text-muted-foreground">{s.d}</p></div>
                  <Switch defaultChecked={s.on} />
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Sécurité" description="Mot de passe et authentification">
              <div className="space-y-3">
                <div className="space-y-1.5"><Label>Mot de passe actuel</Label><Input type="password" defaultValue="********" /></div>
                <div className="space-y-1.5"><Label>Nouveau mot de passe</Label><Input type="password" /></div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3.5">
                  <div><p className="text-sm font-medium text-foreground">Double authentification (2FA)</p><p className="text-xs text-muted-foreground">Sécurité renforcée à la connexion</p></div>
                  <Switch defaultChecked />
                </div>
              </div>
              <Button className="mt-4" onClick={() => toast.success("Sécurité mise à jour")}>Mettre à jour</Button>
            </SectionCard>
            <SectionCard title="Sauvegardes" description="Gestion des sauvegardes de données">
              <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
                <DatabaseBackup className="h-8 w-8 text-primary" />
                <div><p className="text-sm font-medium text-foreground">Dernière sauvegarde</p><p className="text-xs text-muted-foreground">10 juin 2026 à 03:00 · Automatique quotidienne</p></div>
              </div>
              <Button variant="outline" className="mt-4 w-full gap-1.5" onClick={() => toast.success("Sauvegarde lancée")}>
                <DatabaseBackup className="h-4 w-4" /> Sauvegarder maintenant
              </Button>
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="log">
          <SectionCard title="Journal d'activité" description="Historique des actions récentes">
            <div className="space-y-1">
              {activity.map((a) => (
                <div key={a.t} className="flex items-center gap-3 border-b border-border/60 py-3 last:border-0">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-[10px] font-semibold text-white">
                    {a.a.split(" ").map((w) => w[0]).join("")}
                  </span>
                  <p className="flex-1 text-sm text-foreground"><span className="font-medium">{a.a}</span> <span className="text-muted-foreground">{a.t}</span></p>
                  <span className="text-xs text-muted-foreground">{a.time}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </>
  );
}