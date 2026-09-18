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

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("ledger");
  const [isLoaded, setIsLoaded] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // ── Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [bookingUnit, setBookingUnit] = useState<any>(undefined);
  const [installmentPreFill, setInstallmentPreFill] = useState<InstallmentPreFill | null>(null);

  // ── Detail + print modal states
  const [detailTransaction, setDetailTransaction] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [printTransaction, setPrintTransaction] = useState<Transaction | null>(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);

  // ── Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [txRes, catRes] = await Promise.all([
          fetch("/api/transactions"),
          fetch("/api/categories"),
        ]);
        if (txRes.ok) setTransactions(await txRes.json());
        if (catRes.ok) setCategories(await catRes.json());
      } catch (err) {
        console.error("Erreur chargement SQLite:", err);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();

    const saved = localStorage.getItem("immo_theme") as "light" | "dark" | null;
    if (saved) setTheme(saved);
  }, []);

  // ── Apply theme
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

  // ── Handlers ──────────────────────────────────────

  const handleSaveTransaction = async (txData: Partial<Transaction>) => {
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(txData),
      });
      if (res.ok) {
        setTransactions(await res.json());
      } else {
        const err = await res.json();
        alert(`Erreur : ${err.error || "Impossible d'enregistrer l'opération"}`);
      }
    } catch (err: any) {
      console.error("Erreur enregistrement:", err);
      alert("Erreur de communication avec la base de données.");
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Supprimer cette ligne du journal de caisse ?")) return;
    try {
      const res = await fetch(`/api/transactions?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) setTransactions(await res.json());
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const handleResetData = async () => {
    if (!confirm("Réinitialiser la base de données avec les données d'origine ?")) return;
    try {
      const res = await fetch("/api/transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      if (res.ok) setTransactions(await res.json());
    } catch (err) {
      console.error("Erreur réinitialisation:", err);
    }
  };

  const handleAddCategory = async (name: string) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const catRes = await fetch("/api/categories");
      if (catRes.ok) setCategories(await catRes.json());
    } else {
      const err = await res.json();
      throw new Error(err.error || "Impossible d'ajouter la catégorie.");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const res = await fetch(`/api/categories?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) {
      setCategories(await res.json());
    } else {
      const err = await res.json();
      throw new Error(err.error || "Impossible de supprimer la catégorie.");
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
    const prefill = parseInstallmentFromTx(tx);
    setEditingTransaction(null);
    setBookingUnit(undefined);
    setInstallmentPreFill(prefill);
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
    setIsModalOpen(true);
    // close detail if open
    setIsDetailOpen(false);
  };

  const openViewDetail = (tx: Transaction) => {
    setDetailTransaction(tx);
    setIsDetailOpen(true);
  };

  const openPrintReceipt = (tx: Transaction) => {
    setPrintTransaction(tx);
    setIsPrintOpen(true);
    setIsDetailOpen(false);
  };

  // ── Loading screen
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

  const isDark = theme === "dark";

  return (
    <div
      className="h-full flex flex-col"
      style={{
        backgroundColor: isDark ? "#0b0f19" : "#f1f5f9",
        color: isDark ? "#f1f5f9" : "#0f172a",
      }}
    >
      {/* ── Top Navbar (fixed height 60px) ── */}
      <Navbar
        soldeActuel={kpi.soldeActuel}
        totalRecettes={kpi.totalRecettes}
        totalDepenses={kpi.totalDepenses}
        theme={theme}
        onToggleTheme={() => setTheme((p) => (p === "dark" ? "light" : "dark"))}
        onOpenNewTransaction={openNewTransaction}
        onExportCSV={handleExportCSV}
        onResetData={handleResetData}
        onPrint={handlePrint}
      />

      {/* ── Body (fills remaining height, no overflow) ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Sidebar (fixed width, full height) ── */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          totalTransactionsCount={transactions.length}
          theme={theme}
          onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
        />

        {/* ── Main content area ── */}
        <main className="flex-1 overflow-hidden flex flex-col">

          {/* Ledger: h-full flex col (scroll inside table) */}
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

          {/* Other tabs: overflow-y-auto with padding */}
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

      {/* ── Modals ── */}
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
