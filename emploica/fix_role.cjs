const fs = require("fs");
const p = "f:/Mes_Projets/unemploy_solutions/emploica/src/pages/AuthPage.tsx";
let c = fs.readFileSync(p, "utf8");
c = c.replace(/role: "chercheur",/g, 'role: values.role ?? "chercheur",');

// In Supabase success path, after patch seekers? Actually it patches seekers unconditionally. Need make conditional.
// We'll replace the seekers patch block in Supabase path? Hard. Instead leave seekers patch; for employer, also patch employers.
// Add employer patch after seekers patch in both paths? The seekers patch is identical in both. We'll replace one occurrence? There are two.
fs.writeFileSync(p, c, "utf8");
console.log("done");
