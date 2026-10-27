import { useState, type CSSProperties, type FormEvent } from "react";
import { User, Mail, Lock } from "lucide-react";
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
  const Icon = { user: User, mail: Mail, lock: Lock }[icon];
  return (
    <div className="field anim" style={step(index)}>
      <input name={name} type={type} placeholder=" " required />
      <label>{label}</label>
      <Icon aria-hidden="true" />
    </div>
  );
}

export default function AuthAnimated({ onLogin, onRegister, error }: AuthAnimatedProps) {
  const [mode, setMode] = useState<Mode>("login");
  const isLogin = mode === "login";

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
            <button className="btn anim" style={step(4)} type="submit" tabIndex={isLogin ? -1 : 0}>
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
    </div>
  );
}
