import { useState } from "react";
import { useStore } from "../../lib/store";
import { useLang, t } from "../../lib/i18n";
import { Link } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { User, Building2, ShieldCheck, MapPin, Briefcase, Star, BookOpen } from "lucide-react";
import { categoryById } from "../../data/categories";
import ProfileEditor from "./ProfileEditor";
import { supabase } from "../../lib/supabase";
import { TRAININGS } from "../../data/trainings";

export default function ProfileView() {
  const { lang } = useLang();
  const { state, patch, update, currentUser } = useStore();
  const mine = currentUser.id;
  const seeker = state.seekers.find((s) => s.userId === mine);
  const emp = state.employers.find((e) => e.userId === mine);
  const isEmployer = currentUser.role === "employeur";
  const [uploading, setUploading] = useState(false);
  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !seeker) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${currentUser.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = data.publicUrl;
      update("seekers", state.seekers.map((s) => (s.userId === currentUser.id ? { ...s, photo: url } : s)));
    } catch (err: any) {
      alert(err?.message ?? "Upload failed");
  const uploadCv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !seeker) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${currentUser.id}/cv.${ext}`;
      const { error: upErr } = await supabase.storage.from("cvs").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("cvs").getPublicUrl(path);
      update("seekers", state.seekers.map((s) => (s.userId === currentUser.id ? { ...s, cvUrl: data.publicUrl } : s)));
    } catch (err: any) {
      alert(err?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

    } finally {
      setUploading(false);
    }
  };

  const [editing, setEditing] = useState(false);


  const verify = () => {
    if (emp) {
      patch("employers", {
        ...emp,
        verificationRequested: true,
        verificationRequestedAt: new Date().toISOString(),
      });
      // Notifie les administrateurs
      state.users
        .filter((u) => u.role === "admin")
        .forEach((admin) =>
          patch("notifications", {
            id: "notif-" + Math.random().toString(36).slice(2, 9),
            userId: admin.id,
            type: "alerte",
            body: `${currentUser.name} demande la vérification de son entreprise « ${emp.orgName} ».`,
            createdAt: new Date().toISOString(),
            read: false,
          })
        );
    }
  };

  if (isEmployer) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">{t("profile", lang)}</h2>
        <Card>
          <CardHeader><CardTitle>{t("employer", lang)}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <div className="font-medium">{emp?.orgName ?? currentUser.name}</div>
                <div className="text-sm text-muted-foreground">{emp?.orgType}</div>
                {emp?.verification === "vérifié" ? (
                  <Badge variant="secondary" className="mt-1">{t("verified", lang)}</Badge>
                ) : emp?.verificationRequested ? (
                  <Badge variant="outline" className="mt-1">{lang === "fr" ? "Demande envoyée" : "Request sent"}</Badge>
                ) : (
                  <Button size="sm" variant="outline" className="mt-1" onClick={verify}>
                    <ShieldCheck className="h-3 w-3 mr-1" /> {t("verify", lang)}
                  </Button>
                )}
              </div>
            </div>
            <Separator className="my-3" />
            <p className="text-sm text-muted-foreground">{emp?.description ?? ""}</p>
          </CardContent>
        </Card>
        <Link to="/offres/nouveau">
          <Button>{t("createOffer", lang)}</Button>
        </Link>
      </div>
    );
  }

  if (editing && seeker) {
    return (
      <ProfileEditor
        userId={mine}
        initial={seeker}
        onSave={(p) => {
          update("seekers", state.seekers.map((s) => (s.userId === mine ? p : s)));
          setEditing(false);
        }}
      />
    );
  }

  if (!seeker) return <p className="text-muted-foreground">{t("noResults", lang)}</p>;
  const cat = categoryById(seeker.categories[0]);
  const recommended = TRAININGS.filter((tr) => seeker.categories.includes(tr.category)).slice(0, 3);
  const myRatings = state.ratings.filter((r) => r.fromUserId === mine);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t("profile", lang)}</h2>
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>{t("edit", lang) ?? "Modifier"}</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>{t("jobSeeker", lang)}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold overflow-hidden">
              {seeker.photo ? (
                <img src={seeker.photo} alt={currentUser.name} className="h-full w-full object-cover" />
              ) : (
                currentUser.name.charAt(0)
              )}
            </div>
            <div className="mt-3">
              <label className="text-xs text-muted-foreground cursor-pointer">
                <input type="file" accept="image/*" onChange={uploadPhoto} disabled={uploading} className="hidden" />
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md border border-input text-sm hover:bg-accent cursor-pointer">
                  {uploading ? (lang === "fr" ? "Téléchargement..." : "Uploading...") : (lang === "fr" ? "Changer la photo" : "Change photo")}
                </span>
              </label>
            </div>
            <div className="mt-2">
              <label className="text-xs text-muted-foreground cursor-pointer">
                <input type="file" accept=".pdf,.doc,.docx" onChange={uploadCv} disabled={uploading} className="hidden" />
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md border border-input text-sm hover:bg-accent cursor-pointer">
                  {uploading ? (lang === "fr" ? "Téléchargement..." : "Uploading...") : (lang === "fr" ? "Télécharger un CV" : "Upload CV")}
                </span>
              </label>
            </div>

            <div>
              <div className="font-medium flex items-center gap-2">
                {currentUser.name}
                {seeker.rating && <Star className="h-4 w-4 text-brand-500" fill="currentColor" />}
              </div>
              <div className="text-sm text-muted-foreground">
                {cat ? (lang === "fr" ? cat.name : cat.nameEn) : "—"} · {seeker.zone.city}
              </div>
            </div>
          </div>
          <Separator className="my-3" />
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {seeker.zone.region}, {seeker.zone.city}, {seeker.zone.quartier}</div>
            <div><span className="text-muted-foreground">{t("availability", lang)} : </span>{seeker.availability}</div>
            <div><span className="text-muted-foreground">{t("distance", lang)} : </span>{seeker.radiusKm} {t("distanceKm", lang)}</div>
            <div><span className="text-muted-foreground">{t("experience", lang)} : </span>{seeker.experience}</div>
            {seeker.education && <div><span className="text-muted-foreground">{lang === "fr" ? "Formation" : "Education"} : </span>{seeker.education}</div>}
            {seeker.cvUrl && (
              <div>
                <a href={seeker.cvUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  {lang === "fr" ? "Télécharger le CV" : "Download CV"}
                </a>
              </div>
            )}
            <div><span className="text-muted-foreground">{t("skills", lang)} : </span>{seeker.skills.join(", ")}</div>
            <div><span className="text-muted-foreground">{t("description", lang)} : </span>{seeker.bio}</div>
            <div><span className="text-muted-foreground">{lang === "fr" ? "Missions terminées" : "Jobs done"} : </span>{seeker.missionsDone}</div>
          </div>
        </CardContent>
      </Card>

      {recommended.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> {t("formation", lang)}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">{t("formationDesc", lang)}</p>
            <div className="space-y-2">
              {recommended.map((tr) => (
                <div key={tr.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium">{tr.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {tr.provider} · {tr.duration} · {tr.location} · {tr.cost}
                    </div>
                  </div>
                  {tr.url && (
                    <a href={tr.url} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline">{lang === "fr" ? "En savoir plus" : "Learn more"}</Button>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
