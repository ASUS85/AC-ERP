import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate, useRouter } from "@tanstack/react-router";
import * as React from "react";
import { useState, useEffect } from "react";
import { Minus, BarChart3, Zap, ShieldCheck, Mail, Lock, EyeOff, Eye, Loader2, ArrowLeft, MailCheck, KeyRound } from "lucide-react";
import { I as Input, B as Button } from "./input-CtRqKLv_.js";
import { OTPInput, OTPInputContext } from "input-otp";
import { c as cn, a as Route, l as login, f as forgotPassword, v as verifyMfa, b as resendMfa, d as canAccessPermission } from "./router-CU8xXL5-.js";
import { L as Label } from "./label-BsP1U0zM.js";
import { toast } from "sonner";
import { n as navGroups } from "./erp-data-De0hQiRg.js";
import { l as logo } from "./erp-logo-C4ESMtut.js";
import { i as illustration } from "./login-illustration-Bw5LFH-i.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "zod";
import "axios";
import "@radix-ui/react-label";
import "./currency-BmQmAj7J.js";
const InputOTP = React.forwardRef(({ className, containerClassName, ...props }, ref) => /* @__PURE__ */ jsx(
  OTPInput,
  {
    ref,
    containerClassName: cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName
    ),
    className: cn("disabled:cursor-not-allowed", className),
    ...props
  }
));
InputOTP.displayName = "InputOTP";
const InputOTPGroup = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("flex items-center", className), ...props }));
InputOTPGroup.displayName = "InputOTPGroup";
const InputOTPSlot = React.forwardRef(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref,
      className: cn(
        "relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-1 ring-ring",
        className
      ),
      ...props,
      children: [
        char,
        hasFakeCaret && /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "h-4 w-px animate-caret-blink bg-foreground duration-1000" }) })
      ]
    }
  );
});
InputOTPSlot.displayName = "InputOTPSlot";
const InputOTPSeparator = React.forwardRef(({ ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, role: "separator", ...props, children: /* @__PURE__ */ jsx(Minus, {}) }));
InputOTPSeparator.displayName = "InputOTPSeparator";
function LoginPage() {
  const [show, setShow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState("credentials");
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
    password: ""
  });
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = window.setTimeout(() => setResendCountdown((value) => Math.max(0, value - 1)), 1e3);
    return () => window.clearTimeout(timer);
  }, [resendCountdown]);
  const submit = async (e) => {
    e.preventDefault();
    const newErrors = {
      email: "",
      password: ""
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
          description: "Choisissez votre méthode de vérification."
        });
        return;
      }
      completeLogin(result);
    } catch (error) {
      toast.error("Connexion impossible", {
        description: error.message || "Verifier vos identifiants."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const getDefaultRedirect = (user) => {
    const fallback = "/";
    const visibleItem = navGroups.flatMap((group) => group.items).find((item) => {
      if (!item.permission) return true;
      const [module, action] = item.permission.split(":");
      return canAccessPermission(user, module, action);
    });
    return visibleItem?.url ?? fallback;
  };
  const completeLogin = (session) => {
    const redirectTarget = search.redirect && search.redirect !== "/login" ? search.redirect : getDefaultRedirect(session?.user);
    toast.success("Connexion réussie", {
      description: "Bienvenue sur AC ERP."
    });
    router.invalidate();
    navigate({
      to: redirectTarget,
      replace: true
    });
  };
  const submitMfa = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Code incomplet", {
        description: "Saisissez les 6 chiffres reçus par email."
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await verifyMfa(mfaToken, code);
      completeLogin(result);
    } catch (error) {
      toast.error("Code refusé", {
        description: error.message || "Le code est invalide ou expiré."
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
        description: `Un nouveau code a été envoyé à ${maskedEmail}.`
      });
    } catch (error) {
      const retryAfter = error.details?.retryAfter;
      if (retryAfter) setResendCountdown(retryAfter);
      toast.error("Renvoi impossible", {
        description: error.message || "Veuillez réessayer plus tard."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrors((prev) => ({
        ...prev,
        email: "Champ requis"
      }));
      return;
    }
    setIsSubmitting(true);
    try {
      await forgotPassword(email.trim());
      setStep("resetSent");
      toast.success("Email envoyé", {
        description: "Consultez votre boîte mail pour modifier votre mot de passe."
      });
    } catch (error) {
      toast.error("Envoi impossible", {
        description: error.message || "Veuillez réessayer plus tard."
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
  return /* @__PURE__ */ jsxs("div", { className: "grid min-h-screen lg:grid-cols-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative hidden overflow-hidden bg-gradient-primary lg:flex lg:flex-col lg:justify-between lg:p-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("img", { src: logo, alt: "Logo AC ERP", width: 44, height: 44, className: "h-11 w-11 rounded-xl bg-white/95 p-1.5" }),
        /* @__PURE__ */ jsx("span", { className: "font-display text-xl font-bold text-white", children: "AC ERP" })
      ] }),
      /* @__PURE__ */ jsx("img", { src: illustration, alt: "Illustration tableau de bord ERP", width: 1024, height: 1280, className: "absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-luminosity" }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 max-w-md", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-display text-3xl font-bold leading-tight text-white", children: "Pilotez votre entreprise avec intelligence." }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-white/80", children: "Ventes, achats, stocks et finances réunis dans une plateforme moderne enrichie par l'IA." }),
        /* @__PURE__ */ jsx("ul", { className: "mt-8 space-y-3 text-sm text-white/90", children: [{
          icon: BarChart3,
          t: "Tableaux de bord décisionnels en temps réel"
        }, {
          icon: Zap,
          t: "Prévisions de ventes et de stock par IA"
        }, {
          icon: ShieldCheck,
          t: "Gestion fine des rôles et permissions"
        }].map((f) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-white/15", children: /* @__PURE__ */ jsx(f.icon, { className: "h-4 w-4" }) }),
          f.t
        ] }, f.t)) })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "relative z-10 text-xs text-white/60", children: "© 2026 AC ERP — Tous droits réservés." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "lg:flex lg:flex-col lg:justify-start lg:p-12 items-center justify-center bg-background px-6 py-12", children: [
      /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center gap-3", children: /* @__PURE__ */ jsx("img", { src: logo, alt: "Logo AC ERP", width: 80, height: 80, className: "h-80 w-80" }) }),
      /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-8 flex items-center gap-3 lg:hidden", children: [
          /* @__PURE__ */ jsx("img", { src: logo, alt: "Logo AC ERP", width: 10, height: 10, className: "h-10 w-10" }),
          /* @__PURE__ */ jsx("span", { className: "font-display text-lg font-bold", children: "AC ERP" })
        ] }),
        step === "credentials" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-foreground text-center", children: "Bienvenue" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-sm text-muted-foreground text-center", children: "Accédez à votre espace de gestion." }),
          /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "mt-8 space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Adresse e-mail" }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(Mail, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
                /* @__PURE__ */ jsx(Input, { id: "email", name: "email", type: "email", placeholder: "Adresse e-mail", value: email, onChange: (e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors((prev) => ({
                      ...prev,
                      email: ""
                    }));
                  }
                }, className: `h-11 pl-9 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}` })
              ] }),
              errors.email && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-500", children: errors.email })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Mot de passe" }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(Lock, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
                /* @__PURE__ */ jsx(Input, { id: "password", name: "password", type: show ? "text" : "password", placeholder: "Mot de passe", value: password, onChange: (e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => ({
                      ...prev,
                      password: ""
                    }));
                  }
                }, className: `h-11 px-9 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}` }),
                /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShow((s) => !s), className: "absolute right-3 top-[22px] -translate-y-1/2 text-muted-foreground hover:text-foreground", "aria-label": show ? "Masquer" : "Afficher", children: show ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }) })
              ] }),
              errors.password && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-500 mt-1", children: errors.password })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsx("button", { type: "button", onClick: handleForgotPassword, disabled: isSubmitting, className: "text-sm font-medium text-primary hover:underline disabled:pointer-events-none disabled:opacity-60", children: "Mot de passe oublié ?" }) }),
            /* @__PURE__ */ jsx(Button, { type: "submit", className: "h-11 w-full text-base", disabled: isSubmitting, children: isSubmitting ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
              "Vérification"
            ] }) : "Se connecter" })
          ] })
        ] }),
        step === "resetSent" && /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: backToCredentials, className: "mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground", children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
            " Retour à la connexion"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(MailCheck, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Vérifiez votre email" }),
          /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm leading-6 text-muted-foreground", children: [
            "Si un compte AC ERP correspond à",
            " ",
            /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: email }),
            ", un message vient d'être envoyé avec un lien pour modifier votre mot de passe."
          ] }),
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", className: "mt-8 h-11 w-full", onClick: backToCredentials, children: "Revenir au formulaire" })
        ] }),
        step === "method" && /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: resetMfa, className: "mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground", children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
            " Modifier les identifiants"
          ] }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Double authentification" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-sm text-muted-foreground", children: "Choisissez comment recevoir votre code de vérification." }),
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setStep("code"), className: "mt-8 flex w-full items-center gap-4 rounded-lg border border-primary/30 bg-primary/5 p-4 text-left transition-colors hover:bg-primary/10", children: [
            /* @__PURE__ */ jsx("span", { className: "flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground", children: /* @__PURE__ */ jsx(MailCheck, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsx("span", { className: "block font-medium text-foreground", children: "Code par email" }),
              /* @__PURE__ */ jsx("span", { className: "block truncate text-sm text-muted-foreground", children: maskedEmail })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { className: "mt-5 h-11 w-full", onClick: () => setStep("code"), children: "Continuer" })
        ] }),
        step === "code" && /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setStep("method"), className: "mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground", children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
            " Choisir une autre méthode"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(KeyRound, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Saisir le code" }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1.5 text-sm text-muted-foreground", children: [
            "Entrez les 6 chiffres envoyés à ",
            maskedEmail,
            ". Le code expire après 10 minutes."
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: submitMfa, className: "mt-8 space-y-5", children: [
            /* @__PURE__ */ jsx(InputOTP, { maxLength: 6, value: code, onChange: setCode, containerClassName: "justify-between", children: /* @__PURE__ */ jsx(InputOTPGroup, { className: "gap-2", children: Array.from({
              length: 6
            }).map((_, index) => /* @__PURE__ */ jsx(InputOTPSlot, { index, className: "h-12 w-11 rounded-lg border text-lg" }, index)) }) }),
            /* @__PURE__ */ jsx(Button, { type: "submit", className: "h-11 w-full text-base flex items-center justify-center", disabled: isSubmitting || code.length !== 6, children: isSubmitting ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
              "Validation"
            ] }) : "Valider le code" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-5 text-center text-sm text-muted-foreground", children: /* @__PURE__ */ jsx("button", { type: "button", onClick: handleResend, disabled: isSubmitting || resendCountdown > 0, className: "font-medium text-primary disabled:text-muted-foreground", children: resendCountdown > 0 ? `Renvoyer le code dans ${resendCountdown}s` : "Renvoyer le code" }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  LoginPage as component
};
