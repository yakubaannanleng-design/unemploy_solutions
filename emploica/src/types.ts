// Définitions des types TypeScript utilisés dans toute l'application Workca.
// Langues supportées, types de contrat, statuts d'offre, utilisateurs, offres,
// candidatures, conversations, messages, notifications, signalements, transactions,
// formations et offres flash.
export type Lang = "fr" | "en";

export type ContractType =
  | "permanent"
  | "temporaire"
  | "mission"
  | "stage"
  | "temps-partiel"
  | "indépendant";

export type ApplicationStatus = "envoyée" | "consultée" | "retenue" | "refusée" | "retirée";

export type OfferStatus = "brouillon" | "en-attente" | "publiée" | "clôturée";

export type MessageStatus = "envoyé" | "lu";

export type VerificationLevel = "déclaré" | "vérifié";

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
}

export interface Location {
  region: string;
  city: string;
  quartier?: string;
  lat?: number;
  lng?: number;
}

export interface User {
  id: string;
  role: "chercheur" | "employeur" | "admin";
  name: string;
  phone: string;
  email?: string;
  passwordHash: string;
  status: "actif" | "suspendu";
  verification: VerificationLevel;
  createdAt: string;
}

export interface SeekerProfile {
  userId: string;
  bio: string;
  skills: string[];
  categories: string[];
  contractWanted: ContractType[];
  availability: string;
  zone: Location;
  radiusKm: number;
  experience: string;
  education?: string;
  cvUrl?: string;
  languages: string[];
  photo?: string;
  missionsDone: number;
  rating?: number;
}

export interface EmployerProfile {
  userId: string;
  orgName: string;
  description: string;
  orgType: "entreprise" | "particulier" | "association";
  verification: VerificationLevel;
  verifiedAt?: string;
  verificationRequested?: boolean;
  verificationRequestedAt?: string;
}

export interface Offer {
  id: string;
  employerId: string;
  title: string;
  description: string;
  tasks: string[];
  category: string;
  skills: string[];
  location: Location;
  contract: ContractType;
  duration: string;
  schedule: string;
  pay: string;
  payMode: "négocier" | "fixe";
  createdAt: string;
  expiresAt?: string;
  status: OfferStatus;
  boost: boolean;
  views: number;
}

export interface Application {
  id: string;
  offerId: string;
  seekerId: string;
  status: ApplicationStatus;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  messages: Message[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  body: string;
  createdAt: string;
  status: MessageStatus;
}

export interface Notification {
  id: string;
  userId: string;
  type: "offre" | "message" | "candidature" | "alerte";
  body: string;
  createdAt: string;
  read: boolean;
}

export interface Signalement {
  id: string;
  authorId: string;
  targetType: "offre" | "message" | "utilisateur";
  targetId: string;
  reason: string;
  createdAt: string;
  status: "en-attente" | "traité";
}

export interface Transaction {
  id: string;
  userId: string;
  type: "boost" | "abonnement";
  amount: number;
  operator: "Orange Money" | "MTN MoMo";
  status: "réussi" | "échec" | "en-attente";
  createdAt: string;
}

export interface Training {
  id: string;
  name: string;
  category: string;
  provider: string;
  duration: string;
  location: string;
  cost: string;
  url?: string;
}

export interface FlashOffer {
  id: string;
  offerId: string;
  startsAt: string;
  endsAt: string;
  maxCandidates: number;
  takenCount: number;
}

export interface Rating {
  id: string;
  fromUserId: string;
  toUserId: string;
  toRole: "employeur" | "chercheur";
  missionId?: string;
  score: number;
  comment: string;
  createdAt: string;
}