const fs = require("fs");
const p = "f:/Mes_Projets/unemploy_solutions/emploica/src/pages/AuthPage.tsx";
let c = fs.readFileSync(p, "utf8");
const old = `    patch("seekers", {
      userId: newUser.id,
      bio: "",
      skills: [],
      categories: [],
      contractWanted: [],
      availability: "immédiatement",
      zone: { region: "Centre", city: "Yaoundé", quartier: "" },
      radiusKm: 10,
      experience: "",
      languages: ["français"],
      missionsDone: 0,
    } as any);`;
const neu = `    if ((values.role ?? "chercheur") === "employeur") {
      patch("employers", {
        userId: newUser.id,
        orgName: username,
        description: "",
        orgType: "entreprise",
        verification: "déclaré",
        verificationRequested: false,
      } as any);
    } else {
      patch("seekers", {
        userId: newUser.id,
        bio: "",
        skills: [],
        categories: [],
        contractWanted: [],
        availability: "immédiatement",
        zone: { region: "Centre", city: "Yaoundé", quartier: "" },
        radiusKm: 10,
        experience: "",
        languages: ["français"],
        missionsDone: 0,
      } as any);
    }`;
// replace all occurrences
while (c.includes(old)) c = c.replace(old, neu);
fs.writeFileSync(p, c, "utf8");
console.log("done");
