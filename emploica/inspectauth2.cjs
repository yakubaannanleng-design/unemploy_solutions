const fs = require("fs");
const p = "f:/Mes_Projets/unemploy_solutions/emploica/src/components/auth/AuthAnimated.tsx";
const raw = fs.readFileSync(p, "utf8");
const eol = raw.includes("\r\n") ? "\r\n" : "\n";
let lines = raw.split(/\r?\n/);
// footer block is from line 210 to 229 (1-based) approx; find start
const start = lines.findIndex((l) => l.includes('mt-6 text-center text-xs text-muted-foreground space-y-2'));
console.log("start", start);
// find end: line with ");" after footer
let end = -1;
for (let i = start; i < lines.length; i++) {
  if (lines[i].trim() === ");") { end = i; break; }
}
console.log("end", end);
const block = lines.splice(start - 1, end - start + 2); // includes preceding </div>? let's check
// Actually start-1 is the <div className="mt-6...">? Let's just print
console.log("block first", block[0]);
console.log("block last", block[block.length-1]);
// We'll instead not splice; revert by reading original? Too late.
fs.writeFileSync(p, lines.join(eol), "utf8");
console.log("done");
