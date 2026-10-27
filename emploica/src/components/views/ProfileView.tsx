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
import { toast } from "sonner";
import { Progress } from "../ui/progress";
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
  const compressImage = (file: File, maxSize = 1024): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let w = img.width;
          let h = img.height;
          if (w > maxSize || h > maxSize) {
            if (w > h) { h = Math.round((h * maxSize) / w); w = maxSize; }
            else { w = Math.round((w * maxSize) / h); h = maxSize; }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, w, h);
          canvas.toBlob((blob) => {
            if (blob) resolve(new File([blob], file.name, { type: "image/jpeg" }));
            else resolve(file);
          }, "image/jpeg", 0.8);
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };
  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !seeker || !supabase) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const ext = "jpg";
      const path = `${currentUser.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, compressed, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = data.publicUrl;
      update("seekers", state.seekers.map((s) => (s.userId === currentUser.id ? { ...s, photo: url } : s)));
      toast.success(lang === "fr" ? "Photo mise à jour." : "Photo updated.");
    } catch (err: any) {
      toast.error(err?.message ?? (lang === "fr" ? "Impossible d'envoyer la photo, réessaie." : "Could not upload photo, try again."));
    } finally {
      setUploading(false);
    }
  };
  
  const uploadCv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !seeker || !supabase) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${currentUser.id}/cv.${ext}`;
      const { error: upErr } = await supabase.storage.from("cvs").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("cvs").getPublicUrl(path);
      update("seekers", state.seekers.map((s) => (s.userId === currentUser.id ? { ...s, cvUrl: data.publicUrl } : s)));
      toast.success(lang === "fr" ? "CV téléversé." : "CV uploaded.");
    } catch (err: any) {
      toast.error(err?.message ?? (lang === "fr" ? "Impossible d'envoyer le fichier, réessaie." : "Could not upload file, try again."));
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
      <Card>
        <CardHeader><CardTitle>{lang === "fr" ? "Complétion du profil" : "Profile completion"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {(() => {
            const checks = [
              { label: lang === "fr" ? "Photo" : "Photo", ok: !!seeker.photo },
              { label: lang === "fr" ? "CV" : "CV", ok: !!seeker.cvUrl },
              { label: t("skills", lang), ok: seeker.skills.length > 0 },
              { label: t("description", lang), ok: !!seeker.bio },
              { label: t("experience", lang), ok: !!seeker.experience },
              { label: lang === "fr" ? "Formation" : "Education", ok: !!seeker.education },
            ];
            const done = checks.filter((c) => c.ok).length;
            const pct = Math.round((done / checks.length) * 100);
            return (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span>{lang === "fr" ? "Profil complété à" : "Profile completed"} {pct} %</span>
                </div>
                <Progress value={pct} className="h-2" />
                <ul className="text-xs text-muted-foreground space-y-1">
                  {checks.map((c) => (
                    <li key={c.label} className="flex items-center gap-2">
                      <span className={c.ok ? "text-green-500" : "text-red-500"}>{c.ok ? "✓" : "✗"}</span>
                      {c.label}
                      {!c.ok && (
                        <button className="text-primary hover:underline ml-auto" onClick={() => setEditing(true)}>
                          {lang === "fr" ? "Ajouter" : "Add"}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            );
          })()}
        </CardContent>
      </Card>


      </div>

      <Card>
        <CardHeader><CardTitle>{t("jobSeeker", lang)}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden" style={{ backgroundColor: `hsl(${(currentUser.name.charCodeAt(0) * 37) % 360}, 60%, 45%)` }}>
              {seeker.photo ? (
                <img src={seeker.photo} alt={currentUser.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-white">{currentUser.name.charAt(0).toUpperCase()}</span>
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
             <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {seeker.zone.region}, {seeker.zone.city}{seeker.zone.quartier ? `, ${seeker.zone.quartier}` : ""}</div>
             <div><span className="text-muted-foreground">{t("availability", lang)} : </span>{seeker.availability || (lang === "fr" ? "Non renseigné" : "Not specified")}</div>
             <div><span className="text-muted-foreground">{t("distance", lang)} : </span>{seeker.radiusKm} {t("distanceKm", lang)}</div>
             <div>
               <span className="text-muted-foreground">{t("experience", lang)} : </span>
               {seeker.experience || <span className="text-muted-foreground italic">{lang === "fr" ? "Non renseigné" : "Not specified"} <button className="text-primary hover:underline ml-1" onClick={() => setEditing(true)}>{lang === "fr" ? "Ajouter" : "Add"}</button></span>}
             </div>
             {seeker.education && <div><span className="text-muted-foreground">{lang === "fr" ? "Formation" : "Education"} : </span>{seeker.education}</div>}
             {seeker.cvUrl && (
               <div>
                 <a href={seeker.cvUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                   {lang === "fr" ? "Télécharger le CV" : "Download CV"}
                 </a>
               </div>
             )}
             <div>
               <span className="text-muted-foreground">{t("skills", lang)} : </span>
               {seeker.skills.length > 0 ? seeker.skills.join(", ") : <span className="text-muted-foreground italic">{lang === "fr" ? "Non renseigné" : "Not specified"} <button className="text-primary hover:underline ml-1" onClick={() => setEditing(true)}>{lang === "fr" ? "Ajouter" : "Add"}</button></span>}
             </div>
             <div>
               <span className="text-muted-foreground">{t("description", lang)} : </span>
               {seeker.bio ? seeker.bio : <span className="text-muted-foreground italic">{lang === "fr" ? "Non renseigné" : "Not specified"} <button className="text-primary hover:underline ml-1" onClick={() => setEditing(true)}>{lang === "fr" ? "Ajouter" : "Add"}</button></span>}
             </div>
           </div>
            <div>
              <span className="text-muted-foreground">{lang === "fr" ? "Missions terminées" : "Jobs done"} : </span>
              {seeker.missionsDone > 0 ? seeker.missionsDone : (
                <span className="text-muted-foreground italic">
                  {lang === "fr" ? "Aucune pour l'instant." : "None yet."}{" "}
                  <Link to="/offres" className="text-primary hover:underline">
                    {lang === "fr" ? "Postule à ta première offre" : "Apply to your first offer"}
                  </Link>
                </span>
              )}
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


