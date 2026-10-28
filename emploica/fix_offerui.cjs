const fs = require("fs");
const p = "f:/Mes_Projets/unemploy_solutions/emploica/src/components/offers/OfferForm.tsx";
let c = fs.readFileSync(p, "utf8");
const old = "      <Separator />\n      <p className=\"text-xs text-muted-foreground\">{t(\"antiScam\", lang)}</p>";
const neu = `      <div>
        <Label>{lang === "fr" ? "Image (URL)" : "Image (URL)"}</Label>
        <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
      </div>
      <div>
        <Label>{lang === "fr" ? "Document (URL)" : "Document (URL)"}</Label>
        <Input value={documentUrl} onChange={(e) => setDocumentUrl(e.target.value)} placeholder="https://..." />
      </div>
      <Separator />
      <p className="text-xs text-muted-foreground">{t("antiScam", lang)}</p>`;
if (!c.includes(old)) { console.log("NOT FOUND"); process.exit(1); }
c = c.replace(old, neu);
fs.writeFileSync(p, c, "utf8");
console.log("done");
`;
const fs = require("fs");
const p = "f:/Mes_Projets/unemploy_solutions/emploica/src/components/offers/OfferForm.tsx";
let c = fs.readFileSync(p, "utf8");
const old = "      <Separator />\n      <p className=\"text-xs text-muted-foreground\">{t(\"antiScam\", lang)}</p>";
const neu = `      <div>
        <Label>{lang === "fr" ? "Image (URL)" : "Image (URL)"}</Label>
        <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
      </div>
      <div>
        <Label>{lang === "fr" ? "Document (URL)" : "Document (URL)"}</Label>
        <Input value={documentUrl} onChange={(e) => setDocumentUrl(e.target.value)} placeholder="https://..." />
      </div>
      <Separator />
      <p className="text-xs text-muted-foreground">{t("antiScam", lang)}</p>`;
if (!c.includes(old)) { console.log("NOT FOUND"); process.exit(1); }
c = c.replace(old, neu);
fs.writeFileSync(p, c, "utf8");
console.log("done");
