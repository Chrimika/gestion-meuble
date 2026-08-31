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
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  paymentType: "TRANCHE";
  trancheType: string;
  totalContract: string;
  defaultAmount: string;
}
