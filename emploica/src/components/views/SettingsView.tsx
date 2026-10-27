// Vue des parametres utilisateur : apparence, compte, securite, notifications, confidentialite, a propos.
import { useState, useEffect } from "react";
import { Moon, Sun, Globe, LogOut, Settings as SettingsIcon, Shield, User, Phone, Mail, Bell, Info, FileText, Lock } from "lucide-react";
import { useLang, t } from "../../lib/i18n";
import { useStore } from "../../lib/store";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Link } from "react-router-dom";
import { Label } from "../ui/label";

export default function SettingsView() {
  const { lang, setLang } = useLang();
  const { state, update, currentUser } = useStore();

  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const toggleDark = (v: boolean) => {
    setDark(v);
    if (v) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    try { window.localStorage.setItem("workca:theme", v ? "dark" : "light"); } catch {}
  };
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("workca:theme");
      if (saved === "dark") { document.documentElement.classList.add("dark"); setDark(true); }
    } catch {}
  }, []);

  const myUser = state.users.find((u) => u.id === currentUser.id) ?? currentUser;
  const [name, setName] = useState(myUser.name);
  const [phone, setPhone] = useState(myUser.phone);
  const [email, setEmail] = useState(myUser.email ?? "");
  const deleteAccount = () => {
    if (!window.confirm(lang === "fr" ? "Supprimer définitivement votre compte ?" : "Permanently delete your account?")) return;
    update("users", state.users.filter((u) => u.id !== currentUser.id));
    update("seekers", state.seekers.filter((s) => s.userId !== currentUser.id));
    update("employers", state.employers.filter((e) => e.userId !== currentUser.id));
    window.localStorage.removeItem("workca:me");
    window.location.href = "/login";
  };
  const saveAccount = () => {
    update("users", state.users.map((u) =>
      u.id === currentUser.id ? { ...u, name, phone, email: email || undefined } : u
    ));
  };


  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const changePassword = () => {
    if (myUser.passwordHash !== currentPw) { setPwMsg("Mot de passe actuel incorrect."); return; }
    if (newPw.length < 4) { setPwMsg("Le nouveau mot de passe est trop court."); return; }
    if (newPw !== confirmPw) { setPwMsg("Les mots de passe ne correspondent pas."); return; }
    update("users", state.users.map((u) =>
      u.id === currentUser.id ? { ...u, passwordHash: newPw } : u
    ));
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setPwMsg("Mot de passe mis a jour.");
  };

  const [notifEnabled, setNotifEnabled] = useState(() => {
    try { return window.localStorage.getItem("workca:notif") !== "off"; } catch { return true; }
  });
  const [profileVisible, setProfileVisible] = useState(() => {
    try { return window.localStorage.getItem("workca:profileVisible") !== "off"; } catch { return true; }
  });
  const [messagesEnabled, setMessagesEnabled] = useState(() => {
    try { return window.localStorage.getItem("workca:messages") !== "off"; } catch { return true; }
  });
  const togglePref = (key: string, v: boolean, setter: (b: boolean) => void) => {
    setter(v);
    try { window.localStorage.setItem(key, v ? "on" : "off"); } catch {}
  const [twoFa, setTwoFa] = useState(false);
  const [twoFaCode, setTwoFaCode] = useState("");

  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <SettingsIcon className="h-5 w-5" /> {t("settings", lang)}
      </h2>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Sun className="h-4 w-4" /> {lang === "fr" ? "Apparence" : "Appearance"}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">{t("language", lang)}</span>
            <Button variant="outline" size="sm" onClick={() => setLang(lang === "fr" ? "en" : "fr")}>
              <Globe className="h-4 w-4 mr-1" /> {lang === "fr" ? "Passer en anglais" : "Switch to French"}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center gap-2">
              {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              {t("darkMode", lang)}
            </span>
            <Switch checked={dark} onCheckedChange={toggleDark} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-4 w-4" /> {lang === "fr" ? "Compte" : "Account"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>{lang === "fr" ? "Nom" : "Name"}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label className="flex items-center gap-1"><Phone className="h-3 w-3" /> {lang === "fr" ? "Telephone" : "Phone"}</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label className="flex items-center gap-1"><Mail className="h-3 w-3" /> Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="text-xs text-muted-foreground">
            {lang === "fr" ? "Role" : "Role"} : {currentUser.role} . {lang === "fr" ? "Statut" : "Status"} : {myUser.status}
          </div>
          <Button onClick={saveAccount}>{t("save", lang)}</Button>
          <Button variant="destructive" size="sm" onClick={deleteAccount}>
            {lang === "fr" ? "Supprimer mon compte" : "Delete my account"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4" /> {lang === "fr" ? "Securite et confidentialite" : "Security and privacy"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm font-medium">{lang === "fr" ? "Changer le mot de passe" : "Change password"}</p>
          <Input type="password" placeholder={lang === "fr" ? "Mot de passe actuel" : "Current password"} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
          <Input type="password" placeholder={lang === "fr" ? "Nouveau mot de passe" : "New password"} value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          <Input type="password" placeholder={lang === "fr" ? "Confirmer" : "Confirm"} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
          {pwMsg && <p className="text-sm text-muted-foreground">{pwMsg}</p>}
          <Button variant="outline" onClick={changePassword}>
            <Lock className="h-4 w-4 mr-1" /> {lang === "fr" ? "Mettre a jour" : "Update"}
          </Button>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm">{lang === "fr" ? "Profil visible par les autres" : "Profile visible to others"}</span>
            <Switch checked={profileVisible} onCheckedChange={(v) => togglePref("workca:profileVisible", v, setProfileVisible)} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{lang === "fr" ? "Recevoir des messages" : "Receive messages"}</span>
            <Switch checked={messagesEnabled} onCheckedChange={(v) => togglePref("workca:messages", v, setMessagesEnabled)} />
          </div>
        </CardContent>
      </Card>

          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm">{lang === "fr" ? "Authentification a deux facteurs (2FA)" : "Two-factor authentication (2FA)"}</span>
            <Switch checked={twoFa} onCheckedChange={setTwoFa} />
          </div>
          {twoFa && (
            <Input placeholder={lang === "fr" ? "Code a 6 chiffres" : "6-digit code"} value={twoFaCode} onChange={(e) => setTwoFaCode(e.target.value)} />
          )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-4 w-4" /> {t("notifications", lang)}</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-sm">{lang === "fr" ? "Notifications activees" : "Notifications enabled"}</span>
          <Switch checked={notifEnabled} onCheckedChange={(v) => togglePref("workca:notif", v, setNotifEnabled)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4" /> {lang === "fr" ? "A propos" : "About"}</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>Workca v0.0.0</div>
          <div>{lang === "fr" ? "Plateforme de mise en relation emploi au Cameroun." : "Job matching platform in Cameroon."}</div>
          <div className="font-medium text-foreground">{lang === "fr" ? "Proprietaire / Developpeur" : "Owner / Developer"} : MADI OUMAROU YAKUBA</div>

          <Separator />
          <Link to="/conditions" className="text-primary hover:underline flex items-center gap-1">
            <FileText className="h-3 w-3" /> {lang === "fr" ? "Conditions d'utilisation" : "Terms of use"}
          </Link>
          <Link to="/confidentialite" className="text-primary hover:underline flex items-center gap-1">
            <FileText className="h-3 w-3" /> {lang === "fr" ? "Politique de confidentialite" : "Privacy policy"}
          </Link>
          <Link to="/licences" className="text-primary hover:underline flex items-center gap-1">
            <FileText className="h-3 w-3" /> {lang === "fr" ? "Licences open source" : "Open source licenses"}
          </Link>
        </CardContent>
      </Card>

      <Separator />
      <Button variant="destructive" onClick={() => { window.localStorage.removeItem("workca:me"); window.location.href = "/login"; }}>
        <LogOut className="h-4 w-4 mr-1" /> {t("logout", lang)}
      </Button>
    </div>
  );
}
