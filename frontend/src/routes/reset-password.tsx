import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { resetPassword } from "@/lib/api/auth.service";
import logo from "@/assets/erp-logo.png";
import illustration from "@/assets/login-illustration.jpg";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Réinitialiser le mot de passe — AC ERP" },
      {
        name: "description",
        content: "Choisissez un nouveau mot de passe pour votre compte AC ERP.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors = {
      password: "",
      confirmPassword: "",
    };
    let hasError = false;

    if (!password.trim()) {
      newErrors.password = "Champ requis";
      hasError = true;
    } else if (password.length < 8) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères";
      hasError = true;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Champ requis";
      hasError = true;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    if (!token) {
      toast.error("Lien invalide", {
        description: "Demandez un nouveau lien de réinitialisation.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      toast.success("Mot de passe modifié", {
        description:
          "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
      });
    } catch (error: any) {
      toast.error("Réinitialisation impossible", {
        description: error.message || "Le lien est invalide ou expiré.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-primary lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="relative z-10 flex items-center gap-3">
          <img
            src={logo}
            alt="Logo AC ERP"
            width={44}
            height={44}
            className="h-11 w-11 rounded-xl bg-white/95 p-1.5"
          />
          <span className="font-display text-xl font-bold text-white">
            AC ERP
          </span>
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
            Sécurisez votre accès AC ERP.
          </h2>
          <p className="mt-3 text-white/80">
            Choisissez un nouveau mot de passe robuste pour protéger vos données
            de gestion.
          </p>
        </div>
        <p className="relative z-10 text-xs text-white/60">
          © 2026 AC ERP — Tous droits réservés.
        </p>
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3">
            <img
              src={logo}
              alt="Logo AC ERP"
              width={96}
              height={96}
              className="h-24 w-24"
            />
          </div>

          <Link
            to="/login"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Retour à la connexion
          </Link>

          {done ? (
            <div>
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <h1 className="text-2xl font-bold text-foreground">
                Mot de passe modifié
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Votre mot de passe a été réinitialisé avec succès.
                Connectez-vous avec vos nouveaux identifiants.
              </p>
              <Button
                className="mt-8 h-11 w-full"
                onClick={() => navigate({ to: "/login" })}
              >
                Se connecter
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-foreground">
                Nouveau mot de passe
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Saisissez et confirmez votre nouveau mot de passe.
              </p>

              {!token && (
                <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  Lien de réinitialisation invalide. Retournez à la connexion
                  pour demander un nouveau lien.
                </p>
              )}

              <form onSubmit={submit} className="mt-8 space-y-4">
                <PasswordField
                  id="password"
                  label="Nouveau mot de passe"
                  value={password}
                  show={showPassword}
                  error={errors.password}
                  onToggleShow={() => setShowPassword((value) => !value)}
                  onChange={(value) => {
                    setPassword(value);
                    if (errors.password)
                      setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                />

                <PasswordField
                  id="confirmPassword"
                  label="Confirmer le mot de passe"
                  value={confirmPassword}
                  show={showConfirmPassword}
                  error={errors.confirmPassword}
                  onToggleShow={() => setShowConfirmPassword((value) => !value)}
                  onChange={(value) => {
                    setConfirmPassword(value);
                    if (errors.confirmPassword)
                      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }}
                />

                <Button
                  type="submit"
                  className="h-11 w-full text-base"
                  disabled={isSubmitting || !token}
                >
                  {isSubmitting
                    ? "Modification..."
                    : "Modifier le mot de passe"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  show: boolean;
  error: string;
  onToggleShow: () => void;
  onChange: (value: string) => void;
};

function PasswordField({
  id,
  label,
  value,
  show,
  error,
  onToggleShow,
  onChange,
}: PasswordFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-11 px-9 ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-[22px] -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={show ? "Masquer" : "Afficher"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
