import { useState, type CSSProperties, type FormEvent } from "react";
import { User, Mail, Lock, Eye, EyeOff, Globe } from "lucide-react";
import { useLang } from "../../lib/i18n";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import "./auth-animated.css";
import "./auth-animated.css";

type Mode = "login" | "register";

export type LoginValues = { username: string; password: string };
export type RegisterValues = { username: string; email: string; password: string };

type AuthAnimatedProps = {
  /** Appelée à l'envoi du formulaire de connexion */
  onLogin?: (values: LoginValues) => void | Promise<void>;
  /** Appelée à l'envoi du formulaire d'inscription */
  onRegister?: (values: RegisterValues) => void | Promise<void>;
  /** Message d'erreur affiché sous le formulaire visible */
  error?: string;
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
};

function Field({ label, type = "text", icon, index, name }: FieldProps) {
  const [show, setShow] = useState(false);
  const inputType = type === "password" ? (show ? "text" : "password") : type;
  const Icon = { user: User, mail: Mail, lock: Lock }[icon];
  return (
    <div className="field anim" style={step(index)}>
      <input name={name} type={inputType} placeholder=" " required />
      <label>{label}</label>
      <Icon aria-hidden="true" />
      {type === "password" && (
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

export default function AuthAnimated({ onLogin, onRegister, error }: AuthAnimatedProps) {
  const [mode, setMode] = useState<Mode>("login");
  const isLogin = mode === "login";
  const { lang, setLang } = useLang();
  const [rememberMe, setRememberMe] = useState(false);

  const handleSocial = async (provider: "google" | "apple") => {
    if (!supabase) { toast.error("Service d'authentification indisponible."); return; }
    const { error: authError } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin + "/" } });
    if (authError) toast.error(authError.message);
  };

  const handleForgotPassword = async () => {
    const email = window.prompt("Entre ton email pour réinitialiser le mot de passe :");
    if (!email) return;
    if (!supabase) { toast.error("Service indisponible."); return; }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/login" });
    if (resetError) toast.error(resetError.message);
    else toast.success("Email de réinitialisation envoyé.");
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = readForm(e);
    await onLogin?.({ username: d.username ?? "", password: d.password ?? "" });
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = readForm(e);
    await onRegister?.({
      username: d.username ?? "",
      email: d.email ?? "",
      password: d.password ?? "",
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
        >
          <h2 className="anim" style={step(0)}>Connexion</h2>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-2 mb-3">
              <button type="button" className="btn anim flex items-center justify-center gap-2" onClick={() => handleSocial("google")}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continuer avec Google
              </button>
              <button type="button" className="btn anim flex items-center justify-center gap-2" onClick={() => handleSocial("apple")}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                Continuer avec Apple
              </button>
            </div>
            <p className="text-center text-sm mb-2">ou</p>
            <Field name="username" label="Nom d'utilisateur" icon="user" index={1} />
            <Field name="password" label="Mot de passe" type="password" icon="lock" index={2} />
            <div className="flex items-center justify-between text-sm mb-2">
              <button type="button" className="text-primary hover:underline" onClick={handleForgotPassword}>
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
              <button type="button" onClick={() => setMode("register")} tabIndex={isLogin ? 0 : -1}>
                Créer un compte
              </button>
            </p>
          </form>
        </section>

        {/* Texte d'accueil connexion (droite, sur l'orange) */}
        <section
          className={`panel panel--info panel--info-login ${isLogin ? "" : "is-out"}`}
          aria-hidden={!isLogin}
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
        >
          <h2 className="anim" style={step(0)}>Inscription</h2>
          <form onSubmit={handleRegister}>
            <Field name="username" label="Nom d'utilisateur" icon="user" index={1} />
            <Field name="email" label="Email" type="email" icon="mail" index={2} />
            <Field name="password" label="Mot de passe" type="password" icon="lock" index={3} />
            <div className="field anim" style={step(4)}>
              <select name="role" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue="chercheur">
                <option value="chercheur">Je cherche un emploi</option>
                <option value="employeur">Je propose un emploi</option>
              </select>
            </div>
            <button className="btn anim" style={step(5)} type="submit" tabIndex={isLogin ? -1 : 0}>
              S'inscrire
            </button>
            {!isLogin && error ? <p className="auth-error" role="alert">{error}</p> : null}
            <p className="switch anim" style={step(5)}>
              Déjà un compte ?{" "}
              <button type="button" onClick={() => setMode("login")} tabIndex={isLogin ? -1 : 0}>
                Se connecter
              </button>
            </p>
          </form>
        </section>

        {/* Texte d'accueil inscription (gauche, sur l'orange) */}
        <section
          className={`panel panel--info panel--info-register ${isLogin ? "is-out" : ""}`}
          aria-hidden={isLogin}
        >
          <h2 className="anim" style={step(0)}>BIENVENUE !</h2>
          <p className="anim" style={step(1)}>
            Nous sommes ravis de vous accueillir. Créez votre compte pour trouver votre prochain emploi.
          </p>
        </section>
      </div>
    <div className="mt-6 text-center text-xs text-muted-foreground space-y-2">
      <div className="flex flex-wrap justify-center gap-3">
        <a href="/conditions" className="hover:underline">Conditions d’utilisation</a>
        <a href="/confidentialite" className="hover:underline">Politique de confidentialité</a>
        <a href="/confidentialite" className="hover:underline">Politique relative aux cookies</a>
        <a href="/conditions" className="hover:underline">Directives de la communauté</a>
        <a href="/conditions" className="hover:underline">Politique de copyright</a>
        <a href="mailto:yakubaannanleng@gmail.com?subject=Feedback Workca" className="hover:underline">Envoyer un feedback</a>
      </div>
      <div className="flex justify-center items-center gap-2">
        <Globe className="h-3 w-3" />
        <select value={lang} onChange={(e) => setLang(e.target.value as "fr" | "en")} className="rounded-md border border-input bg-background px-2 py-1 text-xs">
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
    </div>
  );
}
