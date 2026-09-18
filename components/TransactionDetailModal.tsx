"use client";

import React, { useRef } from "react";
import { Transaction } from "@/types/finance";
import { formatCurrency, formatDateDisplay } from "@/lib/storage";
import {
  X,
  Printer,
  Calendar,
  Building2,
  Tag,
  CreditCard,
  User,
  Moon,
  Hash,
  TrendingUp,
  TrendingDown,
  Wallet,
  FileText,
  Trash2,
  Edit3,
  PlusCircle,
} from "lucide-react";

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
  onCompleteInstallment?: (tx: Transaction) => void;
  onPrintReceipt?: (tx: Transaction) => void;
  theme: "light" | "dark";
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onCompleteInstallment,
  onPrintReceipt,
  theme,
}) => {
  const isDark = theme === "dark";
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !transaction) return null;

  const tx = transaction;
  const isRec = (tx.recettes || 0) > 0;
  const isReservation =
    tx.category === "Loyers & Réservations" ||
    (tx.clientCni && tx.clientCni.length > 0) ||
    (tx.resStartDate && tx.resStartDate.length > 0);

  const hasTranche =
    tx.libelle?.includes("TRANCHE") ||
    tx.libelle?.includes("RESTE DÛ") ||
    tx.libelle?.includes("AVANCE");

  const handleDelete = () => {
    if (!onDelete) return;
    if (confirm("Supprimer définitivement cette opération ?")) {
      onDelete(tx.id);
      onClose();
    }
  };

  const handlePrint = () => {
    if (onPrintReceipt) {
      onPrintReceipt(tx);
    }
  };

  const Row = ({
    icon,
    label,
    value,
    mono = false,
    highlight,
  }: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    mono?: boolean;
    highlight?: "green" | "red" | "amber";
  }) => {
    const valueClass =
      highlight === "green"
        ? "text-emerald-600 dark:text-emerald-400"
        : highlight === "red"
        ? "text-rose-600 dark:text-rose-400"
        : highlight === "amber"
        ? "text-amber-600 dark:text-amber-400"
        : isDark
        ? "text-slate-100"
        : "text-slate-900";

    return (
      <div
        className={`flex items-start gap-3 py-2.5 border-b last:border-b-0 ${
          isDark ? "border-slate-800" : "border-slate-100"
        }`}
      >
        <div
          className={`mt-0.5 shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
            isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"
          }`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className={`text-[10px] uppercase font-bold tracking-wide ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            {label}
          </div>
          <div className={`text-sm font-semibold mt-0.5 ${mono ? "font-mono" : ""} ${valueClass}`}>
            {value}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] border ${
          isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
        }`}
      >
        {/* ── Header ── */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? "border-slate-800" : "border-slate-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isRec
                  ? "bg-emerald-500/15 border border-emerald-500/30"
                  : "bg-rose-500/15 border border-rose-500/30"
              }`}
            >
              <FileText
                className={`w-4 h-4 ${isRec ? "text-emerald-500" : "text-rose-500"}`}
              />
            </div>
            <div>
              <h3
                className={`font-black text-sm ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Détail de l'Opération
              </h3>
              <p
                className={`text-[11px] ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Pièce n° {tx.pieceNo || "—"} · {formatDateDisplay(tx.date)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${
              isDark
                ? "text-slate-400 hover:bg-slate-800"
                : "text-slate-400 hover:bg-slate-100"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Amount banner + Solde côte à côte */}
          <div className="grid grid-cols-2 gap-3">
            {/* Amount */}
            <div className={`flex items-center justify-between p-4 rounded-2xl border ${
              isRec
                ? isDark ? "bg-emerald-950/30 border-emerald-800/40" : "bg-emerald-50 border-emerald-200"
                : isDark ? "bg-rose-950/30 border-rose-800/40" : "bg-rose-50 border-rose-200"
            }`}>
              <div className="flex items-center gap-2">
                {isRec
                  ? <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  : <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  isRec ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
                }`}>{isRec ? "Recette" : "Dépense"}</span>
              </div>
              <div className={`text-xl font-black tabular-nums font-mono ${
                isRec ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"
              }`}>
                {formatCurrency(isRec ? tx.recettes : tx.depenses)}
              </div>
            </div>

            {/* Solde */}
            {tx.solde !== undefined && (
              <div className={`flex items-center justify-between p-4 rounded-2xl border ${
                isDark ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"
              }`}>
                <div className="flex items-center gap-2">
                  <Wallet className={`w-4 h-4 ${tx.solde >= 0 ? "text-amber-500" : "text-rose-500"}`} />
                  <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Solde après
                  </span>
                </div>
                <span className={`font-black font-mono text-lg tabular-nums ${
                  tx.solde >= 0 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
                }`}>
                  {formatCurrency(tx.solde)}
                </span>
              </div>
            )}
          </div>

          {/* Core + Reservation side by side when reservation exists */}
          <div className={isReservation ? "grid grid-cols-2 gap-3 items-start" : ""}>

            {/* Core details */}
            <div className={`rounded-xl border px-4 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
              <Row icon={<Calendar className="w-3.5 h-3.5" />} label="Date" value={formatDateDisplay(tx.date)} />
              <Row icon={<Hash className="w-3.5 h-3.5" />} label="N° Pièce" value={tx.pieceNo || "—"} mono />
              <Row
                icon={<FileText className="w-3.5 h-3.5" />}
                label="Libellé"
                value={<span className="text-xs leading-relaxed break-words">{tx.libelle}</span>}
              />
              <Row icon={<Building2 className="w-3.5 h-3.5" />} label="Unité / Logement" value={tx.unit} />
              <Row icon={<Tag className="w-3.5 h-3.5" />} label="Catégorie" value={tx.category} />
            </div>

            {/* Reservation details */}
            {isReservation && (
              <div className={`rounded-xl border px-4 ${
                isDark ? "border-amber-800/40 bg-amber-950/20" : "border-amber-200 bg-amber-50"
              }`}>
                <div className={`text-[10px] font-black uppercase tracking-widest py-2 border-b ${
                  isDark ? "text-amber-500 border-amber-800/40" : "text-amber-700 border-amber-200"
                }`}>
                  Informations Réservation
                </div>
                {tx.clientName && (
                  <Row icon={<User className="w-3.5 h-3.5" />} label="Client" value={tx.clientName} highlight="amber" />
                )}
                {tx.clientCni && (
                  <Row icon={<CreditCard className="w-3.5 h-3.5" />} label="N° CNI" value={tx.clientCni} mono />
                )}
                {tx.resStartDate && tx.resEndDate && (
                  <Row
                    icon={<Calendar className="w-3.5 h-3.5" />}
                    label="Période"
                    value={`${formatDateDisplay(tx.resStartDate)} → ${formatDateDisplay(tx.resEndDate)}`}
                  />
                )}
                {tx.resNights && tx.resNights > 0 ? (
                  <Row icon={<Moon className="w-3.5 h-3.5" />} label="Durée" value={`${tx.resNights} nuit${tx.resNights > 1 ? "s" : ""}`} highlight="amber" />
                ) : null}
                {tx.resTotalContract && tx.resTotalContract > 0 ? (
                  <Row icon={<Wallet className="w-3.5 h-3.5" />} label="Total Contrat" value={formatCurrency(tx.resTotalContract)} mono highlight="green" />
                ) : null}
                {tx.resTrancheType && (
                  <Row icon={<Hash className="w-3.5 h-3.5" />} label="Tranche" value={tx.resTrancheType} />
                )}

                {/* Services additionnels */}
                {tx.resServices && tx.resServices.length > 0 && (
                  <div className={`mt-1 pt-2 border-t ${isDark ? "border-amber-800/40" : "border-amber-200"}`}>
                    <div className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? "text-amber-500" : "text-amber-700"}`}>
                      Services Additionnels
                    </div>
                    <div className="space-y-1.5">
                      {tx.resServices.map(sv => (
                        <div key={sv.id} className={`flex items-center justify-between text-xs py-1 border-b last:border-b-0 ${isDark ? "border-slate-700/50" : "border-amber-100"}`}>
                          <span className={isDark ? "text-slate-300" : "text-slate-700"}>
                            {sv.label}
                            <span className={`ml-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>× {sv.qty}</span>
                          </span>
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                            {(sv.qty * sv.unitPrice).toLocaleString("fr-FR")} F
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between text-xs pt-1 font-black">
                        <span className={isDark ? "text-slate-200" : "text-slate-700"}>Sous-total services</span>
                        <span className="font-mono text-amber-600 dark:text-amber-400">
                          {tx.resServices.reduce((s, sv) => s + sv.qty * sv.unitPrice, 0).toLocaleString("fr-FR")} F
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between gap-2 shrink-0 ${
            isDark
              ? "border-slate-800 bg-slate-950/40"
              : "border-slate-100 bg-slate-50"
          }`}
        >
          {/* Left : Supprimer */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                isDark
                  ? "border-slate-700 text-slate-400 hover:bg-slate-800"
                  : "border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Fermer
            </button>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-rose-500/40 text-rose-500 hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Supprimer
              </button>
            )}
          </div>

          {/* Right : Tranche + Modifier + Imprimer */}
          <div className="flex gap-2 flex-wrap justify-end">
            {hasTranche && onCompleteInstallment && (
              <button
                onClick={() => { onClose(); onCompleteInstallment(tx); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/10 border border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Tranche suivante
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => { onClose(); onEdit(tx); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  isDark
                    ? "border-slate-600 text-slate-300 hover:bg-slate-800"
                    : "border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Modifier
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimer le Reçu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
