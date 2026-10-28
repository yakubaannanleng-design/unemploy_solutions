const fs = require("fs");
const p = "f:/Mes_Projets/unemploy_solutions/emploica/src/components/home/SeekerHome.tsx";
const raw = fs.readFileSync(p, "utf8");
const eol = raw.includes("\r\n") ? "\r\n" : "\n";
let lines = raw.split(/\r?\n/);
// Remove the inserted CTA block (lines 120..124 1-based => 119..123 0-based)
lines.splice(119, 5);
// Insert CTA after the closing of recommended section: find line with "{recommended.length === 0 ?" then after its closing "}\n      </div>"? We'll insert before the final </div> of component? Instead insert after line that is "      </div>" following recommended. Find index of "Compatible offers nearby" h3.
let idx = lines.findIndex((l) => l.includes("Compatible offers nearby"));
console.log("idx", idx);
// find closing </div> after idx
let target = -1;
for (let i = idx; i < lines.length; i++) {
  if (lines[i].trim() === "</div>" && lines[i+1] && lines[i+1].trim() === "</div>") {
    // this is the section closing before component closing
    target = i;
    break;
  }
}
console.log("target", target);
const block = [
  '      <div className="pt-2">',
  '        <Link to="/offres">',
  '          <Button variant="outline" size="sm">{lang === "fr" ? "Voir toutes les offres" : "View all offers"}</Button>',
  '        </Link>',
  '      </div>',
];
if (target !== -1) lines.splice(target + 1, 0, ...block);
fs.writeFileSync(p, lines.join(eol), "utf8");
console.log("done");
