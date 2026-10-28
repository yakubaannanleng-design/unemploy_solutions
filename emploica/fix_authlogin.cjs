const fs = require("fs");
const p = "f:/Mes_Projets/unemploy_solutions/emploica/src/components/auth/AuthAnimated.tsx";
let c = fs.readFileSync(p, "utf8");
const old = `          <h2 className="anim" style={step(0)}>Connexion</h2>
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
          </form>`;
const neu = `          <h2 className="anim" style={step(0)}>Connexion</h2>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-2 mb-3">
              <button type="button" className="btn anim" style={step(1)} onClick={() => handleSocial("google")}>
                Continuer avec Google
              </button>
              <button type="button" className="btn anim" style={step(2)} onClick={() => handleSocial("apple")}>
                Continuer avec Apple
              </button>
            </div>
            <p className="text-xs text-muted-foreground text-center mb-3">
              En cliquant sur Continuer, vous acceptez les Conditions d’utilisation, la Politique de confidentialité et la Politique relative aux cookies de Workca.
            </p>
            <p className="text-center text-sm mb-2">ou</p>
            <Field name="username" label="E-mail ou téléphone" icon="user" index={3} />
            <Field name="password" label="Mot de passe" type="password" icon="lock" index={4} />
            <div className="flex items-center justify-between text-sm mb-2">
              <button type="button" className="text-primary hover:underline" onClick={handleForgotPassword}>
                Mot de passe oublié ?
              </button>
            </div>
            <label className="flex items-center gap-2 text-sm mb-3">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              Rester connecté(e)
            </label>
            <button className="btn anim" style={step(5)} type="submit" tabIndex={isLogin ? 0 : -1}>
              S’identifier
            </button>
            {isLogin && error ? <p className="auth-error" role="alert">{error}</p> : null}
            <p className="switch anim" style={step(6)}>
              Pas encore de compte ?{" "}
              <button type="button" onClick={() => setMode("register")} tabIndex={isLogin ? 0 : -1}>
                Créer un compte
              </button>
            </p>
          </form>`;
if (!c.includes(old)) { console.log("NOT FOUND"); process.exit(1); }
c = c.replace(old, neu);
fs.writeFileSync(p, c, "utf8");
console.log("done");
