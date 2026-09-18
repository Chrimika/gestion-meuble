"use client";

import React, { useRef } from "react";
import { Transaction } from "@/types/finance";
import { formatCurrency, formatDateDisplay } from "@/lib/storage";
import { X, Printer } from "lucide-react";
import { PrintPortal } from "@/components/PrintPortal";

interface PrintReceiptModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  theme: "light" | "dark";
}

/**
 * Modal that shows a printable receipt for a single transaction.
 * Pressing "Imprimer" triggers window.print() which only renders .print-page.
 */
export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  transaction,
  isOpen,
  onClose,
  theme,
}) => {
  const isDark = theme === "dark";
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !transaction) return null;

  const tx = transaction;
  const isRec = (tx.recettes || 0) > 0;
  const isReservation =
    tx.category === "Loyers & Réservations" ||
    Boolean(tx.clientCni) ||
    Boolean(tx.resStartDate);

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <>
      {/* ── Screen modal (no-print) ── */}
      <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div
          className={`w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] border ${
            isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
          }`}
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
                  Aperçu du Reçu
                </h3>
                <p className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {isRec ? "Reçu de recette" : "Reçu de dépense"} · Pièce {tx.pieceNo || "—"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg ${isDark ? "text-slate-400 hover:bg-slate-800" : "text-slate-400 hover:bg-slate-100"}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Receipt preview */}
          <div className="flex-1 overflow-y-auto p-5">
            <div
              className={`border rounded-xl overflow-hidden text-sm ${
                isDark ? "border-slate-700" : "border-slate-300"
              }`}
            >
              <ReceiptContent tx={tx} isRec={isRec} isReservation={isReservation} today={today} />
            </div>
          </div>

          {/* Footer */}
          <div
            className={`px-5 py-3 border-t flex justify-between items-center shrink-0 ${
              isDark ? "border-slate-800 bg-slate-950/40" : "border-slate-100 bg-slate-50"
            }`}
          >
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Fermer
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-md transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimer
            </button>
          </div>
        </div>
      </div>

      {/* ── Print-only version — portail vers document.body ── */}
      <PrintPortal>
        <ReceiptContent tx={tx} isRec={isRec} isReservation={isReservation} today={today} forPrint />
      </PrintPortal>
    </>
  );
};

