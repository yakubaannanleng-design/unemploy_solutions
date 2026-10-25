import type {
  Application,
  Conversation,
  EmployerProfile,
  Message,
  Notification,
  Offer,
  SeekerProfile,
  Signalement,
  Transaction,
  User,
} from "../types";

const now = new Date("2026-10-22T09:00:00Z").toISOString();

export const DEMO_USERS: User[] = [
  {
    id: "u-seeker",
    role: "chercheur",
    name: "Paul Mbarga",
    phone: "+237 600000001",
    email: "paul.mbarga@example.com",
    passwordHash: "demo123",
    status: "actif",
    verification: "vérifié",
    createdAt: now,
  },
  {
    id: "u-employer",
    role: "employeur",
    name: "Mamadou Diallo",
    phone: "+237 600000002",
    email: "mamadou.diallo@example.com",
    passwordHash: "demo123",
    status: "actif",
    verification: "vérifié",
    createdAt: now,
  },
  {
    id: "u-admin",
    role: "admin",
    name: "Admin Plateforme",
    phone: "+237 600000000",
    passwordHash: "demo123",
    status: "actif",
    verification: "vérifié",
    createdAt: now,
  },
];

export const DEMO_SEEKERS: SeekerProfile[] = [
  {
    userId: "u-seeker",
    bio: "Jeune mécanicien passionné, disponible immédiatement à Douala.",
    skills: ["réparation moteur", "entretien", "diagnostic"],
    categories: ["mecanique"],
    contractWanted: ["permanent", "mission"],
    availability: "immédiatement",
    zone: { region: "Littoral", city: "Douala", quartier: "Akwa", lat: 4.051, lng: 9.767 },
    radiusKm: 15,
    experience: "3 ans en garage",
    languages: ["français", "anglais"],
    missionsDone: 4,
    rating: 4.5,
  },
];

export const DEMO_EMPLOYERS: EmployerProfile[] = [
  {
    userId: "u-employer",
    orgName: "Garage Diallo",
    description: "Garage automobile indépendant à Douala.",
    orgType: "entreprise",
    verification: "vérifié",
    verifiedAt: now,
  },
];

export const DEMO_OFFERS: Offer[] = [
  {
    id: "off-1",
    employerId: "u-employer",
    title: "Mécanicien automobile",
    description: "Entretien, réparation et diagnostic des véhicules légers.",
    tasks: ["Changement d'huile", "Diagnostic moteur", "Révision générale"],
    category: "mecanique",
    skills: ["mécanique", "diagnostic"],
    location: { region: "Littoral", city: "Douala", quartier: "Akwa", lat: 4.051, lng: 9.767 },
    contract: "permanent",
    duration: "CDI",
    schedule: "Lundi - Vendredi, 8h-17h",
    pay: "120 000 FCFA",
    payMode: "fixe",
    createdAt: now,
    status: "publiée",
    boost: false,
    views: 12,
  },
  {
    id: "off-2",
    employerId: "u-employer",
    title: "Aide-mécanicien",
    description: "Aide aux tâches courantes du garage.",
    tasks: ["Nettoyage outils", "Aide au démontage"],
    category: "mecanique",
    skills: ["mécanique"],
    location: { region: "Littoral", city: "Douala", quartier: "Deido", lat: 4.06, lng: 9.76 },
    contract: "mission",
    duration: "3 mois",
    schedule: "Lundi - Samedi",
    pay: "à négocier",
    payMode: "négocier",
    createdAt: now,
    status: "en-attente",
    boost: false,
    views: 0,
  },
];

export const DEMO_APPLICATIONS: Application[] = [
  { id: "app-1", offerId: "off-1", seekerId: "u-seeker", status: "retenue", createdAt: now },
];

export const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    participants: ["u-seeker", "u-employer"],
    messages: [
      {
        id: "msg-1",
        senderId: "u-employer",
        receiverId: "u-seeker",
        body: "Bonjour Paul, votre candidature a été retenue. Pouvez-vous confirmer votre disponibilité ?",
        createdAt: now,
        status: "lu",
      },
    ],
  },
];

export const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    userId: "u-seeker",
    type: "candidature",
    body: "Votre candidature à « Mécanicien automobile » a été retenue.",
    createdAt: now,
    read: false,
  },
];

export const DEMO_SIGNALEMENTS: Signalement[] = [];

export const DEMO_TRANSACTIONS: Transaction[] = [];

export function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}