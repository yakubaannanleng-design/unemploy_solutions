import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useStore } from "../../lib/store";
import { useLang, t } from "../../lib/i18n";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Logo from "../layout/Logo";

export default function LoginView() {
  const { lang } = useLang();
  const { state } = useStore();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = state.users.find(
      (u) => (u.phone === phone || u.email === phone) && u.passwordHash === password
    );
    if (user) {
      navigate("/" + user.role);
    } else {
      setError(t("error", lang));
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Logo size={48} showText />
          </div>
          <CardTitle>{t("login", lang)}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">
                {lang === "fr" ? "Téléphone / Email" : "Phone / Email"}
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+237 600000001"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{lang === "fr" ? "Mot de passe" : "Password"}</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="demo123"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full">
              {t("login", lang)}
            </Button>
          </form>
          <Separator />
          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
            <div className="font-medium">{lang === "fr" ? "Comptes démo :" : "Demo accounts :"}</div>
            {state.users.map((u) => (
              <div key={u.id}>
                {u.name} — {u.phone} / demo123
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Separator() {
  return <div className="my-3 h-px bg-border" />;
}