/* ─── Shared receipt layout (screen + print) — exporté pour réutilisation ─── */
export function ReceiptContent({
  tx,
  isRec,
  isReservation,
  today,
  forPrint = false,
}: {
  tx: Transaction;
  isRec: boolean;
  isReservation: boolean;
  today: string;
  forPrint?: boolean;
}) {
  const base = forPrint
    ? "bg-white text-black"
    : "bg-white text-slate-900";

  return (
    <div className={`print-page ${base} font-sans`} style={forPrint ? { width: "80mm", padding: "12px", fontSize: 11 } : {}}>
      {/* Letterhead */}
      <div style={{ textAlign: "center", borderBottom: "2px solid #000", paddingBottom: 8, marginBottom: 10 }}>
        {/* Logo + nom sur la même ligne */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 6 }}>
          <img
            src="/logo.jpeg"
            alt="St Raphaël"
            style={{ width: forPrint ? 44 : 52, height: forPrint ? 44 : 52, borderRadius: 8, objectFit: "cover", border: "1px solid #ddd" }}
          />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 900, fontSize: forPrint ? 14 : 17, letterSpacing: "-0.5px", lineHeight: 1.1 }}>
              RÉSIDENCE ST RAPHAËL
            </div>
            <div style={{ fontSize: forPrint ? 8 : 10, color: "#555", marginTop: 2 }}>
              Immeuble rose, Carrefour Ekoumdoum · Yaoundé
            </div>
            <div style={{ fontSize: forPrint ? 8 : 10, color: "#555" }}>
              Tél : +237 656 448 821 · raphaelhome1929@gmail.com
            </div>
          </div>
        </div>
        <div style={{ marginTop: 6, fontWeight: 900, fontSize: forPrint ? 12 : 14, textTransform: "uppercase", letterSpacing: "1px" }}>
          {isRec ? "✦ REÇU DE PAIEMENT ✦" : "✦ BON DE DÉPENSE ✦"}
        </div>
      </div>

      {/* Meta */}
      <table style={{ width: "100%", fontSize: forPrint ? 10 : 12, marginBottom: 8 }}>
        <tbody>
          <TRow label="N° Pièce" value={tx.pieceNo || "—"} />
          <TRow label="Date opération" value={formatDateDisplay(tx.date)} />
          <TRow label="Émis le" value={today} />
        </tbody>
      </table>

      {/* Amount */}
      <div style={{
        border: "2px solid #000",
        borderRadius: 6,
        padding: "10px 14px",
        marginBottom: 8,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{ fontWeight: 700, fontSize: forPrint ? 10 : 12 }}>{isRec ? "MONTANT REÇU" : "MONTANT DÉPENSÉ"}</span>
        <span style={{ fontWeight: 900, fontSize: forPrint ? 15 : 18, fontFamily: "monospace" }}>
          {formatCurrency(isRec ? tx.recettes : tx.depenses)}
        </span>
      </div>

      {/* Details */}
      <table style={{ width: "100%", fontSize: forPrint ? 10 : 12, marginBottom: 8 }}>
        <tbody>
          <TRow label="Libellé" value={tx.libelle} />
          <TRow label="Unité / Logement" value={tx.unit} />
          <TRow label="Catégorie" value={tx.category} />
        </tbody>
      </table>

      {/* Reservation block */}
      {isReservation && (
        <div style={{ borderTop: "1px dashed #000", paddingTop: 6, marginBottom: 6 }}>
          <div style={{ fontWeight: 900, fontSize: forPrint ? 10 : 12, textTransform: "uppercase", marginBottom: 4 }}>
            Détails Réservation
          </div>
          <table style={{ width: "100%", fontSize: forPrint ? 10 : 12, marginBottom: 6 }}>
            <tbody>
              {tx.clientName && <TRow label="Client" value={tx.clientName} />}
              {tx.clientCni && <TRow label="N° CNI" value={tx.clientCni} />}
              {tx.resStartDate && tx.resEndDate && (
                <TRow label="Séjour" value={`${formatDateDisplay(tx.resStartDate)} → ${formatDateDisplay(tx.resEndDate)}`} />
              )}
              {tx.resNights && tx.resNights > 0
                ? <TRow label="Durée" value={`${tx.resNights} nuit${tx.resNights > 1 ? "s" : ""}`} />
                : null}
              {tx.resTrancheType && <TRow label="Tranche" value={tx.resTrancheType} />}
            </tbody>
          </table>

          {/* ── Détail ligne Loyer ── */}
          <table style={{ width: "100%", fontSize: forPrint ? 9 : 11, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ccc" }}>
                <th style={{ textAlign: "left", color: "#555", fontWeight: 700, paddingBottom: 3 }}>Désignation</th>
                <th style={{ textAlign: "center", color: "#555", fontWeight: 700, paddingBottom: 3, width: 30 }}>Qté</th>
                <th style={{ textAlign: "right", color: "#555", fontWeight: 700, paddingBottom: 3 }}>Montant</th>
              </tr>
            </thead>
            <tbody>
              {/* Ligne loyer */}
              <tr>
                <td style={{ paddingTop: 3, paddingBottom: 2 }}>
                  Loyer / Location {tx.unit}
                  {tx.resNights && tx.resNights > 0 ? ` (${tx.resNights} nuit${tx.resNights > 1 ? "s" : ""})` : ""}
                </td>
                <td style={{ textAlign: "center", paddingTop: 3, paddingBottom: 2 }}>1</td>
                <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 700, paddingTop: 3, paddingBottom: 2 }}>
                  {formatCurrency(isRec ? tx.recettes - (tx.resServices || []).reduce((s, sv) => s + sv.qty * sv.unitPrice, 0) : tx.depenses)}
                </td>
              </tr>

              {/* Lignes services */}
              {(tx.resServices || []).map(sv => (
                <tr key={sv.id}>
                  <td style={{ paddingBottom: 2, color: "#333" }}>{sv.label}</td>
                  <td style={{ textAlign: "center", paddingBottom: 2 }}>{sv.qty}</td>
                  <td style={{ textAlign: "right", fontFamily: "monospace", paddingBottom: 2 }}>
                    {(sv.qty * sv.unitPrice).toLocaleString("fr-FR")} F
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "2px solid #000" }}>
                <td colSpan={2} style={{ paddingTop: 4, fontWeight: 900, fontSize: forPrint ? 11 : 13 }}>
                  TOTAL
                </td>
                <td style={{ paddingTop: 4, textAlign: "right", fontFamily: "monospace", fontWeight: 900, fontSize: forPrint ? 11 : 13 }}>
                  {formatCurrency(isRec ? tx.recettes : tx.depenses)}
                </td>
              </tr>
              {tx.resTotalContract && tx.resTotalContract > 0 && (
                <tr>
                  <td colSpan={2} style={{ paddingTop: 2, fontSize: forPrint ? 9 : 11, color: "#555" }}>
                    Montant total contrat
                  </td>
                  <td style={{ paddingTop: 2, textAlign: "right", fontFamily: "monospace", fontSize: forPrint ? 9 : 11, color: "#555" }}>
                    {formatCurrency(tx.resTotalContract)}
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      )}

      {/* Signature line */}
      <div style={{ borderTop: "1px solid #000", paddingTop: 8, marginTop: 10, display: "flex", justifyContent: "space-between" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ borderTop: "1px solid #999", width: 100, marginBottom: 2 }} />
          <div style={{ fontSize: 9, color: "#666" }}>Signature Client</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ borderTop: "1px solid #999", width: 100, marginBottom: 2 }} />
          <div style={{ fontSize: 9, color: "#666" }}>Signature Gestionnaire</div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 8, fontSize: 8, color: "#999" }}>
        Document généré par ImmoGestion PRO · {today}
      </div>
    </div>
  );
}

function TRow({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <tr>
      <td style={{ color: "#666", paddingRight: 8, paddingBottom: 2, whiteSpace: "nowrap", verticalAlign: "top" }}>{label} :</td>
      <td style={{ fontWeight: bold ? 700 : 500, paddingBottom: 2 }}>{value}</td>
    </tr>
  );
}
