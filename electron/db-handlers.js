const { ipcMain, app } = require("electron");
const path = require("path");
const fs = require("fs");

// ── Charger better-sqlite3 depuis app.asar.unpacked
function loadDatabase() {
  const dataDir = path.join(app.getPath("userData"), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const dbPath = path.join(dataDir, "immo_gestion.db");

  // En mode packagé, better-sqlite3 est dans app.asar.unpacked
  let Database;
  try {
    if (app.isPackaged) {
      const nativeModulePath = path.join(
        process.resourcesPath,
        "app.asar.unpacked",
        "node_modules",
        "better-sqlite3"
      );
      Database = require(nativeModulePath);
    } else {
      Database = require("better-sqlite3");
    }
  } catch (e) {
    console.error("Erreur chargement better-sqlite3:", e);
    throw e;
  }

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  initSchema(db);
  return db;
}

// ── Initialisation du schéma
function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      is_custom INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
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
      res_services TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Migration colonnes manquantes
  const cols = db.prepare("PRAGMA table_info(transactions)").all().map(c => c.name);
  const newCols = [
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
    if (!cols.includes(col)) db.exec(`ALTER TABLE transactions ADD COLUMN ${col} ${def};`);
  }

  // Seed catégories
  const catCount = db.prepare("SELECT COUNT(*) as c FROM categories").get().c;
  if (catCount === 0) {
    const defaults = ["Loyers & Réservations","Entretien & Travaux","Fournitures & Linge",
                      "Salaires & Personnel","Charges & Énergie","Transport & Com","Autres"];
    const ins = db.prepare("INSERT INTO categories (id, name, is_custom) VALUES (?, ?, 0)");
    const tx = db.transaction(() => defaults.forEach((n, i) => ins.run(`cat-default-${i}`, n)));
    tx();
  }

  // Seed transactions initiales si vide
  const txCount = db.prepare("SELECT COUNT(*) as c FROM transactions").get().c;
  if (txCount === 0) {
    try {
      // Charger les données initiales depuis le fichier JS compilé
      const initPath = app.isPackaged
        ? path.join(process.resourcesPath, "app.asar.unpacked", "data", "initialData.js")
        : path.join(__dirname, "..", "data", "initialData.js");

      if (fs.existsSync(initPath)) {
        const { INITIAL_TRANSACTIONS } = require(initPath);
        const ins = db.prepare(`INSERT INTO transactions (id,date,piece_no,libelle,unit,category,recettes,depenses)
                                VALUES (?,?,?,?,?,?,?,?)`);
        const insertAll = db.transaction(() => {
          for (const t of INITIAL_TRANSACTIONS) {
            ins.run(t.id, t.date, t.pieceNo||"-", t.libelle, t.unit, t.category, t.recettes||0, t.depenses||0);
          }
        });
        insertAll();
      }
    } catch(e) {
      console.warn("Seed données initiales ignoré:", e.message);
    }
  }
}

// ── Calcul du solde courant
function calculateSoldes(rows) {
  let solde = 0;
  return rows.map(r => {
    solde += (r.recettes || 0) - (r.depenses || 0);
    return { ...r, solde };
  });
}

// ── Mapper une ligne DB vers Transaction
function rowToTx(r) {
  let resServices = [];
  try { resServices = JSON.parse(r.res_services || "[]"); } catch {}
  return {
    id: r.id, date: r.date, pieceNo: r.piece_no || "-",
    libelle: r.libelle, unit: r.unit, category: r.category,
    recettes: Number(r.recettes) || 0, depenses: Number(r.depenses) || 0,
    clientCni: r.client_cni || "", clientName: r.client_name || "",
    resStartDate: r.res_start_date || "", resEndDate: r.res_end_date || "",
    resNights: Number(r.res_nights) || 0,
    resTotalContract: Number(r.res_total_contract) || 0,
    resTrancheType: r.res_tranche_type || "",
    resServices,
  };
}

// ── Enregistrement des handlers IPC
let db = null;

function getDb() {
  if (!db) db = loadDatabase();
  return db;
}

