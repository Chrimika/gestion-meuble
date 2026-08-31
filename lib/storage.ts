import { Transaction, SummaryKPI, PropertyUnit, Category } from "@/types/finance";
import { INITIAL_TRANSACTIONS } from "@/data/initialData";

const STORAGE_KEY = "immo_gestion_transactions_v1";

/**
 * Formats a date string (YYYY-MM-DD) to JJ/MM/AAAA (DD/MM/YYYY)
 */
export function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return "-";
  if (dateStr.includes("/")) return dateStr;
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    if (year.length === 4) {
      return `${day}/${month}/${year}`;
    }
  }
  return dateStr;
}

/**
 * Recalculates running balance (solde) for all transactions in sequential order
 */
export function calculateSoldes(transactions: Transaction[]): Transaction[] {
  let runningSolde = 0;
  return transactions.map((tx) => {
    const recettes = Number(tx.recettes) || 0;
    const depenses = Number(tx.depenses) || 0;
    runningSolde = runningSolde + recettes - depenses;
    return {
      ...tx,
      recettes,
      depenses,
      solde: runningSolde,
    };
  });
}

/**
 * Load transactions from localStorage or default to initial data
 */
export function loadTransactions(): Transaction[] {
  if (typeof window === "undefined") {
    return calculateSoldes(INITIAL_TRANSACTIONS);
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      const initialWithSoldes = calculateSoldes(INITIAL_TRANSACTIONS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialWithSoldes));
      return initialWithSoldes;
    }
    const parsed: Transaction[] = JSON.parse(saved);
    return calculateSoldes(parsed);
  } catch (error) {
    console.error("Erreur lors du chargement des transactions :", error);
    return calculateSoldes(INITIAL_TRANSACTIONS);
  }
}

/**
 * Save transactions array to localStorage
 */
export function saveTransactions(transactions: Transaction[]): Transaction[] {
  const updatedWithSoldes = calculateSoldes(transactions);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWithSoldes));
    } catch (error) {
      console.error("Erreur de sauvegarde localStorage :", error);
    }
  }
  return updatedWithSoldes;
}

/**
 * Reset data back to initial sheet dataset
 */
export function resetTransactions(): Transaction[] {
  const initialWithSoldes = calculateSoldes(INITIAL_TRANSACTIONS);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialWithSoldes));
  }
  return initialWithSoldes;
}

/**
 * Calculate high level KPI summary
 */
export function getSummaryKPI(transactions: Transaction[]): SummaryKPI {
  const totalRecettes = transactions.reduce((acc, t) => acc + (t.recettes || 0), 0);
  const totalDepenses = transactions.reduce((acc, t) => acc + (t.depenses || 0), 0);
  const soldeActuel = totalRecettes - totalDepenses;

  const recettesApparts = transactions
    .filter((t) => t.unit.startsWith("Appartement"))
    .reduce((acc, t) => acc + (t.recettes || 0), 0);

  const recettesSalleConf = transactions
    .filter((t) => t.unit === "Salle de Conférence")
    .reduce((acc, t) => acc + (t.recettes || 0), 0);

  return {
    totalRecettes,
    totalDepenses,
    soldeActuel,
    totalTransactions: transactions.length,
    recettesApparts,
    recettesSalleConf,
  };
}

/**
 * Group transactions by property unit
 */
export function getBreakdownByUnit(transactions: Transaction[]) {
  const units: PropertyUnit[] = [
    "Appartement 1",
    "Appartement 2",
    "Appartement 3",
    "Appartement 4",
    "Salle de Conférence",
    "Général / Communs",
  ];

  return units.map((unit) => {
    const unitTxs = transactions.filter((t) => t.unit === unit);
    const totalRecettes = unitTxs.reduce((sum, t) => sum + (t.recettes || 0), 0);
    const totalDepenses = unitTxs.reduce((sum, t) => sum + (t.depenses || 0), 0);
    return {
      unit,
      recettes: totalRecettes,
      depenses: totalDepenses,
      solde: totalRecettes - totalDepenses,
      count: unitTxs.length,
    };
  });
}

/**
 * Group expenses by category (supports custom categories)
 */
