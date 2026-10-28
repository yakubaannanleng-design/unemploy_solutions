const fs = require("fs");
const p = "f:/Mes_Projets/unemploy_solutions/emploica/src/components/auth/AuthAnimated.tsx";
const raw = fs.readFileSync(p, "utf8");
const lines = raw.split(/\r?\n/);
for (let i = 95; i <= 140; i++) console.log(i+1, lines[i]);