function registerHandlers() {

  // GET transactions
  ipcMain.handle("db:getTransactions", () => {
    const rows = getDb().prepare(
      `SELECT id,date,piece_no,libelle,unit,category,recettes,depenses,
              client_cni,client_name,res_start_date,res_end_date,
              res_nights,res_total_contract,res_tranche_type,res_services
       FROM transactions ORDER BY date ASC, created_at ASC`
    ).all();
    return calculateSoldes(rows.map(rowToTx));
  });

  // SAVE transaction (create ou update)
  ipcMain.handle("db:saveTransaction", (_, txData) => {
    const d = getDb();
    const svc = JSON.stringify(txData.resServices || []);
    if (txData.id) {
      d.prepare(`UPDATE transactions SET date=?,piece_no=?,libelle=?,unit=?,category=?,
                 recettes=?,depenses=?,client_cni=?,client_name=?,res_start_date=?,
                 res_end_date=?,res_nights=?,res_total_contract=?,res_tranche_type=?,
                 res_services=? WHERE id=?`)
       .run(txData.date, txData.pieceNo||"-", txData.libelle, txData.unit, txData.category,
            txData.recettes||0, txData.depenses||0, txData.clientCni||"", txData.clientName||"",
            txData.resStartDate||"", txData.resEndDate||"", txData.resNights||0,
            txData.resTotalContract||0, txData.resTrancheType||"", svc, txData.id);
    } else {
      const id = `tx-${Date.now()}`;
      d.prepare(`INSERT INTO transactions (id,date,piece_no,libelle,unit,category,recettes,depenses,
                 client_cni,client_name,res_start_date,res_end_date,res_nights,res_total_contract,
                 res_tranche_type,res_services) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
       .run(id, txData.date||new Date().toISOString().split("T")[0], txData.pieceNo||"-",
            txData.libelle||"", txData.unit||"Général / Communs", txData.category||"Autres",
            txData.recettes||0, txData.depenses||0, txData.clientCni||"", txData.clientName||"",
            txData.resStartDate||"", txData.resEndDate||"", txData.resNights||0,
            txData.resTotalContract||0, txData.resTrancheType||"", svc);
    }
    // Retourner toutes les transactions à jour
    const rows = d.prepare(
      `SELECT id,date,piece_no,libelle,unit,category,recettes,depenses,
              client_cni,client_name,res_start_date,res_end_date,
              res_nights,res_total_contract,res_tranche_type,res_services
       FROM transactions ORDER BY date ASC, created_at ASC`
    ).all();
    return calculateSoldes(rows.map(rowToTx));
  });

  // DELETE transaction
  ipcMain.handle("db:deleteTransaction", (_, id) => {
    const d = getDb();
    d.prepare("DELETE FROM transactions WHERE id=?").run(id);
    const rows = d.prepare(
      `SELECT id,date,piece_no,libelle,unit,category,recettes,depenses,
              client_cni,client_name,res_start_date,res_end_date,
              res_nights,res_total_contract,res_tranche_type,res_services
       FROM transactions ORDER BY date ASC, created_at ASC`
    ).all();
    return calculateSoldes(rows.map(rowToTx));
  });

  // RESET transactions
  ipcMain.handle("db:resetTransactions", () => {
    const d = getDb();
    d.prepare("DELETE FROM transactions").run();
    try {
      const initPath = app.isPackaged
        ? path.join(process.resourcesPath, "app.asar.unpacked", "data", "initialData.js")
        : path.join(__dirname, "..", "data", "initialData.js");
      if (fs.existsSync(initPath)) {
        const { INITIAL_TRANSACTIONS } = require(initPath);
        const ins = d.prepare(`INSERT INTO transactions (id,date,piece_no,libelle,unit,category,recettes,depenses)
                               VALUES (?,?,?,?,?,?,?,?)`);
        const insertAll = d.transaction(() => {
          for (const t of INITIAL_TRANSACTIONS) {
            ins.run(t.id, t.date, t.pieceNo||"-", t.libelle, t.unit, t.category, t.recettes||0, t.depenses||0);
          }
        });
        insertAll();
      }
    } catch(e) { console.warn("Reset seed ignoré:", e.message); }
    const rows = d.prepare(
      `SELECT id,date,piece_no,libelle,unit,category,recettes,depenses,
              client_cni,client_name,res_start_date,res_end_date,
              res_nights,res_total_contract,res_tranche_type,res_services
       FROM transactions ORDER BY date ASC, created_at ASC`
    ).all();
    return calculateSoldes(rows.map(rowToTx));
  });

  // GET catégories
  ipcMain.handle("db:getCategories", () => {
    const rows = getDb().prepare(
      "SELECT id,name,is_custom,created_at FROM categories ORDER BY is_custom ASC, name ASC"
    ).all();
    return rows.map(r => ({ id: r.id, name: r.name, isCustom: Boolean(r.is_custom), createdAt: r.created_at }));
  });

  // ADD catégorie
  ipcMain.handle("db:addCategory", (_, name) => {
    const d = getDb();
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Nom vide");
    const exists = d.prepare("SELECT id FROM categories WHERE LOWER(name)=LOWER(?)").get(trimmed);
    if (exists) throw new Error("Catégorie déjà existante");
    const id = `cat-custom-${Date.now()}`;
    d.prepare("INSERT INTO categories (id,name,is_custom) VALUES (?,?,1)").run(id, trimmed);
    return d.prepare("SELECT id,name,is_custom,created_at FROM categories ORDER BY is_custom ASC, name ASC").all()
             .map(r => ({ id: r.id, name: r.name, isCustom: Boolean(r.is_custom), createdAt: r.created_at }));
  });

  // DELETE catégorie
  ipcMain.handle("db:deleteCategory", (_, id) => {
    const d = getDb();
    const cat = d.prepare("SELECT * FROM categories WHERE id=?").get(id);
    if (!cat) throw new Error("Catégorie introuvable");
    if (!cat.is_custom) throw new Error("Impossible de supprimer une catégorie système");
    const usage = d.prepare("SELECT COUNT(*) as c FROM transactions WHERE category=?").get(cat.name).c;
    if (usage > 0) throw new Error(`${usage} opération(s) utilisent cette catégorie`);
    d.prepare("DELETE FROM categories WHERE id=?").run(id);
    return d.prepare("SELECT id,name,is_custom,created_at FROM categories ORDER BY is_custom ASC, name ASC").all()
             .map(r => ({ id: r.id, name: r.name, isCustom: Boolean(r.is_custom), createdAt: r.created_at }));
  });
}

module.exports = { registerHandlers };
