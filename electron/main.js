const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const { registerHandlers } = require("./db-handlers");

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 860,
    minWidth: 1024,
    minHeight: 680,
    title: "Résidence St Raphaël — Gestion",
    icon: path.join(__dirname, "../public/logo.ico"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Preload expose window.electronAPI à React
      preload: app.isPackaged
        ? path.join(process.resourcesPath, "app.asar.unpacked", "electron", "preload.js")
        : path.join(__dirname, "preload.js"),
    },
    show: false,
    backgroundColor: "#f1f5f9",
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.maximize();
  });

  // Charger les fichiers statiques générés par Next.js
  const indexPath = app.isPackaged
    ? path.join(process.resourcesPath, "app.asar.unpacked", "out", "index.html")
    : path.join(__dirname, "..", "out", "index.html");

  mainWindow.loadFile(indexPath);

  mainWindow.on("closed", () => { mainWindow = null; });
}

app.whenReady().then(() => {
  // Enregistrer tous les handlers IPC SQLite
  registerHandlers();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});
