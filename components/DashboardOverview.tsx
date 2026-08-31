"use client";

import React from "react";
import { Transaction } from "@/types/finance";
import { 
  getSummaryKPI, 
  getBreakdownByUnit, 
  getExpenseBreakdownByCategory, 
  formatCurrency,
  formatDateDisplay
} from "@/lib/storage";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Receipt, 
  Building2, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

interface DashboardOverviewProps {
  transactions: Transaction[];
  theme: "light" | "dark";
  onNavigateToLedger: () => void;
  onOpenNewTransaction: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  transactions,
  theme,
  onNavigateToLedger,
  onOpenNewTransaction,
}) => {
  const isDark = theme === "dark";
  const kpi = getSummaryKPI(transactions);
  const unitBreakdown = getBreakdownByUnit(transactions);
  const categoryBreakdown = getExpenseBreakdownByCategory(transactions);
  const recentTransactions = [...transactions].reverse().slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div
        className={`border rounded-3xl p-6 shadow-sm relative overflow-hidden transition-colors ${
          isDark
            ? "bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-slate-800"
            : "bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border-slate-700 text-white"
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Tableau de Bord Financier
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Synthèse globale des loyers encaissés, charges d'exploitation et solde du meublé (4 appartements et salle de conférence).
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onOpenNewTransaction}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              + Enregistrer une Opération
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Recettes Card */}
        <div className={`border rounded-2xl p-5 shadow-sm transition-all ${
          isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Total Recettes
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight tabular-nums">
              {formatCurrency(kpi.totalRecettes)}
            </div>
            <div className={`flex items-center gap-1 mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
              <span>Loyers encaissés</span>
            </div>
          </div>
        </div>

        {/* Dépenses Card */}
        <div className={`border rounded-2xl p-5 shadow-sm transition-all ${
          isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Total Dépenses
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight tabular-nums">
              {formatCurrency(kpi.totalDepenses)}
            </div>
            <div className={`flex items-center gap-1 mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
              <span>Travaux, salaires & charges</span>
            </div>
          </div>
        </div>

        {/* Solde Card */}
        <div className={`border rounded-2xl p-5 shadow-sm transition-all ${
          isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Solde de Caisse
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className={`text-2xl font-black tracking-tight tabular-nums ${
              kpi.soldeActuel >= 0
                ? isDark ? "text-emerald-400" : "text-emerald-600"
                : isDark ? "text-rose-400" : "text-rose-600"
            }`}>
              {formatCurrency(kpi.soldeActuel)}
            </div>
            <div className={`flex items-center gap-1 mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {kpi.soldeActuel >= 0 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span>{kpi.soldeActuel >= 0 ? "Solde créditeur" : "Avance de trésorerie"}</span>
            </div>
          </div>
        </div>

        {/* Total Operations Card */}
        <div className={`border rounded-2xl p-5 shadow-sm transition-all ${
          isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Opérations
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              {kpi.totalTransactions} <span className="text-sm font-normal text-slate-400">pièces</span>
            </div>
            <div className={`flex items-center gap-1 mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              <span>Journal de caisse complet</span>
            </div>
          </div>
        </div>

      </div>

      {/* Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Unit Breakdown */}
        <div className={`border rounded-2xl p-5 shadow-sm ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-bold text-base flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
              <Building2 className="w-5 h-5 text-amber-500" />
              Performances par Logement / Salle
            </h3>
            <span className="text-xs text-slate-400 font-medium">Recettes brutes</span>
          </div>
          
          <div className="space-y-4">
            {unitBreakdown.map((item) => {
              const maxRecette = Math.max(...unitBreakdown.map((u) => u.recettes), 1);
              const percentage = Math.min(100, Math.round((item.recettes / maxRecette) * 100));

              return (
                <div key={item.unit} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>{item.unit}</span>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-slate-400 text-[11px]">Dépenses: {formatCurrency(item.depenses)}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(item.recettes)}</span>
                    </div>
                  </div>
                  <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.recettes > 0 ? Math.max(8, percentage) : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Expense Breakdown */}
        <div className={`border rounded-2xl p-5 shadow-sm ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-bold text-base flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
              <TrendingDown className="w-5 h-5 text-rose-500" />
              Ventilation des Dépenses
            </h3>
            <span className="text-xs text-slate-400 font-medium">Par poste</span>
          </div>

          <div className="space-y-3">
            {categoryBreakdown.map((item) => {
              const totalCategoryDepenses = kpi.totalDepenses || 1;
              const pct = Math.round((item.depenses / totalCategoryDepenses) * 100);

              return (
                <div key={item.category} className={`p-3 rounded-xl border flex items-center justify-between ${
                  isDark ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-100"
                }`}>
                  <div>
                    <div className={`text-xs font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>{item.category}</div>
                    <div className="text-[11px] text-slate-400">{item.count} opération(s)</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono">{formatCurrency(item.depenses)}</div>
                    <div className="text-[11px] text-slate-400 font-medium">{pct}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Recent Activity Table */}
      <div className={`border rounded-2xl p-5 shadow-sm ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`font-bold text-base ${isDark ? "text-white" : "text-slate-900"}`}>Dernières Opérations Saisies</h3>
            <p className="text-xs text-slate-400">5 derniers mouvements du journal</p>
          </div>
          <button
            onClick={onNavigateToLedger}
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            Voir le journal →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`uppercase text-[10px] tracking-wider font-semibold ${
              isDark ? "bg-slate-950 text-slate-400" : "bg-slate-50 text-slate-500"
            }`}>
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">Date</th>
                <th className="py-2.5 px-3">N° Pièce</th>
                <th className="py-2.5 px-3">Libellé</th>
                <th className="py-2.5 px-3">Unité</th>
                <th className="py-2.5 px-3 text-right">Recette</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Dépense</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-slate-800/60" : "divide-slate-100"}`}>
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className={`transition-colors ${isDark ? "hover:bg-slate-800/40 text-slate-300" : "hover:bg-slate-50 text-slate-800"}`}>
                  <td className="py-2.5 px-3 font-mono">{formatDateDisplay(tx.date)}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{tx.pieceNo || "-"}</td>
                  <td className={`py-2.5 px-3 font-medium max-w-xs truncate ${isDark ? "text-white" : "text-slate-900"}`}>{tx.libelle}</td>
                  <td className="py-2.5 px-3">{tx.unit}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {tx.recettes ? formatCurrency(tx.recettes) : "-"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                    {tx.depenses ? formatCurrency(tx.depenses) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
