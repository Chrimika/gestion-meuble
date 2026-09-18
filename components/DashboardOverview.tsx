"use client";

import React from "react";
import { Transaction } from "@/types/finance";
import {
  getSummaryKPI,
  getBreakdownByUnit,
  getExpenseBreakdownByCategory,
  formatCurrency,
  formatDateDisplay,
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
  CheckCircle2,
  PlusCircle,
  LayoutList,
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
  const recentTxs = [...transactions].reverse().slice(0, 6);

  const card = `border rounded-2xl p-5 transition-all ${
    isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
  }`;

  return (
    <div className="space-y-5 pb-4">

      {/* ── Banner ── */}
      <div className={`rounded-2xl p-5 border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark
          ? "bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-slate-800"
          : "bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border-transparent"
      }`}>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Tableau de Bord Financier
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Synthèse globale — 4 appartements &amp; salle de conférence
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onNavigateToLedger}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              isDark
                ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                : "bg-white/10 border-white/20 text-white hover:bg-white/20"
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            Journal
          </button>
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Nouvelle Opération
          </button>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Recettes */}
        <div className={card}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Total Recettes
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums font-mono">
            {formatCurrency(kpi.totalRecettes)}
          </div>
          <div className={`flex items-center gap-1 mt-1 text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            <ArrowUpRight className="w-3 h-3 text-emerald-500" />
            Loyers encaissés
          </div>
        </div>

        {/* Dépenses */}
        <div className={card}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Total Dépenses
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-rose-500" />
            </div>
          </div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 tabular-nums font-mono">
            {formatCurrency(kpi.totalDepenses)}
          </div>
          <div className={`flex items-center gap-1 mt-1 text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            <ArrowDownRight className="w-3 h-3 text-rose-500" />
            Travaux, charges &amp; salaires
          </div>
        </div>

        {/* Solde */}
        <div className={card}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Solde de Caisse
            </span>
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
              kpi.soldeActuel >= 0
                ? "bg-amber-500/10 border-amber-500/20"
                : "bg-rose-500/10 border-rose-500/20"
            }`}>
              <Wallet className={`w-4 h-4 ${kpi.soldeActuel >= 0 ? "text-amber-500" : "text-rose-500"}`} />
            </div>
          </div>
          <div className={`text-xl font-black tabular-nums font-mono ${
            kpi.soldeActuel >= 0
              ? "text-amber-600 dark:text-amber-400"
              : "text-rose-600 dark:text-rose-400"
          }`}>
            {formatCurrency(kpi.soldeActuel)}
          </div>
          <div className={`flex items-center gap-1 mt-1 text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {kpi.soldeActuel >= 0
              ? <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              : <AlertCircle className="w-3 h-3 text-amber-500" />
            }
            {kpi.soldeActuel >= 0 ? "Solde créditeur" : "Avance de trésorerie"}
          </div>
        </div>

        {/* Opérations */}
        <div className={card}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Opérations
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-indigo-500" />
            </div>
          </div>
          <div className={`text-xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
            {kpi.totalTransactions}
            <span className={`text-xs font-normal ml-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>pièces</span>
          </div>
          <div className={`text-[11px] mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Journal de caisse complet
          </div>
        </div>

      </div>

      {/* ── Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Par unité */}
        <div className={card}>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-amber-500" />
            <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
              Performances par Logement
            </h3>
          </div>
          <div className="space-y-3">
            {unitBreakdown.map((item) => {
              const max = Math.max(...unitBreakdown.map((u) => u.recettes), 1);
              const pct = Math.min(100, Math.round((item.recettes / max) * 100));
              return (
                <div key={item.unit}>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      {item.unit}
                    </span>
                    <div className="flex items-center gap-3 font-mono">
                      <span className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        -{formatCurrency(item.depenses)}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(item.recettes)}
                      </span>
                    </div>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: item.recettes > 0 ? `${Math.max(4, pct)}%` : "0%" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Par catégorie */}
        <div className={card}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
              Ventilation des Dépenses
            </h3>
          </div>
          <div className="space-y-2">
            {categoryBreakdown.length === 0 && (
              <div className={`text-xs text-center py-4 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                Aucune dépense enregistrée
              </div>
            )}
            {categoryBreakdown.map((item) => {
              const pct = Math.round((item.depenses / (kpi.totalDepenses || 1)) * 100);
              return (
                <div
                  key={item.category}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs ${
                    isDark ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-100"
                  }`}
                >
                  <div>
                    <div className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                      {item.category}
                    </div>
                    <div className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      {item.count} op.
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(item.depenses)}
                    </div>
                    <div className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      {pct}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── Recent transactions ── */}
      <div className={card}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
            Dernières Opérations
          </h3>
          <button
            onClick={onNavigateToLedger}
            className={`text-xs font-semibold ${isDark ? "text-amber-400 hover:text-amber-300" : "text-amber-600 hover:text-amber-700"}`}
          >
            Voir tout →
          </button>
        </div>
        <div className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-100"}`}>
          {recentTxs.map((tx) => {
            const isRec = (tx.recettes || 0) > 0;
            return (
              <div key={tx.id} className="flex items-center justify-between py-2.5 gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isRec
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  }`}>
                    {isRec ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs font-semibold truncate ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                      {tx.libelle}
                    </div>
                    <div className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      {formatDateDisplay(tx.date)} · {tx.unit}
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-black font-mono shrink-0 tabular-nums ${
                  isRec ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}>
                  {isRec ? "+" : "-"}{formatCurrency(isRec ? tx.recettes : tx.depenses)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
