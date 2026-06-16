import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, BarChart3, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { login } from "@/lib/api/auth.service";
import logo from "@/assets/erp-logo.png";
import illustration from "@/assets/login-illustration.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion — AC ERP" },
      { name: "description", content: "Connectez-vous à votre espace AC ERP." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [show, setShow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setIsSubmitting(true);
    try {
      await login(String(formData.get("email")), String(formData.get("password")));
      toast.success("Connexion réussie", { description: "Bienvenue sur AC ERP." });
      navigate({ to: "/" });
    } catch (error: any) {
      toast.error("Connexion impossible", { description: error.message || "Verifier vos identifiants." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand / illustration panel */}
      <div className="relative hidden overflow-hidden bg-gradient-primary lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="relative z-10 flex items-center gap-3">
          <img src={logo} alt="Logo AC ERP" width={44} height={44} className="h-11 w-11 rounded-xl bg-white/95 p-1.5" />
          <span className="font-display text-xl font-bold text-white">AC ERP</span>
        </div>
        <img
          src={illustration}
          alt="Illustration tableau de bord ERP"
          width={1024}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-luminosity"
        />
        <div className="relative z-10 max-w-md">
          <h2 className="font-display text-3xl font-bold leading-tight text-white">
            Pilotez votre entreprise avec intelligence.
          </h2>
          <p className="mt-3 text-white/80">
            Ventes, achats, stocks et finances réunis dans une plateforme moderne enrichie par l'IA.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/90">
            {[
              { icon: BarChart3, t: "Tableaux de bord décisionnels en temps réel" },
              { icon: Zap, t: "Prévisions de ventes et de stock par IA" },
              { icon: ShieldCheck, t: "Gestion fine des rôles et permissions" },
            ].map((f) => (
              <li key={f.t} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                  <f.icon className="h-4 w-4" />
                </span>
                {f.t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 text-xs text-white/60">© 2026 AC ERP — Tous droits réservés.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img src={logo} alt="Logo AC ERP" width={40} height={40} className="h-10 w-10" />
            <span className="font-display text-lg font-bold">AC ERP</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground">Connexion</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Accédez à votre espace de gestion.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Adresse e-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" name="email" type="email" defaultValue="s.martin@acerp.fr" className="h-11 pl-9" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={show ? "text" : "password"}
                  defaultValue="motdepasse"
                  className="h-11 px-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={show ? "Masquer" : "Afficher"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox defaultChecked /> Se souvenir de moi
              </label>
              <a href="#" className="text-sm font-medium text-primary hover:underline">
                Mot de passe oublié ?
              </a>
            </div>
            <Button type="submit" className="h-11 w-full text-base" disabled={isSubmitting}>
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <a href="#" className="font-medium text-primary hover:underline">
              Contactez votre administrateur
            </a>
          </p>
          <p className="mt-8 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:underline">
              Accéder à la démo →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
