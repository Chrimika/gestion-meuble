// Serveur autonome — lancé par Electron comme processus enfant
// Ce fichier tourne avec le Node.js d'Electron

const path = require("path");
const fs = require("fs");
const http = require("http");

const PORT = process.env.PORT || 3421;

// Configurer le répertoire de données
const DATA_DIR = process.env.APP_DATA_DIR;
if (DATA_DIR && !fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function startServer() {
  // Trouver le répertoire de l'app
  // En mode packagé : resources/app.asar.unpacked
  // En mode dev : répertoire racine
  let appDir;
  
  if (process.env.ELECTRON_IS_PACKAGED === "1") {
    // Chercher dans app.asar.unpacked d'abord
    const unpackedDir = path.join(path.dirname(process.execPath), "resources", "app.asar.unpacked");
    const asarDir = path.join(path.dirname(process.execPath), "resources", "app");
    
    if (fs.existsSync(unpackedDir)) {
      appDir = unpackedDir;
    } else if (fs.existsSync(asarDir)) {
      appDir = asarDir;
    } else {
      appDir = path.dirname(process.execPath);
    }
  } else {
    appDir = path.join(__dirname, "..");
  }

  process.chdir(appDir);

  try {
    const next = require(path.join(appDir, "node_modules", "next"));
    const app = next({ dev: false, dir: appDir });
    const handle = app.getRequestHandler();

    await app.prepare();

    http.createServer((req, res) => {
      handle(req, res);
    }).listen(PORT, "127.0.0.1", () => {
      // Signal à Electron que le serveur est prêt
      process.stdout.write(`READY:${PORT}\n`);
    });

  } catch (err) {
    process.stderr.write(`SERVER_ERROR:${err.message}\n`);
    process.exit(1);
  }
}

startServer();
