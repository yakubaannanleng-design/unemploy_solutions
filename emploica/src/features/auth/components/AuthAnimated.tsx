import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { User, Mail, Lock, Eye, EyeOff, Globe, MessageCircle, Phone, ShieldAlert } from "lucide-react";
import { useLang } from "lib/i18n";
import { supabase } from "lib/supabase";
import { toast } from "sonner";
import "./auth-animated.css";

type Mode = "login" | "register";

export type LoginValues = { email: string; password: string };
export type RegisterValues = {
  username: string;
  email: string;
  password: string;
  role?: "chercheur" | "employeur";
};

type AuthAnimatedProps = {
  initialMode?: Mode;
  /** Appelee a l'envoi du formulaire de connexion */
  onLogin?: (values: LoginValues) => void | Promise<void>;
  /** Appelee a l'envoi du formulaire d'inscription */
  onRegister?: (values: RegisterValues) => void | Promise<void>;
  onVerifyEmail?: (token: string) => void | Promise<void>;
  onResendConfirmation?: () => void | Promise<void>;
  onCancelVerification?: () => void;
  verificationEmail?: string;
  /** Message d'erreur affiché sous le formulaire visible */
  error?: string;
  notice?: string;
};

// --li = délai d'entrée, --lo = délai de sortie (effet en cascade)
const step = (i: number): CSSProperties =>
  ({ "--li": `${i * 0.1}s`, "--lo": `${i * 0.05}s` }) as CSSProperties;

const readForm = (e: FormEvent<HTMLFormElement>) =>
  Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;

type FieldProps = {
  label: string;
  type?: string;
  icon: "user" | "mail" | "lock";
  index: number;
  name: string;
  autoComplete?: string;
};

