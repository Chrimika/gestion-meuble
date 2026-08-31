"use client";

import React, { useState, useMemo } from "react";
import { Transaction, PropertyUnit, Category } from "@/types/finance";
import { formatCurrency, formatDateDisplay } from "@/lib/storage";
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  LayoutList,
  Grid,
  X,
  FileSpreadsheet
} from "lucide-react";

interface LedgerTableProps {
  transactions: Transaction[];
  theme: "light" | "dark";
  onOpenNewTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onCompleteInstallment?: (tx: Transaction) => void;
  categories?: any[];
}

export const LedgerTable: React.FC<LedgerTableProps> = ({
  transactions,
  theme,
  onOpenNewTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onCompleteInstallment,
  categories = [],
}) => {
  const isDark = theme === "dark";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "RECETTE" | "DEPENSE">("ALL");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const categoryOptions: string[] = useMemo(() => {
    const defaultCats = [
      "Loyers & Réservations",
      "Entretien & Travaux",
      "Fournitures & Linge",
      "Salaires & Personnel",
      "Charges & Énergie",
      "Transport & Com",
      "Autres",
    ];
    if (categories && categories.length > 0) {
      return categories.map((c) => c.name);
    }
    const fromTx = Array.from(new Set(transactions.map((t) => t.category).filter(Boolean)));
    return Array.from(new Set([...defaultCats, ...fromTx]));
  }, [categories, transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.libelle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.pieceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.date.includes(searchQuery);

      const matchesUnit = selectedUnit === "ALL" || tx.unit === selectedUnit;
      const matchesCategory = selectedCategory === "ALL" || tx.category === selectedCategory;

      let matchesType = true;
      if (typeFilter === "RECETTE") matchesType = (tx.recettes || 0) > 0;
      if (typeFilter === "DEPENSE") matchesType = (tx.depenses || 0) > 0;

      return matchesSearch && matchesUnit && matchesCategory && matchesType;
    });
  }, [transactions, searchQuery, selectedUnit, selectedCategory, typeFilter]);

  // Totals for filtered data
  const filteredTotalRecettes = useMemo(
    () => filteredTransactions.reduce((sum, t) => sum + (t.recettes || 0), 0),
    [filteredTransactions]
  );

  const filteredTotalDepenses = useMemo(
    () => filteredTransactions.reduce((sum, t) => sum + (t.depenses || 0), 0),
    [filteredTransactions]
  );

  const unitOptions: PropertyUnit[] = [
    "Appartement 1",
    "Appartement 2",
    "Appartement 3",
    "Appartement 4",
    "Salle de Conférence",
    "Général / Communs",
  ];

  const getUnitBadge = (u: PropertyUnit) => {
    if (isDark) {
      switch (u) {
        case "Appartement 1": return "bg-blue-500/10 text-blue-300 border-blue-500/30";
        case "Appartement 2": return "bg-cyan-500/10 text-cyan-300 border-cyan-500/30";
        case "Appartement 3": return "bg-purple-500/10 text-purple-300 border-purple-500/30";
        case "Appartement 4": return "bg-amber-500/10 text-amber-300 border-amber-500/30";
        case "Salle de Conférence": return "bg-indigo-500/10 text-indigo-300 border-indigo-500/30";
        default: return "bg-slate-800 text-slate-400 border-slate-700/60";
      }
    } else {
      switch (u) {
        case "Appartement 1": return "bg-blue-50 text-blue-700 border-blue-200";
        case "Appartement 2": return "bg-cyan-50 text-cyan-700 border-cyan-200";
        case "Appartement 3": return "bg-purple-50 text-purple-700 border-purple-200";
        case "Appartement 4": return "bg-amber-50 text-amber-800 border-amber-200";
        case "Salle de Conférence": return "bg-indigo-50 text-indigo-700 border-indigo-200";
        default: return "bg-slate-100 text-slate-600 border-slate-200";
      }
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Search & Filters Bar */}
      <div
        className={`border rounded-2xl p-4 shadow-sm transition-colors space-y-3 ${
          isDark
            ? "bg-slate-900/90 border-slate-800"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-400" : "text-slate-400"}`} />
            <input
              type="text"
              placeholder="Rechercher libellé, n° pièce (ex: 007*)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-8 py-2 border rounded-xl text-xs sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                isDark
                  ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500"
                  : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* View Mode Switcher */}
            <div className={`flex p-1 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === "table"
                    ? isDark ? "bg-slate-800 text-amber-400 shadow-sm" : "bg-white text-amber-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Vue Tableau Compact"
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tableau</span>
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === "cards"
                    ? isDark ? "bg-slate-800 text-amber-400 shadow-sm" : "bg-white text-amber-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Vue Fiches"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Fiches</span>
              </button>
            </div>

            <button
              onClick={onOpenNewTransaction}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Saisir Opération</span>
            </button>
          </div>

        </div>

        {/* Filter Toolbar */}
        <div className={`flex flex-wrap items-center gap-2 pt-2 border-t text-xs ${isDark ? "border-slate-800" : "border-slate-100"}`}>
          <span className={`font-medium flex items-center gap-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <Filter className="w-3.5 h-3.5 text-amber-500" />
            Filtres :
          </span>

          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className={`border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none ${
              isDark
                ? "bg-slate-950 border-slate-800 text-slate-200"
                : "bg-slate-50 border-slate-200 text-slate-800"
            }`}
          >
            <option value="ALL">Toutes les Unités</option>
            {unitOptions.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none ${
              isDark
                ? "bg-slate-950 border-slate-800 text-slate-200"
                : "bg-slate-50 border-slate-200 text-slate-800"
            }`}
          >
            <option value="ALL">Toutes les Catégories</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <div className={`flex p-0.5 rounded-lg border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
            <button
              onClick={() => setTypeFilter("ALL")}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                typeFilter === "ALL"
                  ? isDark ? "bg-slate-800 text-white font-bold" : "bg-white text-slate-900 font-bold shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setTypeFilter("RECETTE")}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                typeFilter === "RECETTE"
                  ? "bg-emerald-600 text-white font-bold"
                  : "text-slate-500 hover:text-emerald-600"
              }`}
            >
              Recettes
            </button>
            <button
              onClick={() => setTypeFilter("DEPENSE")}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                typeFilter === "DEPENSE"
                  ? "bg-rose-600 text-white font-bold"
                  : "text-slate-500 hover:text-rose-600"
              }`}
            >
              Dépenses
            </button>
          </div>

          {(selectedUnit !== "ALL" || selectedCategory !== "ALL" || typeFilter !== "ALL" || searchQuery) && (
            <button
              onClick={() => {
                setSelectedUnit("ALL");
                setSelectedCategory("ALL");
                setTypeFilter("ALL");
                setSearchQuery("");
              }}
              className="text-amber-600 dark:text-amber-400 hover:underline text-xs ml-auto font-medium"
            >
              Réinitialiser
            </button>
          )}
        </div>

      </div>

      {/* Main Ledger Content */}
      {viewMode === "table" ? (
        
        /* TABLEAU COMPACT (NO HORIZONTAL OVERFLOW) */
        <div className={`border rounded-2xl shadow-sm overflow-hidden transition-colors ${
          isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <table className="w-full text-left text-xs sm:text-sm border-collapse table-fixed">
            
            <thead>
              <tr className={`uppercase text-[10px] font-bold tracking-wider border-b ${
                isDark ? "bg-slate-950 text-slate-400 border-slate-800" : "bg-slate-50 text-slate-500 border-slate-200"
              }`}>
                <th className="py-3 px-2 sm:px-3 w-[75px] sm:w-[90px] font-mono">Date</th>
                <th className="py-3 px-2 w-[60px] sm:w-[70px] font-mono text-center">N°</th>
                <th className="py-3 px-3 min-w-[180px]">Libellé & Unité</th>
                <th className="py-3 px-2 sm:px-3 w-[95px] sm:w-[125px] text-right text-emerald-600 dark:text-emerald-400 font-mono">Recette</th>
                <th className="py-3 px-2 sm:px-3 w-[95px] sm:w-[125px] text-right text-rose-600 dark:text-rose-400 font-mono">Dépense</th>
                <th className="py-3 px-2 sm:px-3 w-[110px] sm:w-[135px] text-right text-amber-600 dark:text-amber-300 font-mono">Solde</th>
                <th className="py-3 px-1.5 w-[45px] sm:w-[60px] text-center"></th>
              </tr>
            </thead>

            <tbody className={`divide-y ${isDark ? "divide-slate-800/50" : "divide-slate-100"}`}>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Aucune ligne trouvée.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isRecette = (tx.recettes || 0) > 0;
                  const isDepense = (tx.depenses || 0) > 0;
                  const soldeVal = tx.solde ?? 0;

                  return (
                    <tr
                      key={tx.id}
                      className={`transition-colors ${
                        isDark ? "hover:bg-slate-800/50 text-slate-200" : "hover:bg-slate-50 text-slate-800"
                      }`}
                    >
                      {/* Date */}
                      <td className={`py-2.5 px-2 sm:px-3 font-mono text-[11px] sm:text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                        {formatDateDisplay(tx.date)}
                      </td>

                      {/* Piece No */}
                      <td className="py-2.5 px-2 font-mono text-center text-[10px] sm:text-xs">
                        <span className={`px-1.5 py-0.5 rounded border ${
                          isDark ? "bg-slate-950 text-slate-400 border-slate-800" : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          {tx.pieceNo || "-"}
                        </span>
                      </td>

                      {/* Libelle + Sub-badges */}
                      <td className="py-2.5 px-3">
                        <div className={`font-semibold leading-snug text-xs sm:text-sm ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                          {tx.libelle}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className={`text-[10px] px-2 py-0.2 rounded-md font-medium border ${getUnitBadge(tx.unit)}`}>
                            {tx.unit}
                          </span>
                          <span className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            • {tx.category}
                          </span>
                        </div>
                      </td>

                      {/* Recette */}
                      <td className="py-2.5 px-2 sm:px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm tabular-nums">
                        {isRecette ? formatCurrency(tx.recettes) : ""}
                      </td>

                      {/* Depense */}
                      <td className="py-2.5 px-2 sm:px-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400 text-xs sm:text-sm tabular-nums">
                        {isDepense ? formatCurrency(tx.depenses) : ""}
                      </td>

                      {/* Solde */}
                      <td className="py-2.5 px-2 sm:px-3 text-right font-mono font-extrabold text-xs sm:text-sm tabular-nums">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-lg border ${
                            soldeVal >= 0
                              ? isDark ? "text-emerald-300 bg-emerald-950/50 border-emerald-800/40" : "text-emerald-800 bg-emerald-50 border-emerald-200"
                              : isDark ? "text-rose-300 bg-rose-950/50 border-rose-800/40" : "text-rose-800 bg-rose-50 border-rose-200"
                          }`}
                        >
                          {formatCurrency(soldeVal)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-1.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {(tx.libelle?.includes("TRANCHE") || tx.libelle?.includes("RESTE DÛ:") || tx.libelle?.includes("AVANCE")) && onCompleteInstallment && (
                            <button
                              onClick={() => onCompleteInstallment(tx)}
                              className="px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/30 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm"
                              title="Payer / Compléter la tranche suivante pour cette réservation"
                            >
                              <PlusCircle className="w-3 h-3" />
                              <span>Tranche</span>
                            </button>
                          )}
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded transition-colors"
                            title="Modifier"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Totals Footer */}
            <tfoot className={`border-t-2 text-xs font-bold ${
              isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
            }`}>
              <tr>
                <td colSpan={3} className="py-3 px-3 uppercase tracking-wider text-[11px] text-slate-500">
                  Totaux ({filteredTransactions.length} opérations)
                </td>
                <td className="py-3 px-2 sm:px-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm tabular-nums">
                  {formatCurrency(filteredTotalRecettes)}
                </td>
                <td className="py-3 px-2 sm:px-3 text-right font-mono font-black text-rose-600 dark:text-rose-400 text-xs sm:text-sm tabular-nums">
                  {formatCurrency(filteredTotalDepenses)}
                </td>
                <td className="py-3 px-2 sm:px-3 text-right font-mono font-black text-amber-600 dark:text-amber-300 text-xs sm:text-sm tabular-nums">
                  {formatCurrency(filteredTotalRecettes - filteredTotalDepenses)}
                </td>
                <td></td>
              </tr>
            </tfoot>

          </table>
        </div>

      ) : (

        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTransactions.map((tx) => {
            const isRecette = (tx.recettes || 0) > 0;
            const soldeVal = tx.solde ?? 0;

            return (
              <div
                key={tx.id}
                className={`border rounded-2xl p-4 space-y-3 shadow-sm transition-all flex flex-col justify-between ${
                  isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                <div>
                  <div className={`flex items-center justify-between text-xs border-b pb-2 mb-2 ${
                    isDark ? "text-slate-400 border-slate-800" : "text-slate-500 border-slate-100"
                  }`}>
                    <span className="font-mono">{formatDateDisplay(tx.date)}</span>
                    <span className={`font-mono px-2 py-0.5 rounded border ${
                      isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}>
                      N° {tx.pieceNo || "-"}
                    </span>
                  </div>

                  <h4 className={`font-bold text-sm leading-snug ${isDark ? "text-white" : "text-slate-900"}`}>{tx.libelle}</h4>

                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${getUnitBadge(tx.unit)}`}>
                      {tx.unit}
                    </span>
                    <span className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{tx.category}</span>
                  </div>

                  {(tx.libelle?.includes("TRANCHE") || tx.libelle?.includes("RESTE DÛ:") || tx.libelle?.includes("AVANCE")) && onCompleteInstallment && (
                    <div className="mt-3">
                      <button
                        onClick={() => onCompleteInstallment(tx)}
                        className="w-full py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Régler la tranche suivante</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className={`pt-3 border-t flex items-center justify-between text-xs font-mono ${
                  isDark ? "border-slate-800" : "border-slate-100"
                }`}>
                  <div>
                    {isRecette ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">+ {formatCurrency(tx.recettes)}</span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 font-bold text-sm">- {formatCurrency(tx.depenses)}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-sans">Solde Cumulé</span>
                    <span className={`font-bold ${
                      soldeVal >= 0
                        ? isDark ? "text-emerald-300" : "text-emerald-700"
                        : isDark ? "text-rose-300" : "text-rose-700"
                    }`}>
                      {formatCurrency(soldeVal)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      )}

    </div>
  );
};
