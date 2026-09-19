const { app, BrowserWindow, shell, dialog } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const http = require("http");

const PORT = 3421;
let mainWindow = null;
let nextServer = null;

// ── Données persistantes dans AppData (survit aux mises à jour)
const DATA_DIR = path.join(app.getPath("userData"), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

process.env.APP_DATA_DIR = DATA_DIR;
process.env.PORT = String(PORT);
process.env.NODE_ENV = "production";

// ── Attendre que le serveur réponde
function waitForServer(url, retries = 60, delay = 1000) {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      http.get(url, (res) => {
        if (res.statusCode < 500) resolve();
        else setTimeout(() => attempt(n - 1), delay);
      }).on("error", () => {
        if (n <= 0) reject(new Error("Serveur Next.js non disponible après 60 secondes"));
        else setTimeout(() => attempt(n - 1), delay);
      });
    };
    attempt(retries);
  });
}

// ── Créer la fenêtre principale
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 860,
    minWidth: 1024,
    minHeight: 680,
    title: "Résidence St Raphaël — Gestion",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.maximize();
  });

  mainWindow.loadURL(`http://localhost:${PORT}`);

  mainWindow.on("closed", () => { mainWindow = null; });
}

// ── Lancer le serveur Next.js avec le Node.js d'Electron
function startNextServer() {
  // Chemin vers l'app — dans asar.unpacked pour les modules natifs
  const appPath = app.isPackaged
    ? path.join(process.resourcesPath, "app.asar.unpacked")
    : path.join(__dirname, "..");

  // Chemin vers le script next/dist/bin/next (fonctionne dans asar)
  const nextScript = app.isPackaged
    ? path.join(process.resourcesPath, "app.asar", "node_modules", "next", "dist", "bin", "next")
    : path.join(__dirname, "..", "node_modules", "next", "dist", "bin", "next");

  // Utiliser le node embarqué d'Electron
  const nodeBin = process.execPath;

  nextServer = spawn(
    nodeBin,
    [nextScript, "start", "--port", String(PORT)],
    {
      cwd: app.isPackaged
        ? path.join(process.resourcesPath, "app.asar.unpacked")
        : path.join(__dirname, ".."),
      env: {
        ...process.env,
        NODE_ENV: "production",
        PORT: String(PORT),
        APP_DATA_DIR: DATA_DIR,
      },
      stdio: "pipe",
    }
  );

  nextServer.stdout.on("data", (d) => console.log("[Next]", d.toString().trim()));
  nextServer.stderr.on("data", (d) => console.error("[Next ERR]", d.toString().trim()));

  nextServer.on("error", (err) => {
    console.error("Erreur démarrage Next.js:", err);
    dialog.showErrorBox(
      "Erreur de démarrage",
      `Impossible de démarrer le serveur:\n${err.message}`
    );
  });

  nextServer.on("exit", (code) => {
    console.log("[Next] Processus terminé avec code:", code);
  });
}

app.whenReady().then(async () => {
  startNextServer();

  try {
    await waitForServer(`http://localhost:${PORT}`);
    createWindow();
  } catch (err) {
    console.error("Timeout:", err.message);
    dialog.showErrorBox(
      "Timeout de démarrage",
      "Le serveur n'a pas démarré dans les 60 secondes.\nRelancez l'application."
    );
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (nextServer) { nextServer.kill(); nextServer = null; }
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});

app.on("before-quit", () => {
  if (nextServer) { nextServer.kill(); nextServer = null; }
});
