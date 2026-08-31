"use client";

import React from "react";
import { Transaction } from "@/types/finance";
import { 
  getSummaryKPI, 
  getBreakdownByUnit, 
  getExpenseBreakdownByCategory, 
  formatCurrency 
} from "@/lib/storage";
import { PieChart, BarChart3, TrendingUp, TrendingDown } from "lucide-react";

interface AnalyticsViewProps {
  transactions: Transaction[];
  theme: "light" | "dark";
  categories?: any[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ transactions, theme, categories = [] }) => {
  const isDark = theme === "dark";
  const kpi = getSummaryKPI(transactions);
  const categoryNames = categories.map((c) => c.name);
  const categoryBreakdown = getExpenseBreakdownByCategory(transactions, categoryNames);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className={`border rounded-3xl p-6 shadow-sm ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <h2 className={`text-2xl font-black tracking-tight flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
          <PieChart className="w-6 h-6 text-indigo-500" />
          Analyse Financière & Budgétaire
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Ratios d'exploitation et ventilation par poste budgétaire.
        </p>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recettes vs Dépenses Ratio */}
        <div className={`border rounded-2xl p-6 shadow-sm space-y-4 ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <h3 className={`font-bold text-base flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
            <BarChart3 className="w-5 h-5 text-amber-500" />
            Ratio Recettes / Dépenses
          </h3>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Total Recettes
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm font-bold">{formatCurrency(kpi.totalRecettes)}</span>
              </div>
              <div className={`w-full h-4 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                <div className="h-full bg-emerald-500 rounded-full w-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> Total Dépenses
                </span>
                <span className="text-rose-600 dark:text-rose-400 font-mono text-sm font-bold">{formatCurrency(kpi.totalDepenses)}</span>
              </div>
              <div className={`w-full h-4 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((kpi.totalDepenses / (kpi.totalRecettes || 1)) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border text-xs space-y-1 ${
            isDark ? "bg-slate-800/60 border-slate-700/60 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
          }`}>
            <div className="font-bold text-amber-600 dark:text-amber-300">Analyse de Trésorerie :</div>
            <div>
              Les dépenses représentent{" "}
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {Math.round((kpi.totalDepenses / (kpi.totalRecettes || 1)) * 100)}%
              </span>{" "}
              du total des loyers encaissés sur cette période.
            </div>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className={`border rounded-2xl p-6 shadow-sm space-y-4 ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <h3 className={`font-bold text-base ${isDark ? "text-white" : "text-slate-900"}`}>
            Postes de Dépenses Principaux
          </h3>

          <div className="space-y-3 pt-1">
            {categoryBreakdown.map((cat) => {
              const pct = Math.round((cat.depenses / (kpi.totalDepenses || 1)) * 100);
              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className={isDark ? "text-slate-300" : "text-slate-700"}>{cat.category}</span>
                    <span className="text-rose-600 dark:text-rose-400 font-mono">{formatCurrency(cat.depenses)} ({pct}%)</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
