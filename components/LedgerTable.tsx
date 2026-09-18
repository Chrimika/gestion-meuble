"use client";

import React, { useState, useMemo } from "react";
import { Transaction, PropertyUnit } from "@/types/finance";
import { formatCurrency, formatDateDisplay } from "@/lib/storage";
import {
  Search,
  Filter,
  PlusCircle,
  Trash2,
  Edit3,
  X,
  Eye,
  Printer,
  ChevronRight,
} from "lucide-react";

interface LedgerTableProps {
  transactions: Transaction[];
  theme: "light" | "dark";
  onOpenNewTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onCompleteInstallment?: (tx: Transaction) => void;
  onViewDetail?: (tx: Transaction) => void;
  onPrintReceipt?: (tx: Transaction) => void;
  categories?: any[];
}

export const LedgerTable: React.FC<LedgerTableProps> = ({
  transactions,
  theme,
  onOpenNewTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onCompleteInstallment,
  onViewDetail,
  onPrintReceipt,
  categories = [],
}) => {
  const isDark = theme === "dark";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "RECETTE" | "DEPENSE">("ALL");

  const categoryOptions: string[] = useMemo(() => {
    const defaults = [
      "Loyers & Réservations","Entretien & Travaux","Fournitures & Linge",
      "Salaires & Personnel","Charges & Énergie","Transport & Com","Autres",
    ];
    if (categories.length > 0) return categories.map((c) => c.name);
    const fromTx = Array.from(new Set(transactions.map((t) => t.category).filter(Boolean)));
    return Array.from(new Set([...defaults, ...fromTx]));
  }, [categories, transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        tx.libelle.toLowerCase().includes(q) ||
        tx.pieceNo.toLowerCase().includes(q) ||
        tx.date.includes(q) ||
        (tx.clientName || "").toLowerCase().includes(q) ||
        (tx.clientCni || "").toLowerCase().includes(q);
      const matchesUnit = selectedUnit === "ALL" || tx.unit === selectedUnit;
      const matchesCat = selectedCategory === "ALL" || tx.category === selectedCategory;
      const matchesType =
        typeFilter === "ALL" ? true :
        typeFilter === "RECETTE" ? (tx.recettes || 0) > 0 :
        (tx.depenses || 0) > 0;
      return matchesSearch && matchesUnit && matchesCat && matchesType;
    });
  }, [transactions, searchQuery, selectedUnit, selectedCategory, typeFilter]);

  const totRec = useMemo(() => filteredTransactions.reduce((s, t) => s + (t.recettes || 0), 0), [filteredTransactions]);
  const totDep = useMemo(() => filteredTransactions.reduce((s, t) => s + (t.depenses || 0), 0), [filteredTransactions]);

  const unitOptions: PropertyUnit[] = [
    "Appartement 1","Appartement 2","Appartement 3","Appartement 4",
    "Salle de Conférence","Général / Communs",
  ];

  const unitColor: Record<string, string> = {
    "Appartement 1": isDark ? "bg-blue-900/50 text-blue-300 border-blue-700/50" : "bg-blue-50 text-blue-700 border-blue-200",
    "Appartement 2": isDark ? "bg-cyan-900/50 text-cyan-300 border-cyan-700/50" : "bg-cyan-50 text-cyan-700 border-cyan-200",
    "Appartement 3": isDark ? "bg-purple-900/50 text-purple-300 border-purple-700/50" : "bg-purple-50 text-purple-700 border-purple-200",
    "Appartement 4": isDark ? "bg-amber-900/50 text-amber-300 border-amber-700/50" : "bg-amber-50 text-amber-800 border-amber-200",
    "Salle de Conférence": isDark ? "bg-indigo-900/50 text-indigo-300 border-indigo-700/50" : "bg-indigo-50 text-indigo-700 border-indigo-200",
    "Général / Communs": isDark ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-600 border-slate-200",
  };

  const hasFilters = selectedUnit !== "ALL" || selectedCategory !== "ALL" || typeFilter !== "ALL" || searchQuery;

  const base = isDark
    ? "bg-slate-900 border-slate-800 text-slate-200"
    : "bg-white border-slate-200 text-slate-800";

  return (
    /* Outer container fills remaining height, flex column, no overflow */
    <div className="flex flex-col h-full gap-0">

      {/* ── Filter Bar (fixed height) ── */}
      <div className={`no-print shrink-0 border-b px-4 py-3 flex flex-wrap items-center gap-2 ${
        isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
      }`}>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher libellé, n° pièce, client…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-7 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-colors ${
              isDark
                ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500"
                : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
            }`}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Unit filter */}
        <select
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value)}
          className={`border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none ${
            isDark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
          }`}
        >
          <option value="ALL">Toutes les unités</option>
          {unitOptions.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>

        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={`border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none ${
            isDark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
          }`}
        >
          <option value="ALL">Toutes les catégories</option>
          {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Type toggle */}
        <div className={`flex rounded-lg border overflow-hidden text-xs ${
          isDark ? "border-slate-700" : "border-slate-300"
        }`}>
          {(["ALL", "RECETTE", "DEPENSE"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 font-semibold transition-colors ${
                typeFilter === t
                  ? t === "RECETTE" ? "bg-emerald-600 text-white"
                    : t === "DEPENSE" ? "bg-rose-600 text-white"
                    : isDark ? "bg-slate-700 text-white" : "bg-slate-800 text-white"
                  : isDark ? "bg-slate-900 text-slate-400 hover:text-slate-200" : "bg-white text-slate-500 hover:text-slate-800"
              }`}
            >
              {t === "ALL" ? "Tous" : t === "RECETTE" ? "Recettes" : "Dépenses"}
            </button>
          ))}
        </div>

        {hasFilters && (
          <button
            onClick={() => { setSelectedUnit("ALL"); setSelectedCategory("ALL"); setTypeFilter("ALL"); setSearchQuery(""); }}
            className="text-amber-500 hover:text-amber-400 text-xs font-semibold flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Effacer
          </button>
        )}

        <div className="flex-1" />

        {/* Counts */}
        <span className={`text-xs font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          {filteredTransactions.length} / {transactions.length} lignes
        </span>

        {/* New operation */}
        <button
          onClick={onOpenNewTransaction}
          className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Saisir Opération
        </button>
      </div>

      {/* ── Table (scrolls independently) ── */}
      <div className="flex-1 overflow-y-auto overflow-x-auto">
        <table className={`w-full text-left text-xs border-collapse min-w-[760px] ${isDark ? "bg-slate-900" : "bg-white"}`}>

          <thead className={`sticky top-0 z-10 text-[10px] uppercase tracking-wider font-bold ${
            isDark ? "bg-slate-950 text-slate-400 border-b border-slate-800"
                   : "bg-slate-100 text-slate-500 border-b border-slate-200"
          }`}>
            <tr>
              <th className="py-2.5 px-3 w-[88px]">Date</th>
              <th className="py-2.5 px-2 w-[60px] text-center">N°</th>
              <th className="py-2.5 px-3">Libellé / Unité</th>
              <th className="py-2.5 px-3 w-[110px] text-right text-emerald-500">Recette</th>
              <th className="py-2.5 px-3 w-[110px] text-right text-rose-500">Dépense</th>
              <th className="py-2.5 px-3 w-[120px] text-right text-amber-500">Solde</th>
              <th className="py-2.5 px-2 w-[100px] text-center">Actions</th>
            </tr>
          </thead>

          <tbody className={`divide-y ${isDark ? "divide-slate-800/60" : "divide-slate-100"}`}>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className={`py-16 text-center ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                  <Filter className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <div className="text-sm font-medium">Aucune ligne trouvée</div>
                  {hasFilters && <div className="text-xs mt-1 opacity-70">Essayez de modifier les filtres</div>}
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx, idx) => {
                const isRec = (tx.recettes || 0) > 0;
                const isDep = (tx.depenses || 0) > 0;
                const soldeVal = tx.solde ?? 0;
                const isReservation = tx.category === "Loyers & Réservations" || (tx.clientCni && tx.clientCni.length > 0);
                const hasTranche = tx.libelle?.includes("TRANCHE") || tx.libelle?.includes("RESTE DÛ") || tx.libelle?.includes("AVANCE");

                return (
                  <tr
                    key={tx.id}
                    onClick={() => onViewDetail && onViewDetail(tx)}
                    className={`group transition-colors ${onViewDetail ? "cursor-pointer" : ""} ${
                      isDark ? "hover:bg-slate-800/50 text-slate-200" : "hover:bg-amber-50/40 text-slate-800"
                    } ${isReservation && isRec ? isDark ? "border-l-2 border-l-amber-600/50" : "border-l-2 border-l-amber-400" : ""}`}
                  >
                    {/* Date */}
                    <td className={`py-2.5 px-3 font-mono text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {formatDateDisplay(tx.date)}
                    </td>

                    {/* N° pièce */}
                    <td className="py-2.5 px-2 text-center">
                      <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                        isDark ? "bg-slate-800 text-slate-500 border-slate-700" : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}>
                        {tx.pieceNo || "—"}
                      </span>
                    </td>

                    {/* Libellé + badges */}
                    <td className="py-2.5 px-3 max-w-[320px]">
                      <div className={`font-semibold text-xs leading-snug truncate ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                        {tx.libelle}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${unitColor[tx.unit] || (isDark ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-500 border-slate-200")}`}>
                          {tx.unit}
                        </span>
                        <span className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          {tx.category}
                        </span>
                        {tx.clientName && (
                          <span className={`text-[10px] font-medium ${isDark ? "text-amber-400/80" : "text-amber-700"}`}>
                            · {tx.clientName}
                          </span>
                        )}
                        {tx.resNights && tx.resNights > 0 ? (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${isDark ? "bg-indigo-900/40 text-indigo-300 border-indigo-700/40" : "bg-indigo-50 text-indigo-600 border-indigo-200"}`}>
                            {tx.resNights} nuit{tx.resNights > 1 ? "s" : ""}
                          </span>
                        ) : null}
                      </div>
                    </td>

                    {/* Recette */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {isRec ? formatCurrency(tx.recettes) : <span className="text-slate-300 dark:text-slate-700">—</span>}
                    </td>

                    {/* Dépense */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                      {isDep ? formatCurrency(tx.depenses) : <span className="text-slate-300 dark:text-slate-700">—</span>}
                    </td>

                    {/* Solde */}
                    <td className="py-2.5 px-3 text-right">
                      <span className={`inline-block font-mono font-extrabold text-xs px-2 py-0.5 rounded-lg border tabular-nums ${
                        soldeVal >= 0
                          ? isDark ? "text-emerald-300 bg-emerald-950/60 border-emerald-800/40" : "text-emerald-800 bg-emerald-50 border-emerald-200"
                          : isDark ? "text-rose-300 bg-rose-950/60 border-rose-800/40" : "text-rose-800 bg-rose-50 border-rose-200"
                      }`}>
                        {formatCurrency(soldeVal)}
                      </span>
                    </td>

                    {/* Actions — toujours visibles, stopPropagation pour ne pas déclencher le détail */}
                    <td className="py-2 px-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5">
                        {/* Tranche */}
                        {hasTranche && onCompleteInstallment && (
                          <button
                            onClick={() => onCompleteInstallment(tx)}
                            className="px-1.5 py-1 rounded-lg text-[9px] font-black transition-all bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/30"
                            title="Tranche suivante"
                          >
                            +T
                          </button>
                        )}

                        {/* Print */}
                        {onPrintReceipt && (
                          <button
                            onClick={() => onPrintReceipt(tx)}
                            className={`p-1.5 rounded-lg transition-all ${
                              isDark
                                ? "text-slate-500 hover:text-emerald-400 hover:bg-emerald-900/30"
                                : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            }`}
                            title="Imprimer le reçu"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Edit */}
                        <button
                          onClick={() => onEditTransaction(tx)}
                          className={`p-1.5 rounded-lg transition-all ${
                            isDark
                              ? "text-slate-500 hover:text-amber-400 hover:bg-amber-900/30"
                              : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                          }`}
                          title="Modifier"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className={`p-1.5 rounded-lg transition-all ${
                            isDark
                              ? "text-slate-500 hover:text-rose-400 hover:bg-rose-900/30"
                              : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                          }`}
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
        </table>
      </div>

      {/* ── Footer totals (fixed) ── */}
      <div className={`no-print shrink-0 border-t px-4 py-2 flex items-center justify-between text-xs font-bold ${
        isDark ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
      }`}>
        <span>{filteredTransactions.length} opération{filteredTransactions.length !== 1 ? "s" : ""} affichée{filteredTransactions.length !== 1 ? "s" : ""}</span>
        <div className="flex items-center gap-4 font-mono">
          <span>
            <span className={isDark ? "text-slate-500" : "text-slate-400"}>Total Recettes : </span>
            <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(totRec)}</span>
          </span>
          <span>
            <span className={isDark ? "text-slate-500" : "text-slate-400"}>Total Dépenses : </span>
            <span className="text-rose-600 dark:text-rose-400">{formatCurrency(totDep)}</span>
          </span>
          <span>
            <span className={isDark ? "text-slate-500" : "text-slate-400"}>Solde filtré : </span>
            <span className={totRec - totDep >= 0 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}>
              {formatCurrency(totRec - totDep)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
