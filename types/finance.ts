export type PropertyUnit = 
  | "Appartement 1"
  | "Appartement 2"
  | "Appartement 3"
  | "Appartement 4"
  | "Salle de Conférence"
  | "Général / Communs";

export type Category = string;

export interface CategoryItem {
  id: string;
  name: string;
  isCustom: boolean;
  createdAt?: string;
}

export interface ReservationService {
  id: string;        // uuid local
  label: string;     // Ex: "Lessive", "Repas soir"
  qty: number;       // quantité
  unitPrice: number; // prix unitaire en FCFA
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  pieceNo: string;
  libelle: string;
  unit: PropertyUnit;
  category: Category;
  recettes: number;
  depenses: number;
  solde?: number; // Calculated dynamically
  notes?: string;
  // Reservation extras
  clientCni?: string;
  clientName?: string;
  resStartDate?: string;
  resEndDate?: string;
  resNights?: number;
  resTotalContract?: number;
  resTrancheType?: string;
  resServices?: ReservationService[]; // services additionnels
}

export interface UnitSummary {
  id: PropertyUnit;
  name: string;
  type: "appartement" | "conference" | "general";
  totalRecettes: number;
  totalDepenses: number;
  transactionCount: number;
  activeBooking?: {
    client: string;
    startDate: string;
    endDate: string;
  };
}

export interface SummaryKPI {
  totalRecettes: number;
  totalDepenses: number;
  soldeActuel: number;
  totalTransactions: number;
  recettesApparts: number;
  recettesSalleConf: number;
}

export interface InstallmentPreFill {
  unit: PropertyUnit;
  client: string;
  clientCni?: string;
  startDate: string;
  endDate: string;
  paymentType: "TRANCHE";
  trancheType: string;
  totalContract: string;
  defaultAmount: string;
}
