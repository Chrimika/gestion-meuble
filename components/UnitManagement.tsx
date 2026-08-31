"use client";

import React, { useState } from "react";
import { Transaction, PropertyUnit } from "@/types/finance";
import { getBreakdownByUnit, formatCurrency, formatDateDisplay } from "@/lib/storage";
import { 
  Building, 
  Bed, 
  Users, 
  PlusCircle
} from "lucide-react";

interface UnitManagementProps {
  transactions: Transaction[];
  theme: "light" | "dark";
  onOpenBookingForUnit: (unit: PropertyUnit) => void;
}

export const UnitManagement: React.FC<UnitManagementProps> = ({
  transactions,
  theme,
  onOpenBookingForUnit,
}) => {
  const isDark = theme === "dark";
  const [activeSelectedUnit, setActiveSelectedUnit] = useState<PropertyUnit>("Appartement 1");
  const unitSummaries = getBreakdownByUnit(transactions);

  const unitsList: { name: PropertyUnit; type: string; subtitle: string; icon: any }[] = [
    { name: "Appartement 1", type: "Appartement Meublé", subtitle: "2 Chambres & Salon", icon: Bed },
    { name: "Appartement 2", type: "Appartement Meublé", subtitle: "2 Chambres & Salon", icon: Bed },
    { name: "Appartement 3", type: "Appartement Meublé", subtitle: "1 Chambre & Salon VIP", icon: Bed },
    { name: "Appartement 4", type: "Appartement Meublé", subtitle: "Studio Prestige", icon: Bed },
    { name: "Salle de Conférence", type: "Espace Événementiel", subtitle: "Réceptions & Séminaires", icon: Users },
    { name: "Général / Communs", type: "Dépenses Structurelles", subtitle: "Réception & Entretien", icon: Building },
  ];

  const selectedUnitTxs = transactions.filter((t) => t.unit === activeSelectedUnit);

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className={`border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div>
          <h2 className={`text-2xl font-black tracking-tight flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
            <Building className="w-6 h-6 text-amber-500" />
            Gestion des Logements & Salle de Conférence
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Suivi individuel des recettes et dépenses par appartement meublé et espace événementiel.
          </p>
        </div>
        <button
          onClick={() => onOpenBookingForUnit(activeSelectedUnit)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Réserver {activeSelectedUnit}
        </button>
      </div>

      {/* Property Units Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {unitsList.map((u) => {
          const summary = unitSummaries.find((s) => s.unit === u.name) || {
            recettes: 0,
            depenses: 0,
            solde: 0,
            count: 0,
          };
          const Icon = u.icon;
          const isSelected = activeSelectedUnit === u.name;

          return (
            <div
              key={u.name}
              onClick={() => setActiveSelectedUnit(u.name)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? isDark
                    ? "bg-slate-800/90 border-amber-500 shadow-md ring-1 ring-amber-500/50"
                    : "bg-amber-50/60 border-amber-500 shadow-md ring-1 ring-amber-500/30"
                  : isDark
                    ? "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                    : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected
                      ? "bg-amber-500 text-slate-950"
                      : isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-base leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>{u.name}</h3>
                    <span className="text-[11px] text-slate-400">{u.type}</span>
                  </div>
                </div>
                {summary.recettes > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-bold border border-emerald-500/20">
                    Actif
                  </span>
                )}
              </div>

              <div className={`grid grid-cols-2 gap-2 py-2 border-t border-b my-2 text-xs font-mono ${
                isDark ? "border-slate-800" : "border-slate-100"
              }`}>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Recettes</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(summary.recettes)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Dépenses</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(summary.depenses)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-400 font-medium">{summary.count} op.</span>
                <span className={`font-bold font-mono ${
                  summary.solde >= 0
                    ? isDark ? "text-emerald-400" : "text-emerald-600"
                    : isDark ? "text-rose-400" : "text-rose-600"
                }`}>
                  Solde: {formatCurrency(summary.solde)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Unit Movement History */}
      <div className={`border rounded-2xl p-5 shadow-sm space-y-4 ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className={`flex items-center justify-between border-b pb-3 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
          <div>
            <h3 className={`font-bold text-lg flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
              Historique - <span className="text-amber-500">{activeSelectedUnit}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {selectedUnitTxs.length} mouvement(s) pour cette unité.
            </p>
          </div>
          <button
            onClick={() => onOpenBookingForUnit(activeSelectedUnit)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              isDark ? "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700" : "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200"
            }`}
          >
            + Saisir pour {activeSelectedUnit}
          </button>
        </div>

        {selectedUnitTxs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Aucune opération enregistrée directement pour {activeSelectedUnit}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`uppercase text-[10px] tracking-wider font-semibold ${
                isDark ? "bg-slate-950 text-slate-400" : "bg-slate-50 text-slate-500"
              }`}>
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">N° Pièce</th>
                  <th className="py-2.5 px-3">Libellé</th>
                  <th className="py-2.5 px-3">Catégorie</th>
                  <th className="py-2.5 px-3 text-right">Recette</th>
                  <th className="py-2.5 px-3 text-right">Dépense</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-800/60" : "divide-slate-100"}`}>
                {selectedUnitTxs.map((tx) => (
                  <tr key={tx.id} className={`transition-colors ${isDark ? "hover:bg-slate-800/40 text-slate-300" : "hover:bg-slate-50 text-slate-800"}`}>
                    <td className="py-2.5 px-3 font-mono">{formatDateDisplay(tx.date)}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{tx.pieceNo || "-"}</td>
                    <td className={`py-2.5 px-3 font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{tx.libelle}</td>
                    <td className="py-2.5 px-3 text-slate-400">{tx.category}</td>
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
        )}
      </div>

    </div>
  );
};
