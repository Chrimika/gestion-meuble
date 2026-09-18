"use client";

import React from "react";
import {
  Building2,
  PlusCircle,
  Download,
  RotateCcw,
  Printer,
  Wallet,
  Sun,
  Moon,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { formatCurrency } from "@/lib/storage";

interface NavbarProps {
  soldeActuel: number;
  totalRecettes: number;
  totalDepenses: number;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onOpenNewTransaction: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
  onPrint: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  soldeActuel,
  totalRecettes,
  totalDepenses,
  theme,
  onToggleTheme,
  onOpenNewTransaction,
  onExportCSV,
  onResetData,
  onPrint,
}) => {
  const isDark = theme === "dark";

  return (
    <header
      className={`no-print shrink-0 z-40 border-b backdrop-blur-xl transition-colors ${
        isDark
          ? "bg-slate-950/95 border-slate-800 shadow-xl"
          : "bg-white/95 border-slate-200 shadow-sm"
      }`}
      style={{ height: 68 }}
    >
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">

        {/* ── Logo + Nom résidence ── */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/logo.jpeg"
            alt="Résidence St Raphaël"
            className="rounded-xl object-cover shadow-md"
            style={{ width: 44, height: 44 }}
          />
          <div className="leading-none">
            <div className={`font-black text-base tracking-tight leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              Résidence <span className="text-amber-500">St Raphaël</span>
            </div>
            <div className={`text-[10px] font-semibold ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              4 Apparts · Salle de Conférence · Yaoundé
            </div>
          </div>
        </div>

        {/* ── KPI Strip (centre) ── */}
        <div className="hidden lg:flex items-center gap-2 flex-1 justify-center">
          {/* Recettes */}
          <div className={`flex items-center gap-3 px-5 py-2 rounded-xl border ${
            isDark ? "bg-emerald-950/40 border-emerald-900/60" : "bg-emerald-50 border-emerald-200"
          }`}>
            <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <div className={`text-[9px] uppercase font-bold tracking-wider ${isDark ? "text-emerald-600" : "text-emerald-700"}`}>Recettes</div>
              <div className="text-base font-black tabular-nums text-emerald-600 dark:text-emerald-400 leading-tight font-mono">
                {formatCurrency(totalRecettes)}
              </div>
            </div>
          </div>

          {/* Dépenses */}
          <div className={`flex items-center gap-3 px-5 py-2 rounded-xl border ${
            isDark ? "bg-rose-950/40 border-rose-900/60" : "bg-rose-50 border-rose-200"
          }`}>
            <TrendingDown className="w-4 h-4 text-rose-500 shrink-0" />
            <div>
              <div className={`text-[9px] uppercase font-bold tracking-wider ${isDark ? "text-rose-600" : "text-rose-700"}`}>Dépenses</div>
              <div className="text-base font-black tabular-nums text-rose-600 dark:text-rose-400 leading-tight font-mono">
                {formatCurrency(totalDepenses)}
              </div>
            </div>
          </div>

          {/* Solde — plus mis en avant */}
          <div className={`flex items-center gap-3 px-6 py-2 rounded-xl border-2 shadow-sm ${
            soldeActuel >= 0
              ? isDark ? "bg-amber-950/50 border-amber-700/60" : "bg-amber-50 border-amber-400"
              : isDark ? "bg-rose-950/50 border-rose-700/60" : "bg-rose-50 border-rose-400"
          }`}>
            <Wallet className={`w-5 h-5 shrink-0 ${soldeActuel >= 0 ? "text-amber-500" : "text-rose-500"}`} />
            <div>
              <div className={`text-[9px] uppercase font-black tracking-wider ${
                soldeActuel >= 0 ? isDark ? "text-amber-500" : "text-amber-700" : isDark ? "text-rose-500" : "text-rose-700"
              }`}>Solde Net Caisse</div>
              <div className={`text-xl font-black tabular-nums leading-tight font-mono ${
                soldeActuel >= 0 ? "text-amber-600 dark:text-amber-300" : "text-rose-600 dark:text-rose-300"
              }`}>
                {formatCurrency(soldeActuel)}
              </div>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center gap-1.5 shrink-0">

          {/* Theme */}
          <button
            onClick={onToggleTheme}
            title={isDark ? "Mode clair" : "Mode sombre"}
            className={`p-2 rounded-lg border transition-all ${
              isDark
                ? "bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800"
                : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCSV}
            title="Exporter CSV"
            className={`p-2 rounded-lg border transition-all ${
              isDark
                ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Download className="w-4 h-4 text-emerald-500" />
          </button>

          {/* Print */}
          <button
            onClick={onPrint}
            title="Imprimer"
            className={`p-2 rounded-lg border transition-all ${
              isDark
                ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Printer className="w-4 h-4 text-indigo-500" />
          </button>

          {/* Reset */}
          <button
            onClick={onResetData}
            title="Réinitialiser les données"
            className={`p-2 rounded-lg border transition-all ${
              isDark
                ? "bg-slate-900 border-slate-800 text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                : "bg-slate-100 border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-slate-200"
            }`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Nouvelle opération */}
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm px-4 py-2 rounded-lg shadow-md shadow-emerald-600/20 transition-all ml-1"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>Nouvelle Opération</span>
          </button>

        </div>
      </div>
    </header>
  );
};
