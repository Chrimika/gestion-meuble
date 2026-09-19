const { app, BrowserWindow, shell, dialog } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const PORT = 3421;
let mainWindow = null;
let serverProcess = null;

// ── Données persistantes dans AppData
const DATA_DIR = path.join(app.getPath("userData"), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

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

  mainWindow.loadURL(`http://127.0.0.1:${PORT}`);
  mainWindow.on("closed", () => { mainWindow = null; });
}

function startServer() {
  return new Promise((resolve, reject) => {
    const isDev = !app.isPackaged;

    // Chemin vers le script serveur
    const serverScript = isDev
      ? path.join(__dirname, "server.js")
      : path.join(process.resourcesPath, "app.asar.unpacked", "electron", "server.js");

    // Node.js d'Electron pour exécuter le serveur
    const nodePath = process.execPath;

    const env = {
      ...process.env,
      NODE_ENV: "production",
      PORT: String(PORT),
      APP_DATA_DIR: DATA_DIR,
      ELECTRON_IS_PACKAGED: app.isPackaged ? "1" : "0",
    };

    serverProcess = spawn(nodePath, [serverScript], {
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        reject(new Error("Timeout: serveur non démarré en 90 secondes"));
      }
    }, 90000);

    serverProcess.stdout.on("data", (data) => {
      const msg = data.toString();
      console.log("[Server]", msg.trim());

      // Attendre le signal READY
      if (msg.includes("READY:") && !resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve();
      }
    });

    serverProcess.stderr.on("data", (data) => {
      const msg = data.toString();
      console.error("[Server ERR]", msg.trim());

      if (msg.includes("SERVER_ERROR:") && !resolved) {
        resolved = true;
        clearTimeout(timeout);
        reject(new Error(msg));
      }
    });

    serverProcess.on("error", (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        reject(err);
      }
    });

    serverProcess.on("exit", (code) => {
      console.log("[Server] Exited with code:", code);
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        reject(new Error(`Serveur terminé avec code ${code}`));
      }
    });
  });
}

app.whenReady().then(async () => {
  try {
    await startServer();
    createWindow();
  } catch (err) {
    console.error("Erreur démarrage:", err.message);
    dialog.showErrorBox(
      "Erreur de démarrage",
      `Impossible de démarrer l'application:\n\n${err.message}\n\nVeuillez contacter le support.`
    );
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (serverProcess) { serverProcess.kill(); serverProcess = null; }
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});

app.on("before-quit", () => {
  if (serverProcess) { serverProcess.kill(); serverProcess = null; }
});
