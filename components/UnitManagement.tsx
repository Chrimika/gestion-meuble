"use client";

import React, { useState } from "react";
import { Transaction, PropertyUnit } from "@/types/finance";
import { getBreakdownByUnit, formatCurrency, formatDateDisplay } from "@/lib/storage";
import { Building, Bed, Users, PlusCircle, TrendingUp, TrendingDown, Edit3, Trash2, Printer } from "lucide-react";

interface UnitManagementProps {
  transactions: Transaction[];
  theme: "light" | "dark";
  onOpenBookingForUnit: (unit: PropertyUnit) => void;
  onViewDetail?: (tx: Transaction) => void;
  onPrintReceipt?: (tx: Transaction) => void;
  onEditTx?: (tx: Transaction) => void;
  onDeleteTx?: (id: string) => void;
  onCompleteInstallment?: (tx: Transaction) => void;
}

export const UnitManagement: React.FC<UnitManagementProps> = ({
  transactions,
  theme,
  onOpenBookingForUnit,
  onViewDetail,
  onPrintReceipt,
  onEditTx,
  onDeleteTx,
  onCompleteInstallment,
}) => {
  const isDark = theme === "dark";
  const [activeSelectedUnit, setActiveSelectedUnit] = useState<PropertyUnit>("Appartement 1");
  const unitSummaries = getBreakdownByUnit(transactions);

  const unitsList: { name: PropertyUnit; type: string; subtitle: string; icon: any }[] = [
    { name: "Appartement 1",      type: "Appartement Meublé",     subtitle: "2 Chambres & Salon",       icon: Bed },
    { name: "Appartement 2",      type: "Appartement Meublé",     subtitle: "2 Chambres & Salon",       icon: Bed },
    { name: "Appartement 3",      type: "Appartement Meublé",     subtitle: "1 Chambre & Salon VIP",    icon: Bed },
    { name: "Appartement 4",      type: "Appartement Meublé",     subtitle: "Studio Prestige",          icon: Bed },
    { name: "Salle de Conférence",type: "Espace Événementiel",    subtitle: "Réceptions & Séminaires",  icon: Users },
    { name: "Général / Communs",  type: "Dépenses Structurelles", subtitle: "Réception & Entretien",    icon: Building },
  ];

  const selectedUnitTxs = transactions.filter((t) => t.unit === activeSelectedUnit);

  return (
    <div className="space-y-5 pb-4">

      {/* ── Banner ── */}
      <div className={`rounded-2xl p-5 border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark
          ? "bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-slate-800"
          : "bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border-transparent"
      }`}>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-500" />
            Logements &amp; Salle de Conférence
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Suivi individuel par appartement meublé et espace événementiel
          </p>
        </div>
        <button
          onClick={() => onOpenBookingForUnit(activeSelectedUnit)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Réserver {activeSelectedUnit}
        </button>
      </div>

      {/* ── Unit Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {unitsList.map((u) => {
          const summary = unitSummaries.find((s) => s.unit === u.name) || { recettes: 0, depenses: 0, solde: 0, count: 0 };
          const Icon = u.icon;
          const isSelected = activeSelectedUnit === u.name;

          return (
            <div
              key={u.name}
              onClick={() => setActiveSelectedUnit(u.name)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? isDark
                    ? "bg-slate-800 border-amber-500 shadow-md ring-1 ring-amber-500/40"
                    : "bg-amber-50 border-amber-500 shadow-md ring-1 ring-amber-500/20"
                  : isDark
                    ? "bg-slate-900 border-slate-800 hover:border-slate-700"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-amber-500 text-slate-950" : isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"
                  }`}>
                    <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                  </div>
                  <div>
                    <div className={`font-bold text-sm leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>{u.name}</div>
                    <div className="text-[10px] text-slate-400">{u.subtitle}</div>
                  </div>
                </div>
                {summary.recettes > 0 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-bold border border-emerald-500/20">
                    Actif
                  </span>
                )}
              </div>

              <div className={`grid grid-cols-2 gap-1.5 py-2 border-t border-b my-2 text-xs font-mono ${
                isDark ? "border-slate-700" : "border-slate-100"
              }`}>
                <div>
                  <span className="text-[9px] text-slate-400 block font-sans">Recettes</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">{formatCurrency(summary.recettes)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block font-sans">Dépenses</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 text-[11px]">{formatCurrency(summary.depenses)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className={`${isDark ? "text-slate-500" : "text-slate-400"}`}>{summary.count} op.</span>
                <span className={`font-bold font-mono ${
                  summary.solde >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}>
                  {formatCurrency(summary.solde)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Historique de l'unité sélectionnée ── */}
      <div className={`border rounded-2xl overflow-hidden ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-3 border-b ${
          isDark ? "border-slate-800 bg-slate-950/40" : "border-slate-100 bg-slate-50"
        }`}>
          <div>
            <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
              Historique —{" "}
              <span className="text-amber-500">{activeSelectedUnit}</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {selectedUnitTxs.length} mouvement{selectedUnitTxs.length !== 1 ? "s" : ""} · cliquer une ligne pour les détails
            </p>
          </div>
          <button
            onClick={() => onOpenBookingForUnit(activeSelectedUnit)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              isDark ? "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700" : "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200"
            }`}
          >
            + Saisir
          </button>
        </div>

        {/* Table */}
        {selectedUnitTxs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Aucune opération pour {activeSelectedUnit}
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className={`text-[10px] uppercase tracking-wider font-bold ${
              isDark ? "bg-slate-950 text-slate-500 border-b border-slate-800" : "bg-slate-50 text-slate-400 border-b border-slate-100"
            }`}>
              <tr>
                <th className="py-2.5 px-4 w-[90px]">Date</th>
                <th className="py-2.5 px-3 w-[60px]">N°</th>
                <th className="py-2.5 px-3">Libellé</th>
                <th className="py-2.5 px-3 w-[90px]">Catégorie</th>
                <th className="py-2.5 px-4 w-[110px] text-right text-emerald-500">Recette</th>
                <th className="py-2.5 px-4 w-[110px] text-right text-rose-500">Dépense</th>
                <th className="py-2.5 px-2 w-[90px]">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-slate-800/60" : "divide-slate-100"}`}>
              {selectedUnitTxs.map((tx) => {
                const isRec = (tx.recettes || 0) > 0;
                const hasTranche =
                  tx.libelle?.includes("TRANCHE") ||
                  tx.libelle?.includes("RESTE DÛ") ||
                  tx.libelle?.includes("AVANCE");
                return (
                  <tr
                    key={tx.id}
                    onClick={() => onViewDetail && onViewDetail(tx)}
                    className={`group transition-colors ${onViewDetail ? "cursor-pointer" : ""} ${
                      isDark ? "hover:bg-slate-800/50 text-slate-300" : "hover:bg-amber-50/40 text-slate-800"
                    }`}
                  >
                    <td className={`py-2.5 px-4 font-mono text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {formatDateDisplay(tx.date)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        isDark ? "bg-slate-800 text-slate-500 border-slate-700" : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}>
                        {tx.pieceNo || "—"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 max-w-[260px]">
                      <div className={`font-semibold truncate ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                        {tx.libelle}
                      </div>
                      {tx.clientName && (
                        <div className={`text-[10px] mt-0.5 ${isDark ? "text-amber-400/80" : "text-amber-700"}`}>
                          {tx.clientName}
                          {tx.resNights && tx.resNights > 0 ? ` · ${tx.resNights} nuit${tx.resNights > 1 ? "s" : ""}` : ""}
                        </div>
                      )}
                    </td>
                    <td className={`py-2.5 px-3 text-[11px] truncate max-w-[90px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      {tx.category}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {isRec ? formatCurrency(tx.recettes) : <span className="text-slate-300 dark:text-slate-700">—</span>}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums text-rose-600 dark:text-rose-400">
                      {!isRec && (tx.depenses || 0) > 0 ? formatCurrency(tx.depenses) : <span className="text-slate-300 dark:text-slate-700">—</span>}
                    </td>
                    {/* Actions — stopPropagation pour ne pas ouvrir le détail */}
                    <td className="py-2 px-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5">
                        {hasTranche && onCompleteInstallment && (
                          <button
                            onClick={() => onCompleteInstallment(tx)}
                            className="px-1.5 py-1 rounded-lg text-[9px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/30 transition-all"
                            title="Tranche suivante"
                          >
                            +T
                          </button>
                        )}
                        {onPrintReceipt && (
                          <button
                            onClick={() => onPrintReceipt(tx)}
                            className={`p-1.5 rounded-lg transition-all ${isDark ? "text-slate-500 hover:text-emerald-400 hover:bg-emerald-900/30" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"}`}
                            title="Imprimer le reçu"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onEditTx && onEditTx(tx)}
                          className={`p-1.5 rounded-lg transition-all ${isDark ? "text-slate-500 hover:text-amber-400 hover:bg-amber-900/30" : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"}`}
                          title="Modifier"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTx && onDeleteTx(tx.id)}
                          className={`p-1.5 rounded-lg transition-all ${isDark ? "text-slate-500 hover:text-rose-400 hover:bg-rose-900/30" : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"}`}
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};
