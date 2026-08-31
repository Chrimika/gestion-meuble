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

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("ledger");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [bookingUnit, setBookingUnit] = useState<any>(undefined);
  const [installmentPreFill, setInstallmentPreFill] = useState<InstallmentPreFill | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const handleCompleteInstallment = (tx: Transaction) => {
    const prefill = parseInstallmentFromTx(tx);
    setEditingTransaction(null);
    setBookingUnit(undefined);
    setInstallmentPreFill(prefill);
    setIsModalOpen(true);
  };

  // Load data from SQLite API on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [txRes, catRes] = await Promise.all([
          fetch("/api/transactions"),
          fetch("/api/categories"),
        ]);
        if (txRes.ok) {
          const txData = await txRes.json();
          setTransactions(txData);
        }
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données SQLite:", error);
      } finally {
        setIsLoaded(true);
      }
    }

    loadData();

    // Restore saved theme preference
    const savedTheme = localStorage.getItem("immo_theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Apply theme to html element
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#0b0f19";
      document.body.style.color = "#f1f5f9";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = "#f8fafc";
      document.body.style.color = "#0f172a";
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("immo_theme", theme);
    }
  }, [theme]);

  const kpi = getSummaryKPI(transactions);

  // Save transaction to SQLite DB
  const handleSaveTransaction = async (txData: Partial<Transaction>) => {
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(txData),
      });
      if (res.ok) {
        const updated = await res.json();
        setTransactions(updated);
      } else {
        const err = await res.json();
        alert(`Erreur : ${err.error || "Impossible d'enregistrer l'opération"}`);
      }
    } catch (error: any) {
      console.error("Erreur d'enregistrement:", error);
      alert("Erreur de communication avec la base de données locale.");
    }
  };

  // Delete transaction from SQLite DB
  const handleDeleteTransaction = async (id: string) => {
    if (confirm("Supprimer cette ligne du journal de caisse ?")) {
      try {
        const res = await fetch(`/api/transactions?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        if (res.ok) {
          const updated = await res.json();
          setTransactions(updated);
        }
      } catch (error) {
        console.error("Erreur de suppression:", error);
      }
    }
  };

  // Reset database back to initial data
  const handleResetData = async () => {
    if (confirm("Réinitialiser la base de données avec les données originales ?")) {
      try {
        const res = await fetch("/api/transactions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reset" }),
        });
        if (res.ok) {
          const resetData = await res.json();
          setTransactions(resetData);
        }
      } catch (error) {
        console.error("Erreur de réinitialisation:", error);
      }
    }
  };

  // Add Custom Category
  const handleAddCategory = async (name: string) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const catRes = await fetch("/api/categories");
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
    } else {
      const err = await res.json();
      throw new Error(err.error || "Impossible d'ajouter la catégorie.");
    }
  };

  // Delete Custom Category
  const handleDeleteCategory = async (id: string) => {
    const res = await fetch(`/api/categories?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      const catData = await res.json();
      setCategories(catData);
    } else {
      const err = await res.json();
      throw new Error(err.error || "Impossible de supprimer la catégorie.");
    }
  };

  const handleExportCSV = () => {
    const csvContent = exportToCSV(transactions);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `journal_de_caisse_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  if (!isLoaded) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#f8fafc" }}
      >
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Chargement du journal de caisse SQLite...</span>
        </div>
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <div
      className="min-h-screen flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 transition-colors"
      style={{
        backgroundColor: isDark ? "#0b0f19" : "#f8fafc",
        color: isDark ? "#f1f5f9" : "#0f172a",
      }}
    >
      {/* Top Navbar */}
      <Navbar
        soldeActuel={kpi.soldeActuel}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenNewTransaction={() => {
          setEditingTransaction(null);
          setIsModalOpen(true);
        }}
        onExportCSV={handleExportCSV}
        onResetData={handleResetData}
        onPrint={handlePrint}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          totalTransactionsCount={transactions.length}
          theme={theme}
          onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === "ledger" && (
            <LedgerTable
              transactions={transactions}
              categories={categories}
              theme={theme}
              onOpenNewTransaction={() => {
                setEditingTransaction(null);
                setBookingUnit(undefined);
                setInstallmentPreFill(null);
                setIsModalOpen(true);
              }}
              onEditTransaction={(tx) => {
                setEditingTransaction(tx);
                setBookingUnit(undefined);
                setInstallmentPreFill(null);
                setIsModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              onCompleteInstallment={handleCompleteInstallment}
            />
          )}

          {activeTab === "dashboard" && (
            <DashboardOverview
              transactions={transactions}
              theme={theme}
              onNavigateToLedger={() => setActiveTab("ledger")}
              onOpenNewTransaction={() => {
                setEditingTransaction(null);
                setBookingUnit(undefined);
                setInstallmentPreFill(null);
                setIsModalOpen(true);
              }}
            />
          )}

          {activeTab === "units" && (
            <UnitManagement
              transactions={transactions}
              theme={theme}
              onOpenBookingForUnit={(unit) => {
                setEditingTransaction(null);
                setBookingUnit(unit);
                setInstallmentPreFill(null);
                setIsModalOpen(true);
              }}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsView transactions={transactions} categories={categories} theme={theme} />
          )}
        </main>
      </div>

      {/* New / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        installmentPreFill={installmentPreFill}
        defaultUnit={bookingUnit}
        theme={theme}
        categories={categories}
        onOpenCategoryManager={() => {
          setIsModalOpen(false);
          setIsCategoryModalOpen(true);
        }}
      />

      {/* Custom Category Management Modal */}
      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        theme={theme}
      />
    </div>
  );
}
