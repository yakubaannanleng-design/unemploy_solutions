// Référentiel géographique Cameroun (simplifié) : région -> ville -> quartiers.
// Conformément au cahier des charges : saisie par sélection de quartier, GPS optionnel.

export const LOCATIONS: Record<string, { city: string; quartiers: string[] }[]> = {
  Centre: [
    { city: "Yaoundé", quartiers: ["Mfoundi", "Efok", "Mfandena", "Nkol Nyada", "Ekounou", "Biyem-Assi", "Simbi", "Nkol-Efok"] },
    { city: "Mbalmayo", quartiers: ["Centre-ville", "Nkol-Mengang"] },
    { city: "Sahmabé", quartiers: ["Centre-ville"] },
  ],
  Littoral: [
    { city: "Douala", quartiers: ["Akwa", "Bonanjo", "Deido", "Ndogpassi", "Bonapriso", "Makepe", "Rond-Point", "Kotto", "Ndokoti"] },
    { city: "Edéa", quartiers: ["Centre-ville", "Sangmélima"] },
    { city: "Kribi", quartiers: ["Plage", "Centre-ville"] },
  ],
  Ouest: [
    { city: "Bafoussam", quartiers: ["Mankon", "Nkwen", "Centre-ville", "Bamendjou"] },
    { city: "Dschang", quartiers: ["Centre-ville", "Fongo-Tongo"] },
  ],
  Nord: [
    { city: "Garoua", quartiers: ["Centre-ville", "Wazza", "Lamorde"] },
    { city: "Maroua", quartiers: ["Centre-ville", "Foumban"] },
  ],
  Sud: [
    { city: "Ebolowa", quartiers: ["Centre-ville", "Mefou"] },
    { city: "Sangmélima", quartiers: ["Centre-ville", "Bidjoua"] },
  ],
  "Nord-Ouest": [
    { city: "Bamenda", quartiers: ["Mankon", "Nkwen", "Up-Station", "Cité-Verte"] },
    { city: "Kumbo", quartiers: ["Centre-ville", "Kimbi"] },
  ],
  "Sud-Ouest": [
    { city: "Buea", quartiers: ["Molyko", "Cité-Verte", "Bokwai"] },
    { city: "Limbe", quartiers: ["Centre-ville", "Down-Beach"] },
  ],
  Est: [
    { city: "Douala-Est", quartiers: ["Centre-ville"] },
    { city: "Abong-Mbang", quartiers: ["Centre-ville"] },
  ],
  "Adamawa": [
    { city: "Ngaoundéré", quartiers: ["Centre-ville", "Mbidel"] },
  ],
};

export function regions(): string[] {
  return Object.keys(LOCATIONS);
}

export function cities(region: string): string[] {
  return (LOCATIONS[region] ?? []).map((c) => c.city);
}

export function quartiers(region: string, city: string): string[] {
  const entry = (LOCATIONS[region] ?? []).find((c) => c.city === city);
  return entry?.quartiers ?? [];
}