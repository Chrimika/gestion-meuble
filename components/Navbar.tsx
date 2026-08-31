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
  Moon
} from "lucide-react";
import { formatCurrency } from "@/lib/storage";

interface NavbarProps {
  soldeActuel: number;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onOpenNewTransaction: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
  onPrint: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  soldeActuel,
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
      className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors ${
        isDark
          ? "bg-slate-950/90 border-slate-800 text-slate-100 shadow-2xl"
          : "bg-white/90 border-slate-200 text-slate-900 shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Application Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-indigo-600 flex items-center justify-center shadow-md shadow-amber-500/20 ring-1 ring-white/20">
              <Building2 className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`font-black text-lg tracking-tight flex items-center gap-1.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                  ImmoGestion <span className="text-amber-500 font-black">PRO</span>
                </h1>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${
                  isDark ? "bg-amber-500/10 text-amber-300 border-amber-500/30" : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  4 Apparts & Salle
                </span>
              </div>
              <p className={`text-[11px] hidden sm:block font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Logiciel de gestion financière & suivi de caisse
              </p>
            </div>
          </div>

          {/* Solde Pill Indicator */}
          <div
            className={`hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl border shadow-inner ${
              isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? "bg-slate-800 text-slate-400" : "bg-slate-200 text-slate-600"}`}>
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <div className={`text-[10px] uppercase font-semibold tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Solde Net Actuel
              </div>
              <div
                className={`text-sm font-black tracking-tight tabular-nums ${
                  soldeActuel >= 0
                    ? isDark ? "text-emerald-400" : "text-emerald-600"
                    : isDark ? "text-rose-400" : "text-rose-600"
                }`}
              >
                {formatCurrency(soldeActuel)}
              </div>
            </div>
          </div>

          {/* Action Buttons & Theme Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Theme Switcher Button */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all ${
                isDark
                  ? "bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
              }`}
              title={isDark ? "Passer en Mode Clair ☀️" : "Passer en Mode Sombre 🌙"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              <span className="hidden lg:inline">{isDark ? "Mode Clair" : "Mode Sombre"}</span>
            </button>

            {/* New Operation Button */}
            <button
              onClick={onOpenNewTransaction}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Ajouter une opération au journal"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Nouvelle Opération</span>
              <span className="sm:hidden">Ajouter</span>
            </button>

            {/* Export Button */}
            <button
              onClick={onExportCSV}
              className={`p-2 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 border transition-colors ${
                isDark
                  ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
                  : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
              }`}
              title="Exporter vers Excel (CSV)"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span className="hidden md:inline">Exporter</span>
            </button>

            {/* Print Button */}
            <button
              onClick={onPrint}
              className={`p-2 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 border transition-colors ${
                isDark
                  ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
                  : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
              }`}
              title="Imprimer le journal de caisse"
            >
              <Printer className="w-4 h-4 text-indigo-500" />
              <span className="hidden lg:inline">Imprimer</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={onResetData}
              className={`p-2 rounded-xl transition-colors border ${
                isDark
                  ? "text-slate-400 hover:text-white border-transparent hover:bg-slate-900"
                  : "text-slate-500 hover:text-slate-900 border-transparent hover:bg-slate-100"
              }`}
              title="Réinitialiser avec les données d'origine"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
