const fs = require("fs");
const p = "f:/Mes_Projets/unemploy_solutions/emploica/src/components/home/SeekerHome.tsx";
const raw = fs.readFileSync(p, "utf8");
const eol = raw.includes("\r\n") ? "\r\n" : "\n";
let lines = raw.split(/\r?\n/);
// find the line with recommended.map closing
const idx = lines.findIndex((l) => l.includes("recommended.map((o) => ("));
console.log("idx", idx);
// insert after the closing </div> of space-y-3 (idx+3 approx)
// find next line after idx that is "          </div>" then insert button
let target = -1;
for (let i = idx; i < lines.length; i++) {
  if (lines[i].trim() === "</div>" && lines[i-1].includes("OfferPreview")) {
    target = i;
    break;
  }
}
console.log("target", target);
const block = [
  '          <div className="pt-2">',
  '            <Link to="/offres">',
  '              <Button variant="outline" size="sm">{lang === "fr" ? "Voir toutes les offres" : "View all offers"}</Button>',
  '            </Link>',
  '          </div>',
];
lines.splice(target + 1, 0, ...block);
fs.writeFileSync(p, lines.join(eol), "utf8");
console.log("done");
