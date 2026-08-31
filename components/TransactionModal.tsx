"use client";

import React, { useState, useEffect } from "react";
import { Transaction, PropertyUnit, Category, CategoryItem, InstallmentPreFill } from "@/types/finance";
import { X, Sparkles, Building2, Tag } from "lucide-react";
import { DateInput } from "@/components/DateInput";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txData: Partial<Transaction>) => void;
  editingTransaction?: Transaction | null;
  installmentPreFill?: InstallmentPreFill | null;
  theme: "light" | "dark";
  categories?: CategoryItem[];
  onOpenCategoryManager?: () => void;
  defaultUnit?: PropertyUnit;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  installmentPreFill,
  theme,
  categories = [],
  onOpenCategoryManager,
  defaultUnit,
}) => {
  const isDark = theme === "dark";
  const [mode, setMode] = useState<"STANDARD" | "RESERVATION">("STANDARD");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [pieceNo, setPieceNo] = useState<string>("");
  const [libelle, setLibelle] = useState<string>("");
  const [unit, setUnit] = useState<PropertyUnit>("Général / Communs");
  const [category, setCategory] = useState<Category>("Fournitures & Linge");
  const [entryType, setEntryType] = useState<"RECETTE" | "DEPENSE">("DEPENSE");
  const [amount, setAmount] = useState<string>("");
  const [resUnit, setResUnit] = useState<PropertyUnit>("Appartement 1");
  const [resClient, setResClient] = useState<string>("");
  const [resStartDate, setResStartDate] = useState<string>("");
  const [resEndDate, setResEndDate] = useState<string>("");
  const [resPaymentType, setResPaymentType] = useState<"TOTAL" | "TRANCHE">("TOTAL");
  const [resTrancheType, setResTrancheType] = useState<string>("1ère Tranche (Acompte)");
  const [resCustomTranche, setResCustomTranche] = useState<string>("");
  const [resTotalContract, setResTotalContract] = useState<string>("");

  useEffect(() => {
    if (editingTransaction) {
      setMode("STANDARD");
      setDate(editingTransaction.date || "");
      setPieceNo(editingTransaction.pieceNo || "");
      setLibelle(editingTransaction.libelle || "");
      setUnit(editingTransaction.unit || "Général / Communs");
      setCategory(editingTransaction.category || "Autres");
      if ((editingTransaction.recettes || 0) > 0) {
        setEntryType("RECETTE");
        setAmount(editingTransaction.recettes.toString());
      } else {
        setEntryType("DEPENSE");
        setAmount(editingTransaction.depenses?.toString() || "");
      }
    } else if (installmentPreFill) {
      setMode("RESERVATION");
      setDate(new Date().toISOString().split("T")[0]);
      setPieceNo("");
      setResUnit(installmentPreFill.unit);
      setResClient(installmentPreFill.client);
      setResStartDate(installmentPreFill.startDate);
      setResEndDate(installmentPreFill.endDate);
      setResPaymentType("TRANCHE");
      setResTrancheType(installmentPreFill.trancheType || "2ème Tranche");
      setResCustomTranche("");
      setResTotalContract(installmentPreFill.totalContract || "");
      setAmount(installmentPreFill.defaultAmount || "");
      setEntryType("RECETTE");
      setCategory("Loyers & Réservations");
    } else {
      setDate(new Date().toISOString().split("T")[0]);
      setPieceNo("");
      setLibelle("");
      setUnit(defaultUnit || "Général / Communs");
      setCategory("Fournitures & Linge");
      setEntryType("DEPENSE");
      setAmount("");
      setResUnit(defaultUnit || "Appartement 1");
      setResClient("");
      setResStartDate("");
      setResEndDate("");
      setResPaymentType("TOTAL");
      setResTrancheType("1ère Tranche (Acompte)");
      setResCustomTranche("");
      setResTotalContract("");
    }
  }, [editingTransaction, installmentPreFill, isOpen, defaultUnit]);

  useEffect(() => {
    if (mode === "RESERVATION") {
      const formatF = (dStr: string) => {
        const parts = dStr.split("-");
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dStr;
      };
      let formattedLibelle = `LOCATION ${resUnit.toUpperCase()}`;
      if (resStartDate && resEndDate) {
        formattedLibelle += ` DU ${formatF(resStartDate)} AU ${formatF(resEndDate)}`;
      }
      if (resClient) {
        formattedLibelle += ` (PAR ${resClient.toUpperCase()})`;
      }

      if (resPaymentType === "TOTAL") {
        formattedLibelle += " - REGLEMENT TOTAL";
      } else {
        const trancheLabelStr = resTrancheType === "Personnalisée" 
          ? (resCustomTranche.trim() || "TRANCHE")
          : resTrancheType;

        const currentAmt = parseFloat(amount) || 0;
        const totalContractAmt = parseFloat(resTotalContract) || 0;

        if (totalContractAmt > 0) {
          const reste = Math.max(0, totalContractAmt - currentAmt);
          const fmtAmt = currentAmt.toLocaleString("fr-FR");
          const fmtTot = totalContractAmt.toLocaleString("fr-FR");
          const fmtReste = reste.toLocaleString("fr-FR");
          formattedLibelle += ` - ${trancheLabelStr.toUpperCase()} (${fmtAmt} F / TOTAL: ${fmtTot} F - RESTE DÛ: ${fmtReste} F)`;
        } else {
          formattedLibelle += ` - ${trancheLabelStr.toUpperCase()}`;
        }
      }

      setLibelle(formattedLibelle);
      setUnit(resUnit);
      setCategory("Loyers & Réservations");
      setEntryType("RECETTE");
    }
  }, [
    mode, 
    resUnit, 
    resClient, 
    resStartDate, 
    resEndDate, 
    resPaymentType, 
    resTrancheType, 
    resCustomTranche, 
    resTotalContract,
    amount
  ]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount) || 0;
    const payload: Partial<Transaction> = {
      date,
      pieceNo: pieceNo.trim() || "-",
      libelle: libelle.trim(),
      unit,
      category,
      recettes: entryType === "RECETTE" ? numAmount : 0,
      depenses: entryType === "DEPENSE" ? numAmount : 0,
    };
    if (editingTransaction?.id) {
      payload.id = editingTransaction.id;
    }
    onSave(payload);
    onClose();
  };

  const unitOptions: PropertyUnit[] = [
    "Appartement 1",
    "Appartement 2",
    "Appartement 3",
    "Appartement 4",
    "Salle de Conférence",
    "Général / Communs",
  ];

  const defaultCategoryOptions = [
    "Loyers & Réservations",
    "Entretien & Travaux",
    "Fournitures & Linge",
    "Salaires & Personnel",
    "Charges & Énergie",
    "Transport & Com",
    "Autres",
  ];

  const categoryOptions: string[] = categories.length > 0
    ? categories.map((c) => c.name)
    : defaultCategoryOptions;

  // Shared input style
  const inputClass = `w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-colors ${
    isDark
      ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500"
      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
  }`;

  const selectClass = `w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-colors ${
    isDark
      ? "bg-slate-950 border-slate-800 text-slate-100"
      : "bg-slate-50 border-slate-200 text-slate-900"
  }`;

  const labelClass = `text-xs font-semibold block mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div
        className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border ${
          isDark
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-200"
        }`}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? "border-slate-800" : "border-slate-100"
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className={`font-black text-base ${isDark ? "text-white" : "text-slate-900"}`}>
              {editingTransaction ? "Modifier l'Opération" : "Saisir une Nouvelle Opération"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        {!editingTransaction && (
          <div className={`flex p-2 border-b ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-100"}`}>
            <button
              type="button"
              onClick={() => setMode("STANDARD")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === "STANDARD"
                  ? isDark
                    ? "bg-slate-800 text-white shadow-sm"
                    : "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Saisie Standard
            </button>
            <button
              type="button"
              onClick={() => setMode("RESERVATION")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === "RESERVATION"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : isDark ? "text-slate-400 hover:text-amber-400" : "text-slate-500 hover:text-amber-600"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Assistant Réservation
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          {/* Reservation Wizard */}
          {mode === "RESERVATION" && !editingTransaction && (
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-200"
            }`}>
              <div className="text-xs font-black text-amber-600 uppercase tracking-wider">
                Générateur de Réservation / Loyer
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Logement / Salle</label>
                  <select value={resUnit} onChange={(e) => setResUnit(e.target.value as PropertyUnit)} className={selectClass}>
                    <option>Appartement 1</option>
                    <option>Appartement 2</option>
                    <option>Appartement 3</option>
                    <option>Appartement 4</option>
                    <option>Salle de Conférence</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Client / Réservant</label>
                  <input
                    type="text"
                    placeholder="Ex: MR NLOGA"
                    value={resClient}
                    onChange={(e) => setResClient(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Date d'arrivée (JJ/MM/AAAA)</label>
                  <DateInput
                    value={resStartDate}
                    onChange={(val) => setResStartDate(val)}
                    className={inputClass}
                    isDark={isDark}
                    placeholder="JJ/MM/AAAA"
                  />
                </div>
                <div>
                  <label className={labelClass}>Date de départ (JJ/MM/AAAA)</label>
                  <DateInput
                    value={resEndDate}
                    onChange={(val) => setResEndDate(val)}
                    className={inputClass}
                    isDark={isDark}
                    placeholder="JJ/MM/AAAA"
                  />
                </div>
              </div>

              {/* Mode de Règlement: Total vs Tranches */}
              <div className="pt-1">
                <label className={labelClass}>Mode de Règlement du Loyer</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setResPaymentType("TOTAL")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                      resPaymentType === "TOTAL"
                        ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                        : isDark ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-600"
                    }`}
                  >
                    Règlement Total
                  </button>
                  <button
                    type="button"
                    onClick={() => setResPaymentType("TRANCHE")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                      resPaymentType === "TRANCHE"
                        ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                        : isDark ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-600"
                    }`}
                  >
                    Versement en Tranches
                  </button>
                </div>
              </div>

              {/* Installment Controls */}
              {resPaymentType === "TRANCHE" && (
                <div className="space-y-3 pt-1 border-t border-amber-500/20">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Tranche Réglée</label>
                      <select
                        value={resTrancheType}
                        onChange={(e) => setResTrancheType(e.target.value)}
                        className={selectClass}
                      >
                        <option value="1ère Tranche (Acompte)">1ère Tranche (Acompte)</option>
                        <option value="2ème Tranche">2ème Tranche</option>
                        <option value="3ème Tranche">3ème Tranche</option>
                        <option value="Solde Final">Solde Final</option>
                        <option value="Personnalisée">Tranche Personnalisée...</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Montant Total Réservation (FCFA)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ex: 300000 (Optionnel)"
                        value={resTotalContract}
                        onChange={(e) => setResTotalContract(e.target.value)}
                        className={`${inputClass} font-mono`}
                      />
                    </div>
                  </div>

                  {resTrancheType === "Personnalisée" && (
                    <div>
                      <label className={labelClass}>Libellé de la tranche personnalisée</label>
                      <input
                        type="text"
                        placeholder="Ex: Acompte de 50%, Versement 4..."
                        value={resCustomTranche}
                        onChange={(e) => setResCustomTranche(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  )}

                  {/* Calculation Preview Badge */}
                  {resTotalContract && parseFloat(resTotalContract) > 0 && (
                    <div className={`p-3 rounded-xl border text-xs flex items-center justify-between font-mono ${
                      isDark ? "bg-slate-950/80 border-slate-800" : "bg-white border-amber-200"
                    }`}>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-sans">Montant Total Réservation</span>
                        <span className="font-bold text-amber-500">{(parseFloat(resTotalContract) || 0).toLocaleString("fr-FR")} F</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px] font-sans">Reste Dû après ce versement</span>
                        <span className="font-bold text-rose-500">
                          {Math.max(0, (parseFloat(resTotalContract) || 0) - (parseFloat(amount) || 0)).toLocaleString("fr-FR")} F
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Standard Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Date (JJ/MM/AAAA)</label>
              <DateInput
                required
                value={date}
                onChange={(val) => setDate(val)}
                className={inputClass}
                isDark={isDark}
                placeholder="JJ/MM/AAAA"
              />
            </div>
            <div>
              <label className={labelClass}>N° Pièce / Bon</label>
              <input
                type="text"
                placeholder="Ex: 007*, 18"
                value={pieceNo}
                onChange={(e) => setPieceNo(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>

          {/* Operation Type */}
          <div>
            <label className={labelClass}>Type d'opération</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEntryType("RECETTE")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  entryType === "RECETTE"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                    : isDark ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                + RECETTE (Encaissement)
              </button>
              <button
                type="button"
                onClick={() => setEntryType("DEPENSE")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  entryType === "DEPENSE"
                    ? "bg-rose-600 text-white border-rose-600 shadow-md"
                    : isDark ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                - DÉPENSE (Décaissement)
              </button>
            </div>
          </div>

          {/* Libellé */}
          <div>
            <label className={labelClass}>Libellé / Description</label>
            <textarea
              required
              rows={2}
              placeholder="Description détaillée de l'opération..."
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Amount */}
          <div>
            <label className={labelClass}>Montant (FCFA)</label>
            <input
              type="number"
              required
              min="0"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`${inputClass} font-mono font-bold text-amber-600 dark:text-amber-400 text-base`}
            />
          </div>

          {/* Unit & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Unité liée</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value as PropertyUnit)} className={selectClass}>
                {unitOptions.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelClass}>Catégorie</label>
                {onOpenCategoryManager && (
                  <button
                    type="button"
                    onClick={onOpenCategoryManager}
                    className="text-[10px] text-amber-500 hover:text-amber-400 font-bold flex items-center gap-0.5"
                  >
                    <Tag className="w-3 h-3" />
                    + Gérer
                  </button>
                )}
              </div>
              <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className={selectClass}>
                {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className={`pt-3 border-t flex items-center justify-end gap-2 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
                isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-md shadow-amber-500/20 transition-all"
            >
              Enregistrer l'Opération
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
