import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  MailCheck,
  ShieldCheck,
  Zap,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  forgotPassword,
  login,
  resendMfa,
  verifyMfa,
} from "@/lib/api/auth.service";
import { canAccessPermission, type AuthUserLike } from "@/lib/auth-session";
import { navGroups } from "@/lib/erp-data";
import logo from "@/assets/erp-logo.png";
import illustration from "@/assets/login-illustration.jpg";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({
    redirect: z.string().optional().catch(""),
  }),
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
  const [step, setStep] = useState<
    "credentials" | "method" | "code" | "resetSent"
  >("credentials");
  const [mfaToken, setMfaToken] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [code, setCode] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const navigate = useNavigate();
  const router = useRouter();
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = window.setTimeout(
      () => setResendCountdown((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [resendCountdown]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors = {
      email: "",
      password: "",
    };

    let hasError = false;

    if (!email.trim()) {
      newErrors.email = "Champ requis";
      hasError = true;
    }

    if (!password.trim()) {
      newErrors.password = "Champ requis";
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(email, password);

      if (result.mfaRequired) {
        setMfaToken(result.mfaToken);
        setMaskedEmail(result.email);
        setResendCountdown(result.resendAfter || 30);
        setStep("method");

        toast.success("Identifiants validés", {
          description: "Choisissez votre méthode de vérification.",
        });

        return;
      }

      completeLogin(result as { user?: AuthUserLike } | undefined);
    } catch (error: any) {
      toast.error("Connexion impossible", {
        description: error.message || "Verifier vos identifiants.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDefaultRedirect = (user?: AuthUserLike | null) => {
    const fallback = "/";
    const visibleItem = navGroups
      .flatMap((group) => group.items)
      .find((item) => {
        if (!item.permission) return true;
        const [module, action] = item.permission.split(":");
        return canAccessPermission(user, module, action);
      });

    return visibleItem?.url ?? fallback;
  };

  const completeLogin = (session?: { user?: AuthUserLike } | undefined) => {
    const redirectTarget =
      search.redirect && search.redirect !== "/login"
        ? search.redirect
        : getDefaultRedirect(session?.user);

    toast.success("Connexion réussie", {
      description: "Bienvenue sur AC ERP.",
    });
    router.invalidate();
    navigate({ to: redirectTarget, replace: true });
  };

  const submitMfa = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Code incomplet", {
        description: "Saisissez les 6 chiffres reçus par email.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await verifyMfa(mfaToken, code);
      completeLogin(result as { user?: AuthUserLike } | undefined);
    } catch (error: any) {
      toast.error("Code refusé", {
        description: error.message || "Le code est invalide ou expiré.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || !mfaToken) return;
    setIsSubmitting(true);
    try {
      const result = await resendMfa(mfaToken);
      setResendCountdown(result.resendAfter || 30);
      setCode("");
      toast.success("Code renvoyé", {
        description: `Un nouveau code a été envoyé à ${maskedEmail}.`,
      });
    } catch (error: any) {
      const retryAfter = error.details?.retryAfter;
      if (retryAfter) setResendCountdown(retryAfter);
      toast.error("Renvoi impossible", {
        description: error.message || "Veuillez réessayer plus tard.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: "Champ requis" }));
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(email.trim());
      setStep("resetSent");
      toast.success("Email envoyé", {
        description:
          "Consultez votre boîte mail pour modifier votre mot de passe.",
      });
    } catch (error: any) {
      toast.error("Envoi impossible", {
        description: error.message || "Veuillez réessayer plus tard.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const backToCredentials = () => {
    setStep("credentials");
    setPassword("");
  };

  const resetMfa = () => {
    setStep("credentials");
    setMfaToken("");
    setMaskedEmail("");
    setCode("");
    setResendCountdown(0);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand / illustration panel */}
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
            Pilotez votre entreprise avec intelligence.
          </h2>
          <p className="mt-3 text-white/80">
            Ventes, achats, stocks et finances réunis dans une plateforme
            moderne enrichie par l'IA.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/90">
            {[
              {
                icon: BarChart3,
                t: "Tableaux de bord décisionnels en temps réel",
              },
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
        <p className="relative z-10 text-xs text-white/60">
          © 2026 AC ERP — Tous droits réservés.
        </p>
      </div>

      {/* Form panel */}
      <div className="lg:flex lg:flex-col lg:justify-start lg:p-12 items-center justify-center bg-background px-6 py-12">
        <div className="flex flex-col items-center gap-3">
          <img
            src={logo}
            alt="Logo AC ERP"
            width={80}
            height={80}
            className="h-80 w-80"
          />
        </div>
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img
              src={logo}
              alt="Logo AC ERP"
              width={10}
              height={10}
              className="h-10 w-10"
            />
            <span className="font-display text-lg font-bold">AC ERP</span>
          </div>

          {step === "credentials" && (
            <>
              <h1 className="text-2xl font-bold text-foreground text-center">
                Bienvenue
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground text-center">
                Accédez à votre espace de gestion.
              </p>

              <form onSubmit={submit} className="mt-8 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Adresse e-mail</Label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Adresse e-mail"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);

                        if (errors.email) {
                          setErrors((prev) => ({
                            ...prev,
                            email: "",
                          }));
                        }
                      }}
                      className={`h-11 pl-9 ${
                        errors.email
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                    />
                  </div>

                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={show ? "text" : "password"}
                      placeholder="Mot de passe"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);

                        if (errors.password) {
                          setErrors((prev) => ({
                            ...prev,
                            password: "",
                          }));
                        }
                      }}
                      className={`h-11 px-9 ${
                        errors.password
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      className="absolute right-3 top-[22px] -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={show ? "Masquer" : "Afficher"}
                    >
                      {show ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  {/* <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox defaultChecked /> Se souvenir de moi
                  </label> */}
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isSubmitting}
                    className="text-sm font-medium text-primary hover:underline disabled:pointer-events-none disabled:opacity-60"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <Button
                  type="submit"
                  className="h-11 w-full text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Vérification
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </form>
            </>
          )}

          {step === "resetSent" && (
            <div className="mt-2">
              <button
                type="button"
                onClick={backToCredentials}
                className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Retour à la connexion
              </button>
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MailCheck className="h-6 w-6" />
              </span>
              <h1 className="text-2xl font-bold text-foreground">
                Vérifiez votre email
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Si un compte AC ERP correspond à{" "}
                <span className="font-medium text-foreground">{email}</span>, un
                message vient d'être envoyé avec un lien pour modifier votre mot
                de passe.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-8 h-11 w-full"
                onClick={backToCredentials}
              >
                Revenir au formulaire
              </Button>
            </div>
          )}

          {step === "method" && (
            <div className="mt-2">
              <button
                type="button"
                onClick={resetMfa}
                className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Modifier les identifiants
              </button>
              <h1 className="text-2xl font-bold text-foreground">
                Double authentification
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Choisissez comment recevoir votre code de vérification.
              </p>

              <button
                type="button"
                onClick={() => setStep("code")}
                className="mt-8 flex w-full items-center gap-4 rounded-lg border border-primary/30 bg-primary/5 p-4 text-left transition-colors hover:bg-primary/10"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <MailCheck className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-foreground">
                    Code par email
                  </span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {maskedEmail}
                  </span>
                </span>
              </button>

              <Button
                className="mt-5 h-11 w-full"
                onClick={() => setStep("code")}
              >
                Continuer
              </Button>
            </div>
          )}

          {step === "code" && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setStep("method")}
                className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Choisir une autre méthode
              </button>
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <KeyRound className="h-6 w-6" />
              </span>
              <h1 className="text-2xl font-bold text-foreground">
                Saisir le code
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Entrez les 6 chiffres envoyés à {maskedEmail}. Le code expire
                après 10 minutes.
              </p>

              <form onSubmit={submitMfa} className="mt-8 space-y-5">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={setCode}
                  containerClassName="justify-between"
                >
                  <InputOTPGroup className="gap-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className="h-12 w-11 rounded-lg border text-lg"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>

                <Button
                  type="submit"
                  className="h-11 w-full text-base flex items-center justify-center"
                  disabled={isSubmitting || code.length !== 6}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validation
                    </>
                  ) : (
                    "Valider le code"
                  )}
                </Button>
              </form>

              <div className="mt-5 text-center text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isSubmitting || resendCountdown > 0}
                  className="font-medium text-primary disabled:text-muted-foreground"
                >
                  {resendCountdown > 0
                    ? `Renvoyer le code dans ${resendCountdown}s`
                    : "Renvoyer le code"}
                </button>
              </div>
            </div>
          )}

          {/*<p className="mt-6 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <a href="#" className="font-medium text-primary hover:underline">
              Contactez votre administrateur
            </a>
          </p>
           <p className="mt-8 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:underline">
              Accéder à la démo →
            </Link>
          </p> */}
        </div>
      </div>
    </div>
  );
}
