import { useState, type CSSProperties, type FormEvent } from "react";
import { User, Mail, Lock, Eye, EyeOff, Globe } from "lucide-react";
import { useLang } from "../../lib/i18n";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import "./auth-animated.css";

type Mode = "login" | "register";

export type LoginValues = { username: string; password: string };
export type RegisterValues = { username: string; email: string; password: string };

type AuthAnimatedProps = {
  /** Appelee a l'envoi du formulaire de connexion */
  onLogin?: (values: LoginValues) => void | Promise<void>;
  /** Appelee a l'envoi du formulaire d'inscription */
  onRegister?: (values: RegisterValues) => void | Promise<void>;
  /** Message d'erreur affichÃ© sous le formulaire visible */
  error?: string;
};

// --li = dÃ©lai d'entrÃ©e, --lo = dÃ©lai de sortie (effet en cascade)
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

export default function AuthAnimated({ onLogin, onRegister, error }: AuthAnimatedProps) {
  const [mode, setMode] = useState<Mode>("login");
  const isLogin = mode === "login";
  const { lang, setLang } = useLang();
  const [rememberMe, setRememberMe] = useState(false);

  const handleForgotPassword = async () => {
    const email = window.prompt("Entre ton email pour rÃ©initialiser le mot de passe :");
    if (!email) return;
    if (!supabase) { toast.error("Service indisponible."); return; }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/login" });
    if (resetError) toast.error(resetError.message);
    else toast.success("Email de rÃ©initialisation envoyÃ©.");
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
            <Field name="username" label="Nom d'utilisateur" icon="user" index={1} />
            <Field name="password" label="Mot de passe" type="password" icon="lock" index={2} />
            <div className="flex items-center justify-between text-sm mb-2">
              <button type="button" className="text-primary hover:underline" onClick={handleForgotPassword}>
                Mot de passe oubliÃ© ?
              </button>
            </div>
            <label className="flex items-center gap-2 text-sm mb-3">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              Rester connectÃ©(e)
            </label>
            <button className="btn anim" style={step(3)} type="submit" tabIndex={isLogin ? 0 : -1}>
              Se connecter
            </button>
            {isLogin && error ? <p className="auth-error" role="alert">{error}</p> : null}
            <p className="switch anim" style={step(4)}>
              Pas encore de compte ?{" "}
              <button type="button" onClick={() => setMode("register")} tabIndex={isLogin ? 0 : -1}>
                CrÃ©er un compte
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
            <div className="field anim" style={{ ...step(4), borderBottom: "none", height: "auto", margin: "0.5rem 0" }}>
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
              Deja un compte ?{" "}
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
            Nous sommes ravis de vous accueillir. CrÃ©ez votre compte pour trouver votre prochain emploi.
          </p>
        </section>
      </div>

    <div className="mt-6 text-center text-xs text-muted-foreground space-y-3">
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        <a href="/conditions" className="hover:text-primary hover:underline transition-colors">Conditions d'utilisation</a>
        <span className="text-muted-foreground/40">Â·</span>
        <a href="/confidentialite" className="hover:text-primary hover:underline transition-colors">Politique de confidentialitÃ©</a>
        <span className="text-muted-foreground/40">Â·</span>
        <a href="/confidentialite" className="hover:text-primary hover:underline transition-colors">Politique relative aux cookies</a>
        <span className="text-muted-foreground/40">Â·</span>
        <a href="/conditions" className="hover:text-primary hover:underline transition-colors">Directives de la communautÃ©</a>
        <span className="text-muted-foreground/40">Â·</span>
        <a href="/conditions" className="hover:text-primary hover:underline transition-colors">Politique de copyright</a>
        <span className="text-muted-foreground/40">Â·</span>
        <a href="mailto:yakubaannanleng@gmail.com?subject=Feedback Workca" className="hover:text-primary hover:underline transition-colors">Envoyer un feedback</a>
      </div>
      <div className="flex justify-center items-center gap-2">
        <Globe className="h-3 w-3" />
        <select value={lang} onChange={(e) => setLang(e.target.value as "fr" | "en")} className="rounded-md border border-input bg-background px-2 py-1 text-xs">
          <option value="fr">FranÃ§ais</option>
          <option value="en">English</option>
        </select>
      </div>
      <p className="max-w-prose mx-auto leading-relaxed">
        Aucun employeur ne doit jamais vous demander de l'argent. Signalez tout comportement suspect.
      </p>
    </div>
    </div>
  );
}
