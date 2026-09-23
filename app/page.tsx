"use client";

import React, { useState, useEffect } from "react";
import { Transaction, CategoryItem, InstallmentPreFill } from "@/types/finance";
import { getSummaryKPI, exportToCSV, parseInstallmentFromTx } from "@/lib/storage";
import { Navbar } from "@/components/Navbar";
import { Sidebar, ActiveTab } from "@/components/Sidebar";
import { DashboardOverview } from "@/components/DashboardOverview";
import { LedgerTable } from "@/components/LedgerTable";
import { UnitManagement } from "@/components/UnitManagement";
import { AnalyticsView } from "@/components/AnalyticsView";
import { TransactionModal } from "@/components/TransactionModal";
import { CategoryManagementModal } from "@/components/CategoryManagementModal";
import { TransactionDetailModal } from "@/components/TransactionDetailModal";
import { PrintReceiptModal } from "@/components/PrintReceiptModal";
import { BulkPrintModal } from "@/components/BulkPrintModal";

// ── Détection du contexte Electron
declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      getTransactions: () => Promise<Transaction[]>;
      saveTransaction: (tx: any) => Promise<Transaction[]>;
      deleteTransaction: (id: string) => Promise<Transaction[]>;
      resetTransactions: () => Promise<Transaction[]>;
      getCategories: () => Promise<CategoryItem[]>;
      addCategory: (name: string) => Promise<CategoryItem[]>;
      deleteCategory: (id: string) => Promise<CategoryItem[]>;
    };
  }
}

const isElectron = () =>
  typeof window !== "undefined" && Boolean(window.electronAPI?.isElectron);

