const fs = require("fs");
const p = "f:/Mes_Projets/unemploy_solutions/emploica/src/components/auth/AuthAnimated.tsx";
const raw = fs.readFileSync(p, "utf8");
const eol = raw.includes("\r\n") ? "\r\n" : "\n";
let lines = raw.split(/\r?\n/);
const idx = lines.findIndex((l) => l.includes("const isLogin = mode === \"login\";"));
const block = [
  "  const { lang, setLang } = useLang();",
  "  const [rememberMe, setRememberMe] = useState(false);",
  "",
  "  const handleSocial = async (provider: \"google\" | \"apple\") => {",
  "    if (!supabase) { toast.error(\"Service d'authentification indisponible.\"); return; }",
  "    const { error: authError } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin + \"/\" } });",
  "    if (authError) toast.error(authError.message);",
  "  };",
  "",
  "  const handleForgotPassword = async () => {",
  "    const email = window.prompt(\"Entre ton email pour réinitialiser le mot de passe :\");",
  "    if (!email) return;",
  "    if (!supabase) { toast.error(\"Service indisponible.\"); return; }",
  "    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + \"/login\" });",
  "    if (resetError) toast.error(resetError.message);",
  "    else toast.success(\"Email de réinitialisation envoyé.\");",
  "  };",
];
lines.splice(idx + 1, 0, ...block);
fs.writeFileSync(p, lines.join(eol), "utf8");
console.log("done");
