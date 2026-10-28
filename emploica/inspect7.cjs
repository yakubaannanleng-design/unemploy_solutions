const fs = require("fs");
const p = "f:/Mes_Projets/unemploy_solutions/emploica/src/components/home/SeekerHome.tsx";
const c = fs.readFileSync(p, "utf8");
const lines = c.split(/\r?\n/);
for (let i = 114; i <= 124; i++) console.log(i+1, lines[i]);