// ── Couche d'abstraction : IPC Electron OU fetch HTTP selon le contexte
const api = {
  async getTransactions(): Promise<Transaction[]> {
    if (isElectron()) return window.electronAPI!.getTransactions();
    const res = await fetch("/api/transactions");
    return res.json();
  },
  async saveTransaction(tx: any): Promise<Transaction[]> {
    if (isElectron()) return window.electronAPI!.saveTransaction(tx);
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tx),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
    return res.json();
  },
  async deleteTransaction(id: string): Promise<Transaction[]> {
    if (isElectron()) return window.electronAPI!.deleteTransaction(id);
    const res = await fetch(`/api/transactions?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    return res.json();
  },
  async resetTransactions(): Promise<Transaction[]> {
    if (isElectron()) return window.electronAPI!.resetTransactions();
    const res = await fetch("/api/transactions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    return res.json();
  },
  async getCategories(): Promise<CategoryItem[]> {
    if (isElectron()) return window.electronAPI!.getCategories();
    const res = await fetch("/api/categories");
    return res.json();
  },
  async addCategory(name: string): Promise<CategoryItem[]> {
    if (isElectron()) return window.electronAPI!.addCategory(name);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
    return res.json();
  },
  async deleteCategory(id: string): Promise<CategoryItem[]> {
    if (isElectron()) return window.electronAPI!.deleteCategory(id);
    const res = await fetch(`/api/categories?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
    return res.json();
  },
};

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("ledger");
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [bookingUnit, setBookingUnit] = useState<any>(undefined);
  const [installmentPreFill, setInstallmentPreFill] = useState<InstallmentPreFill | null>(null);

  const [detailTransaction, setDetailTransaction] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [printTransaction, setPrintTransaction] = useState<Transaction | null>(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);

  // ── Chargement initial
  useEffect(() => {
    async function loadData() {
      try {
        const timeout = new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error("Le chargement a dépassé 15 secondes.")), 15000);
        });
        const [txs, cats] = await Promise.race([
          Promise.all([api.getTransactions(), api.getCategories()]),
          timeout,
        ]);
        setTransactions(txs);
        setCategories(cats);
        setLoadError(null);
      } catch (err) {
        console.error("Erreur chargement:", err);
        setLoadError(err instanceof Error ? err.message : "Impossible de charger les données de la caisse.");
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();

    const saved = localStorage.getItem("immo_theme") as "light" | "dark" | null;
    if (saved) setTheme(saved);
  }, [loadAttempt]);

  // ── Thème
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#0b0f19";
      document.body.style.color = "#f1f5f9";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = "#f1f5f9";
      document.body.style.color = "#0f172a";
    }
    localStorage.setItem("immo_theme", theme);
  }, [theme]);

  const kpi = getSummaryKPI(transactions);

  // ── Handlers
  const handleSaveTransaction = async (txData: Partial<Transaction>) => {
    try {
      const updated = await api.saveTransaction(txData);
      setTransactions(updated);
    } catch (err: any) {
      alert(`Erreur : ${err.message || "Impossible d'enregistrer l'opération"}`);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Supprimer cette ligne du journal de caisse ?")) return;
    try {
      setTransactions(await api.deleteTransaction(id));
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const handleResetData = async () => {
    if (!confirm("Réinitialiser la base de données avec les données d'origine ?")) return;
    try {
      setTransactions(await api.resetTransactions());
    } catch (err) {
      console.error("Erreur réinitialisation:", err);
    }
  };

  const handleAddCategory = async (name: string) => {
    const updated = await api.addCategory(name);
    // addCategory retourne la liste complète en Electron, ou l'item seul en HTTP
    if (Array.isArray(updated)) {
      setCategories(updated as CategoryItem[]);
    } else {
      setCategories(await api.getCategories());
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const updated = await api.deleteCategory(id);
    if (Array.isArray(updated)) {
      setCategories(updated as CategoryItem[]);
    } else {
      setCategories(await api.getCategories());
    }
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(transactions);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `journal_caisse_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => setIsBulkPrintOpen(true);

  const handleCompleteInstallment = (tx: Transaction) => {
    setEditingTransaction(null);
    setBookingUnit(undefined);
    setInstallmentPreFill(parseInstallmentFromTx(tx));
    setIsModalOpen(true);
  };

  const openNewTransaction = () => {
    setEditingTransaction(null);
    setBookingUnit(undefined);
    setInstallmentPreFill(null);
    setIsModalOpen(true);
  };

  const openEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setBookingUnit(undefined);
    setInstallmentPreFill(null);
    setIsDetailOpen(false);
    setIsModalOpen(true);
  };

  const openViewDetail = (tx: Transaction) => {
    setDetailTransaction(tx);
    setIsDetailOpen(true);
  };

  const openPrintReceipt = (tx: Transaction) => {
    setPrintTransaction(tx);
    setIsDetailOpen(false);
    setIsPrintOpen(true);
  };

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: "#f1f5f9" }}>
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Chargement du journal de caisse…</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="h-full flex items-center justify-center p-6" style={{ backgroundColor: "#f1f5f9" }}>
        <div className="max-w-md rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-base font-semibold text-red-700">Chargement impossible</h1>
          <p className="mt-2 text-sm text-slate-600">{loadError}</p>
          <p className="mt-2 text-xs text-slate-500">Vérifiez que la base SQLite et le module Electron sont correctement installés.</p>
          <button
            type="button"
            onClick={() => {
              setIsLoaded(false);
              setLoadAttempt((attempt) => attempt + 1);
            }}
            className="mt-5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <div
      className="h-full flex flex-col"
      style={{
        backgroundColor: isDark ? "#0b0f19" : "#f1f5f9",
        color: isDark ? "#f1f5f9" : "#0f172a",
      }}
    >
      <Navbar
        soldeActuel={kpi.soldeActuel}
        totalRecettes={kpi.totalRecettes}
        totalDepenses={kpi.totalDepenses}
        theme={theme}
        onToggleTheme={() => setTheme(p => p === "dark" ? "light" : "dark")}
        onOpenNewTransaction={openNewTransaction}
        onExportCSV={handleExportCSV}
        onResetData={handleResetData}
        onPrint={handlePrint}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          totalTransactionsCount={transactions.length}
          theme={theme}
          onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
        />

        <main className="flex-1 overflow-hidden flex flex-col">
          {activeTab === "ledger" && (
            <LedgerTable
              transactions={transactions}
              categories={categories}
              theme={theme}
              onOpenNewTransaction={openNewTransaction}
              onEditTransaction={openEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onCompleteInstallment={handleCompleteInstallment}
              onViewDetail={openViewDetail}
              onPrintReceipt={openPrintReceipt}
            />
          )}
          {activeTab === "dashboard" && (
            <div className="flex-1 overflow-y-auto p-5">
              <DashboardOverview
                transactions={transactions}
                theme={theme}
                onNavigateToLedger={() => setActiveTab("ledger")}
                onOpenNewTransaction={openNewTransaction}
              />
            </div>
          )}
          {activeTab === "units" && (
            <div className="flex-1 overflow-y-auto p-5">
              <UnitManagement
                transactions={transactions}
                theme={theme}
                onOpenBookingForUnit={(unit) => {
                  setEditingTransaction(null);
                  setBookingUnit(unit);
                  setInstallmentPreFill(null);
                  setIsModalOpen(true);
                }}
                onViewDetail={openViewDetail}
                onPrintReceipt={openPrintReceipt}
                onEditTx={openEditTransaction}
                onDeleteTx={handleDeleteTransaction}
                onCompleteInstallment={handleCompleteInstallment}
              />
            </div>
          )}
          {activeTab === "analytics" && (
            <div className="flex-1 overflow-y-auto p-5">
              <AnalyticsView
                transactions={transactions}
                theme={theme}
                categories={categories}
              />
            </div>
          )}
        </main>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        installmentPreFill={installmentPreFill}
        theme={theme}
        categories={categories}
        onOpenCategoryManager={() => { setIsModalOpen(false); setIsCategoryModalOpen(true); }}
        defaultUnit={bookingUnit}
      />
      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        theme={theme}
      />
      <TransactionDetailModal
        transaction={detailTransaction}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={openEditTransaction}
        onDelete={handleDeleteTransaction}
        onCompleteInstallment={handleCompleteInstallment}
        onPrintReceipt={openPrintReceipt}
        theme={theme}
      />
      <PrintReceiptModal
        transaction={printTransaction}
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        theme={theme}
      />
      <BulkPrintModal
        transactions={transactions}
        isOpen={isBulkPrintOpen}
        onClose={() => setIsBulkPrintOpen(false)}
        theme={theme}
      />
    </div>
  );
}
