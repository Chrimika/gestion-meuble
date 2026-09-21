const { contextBridge, ipcRenderer } = require("electron");

// Expose une API sécurisée au renderer (React)
// Remplace tous les fetch("/api/...") de l'app
contextBridge.exposeInMainWorld("electronAPI", {

  // ── Transactions
  getTransactions: () => ipcRenderer.invoke("db:getTransactions"),
  saveTransaction: (txData) => ipcRenderer.invoke("db:saveTransaction", txData),
  deleteTransaction: (id) => ipcRenderer.invoke("db:deleteTransaction", id),
  resetTransactions: () => ipcRenderer.invoke("db:resetTransactions"),

  // ── Catégories
  getCategories: () => ipcRenderer.invoke("db:getCategories"),
  addCategory: (name) => ipcRenderer.invoke("db:addCategory", name),
  deleteCategory: (id) => ipcRenderer.invoke("db:deleteCategory", id),

  // ── Utilitaires
  isElectron: true,
});
