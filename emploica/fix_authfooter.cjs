const fs = require("fs");
const p = "f:/Mes_Projets/unemploy_solutions/emploica/src/components/auth/AuthAnimated.tsx";
let c = fs.readFileSync(p, "utf8");
const old = "    </div>\n  );\n}";
const neu = `    </div>
    <div className="mt-6 text-center text-xs text-muted-foreground space-y-2">
      <div className="flex flex-wrap justify-center gap-3">
        <a href="/conditions" className="hover:underline">Conditions d’utilisation</a>
        <a href="/confidentialite" className="hover:underline">Politique de confidentialité</a>
        <a href="/confidentialite" className="hover:underline">Politique relative aux cookies</a>
        <a href="/conditions" className="hover:underline">Directives de la communauté</a>
        <a href="/conditions" className="hover:underline">Politique de copyright</a>
        <a href="mailto:yakubaannanleng@gmail.com?subject=Feedback Workca" className="hover:underline">Envoyer un feedback</a>
      </div>
      <div className="flex justify-center items-center gap-2">
        <Globe className="h-3 w-3" />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as "fr" | "en")}
          className="rounded-md border border-input bg-background px-2 py-1 text-xs"
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
  );
}`;
if (!c.includes(old)) { console.log("NOT FOUND"); process.exit(1); }
// replace last occurrence
const idx = c.lastIndexOf(old);
c = c.slice(0, idx) + neu + c.slice(idx + old.length);
fs.writeFileSync(p, c, "utf8");
console.log("done");
`;
const fs = require("fs");
const p = "f:/Mes_Projets/unemploy_solutions/emploica/src/components/auth/AuthAnimated.tsx";
let c = fs.readFileSync(p, "utf8");
const old = "    </div>\n  );\n}";
const neu = `    </div>
    <div className="mt-6 text-center text-xs text-muted-foreground space-y-2">
      <div className="flex flex-wrap justify-center gap-3">
        <a href="/conditions" className="hover:underline">Conditions d’utilisation</a>
        <a href="/confidentialite" className="hover:underline">Politique de confidentialité</a>
        <a href="/confidentialite" className="hover:underline">Politique relative aux cookies</a>
        <a href="/conditions" className="hover:underline">Directives de la communauté</a>
        <a href="/conditions" className="hover:underline">Politique de copyright</a>
        <a href="mailto:yakubaannanleng@gmail.com?subject=Feedback Workca" className="hover:underline">Envoyer un feedback</a>
      </div>
      <div className="flex justify-center items-center gap-2">
        <Globe className="h-3 w-3" />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as "fr" | "en")}
          className="rounded-md border border-input bg-background px-2 py-1 text-xs"
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
  );
}`;
if (!c.includes(old)) { console.log("NOT FOUND"); process.exit(1); }
const idx = c.lastIndexOf(old);
c = c.slice(0, idx) + neu + c.slice(idx + old.length);
fs.writeFileSync(p, c, "utf8");
console.log("done");