export function getExpenseBreakdownByCategory(transactions: Transaction[], availableCategories?: string[]) {
  const defaultCats = [
    "Entretien & Travaux",
    "Fournitures & Linge",
    "Salaires & Personnel",
    "Charges & Énergie",
    "Transport & Com",
    "Loyers & Réservations",
    "Autres",
  ];

  const allCategoryNames = new Set<string>([
    ...defaultCats,
    ...(availableCategories || []),
    ...transactions.map((t) => t.category).filter(Boolean),
  ]);

  return Array.from(allCategoryNames).map((cat) => {
    const catTxs = transactions.filter((t) => t.category === cat);
    const totalDepenses = catTxs.reduce((sum, t) => sum + (t.depenses || 0), 0);
    const totalRecettes = catTxs.reduce((sum, t) => sum + (t.recettes || 0), 0);
    return {
      category: cat,
      depenses: totalDepenses,
      recettes: totalRecettes,
      count: catTxs.length,
    };
  }).filter((item) => item.depenses > 0 || item.recettes > 0);
}

/**
 * Export transactions to CSV string
 */
export function exportToCSV(transactions: Transaction[]): string {
  const headers = ["DATE", "N° PIECE", "LIBELLE", "UNITE", "CATEGORIE", "RECETTES", "DEPENSES", "SOLDE"];
  const rows = transactions.map((t) => [
    t.date,
    `"${t.pieceNo.replace(/"/g, '""')}"`,
    `"${t.libelle.replace(/"/g, '""')}"`,
    `"${t.unit}"`,
    `"${t.category}"`,
    t.recettes || 0,
    t.depenses || 0,
    t.solde || 0,
  ]);

  return [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
}

/**
 * Extracts reservation details from a transaction libellé to pre-fill the next installment payment
 */
export function parseInstallmentFromTx(tx: Transaction): any {
  const lib = tx.libelle || "";

  // Extract client: (PAR ...)
  const clientMatch = lib.match(/\(PAR\s+([^)]+)\)/i);
  const client = clientMatch ? clientMatch[1].trim() : "";

  // Extract dates: DU DD/MM/YYYY AU DD/MM/YYYY
  const dateMatch = lib.match(/DU\s+(\d{2}\/\d{2}\/\d{4})\s+AU\s+(\d{2}\/\d{2}\/\d{4})/i);
  let startDate = "";
  let endDate = "";
  if (dateMatch) {
    const parseFrDate = (str: string) => {
      const parts = str.split("/");
      return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : "";
    };
    startDate = parseFrDate(dateMatch[1]);
    endDate = parseFrDate(dateMatch[2]);
  }

  // Extract total: TOTAL: X F
  const totalMatch = lib.match(/TOTAL:\s*([\d\s]+)\s*F/i);
  const totalContract = totalMatch ? totalMatch[1].replace(/\s/g, "") : "";

  // Extract reste: RESTE DÛ: X F
  const resteMatch = lib.match(/RESTE DÛ:\s*([\d\s]+)\s*F/i);
  const resteAmt = resteMatch ? resteMatch[1].replace(/\s/g, "") : "";

  // Determine next tranche
  let nextTranche = "2ème Tranche";
  if (lib.includes("1ÈRE TRANCHE") || lib.includes("1ERE TRANCHE")) {
    nextTranche = "2ème Tranche";
  } else if (lib.includes("2ÈME TRANCHE") || lib.includes("2EME TRANCHE")) {
    nextTranche = "3ème Tranche";
  } else if (lib.includes("3ÈME TRANCHE") || lib.includes("3EME TRANCHE")) {
    nextTranche = "Solde Final";
  } else {
    nextTranche = "Solde Final";
  }

  return {
    unit: tx.unit,
    client,
    startDate,
    endDate,
    paymentType: "TRANCHE",
    trancheType: nextTranche,
    totalContract: totalContract,
    defaultAmount: resteAmt || "",
  };
}

/**
 * Helper to format currency in FCFA
 */
export function formatCurrency(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString("fr-FR");
  if (amount < 0) {
    return `- ${formatted} F`;
  }
  return `${formatted} F`;
}
