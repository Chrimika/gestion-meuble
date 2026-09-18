"use client";

import React, { useState, useMemo } from "react";
import { Transaction, PropertyUnit } from "@/types/finance";
import { formatCurrency, formatDateDisplay } from "@/lib/storage";
import { X, Printer, CheckSquare, Square, Filter } from "lucide-react";
import { ReceiptContent } from "@/components/PrintReceiptModal";
import { PrintPortal } from "@/components/PrintPortal";

interface BulkPrintModalProps {
  transactions: Transaction[];
  isOpen: boolean;
  onClose: () => void;
  theme: "light" | "dark";
}

const UNIT_OPTIONS: PropertyUnit[] = [
  "Appartement 1",
  "Appartement 2",
  "Appartement 3",
  "Appartement 4",
  "Salle de Conférence",
  "Général / Communs",
];

export const BulkPrintModal: React.FC<BulkPrintModalProps> = ({
  transactions,
  isOpen,
  onClose,
  theme,
}) => {
  const isDark = theme === "dark";
  const [filterUnit, setFilterUnit] = useState<"ALL" | PropertyUnit>("ALL");
  const [filterType, setFilterType] = useState<"ALL" | "RECETTE" | "DEPENSE">("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [allSelected, setAllSelected] = useState(true);

  const today = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const unitOk = filterUnit === "ALL" || tx.unit === filterUnit;
      const typeOk =
        filterType === "ALL"
          ? true
          : filterType === "RECETTE"
          ? (tx.recettes || 0) > 0
          : (tx.depenses || 0) > 0;
      return unitOk && typeOk;
    });
  }, [transactions, filterUnit, filterType]);

  // Re-sélectionner tout quand les filtres changent et qu'on était en "tout sélectionné"
  React.useEffect(() => {
    if (allSelected) setSelectedIds(new Set(filtered.map((t) => t.id)));
  }, [filtered, allSelected]);

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setAllSelected(false);
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
      setAllSelected(false);
    } else {
      setSelectedIds(new Set(filtered.map((t) => t.id)));
      setAllSelected(true);
    }
  };

  const selectedTxs = filtered.filter((t) => selectedIds.has(t.id));

  if (!isOpen) return null;

  return (
    <>
      {/* ── Modal screen ── */}
      <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div
          className={`w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col border ${
            isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
          }`}
          style={{ maxHeight: "88vh" }}
        >
          {/* Header */}
          <div
            className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
              isDark ? "border-slate-800" : "border-slate-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                <Printer className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <h3 className={`font-black text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                  Impression des Reçus
                </h3>
                <p className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  Sélectionnez les opérations — chaque reçu sera imprimé sur sa propre page
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg ${
                isDark ? "text-slate-400 hover:bg-slate-800" : "text-slate-400 hover:bg-slate-100"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filtres */}
          <div
            className={`px-5 py-3 border-b flex flex-wrap items-center gap-2 shrink-0 ${
              isDark ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-100"
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-amber-500 shrink-0" />

            <select
              value={filterUnit}
              onChange={(e) => { setFilterUnit(e.target.value as any); setAllSelected(true); }}
              className={`border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none ${
                isDark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
              }`}
            >
              <option value="ALL">Tous les logements</option>
              {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>

            <div className={`flex rounded-lg border overflow-hidden text-xs ${isDark ? "border-slate-700" : "border-slate-300"}`}>
              {(["ALL", "RECETTE", "DEPENSE"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setFilterType(t); setAllSelected(true); }}
                  className={`px-3 py-1.5 font-semibold transition-colors ${
                    filterType === t
                      ? t === "RECETTE" ? "bg-emerald-600 text-white"
                        : t === "DEPENSE" ? "bg-rose-600 text-white"
                        : isDark ? "bg-slate-700 text-white" : "bg-slate-800 text-white"
                      : isDark ? "bg-slate-900 text-slate-400 hover:text-slate-200" : "bg-white text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t === "ALL" ? "Tous" : t === "RECETTE" ? "Recettes" : "Dépenses"}
                </button>
              ))}
            </div>

            <span className={`text-xs font-medium ml-auto ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {selectedIds.size} / {filtered.length} sélectionné{selectedIds.size > 1 ? "s" : ""}
            </span>
          </div>

          {/* Liste */}
          <div className="flex-1 overflow-y-auto">
            {/* Tout sélectionner */}
            <div
              onClick={toggleAll}
              className={`flex items-center gap-3 px-5 py-2.5 border-b cursor-pointer ${
                isDark
                  ? "bg-slate-950/30 border-slate-800 hover:bg-slate-800/50"
                  : "bg-slate-50 border-slate-100 hover:bg-slate-100"
              }`}
            >
              {selectedIds.size === filtered.length && filtered.length > 0
                ? <CheckSquare className="w-4 h-4 text-indigo-500 shrink-0" />
                : <Square className="w-4 h-4 text-slate-400 shrink-0" />
              }
              <span className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {selectedIds.size === filtered.length ? "Tout désélectionner" : "Tout sélectionner"}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Aucune opération pour ces critères
              </div>
            ) : (
              filtered.map((tx) => {
                const isRec = (tx.recettes || 0) > 0;
                const checked = selectedIds.has(tx.id);
                return (
                  <div
                    key={tx.id}
                    onClick={() => toggleOne(tx.id)}
                    className={`flex items-center gap-3 px-5 py-2.5 border-b cursor-pointer transition-colors ${
                      checked
                        ? isDark ? "bg-indigo-950/20" : "bg-indigo-50/60"
                        : ""
                    } ${isDark ? "border-slate-800 hover:bg-slate-800/40" : "border-slate-100 hover:bg-slate-50"}`}
                  >
                    {checked
                      ? <CheckSquare className="w-4 h-4 text-indigo-500 shrink-0" />
                      : <Square className="w-4 h-4 text-slate-300 shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-semibold truncate ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                        {tx.libelle}
                      </div>
                      <div className={`text-[10px] mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {formatDateDisplay(tx.date)} · {tx.unit}
                        {tx.clientName ? ` · ${tx.clientName}` : ""}
                        {tx.resNights && tx.resNights > 0 ? ` · ${tx.resNights} nuit${tx.resNights > 1 ? "s" : ""}` : ""}
                      </div>
                    </div>
                    <div className={`text-xs font-black font-mono tabular-nums shrink-0 ${
                      isRec ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}>
                      {isRec ? "+" : "−"}{formatCurrency(isRec ? tx.recettes : tx.depenses)}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div
            className={`px-5 py-3 border-t flex items-center justify-between gap-2 shrink-0 ${
              isDark ? "border-slate-800 bg-slate-950/40" : "border-slate-100 bg-slate-50"
            }`}
          >
            <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {selectedTxs.length > 0
                ? `${selectedTxs.length} page${selectedTxs.length > 1 ? "s" : ""} à imprimer`
                : "Aucune sélection"}
            </span>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                  isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Annuler
              </button>
              <button
                onClick={() => selectedTxs.length > 0 && window.print()}
                disabled={selectedTxs.length === 0}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-black rounded-xl shadow transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimer {selectedTxs.length > 0 ? `${selectedTxs.length} reçu${selectedTxs.length > 1 ? "s" : ""}` : ""}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Zone print-only via portail — enfant direct du body ── */}
      <PrintPortal>
        {selectedTxs.map((tx, idx) => {
          const isRec = (tx.recettes || 0) > 0;
          const isReservation =
            tx.category === "Loyers & Réservations" ||
            Boolean(tx.clientCni) ||
            Boolean(tx.resStartDate);
          const isLast = idx === selectedTxs.length - 1;

          return (
            <div
              key={tx.id}
              style={{ pageBreakAfter: isLast ? "auto" : "always", breakAfter: isLast ? "auto" : "page" }}
            >
              <ReceiptContent
                tx={tx}
                isRec={isRec}
                isReservation={isReservation}
                today={today}
                forPrint
              />
            </div>
          );
        })}
      </PrintPortal>
    </>
  );
};
