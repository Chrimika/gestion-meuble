const { app, BrowserWindow, shell } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const http = require("http");

const PORT = 3421; // Port fixe pour éviter les conflits
let mainWindow = null;
let nextServer = null;

// ── Chemin des données persistantes (survit aux mises à jour)
// Windows : C:\Users\<user>\AppData\Roaming\ResidenceStRaphael
// Mac     : ~/Library/Application Support/ResidenceStRaphael
const DATA_DIR = path.join(app.getPath("userData"), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Exposer le chemin de données à Next.js via variable d'environnement
process.env.APP_DATA_DIR = DATA_DIR;
process.env.PORT = String(PORT);

function waitForServer(url, retries = 30, delay = 1000) {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      http
        .get(url, (res) => {
          if (res.statusCode < 500) resolve();
          else setTimeout(() => attempt(n - 1), delay);
        })
        .on("error", () => {
          if (n <= 0) reject(new Error("Serveur non disponible"));
          else setTimeout(() => attempt(n - 1), delay);
        });
    };
    attempt(retries);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 860,
    minWidth: 1024,
    minHeight: 680,
    title: "Résidence St Raphaël — Gestion",
    icon: path.join(__dirname, "../public/logo.jpeg"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false, // Attendre que la page soit chargée
  });

  // Ouvrir les liens externes dans le navigateur système
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.maximize();
  });

  mainWindow.loadURL(`http://localhost:${PORT}`);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function startNextServer() {
  // En production (app packagée), le build Next.js est dans app.asar
  const appPath = app.isPackaged
    ? path.join(process.resourcesPath, "app")
    : path.join(__dirname, "..");

  const nextBin = path.join(appPath, "node_modules", ".bin", "next");
  const nextBinCmd = process.platform === "win32" ? nextBin + ".cmd" : nextBin;

  nextServer = spawn(nextBinCmd, ["start", "--port", String(PORT)], {
    cwd: appPath,
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: String(PORT),
      APP_DATA_DIR: DATA_DIR,
    },
    stdio: "pipe",
  });

  nextServer.stdout.on("data", (d) => console.log("[Next]", d.toString()));
  nextServer.stderr.on("data", (d) => console.error("[Next ERR]", d.toString()));

  nextServer.on("error", (err) => {
    console.error("Impossible de démarrer Next.js :", err);
  });
}

app.whenReady().then(async () => {
  startNextServer();

  try {
    await waitForServer(`http://localhost:${PORT}`);
    createWindow();
  } catch (err) {
    console.error("Timeout serveur :", err);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (nextServer) nextServer.kill();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});

app.on("before-quit", () => {
  if (nextServer) nextServer.kill();
});
