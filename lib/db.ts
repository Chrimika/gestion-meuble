import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { Transaction, CategoryItem } from "@/types/finance";
import { INITIAL_TRANSACTIONS } from "@/data/initialData";

const DEFAULT_CATEGORIES = [
  "Loyers & Réservations",
  "Entretien & Travaux",
  "Fournitures & Linge",
  "Salaires & Personnel",
  "Charges & Énergie",
  "Transport & Com",
  "Autres",
];

// Ensure data directory exists
// En mode Electron packagé, APP_DATA_DIR pointe vers %APPDATA%\ResidenceStRaphael\data
// En mode dev/web, on utilise le dossier local data/
const dataDir = process.env.APP_DATA_DIR || path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "immo_gestion.db");

// Singleton connection
let dbInstance: Database.Database | null = null;

function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(dbPath);
    dbInstance.pragma("journal_mode = WAL");
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: Database.Database) {
  // Categories Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      is_custom INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Transactions Table — includes new reservation fields
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      piece_no TEXT DEFAULT '-',
      libelle TEXT NOT NULL,
      unit TEXT NOT NULL,
      category TEXT NOT NULL,
      recettes REAL DEFAULT 0,
      depenses REAL DEFAULT 0,
      client_cni TEXT DEFAULT '',
      client_name TEXT DEFAULT '',
      res_start_date TEXT DEFAULT '',
      res_end_date TEXT DEFAULT '',
      res_nights INTEGER DEFAULT 0,
      res_total_contract REAL DEFAULT 0,
      res_tranche_type TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Add new columns to existing DB if they don't exist (migration)
  const cols = db.prepare("PRAGMA table_info(transactions)").all() as { name: string }[];
  const colNames = cols.map((c) => c.name);
  const newCols: [string, string][] = [
    ["client_cni", "TEXT DEFAULT ''"],
    ["client_name", "TEXT DEFAULT ''"],
    ["res_start_date", "TEXT DEFAULT ''"],
    ["res_end_date", "TEXT DEFAULT ''"],
    ["res_nights", "INTEGER DEFAULT 0"],
    ["res_total_contract", "REAL DEFAULT 0"],
    ["res_tranche_type", "TEXT DEFAULT ''"],
    ["res_services", "TEXT DEFAULT '[]'"],
  ];
  for (const [col, def] of newCols) {
    if (!colNames.includes(col)) {
      db.exec(`ALTER TABLE transactions ADD COLUMN ${col} ${def};`);
    }
  }

  // Seed default categories if empty
  const catCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
  if (catCount.count === 0) {
    const insertCat = db.prepare("INSERT INTO categories (id, name, is_custom) VALUES (?, ?, 0)");
    const insertMany = db.transaction((categories: string[]) => {
      for (const cat of categories) {
        insertCat.run(`cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, cat);
      }
    });
    insertMany(DEFAULT_CATEGORIES);
  }

  // Seed default transactions if empty
  const txCount = db.prepare("SELECT COUNT(*) as count FROM transactions").get() as { count: number };
  if (txCount.count === 0) {
    const insertTx = db.prepare(`
      INSERT INTO transactions (id, date, piece_no, libelle, unit, category, recettes, depenses)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertManyTx = db.transaction((transactions: typeof INITIAL_TRANSACTIONS) => {
      for (const tx of transactions) {
        insertTx.run(
          tx.id, tx.date, tx.pieceNo || "-", tx.libelle,
          tx.unit, tx.category, tx.recettes || 0, tx.depenses || 0
        );
      }
    });
    insertManyTx(INITIAL_TRANSACTIONS);
  }
}

// Recalculate running balance (solde)
export function calculateSoldes(transactions: Transaction[]): Transaction[] {
  let runningSolde = 0;
  return transactions.map((tx) => {
    const recettes = Number(tx.recettes) || 0;
    const depenses = Number(tx.depenses) || 0;
    runningSolde = runningSolde + recettes - depenses;
    return { ...tx, recettes, depenses, solde: runningSolde };
  });
}

// Map DB row to Transaction type
function rowToTransaction(r: any): Transaction {
  let resServices: import("@/types/finance").ReservationService[] = [];
  try { resServices = JSON.parse(r.res_services || "[]"); } catch {}
  return {
    id: r.id,
    date: r.date,
    pieceNo: r.pieceNo || r.piece_no || "-",
    libelle: r.libelle,
    unit: r.unit,
    category: r.category,
    recettes: Number(r.recettes) || 0,
    depenses: Number(r.depenses) || 0,
    clientCni: r.client_cni || "",
    clientName: r.client_name || "",
    resStartDate: r.res_start_date || "",
    resEndDate: r.res_end_date || "",
    resNights: Number(r.res_nights) || 0,
    resTotalContract: Number(r.res_total_contract) || 0,
    resTrancheType: r.res_tranche_type || "",
    resServices,
  };
}

// --- Categories CRUD ---

export function getCategoriesDB(): CategoryItem[] {
  const db = getDb();
  const rows = db.prepare(
    "SELECT id, name, is_custom, created_at FROM categories ORDER BY is_custom ASC, name ASC"
  ).all() as any[];
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    isCustom: Boolean(r.is_custom),
    createdAt: r.created_at,
  }));
}

export function addCategoryDB(name: string): CategoryItem {
  const db = getDb();
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error("Le nom de la catégorie ne peut pas être vide");

  const existing = db.prepare("SELECT * FROM categories WHERE LOWER(name) = LOWER(?)").get(trimmedName);
  if (existing) throw new Error("Une catégorie avec ce nom existe déjà.");

  const newId = `cat-custom-${Date.now()}`;
  db.prepare("INSERT INTO categories (id, name, is_custom) VALUES (?, ?, 1)").run(newId, trimmedName);
  return { id: newId, name: trimmedName, isCustom: true };
}

export function deleteCategoryDB(id: string): void {
  const db = getDb();
  const cat = db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as any;
  if (!cat) return;
  if (!cat.is_custom) throw new Error("Les catégories par défaut du système ne peuvent pas être supprimées.");

  const usage = db.prepare("SELECT COUNT(*) as count FROM transactions WHERE category = ?").get(cat.name) as { count: number };
  if (usage.count > 0) {
    throw new Error(`Impossible de supprimer cette catégorie car ${usage.count} opération(s) l'utilise(nt).`);
  }
  db.prepare("DELETE FROM categories WHERE id = ?").run(id);
}

// --- Transactions CRUD ---

export function getTransactionsDB(): Transaction[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, date, piece_no as pieceNo, libelle, unit, category,
           recettes, depenses, client_cni, client_name,
           res_start_date, res_end_date, res_nights, res_total_contract, res_tranche_type, res_services
    FROM transactions ORDER BY date ASC, created_at ASC
  `).all() as any[];
  return calculateSoldes(rows.map(rowToTransaction));
}

export function saveTransactionDB(txData: Partial<Transaction>): Transaction[] {
  const db = getDb();

  if (txData.id) {
    // Update existing
    db.prepare(`
      UPDATE transactions
      SET date = ?, piece_no = ?, libelle = ?, unit = ?, category = ?,
          recettes = ?, depenses = ?,
          client_cni = ?, client_name = ?,
          res_start_date = ?, res_end_date = ?, res_nights = ?,
          res_total_contract = ?, res_tranche_type = ?, res_services = ?
      WHERE id = ?
    `).run(
      txData.date,
      txData.pieceNo || "-",
      txData.libelle,
      txData.unit,
      txData.category,
      txData.recettes || 0,
      txData.depenses || 0,
      txData.clientCni || "",
      txData.clientName || "",
      txData.resStartDate || "",
      txData.resEndDate || "",
      txData.resNights || 0,
      txData.resTotalContract || 0,
      txData.resTrancheType || "",
      JSON.stringify(txData.resServices || []),
      txData.id
    );
  } else {
    // Create new
    const id = `tx-${Date.now()}`;
    db.prepare(`
      INSERT INTO transactions (id, date, piece_no, libelle, unit, category,
        recettes, depenses, client_cni, client_name,
        res_start_date, res_end_date, res_nights, res_total_contract, res_tranche_type, res_services)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      txData.date || new Date().toISOString().split("T")[0],
      txData.pieceNo || "-",
      txData.libelle || "",
      txData.unit || "Général / Communs",
      txData.category || "Autres",
      txData.recettes || 0,
      txData.depenses || 0,
      txData.clientCni || "",
      txData.clientName || "",
      txData.resStartDate || "",
      txData.resEndDate || "",
      txData.resNights || 0,
      txData.resTotalContract || 0,
      txData.resTrancheType || "",
      JSON.stringify(txData.resServices || [])
    );
  }

  return getTransactionsDB();
}

export function deleteTransactionDB(id: string): Transaction[] {
  const db = getDb();
  db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
  return getTransactionsDB();
}

export function resetTransactionsDB(): Transaction[] {
  const db = getDb();
  db.prepare("DELETE FROM transactions").run();

  const insertTx = db.prepare(`
    INSERT INTO transactions (id, date, piece_no, libelle, unit, category, recettes, depenses)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertManyTx = db.transaction((transactions: typeof INITIAL_TRANSACTIONS) => {
    for (const tx of transactions) {
      insertTx.run(
        tx.id, tx.date, tx.pieceNo || "-", tx.libelle,
        tx.unit, tx.category, tx.recettes || 0, tx.depenses || 0
      );
    }
  });

  insertManyTx(INITIAL_TRANSACTIONS);
  return getTransactionsDB();
}