function Field({ label, type = "text", icon, index, name, autoComplete }: FieldProps) {
  const [show, setShow] = useState(false);
  const inputType = type === "password" ? (show ? "text" : "password") : type;
  const Icon = { user: User, mail: Mail, lock: Lock }[icon];
  return (
    <div className="field anim" style={step(index)}>
      <input name={name} type={inputType} autoComplete={autoComplete} placeholder=" " required />
      <label>{label}</label>
      {type !== "password" && <Icon aria-hidden="true" />}
      {type === "password" && (
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

export default function AuthAnimated({
  initialMode = "login",
  onLogin,
  onRegister,
  onVerifyEmail,
  onResendConfirmation,
  onCancelVerification,
  verificationEmail,
  error,
  notice,
}: AuthAnimatedProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const isLogin = mode === "login";
  const { lang, setLang } = useLang();
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [recoveryNotice, setRecoveryNotice] = useState("");
  const [recoveryError, setRecoveryError] = useState("");

  useEffect(() => {
    if (verificationEmail) setMode("register");
  }, [verificationEmail]);

  const handleForgotPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRecoveryError("");
    setRecoveryNotice("");
    if (!supabase) {
      setRecoveryError(lang === "fr" ? "Le service est indisponible. Réessayez plus tard." : "The service is unavailable. Please try again later.");
      return;
    }
    const email = String(new FormData(e.currentTarget).get("recoveryEmail") ?? "").trim();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: new URL(`${import.meta.env.BASE_URL}reset-password`, window.location.origin).toString(),
    });
    if (resetError) {
      setRecoveryError(resetError.message);
      toast.error(resetError.message);
      return;
    }
    const message = lang === "fr"
      ? "Si un compte existe pour cette adresse, un lien de réinitialisation a été envoyé."
      : "If an account exists for this address, a password reset link has been sent.";
    setRecoveryNotice(message);
    toast.success(lang === "fr" ? "Demande envoyée. Consultez votre email." : "Request sent. Check your email.");
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = readForm(e);
    await onLogin?.({ email: d.email ?? "", password: d.password ?? "" });
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = readForm(e);
    if (verificationEmail) {
      await onVerifyEmail?.(d.verificationCode ?? "");
      return;
    }
    await onRegister?.({
      username: d.username ?? "",
      email: d.email ?? "",
      password: d.password ?? "",
      role: d.role === "employeur" ? "employeur" : "chercheur",
    });
  };

  return (
    <div className="auth-wrap">
      <div className="auth" data-mode={mode}>
        <div className="auth__shape" />

        {/* Formulaire de connexion (gauche) */}
        <section
          className={`panel panel--form panel--form-login ${isLogin ? "" : "is-out"}`}
          aria-hidden={!isLogin}
          inert={!isLogin}
        >
          <h2 className="anim" style={step(0)}>Connexion</h2>
          {forgotPasswordOpen ? (
            <form onSubmit={handleForgotPassword}>
              <p className="text-center text-sm text-muted-foreground">
                {lang === "fr" ? "Saisissez l'adresse liée à votre compte pour recevoir un lien sécurisé." : "Enter your account email to receive a secure link."}
              </p>
              <Field name="recoveryEmail" label={lang === "fr" ? "Adresse email" : "Email address"} type="email" icon="mail" index={1} autoComplete="email" />
              <button className="btn anim" style={step(2)} type="submit" tabIndex={isLogin ? 0 : -1}>
                {lang === "fr" ? "Envoyer le lien" : "Send reset link"}
              </button>
              {recoveryError ? <p className="auth-error" role="alert">{recoveryError}</p> : null}
              {recoveryNotice ? <p className="auth-notice" role="status">{recoveryNotice}</p> : null}
              <p className="switch anim" style={step(3)}>
                <button type="button" onClick={() => setForgotPasswordOpen(false)}>
                  {lang === "fr" ? "Retour à la connexion" : "Back to sign in"}
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <Field name="email" label="Adresse email" type="email" icon="mail" index={1} autoComplete="email" />
              <Field name="password" label="Mot de passe" type="password" icon="lock" index={2} autoComplete="current-password" />
              <div className="flex items-center justify-between text-sm mb-2">
                <button type="button" className="text-primary hover:underline" onClick={() => setForgotPasswordOpen(true)}>
                  Mot de passe oublié ?
                </button>
              </div>
              <label className="flex items-center gap-2 text-sm mb-3">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                Rester connecté(e)
              </label>
              <button className="btn anim" style={step(3)} type="submit" tabIndex={isLogin ? 0 : -1}>
                Se connecter
              </button>
              {isLogin && error ? <p className="auth-error" role="alert">{error}</p> : null}
              <p className="switch anim" style={step(4)}>
                Pas encore de compte ?{" "}
                <button
                  type="button"
                  onClick={(event) => {
                    event.currentTarget.blur();
                    setMode("register");
                  }}
                  tabIndex={isLogin ? 0 : -1}
                >
                  Créer un compte
                </button>
              </p>
            </form>
          )}
        </section>

        {/* Texte d'accueil connexion (droite, sur l'orange) */}
        <section
          className={`panel panel--info panel--info-login ${isLogin ? "" : "is-out"}`}
          aria-hidden={!isLogin}
          inert={!isLogin}
        >
          <h2 className="anim" style={step(0)}>BON RETOUR !</h2>
          <p className="anim" style={step(1)}>
            Content de vous revoir. Connectez-vous pour retrouver vos offres et candidatures.
          </p>
        </section>

        {/* Formulaire d'inscription (droite) */}
        <section
          className={`panel panel--form panel--form-register ${isLogin ? "is-out" : ""}`}
          aria-hidden={isLogin}
          inert={isLogin}
        >
          <h2 className="anim" style={step(0)}>Inscription</h2>
          <form onSubmit={handleRegister}>
            {verificationEmail ? (
              <>
                <p className="auth-notice" role="status">
                  {notice || (lang === "fr"
                    ? `Saisissez le code à 6 chiffres envoyé à ${verificationEmail}.`
                    : `Enter the 6-digit code sent to ${verificationEmail}.`)}
                </p>
                <div className="field anim" style={step(1)}>
                  <input
                    name="verificationCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder=" "
                    required
                    aria-label={lang === "fr" ? "Code de vérification à 6 chiffres" : "6-digit verification code"}
                  />
                  <label>{lang === "fr" ? "Code de vérification" : "Verification code"}</label>
                </div>
                <button className="btn anim" style={step(2)} type="submit" tabIndex={isLogin ? -1 : 0}>
                  {lang === "fr" ? "Vérifier et continuer" : "Verify and continue"}
                </button>
                {!isLogin && error ? <p className="auth-error" role="alert">{error}</p> : null}
                <p className="switch anim" style={step(3)}>
                  <button type="button" onClick={() => void onResendConfirmation?.()}>
                    {lang === "fr" ? "Renvoyer le code" : "Resend code"}
                  </button>
                  {" · "}
                  <button type="button" onClick={onCancelVerification}>
                    {lang === "fr" ? "Modifier l'email" : "Change email"}
                  </button>
                </p>
              </>
            ) : (
              <>
                <Field name="username" label="Nom complet" icon="user" index={1} autoComplete="name" />
                <Field name="email" label="Adresse email" type="email" icon="mail" index={2} autoComplete="email" />
                <Field name="password" label="Mot de passe" type="password" icon="lock" index={3} autoComplete="new-password" />
                <div className="field anim" style={{ ...step(4), borderBottom: "none", height: "auto", margin: "0.5rem 0" }}>
                  <select name="role" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue="chercheur">
                    <option value="chercheur">Je cherche un emploi</option>
                    <option value="employeur">Je souhaite publier des offres</option>
                  </select>
                </div>
                <button className="btn anim" style={step(5)} type="submit" tabIndex={isLogin ? -1 : 0}>
                  S'inscrire
                </button>
                {!isLogin && error ? <p className="auth-error" role="alert">{error}</p> : null}
                {!isLogin && notice ? <p className="auth-notice" role="status">{notice}</p> : null}
                <p className="switch anim" style={step(5)}>
                  Deja un compte ?{" "}
                  <button
                    type="button"
                    onClick={(event) => {
                      event.currentTarget.blur();
                      setMode("login");
                    }}
                    tabIndex={isLogin ? -1 : 0}
                  >
                    Se connecter
                  </button>
                </p>
              </>
            )}
          </form>
        </section>

        {/* Texte d'accueil inscription (gauche, sur l'orange) */}
        <section
          className={`panel panel--info panel--info-register ${isLogin ? "is-out" : ""}`}
          aria-hidden={isLogin}
          inert={isLogin}
        >
          <h2 className="anim" style={step(0)}>BIENVENUE !</h2>
          <p className="anim" style={step(1)}>
            Nous sommes ravis de vous accueillir. Créez votre compte pour trouver votre prochain emploi.
          </p>
        </section>
      </div>

    <div className="mt-6 flex justify-center items-center gap-2 text-xs text-muted-foreground">
      <Globe className="h-3 w-3" />
      <select value={lang} onChange={(e) => setLang(e.target.value as "fr" | "en")} className="rounded-md border border-input bg-background px-2 py-1 text-xs">
        <option value="fr">Français</option>
        <option value="en">English</option>
      </select>
    </div>
    {!isLogin && (
      <footer className="w-full max-w-[760px] border-t border-white/15 pt-3 text-center text-xs text-white/70">
        <div className="flex items-start gap-2 rounded-lg border border-orange-300/25 bg-white/5 px-3 py-2 text-left">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" aria-hidden="true" />
          <p className="leading-relaxed">
            {lang === "fr"
              ? "Aucun employeur ne doit vous demander de payer pour obtenir un emploi. En cas de doute, n'envoyez pas d'argent et signalez l'offre."
              : "An employer should never ask you to pay to get a job. If in doubt, do not send money and report the offer."}
          </p>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span>© {new Date().getFullYear()} Workca</span>
          <a className="underline-offset-4 hover:text-white hover:underline" href={`${import.meta.env.BASE_URL}conditions`}>
            {lang === "fr" ? "Conditions d'utilisation" : "Terms of use"}
          </a>
          <a className="underline-offset-4 hover:text-white hover:underline" href={`${import.meta.env.BASE_URL}confidentialite#cookies`}>
            {lang === "fr" ? "Confidentialité et cookies" : "Privacy and cookies"}
          </a>
          <details className="relative">
            <summary className="cursor-pointer list-none rounded px-2 py-1 font-medium underline-offset-4 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300">
              Contact
            </summary>
            <address className="absolute bottom-full right-0 z-50 mb-2 flex min-w-56 flex-col gap-2 rounded-lg border bg-background p-3 text-left text-xs not-italic text-foreground shadow-lg">
              <a className="inline-flex items-center gap-2 hover:underline" href="mailto:yakubaannanleng@gmail.com">
                <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="break-all">yakubaannanleng@gmail.com</span>
              </a>
              <a className="inline-flex items-center gap-2 hover:underline" href="tel:+237694073533">
                <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                +237 694-073-533
              </a>
              <a className="inline-flex items-center gap-2 hover:underline" href="https://wa.me/237672069569" target="_blank" rel="noreferrer">
                <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                WhatsApp +237 672-069-569
              </a>
            </address>
          </details>
        </div>
      </footer>
    )}
    </div>
  );
}
