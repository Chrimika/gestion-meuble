"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Transaction, PropertyUnit, Category, CategoryItem, InstallmentPreFill, ReservationService } from "@/types/finance";
import { X, Sparkles, Building2, Tag, Moon, Calculator, User, CreditCard, Plus, Trash2, ShoppingBag } from "lucide-react";
import { DateInput } from "@/components/DateInput";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txData: Partial<Transaction>) => Promise<void>;
  editingTransaction?: Transaction | null;
  installmentPreFill?: InstallmentPreFill | null;
  theme: "light" | "dark";
  categories?: CategoryItem[];
  onOpenCategoryManager?: () => void;
  defaultUnit?: PropertyUnit;
}

function computeNights(startIso: string, endIso: string): number {
  if (!startIso || !endIso) return 0;
  const diff = Math.floor((new Date(endIso).getTime() - new Date(startIso).getTime()) / 86400000);
  return diff > 0 ? diff : 0;
}

function newService(): ReservationService {
  return { id: `svc-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, label: "", qty: 1, unitPrice: 0 };
}

// Preset services rapides
const SERVICE_PRESETS = [
  { label: "Lessive", unitPrice: 2000 },
  { label: "Petit-déjeuner", unitPrice: 3000 },
  { label: "Déjeuner", unitPrice: 5000 },
  { label: "Dîner", unitPrice: 5000 },
  { label: "Navette aéroport", unitPrice: 10000 },
  { label: "Ménage supplémentaire", unitPrice: 5000 },
  { label: "Serviettes supplémentaires", unitPrice: 1000 },
  { label: "Wifi premium", unitPrice: 2000 },
];

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

  // Standard
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [pieceNo, setPieceNo] = useState("");
  const [libelle, setLibelle] = useState("");
  const [unit, setUnit] = useState<PropertyUnit>("Général / Communs");
  const [category, setCategory] = useState<Category>("Fournitures & Linge");
  const [entryType, setEntryType] = useState<"RECETTE" | "DEPENSE">("DEPENSE");
  const [amount, setAmount] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Reservation
  const [resUnit, setResUnit] = useState<PropertyUnit>("Appartement 1");
  const [resClient, setResClient] = useState("");
  const [resClientCni, setResClientCni] = useState("");
  const [resStartDate, setResStartDate] = useState("");
  const [resEndDate, setResEndDate] = useState("");
  const [resPaymentType, setResPaymentType] = useState<"TOTAL" | "TRANCHE">("TOTAL");
  const [resTrancheType, setResTrancheType] = useState("1ère Tranche (Acompte)");
  const [resCustomTranche, setResCustomTranche] = useState("");
  const [resTotalContract, setResTotalContract] = useState("");
  const [resServices, setResServices] = useState<ReservationService[]>([]);

  const nights = useMemo(() => computeNights(resStartDate, resEndDate), [resStartDate, resEndDate]);

  const servicesTotalAmount = useMemo(
    () => resServices.reduce((s, sv) => s + sv.qty * sv.unitPrice, 0),
    [resServices]
  );

  // ── Reset on open
  useEffect(() => {
    if (!isOpen) return;
    if (editingTransaction) {
      setMode("STANDARD");
      setDate(editingTransaction.date || "");
      setPieceNo(editingTransaction.pieceNo || "");
      setLibelle(editingTransaction.libelle || "");
      setUnit(editingTransaction.unit || "Général / Communs");
      setCategory(editingTransaction.category || "Autres");
      setEntryType((editingTransaction.recettes || 0) > 0 ? "RECETTE" : "DEPENSE");
      setAmount((editingTransaction.recettes || 0) > 0 ? editingTransaction.recettes.toString() : editingTransaction.depenses?.toString() || "");
    } else if (installmentPreFill) {
      setMode("RESERVATION");
      setDate(new Date().toISOString().split("T")[0]);
      setPieceNo("");
      setResUnit(installmentPreFill.unit);
      setResClient(installmentPreFill.client);
      setResClientCni(installmentPreFill.clientCni || "");
      setResStartDate(installmentPreFill.startDate);
      setResEndDate(installmentPreFill.endDate);
      setResPaymentType("TRANCHE");
      setResTrancheType(installmentPreFill.trancheType || "2ème Tranche");
      setResCustomTranche("");
      setResTotalContract(installmentPreFill.totalContract || "");
      setAmount(installmentPreFill.defaultAmount || "");
      setEntryType("RECETTE");
      setCategory("Loyers & Réservations");
      setResServices([]);
    } else {
      setMode("STANDARD");
      setDate(new Date().toISOString().split("T")[0]);
      setPieceNo(""); setLibelle("");
      setUnit(defaultUnit || "Général / Communs");
      setCategory("Fournitures & Linge");
      setEntryType("DEPENSE"); setAmount("");
      setResUnit(defaultUnit && defaultUnit !== "Général / Communs" ? defaultUnit : "Appartement 1");
      setResClient(""); setResClientCni("");
      setResStartDate(""); setResEndDate("");
      setResPaymentType("TOTAL");
      setResTrancheType("1ère Tranche (Acompte)");
      setResCustomTranche(""); setResTotalContract("");
      setResServices([]);
    }
  }, [editingTransaction, installmentPreFill, isOpen, defaultUnit]);

  // ── Auto-libellé réservation
  useEffect(() => {
    if (mode !== "RESERVATION") return;
    const fmt = (d: string) => { const p = d.split("-"); return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d; };
    let lib = `LOCATION ${resUnit.toUpperCase()}`;
    if (resStartDate && resEndDate) lib += ` DU ${fmt(resStartDate)} AU ${fmt(resEndDate)}`;
    if (nights > 0) lib += ` (${nights} NUIT${nights > 1 ? "S" : ""})`;
    if (resClient) lib += ` PAR ${resClient.toUpperCase()}`;
    if (resPaymentType === "TOTAL") {
      lib += " — RÈGLEMENT TOTAL";
    } else {
      const label = resTrancheType === "Personnalisée" ? resCustomTranche.trim() || "TRANCHE" : resTrancheType;
      const cur = parseFloat(amount) || 0;
      const tot = parseFloat(resTotalContract) || 0;
      if (tot > 0) {
        const reste = Math.max(0, tot - cur);
        lib += ` — ${label.toUpperCase()} (${cur.toLocaleString("fr-FR")} F / TOTAL: ${tot.toLocaleString("fr-FR")} F — RESTE DÛ: ${reste.toLocaleString("fr-FR")} F)`;
      } else {
        lib += ` — ${label.toUpperCase()}`;
      }
    }
    if (servicesTotalAmount > 0) lib += ` + SERVICES: ${servicesTotalAmount.toLocaleString("fr-FR")} F`;
    setLibelle(lib);
    setUnit(resUnit);
    setCategory("Loyers & Réservations");
    setEntryType("RECETTE");
  }, [mode, resUnit, resClient, resStartDate, resEndDate, nights, resPaymentType, resTrancheType, resCustomTranche, resTotalContract, amount, servicesTotalAmount]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    const loyer = parseFloat(amount) || 0;
    const totalMontant = mode === "RESERVATION" ? loyer + servicesTotalAmount : loyer;
    if (totalMontant <= 0) {
      alert("Saisissez un montant supérieur à zéro.");
      return;
    }
    const payload: Partial<Transaction> = {
      date, pieceNo: pieceNo.trim() || "-", libelle: libelle.trim(), unit, category,
      recettes: entryType === "RECETTE" ? totalMontant : 0,
      depenses: entryType === "DEPENSE" ? totalMontant : 0,
    };
    if (mode === "RESERVATION") {
      payload.clientCni = resClientCni.trim();
      payload.clientName = resClient.trim();
      payload.resStartDate = resStartDate;
      payload.resEndDate = resEndDate;
      payload.resNights = nights;
      payload.resTotalContract = parseFloat(resTotalContract) || 0;
      payload.resTrancheType = resTrancheType === "Personnalisée" ? resCustomTranche.trim() : resTrancheType;
      payload.resServices = resServices.filter(s => s.label.trim() && s.unitPrice > 0);
    }
    if (editingTransaction?.id) payload.id = editingTransaction.id;
    setIsSaving(true);
    try {
      await onSave(payload);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  // Services CRUD
  const addService = () => setResServices(s => [...s, newService()]);
  const addPreset = (preset: { label: string; unitPrice: number }) =>
    setResServices(s => [...s, { id: `svc-${Date.now()}`, label: preset.label, qty: 1, unitPrice: preset.unitPrice }]);
  const updateService = (id: string, field: keyof ReservationService, val: any) =>
    setResServices(s => s.map(sv => sv.id === id ? { ...sv, [field]: val } : sv));
  const removeService = (id: string) => setResServices(s => s.filter(sv => sv.id !== id));

  const unitOptions: PropertyUnit[] = ["Appartement 1","Appartement 2","Appartement 3","Appartement 4","Salle de Conférence","Général / Communs"];
  const categoryOptions = categories.length > 0 ? categories.map(c => c.name)
    : ["Loyers & Réservations","Entretien & Travaux","Fournitures & Linge","Salaires & Personnel","Charges & Énergie","Transport & Com","Autres"];

  const inp = `w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-colors ${
    isDark ? "bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
  }`;
  const sel = `w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-colors ${
    isDark ? "bg-slate-950 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
  }`;
  const lbl = `text-[11px] font-bold uppercase tracking-wide block mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`;
  const reste = Math.max(0, (parseFloat(resTotalContract) || 0) - (parseFloat(amount) || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col border ${
        isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
      }`} style={{ maxHeight: "94vh" }}>

        {/* Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h3 className={`font-black text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                {editingTransaction ? "Modifier l'Opération" : "Nouvelle Opération"}
              </h3>
              <p className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>Saisie dans le journal de caisse</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${isDark ? "text-slate-400 hover:bg-slate-800" : "text-slate-400 hover:bg-slate-100"}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode tabs */}
        {!editingTransaction && (
          <div className={`flex gap-1 p-2 border-b shrink-0 ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-100"}`}>
            <button type="button" onClick={() => setMode("STANDARD")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${mode === "STANDARD"
                ? isDark ? "bg-slate-800 text-white" : "bg-white text-slate-900 shadow-sm border border-slate-200"
                : isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-700"}`}>
              Saisie Standard
            </button>
            <button type="button" onClick={() => setMode("RESERVATION")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${mode === "RESERVATION"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : isDark ? "text-slate-500 hover:text-amber-400" : "text-slate-400 hover:text-amber-600"}`}>
              <Building2 className="w-3.5 h-3.5" />
              Assistant Réservation
            </button>
          </div>
        )}

        {/* Form body — 2 columns when reservation mode */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className={mode === "RESERVATION" && !editingTransaction ? "grid grid-cols-2 gap-0 h-full" : ""}>

            {/* ── LEFT col (reservation wizard) ── */}
            {mode === "RESERVATION" && !editingTransaction && (
              <div className={`p-4 border-r space-y-3 overflow-y-auto ${isDark ? "border-slate-800" : "border-slate-200"}`}
                style={{ maxHeight: "calc(94vh - 130px)" }}>
                <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Réservation / Loyer</div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={lbl}>Logement</label>
                    <select value={resUnit} onChange={e => setResUnit(e.target.value as PropertyUnit)} className={sel}>
                      <option>Appartement 1</option><option>Appartement 2</option>
                      <option>Appartement 3</option><option>Appartement 4</option>
                      <option>Salle de Conférence</option>
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Client</label>
                    <div className="relative">
                      <User className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="MR NLOGA" value={resClient} onChange={e => setResClient(e.target.value)} className={inp + " pl-7 text-xs"} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={lbl}>N° CNI</label>
                  <div className="relative">
                    <CreditCard className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="1234567890123" value={resClientCni} onChange={e => setResClientCni(e.target.value)} className={inp + " pl-7 font-mono text-xs"} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div><label className={lbl}>Arrivée</label><DateInput value={resStartDate} onChange={setResStartDate} className={inp + " text-xs"} isDark={isDark} placeholder="JJ/MM/AAAA" /></div>
                  <div><label className={lbl}>Départ</label><DateInput value={resEndDate} onChange={setResEndDate} className={inp + " text-xs"} isDark={isDark} placeholder="JJ/MM/AAAA" /></div>
                </div>

                {resStartDate && resEndDate && nights > 0 && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? "bg-indigo-950/40 border-indigo-700/40" : "bg-indigo-50 border-indigo-200"}`}>
                    <Moon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-300">{nights} nuit{nights > 1 ? "s" : ""}</span>
                    <span className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>(départ à 11h)</span>
                  </div>
                )}

                {/* Mode règlement */}
                <div>
                  <label className={lbl}>Règlement</label>
                  <div className="flex gap-2">
                    {(["TOTAL","TRANCHE"] as const).map(t => (
                      <button key={t} type="button" onClick={() => setResPaymentType(t)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${resPaymentType === t
                          ? "bg-amber-500 text-slate-950 border-amber-500"
                          : isDark ? "bg-slate-950 border-slate-700 text-slate-400" : "bg-white border-slate-300 text-slate-600"}`}>
                        {t === "TOTAL" ? "Total" : "Tranches"}
                      </button>
                    ))}
                  </div>
                </div>

                {resPaymentType === "TRANCHE" && (
                  <div className={`space-y-2 pt-2 border-t ${isDark ? "border-amber-700/30" : "border-amber-200"}`}>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={lbl}>Tranche</label>
                        <select value={resTrancheType} onChange={e => setResTrancheType(e.target.value)} className={sel + " text-xs"}>
                          <option>1ère Tranche (Acompte)</option><option>2ème Tranche</option>
                          <option>3ème Tranche</option><option>Solde Final</option>
                          <option value="Personnalisée">Personnalisée…</option>
                        </select>
                      </div>
                      <div>
                        <label className={lbl}>Total Contrat (F)</label>
                        <input type="number" min="0" placeholder="Optionnel" value={resTotalContract} onChange={e => setResTotalContract(e.target.value)} className={inp + " font-mono text-xs"} />
                      </div>
                    </div>
                    {resTrancheType === "Personnalisée" && (
                      <input type="text" placeholder="Ex: Acompte 50%" value={resCustomTranche} onChange={e => setResCustomTranche(e.target.value)} className={inp + " text-xs"} />
                    )}
                    {resTotalContract && parseFloat(resTotalContract) > 0 && (
                      <div className={`flex justify-between px-3 py-2 rounded-xl border text-xs font-mono ${isDark ? "bg-slate-950/80 border-slate-700" : "bg-white border-amber-200"}`}>
                        <div><div className={`text-[9px] font-sans font-bold mb-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>Total</div>
                          <div className="font-black text-amber-500">{(parseFloat(resTotalContract)||0).toLocaleString("fr-FR")} F</div></div>
                        <div className="text-right"><div className={`text-[9px] font-sans font-bold mb-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>Reste Dû</div>
                          <div className="font-black text-rose-500">{reste.toLocaleString("fr-FR")} F</div></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── RIGHT col (or full-width for standard) ── */}
            <div className={`p-4 space-y-3 overflow-y-auto ${mode === "RESERVATION" && !editingTransaction ? "" : ""}`}
              style={{ maxHeight: "calc(94vh - 130px)" }}>

              {/* Services additionnels — uniquement en mode réservation */}
              {mode === "RESERVATION" && !editingTransaction && (
                <div className={`rounded-2xl border p-3 space-y-2 ${isDark ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                      <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        Services Additionnels
                      </span>
                    </div>
                    {servicesTotalAmount > 0 && (
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">
                        +{servicesTotalAmount.toLocaleString("fr-FR")} F
                      </span>
                    )}
                  </div>

                  {/* Presets rapides */}
                  <div className="flex flex-wrap gap-1">
                    {SERVICE_PRESETS.map(p => (
                      <button key={p.label} type="button" onClick={() => addPreset(p)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border font-semibold transition-all ${
                          isDark ? "bg-slate-900 border-slate-700 text-slate-300 hover:border-amber-500/60 hover:text-amber-400"
                                 : "bg-white border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-700"}`}>
                        + {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Liste des services */}
                  {resServices.length > 0 && (
                    <div className="space-y-1.5">
                      {resServices.map(sv => (
                        <div key={sv.id} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="Service (ex: Lessive)"
                            value={sv.label}
                            onChange={e => updateService(sv.id, "label", e.target.value)}
                            className={`flex-1 px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/40 ${
                              isDark ? "bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-600" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"}`}
                          />
                          <input
                            type="number"
                            min="1"
                            value={sv.qty}
                            onChange={e => updateService(sv.id, "qty", parseInt(e.target.value) || 1)}
                            className={`w-12 px-2 py-1.5 border rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-amber-500/40 font-mono ${
                              isDark ? "bg-slate-950 border-slate-700 text-slate-100" : "bg-white border-slate-300 text-slate-900"}`}
                          />
                          <span className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>×</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="Prix"
                            value={sv.unitPrice || ""}
                            onChange={e => updateService(sv.id, "unitPrice", parseFloat(e.target.value) || 0)}
                            className={`w-20 px-2 py-1.5 border rounded-lg text-xs text-right focus:outline-none focus:ring-1 focus:ring-amber-500/40 font-mono ${
                              isDark ? "bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-600" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"}`}
                          />
                          <span className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>F</span>
                          <span className={`text-[10px] font-bold font-mono w-16 text-right ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                            {(sv.qty * sv.unitPrice).toLocaleString("fr-FR")} F
                          </span>
                          <button type="button" onClick={() => removeService(sv.id)}
                            className="p-1 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button type="button" onClick={addService}
                    className={`w-full py-1.5 rounded-xl border-dashed border text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                      isDark ? "border-slate-600 text-slate-500 hover:text-slate-300 hover:border-slate-500" : "border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400"}`}>
                    <Plus className="w-3 h-3" /> Ajouter un service
                  </button>
                </div>
              )}

              {/* Montant loyer */}
              <div>
                <label className={lbl}>
                  {mode === "RESERVATION" ? "Montant Loyer / Versement (F)" : "Montant (FCFA)"}
                </label>
                <div className="flex gap-2">
                  {mode === "STANDARD" && (
                    <div className="flex rounded-xl border overflow-hidden shrink-0">
                      {(["RECETTE","DEPENSE"] as const).map(t => (
                        <button key={t} type="button" onClick={() => setEntryType(t)}
                          className={`px-3 py-2 text-xs font-bold transition-colors ${entryType === t
                            ? t === "RECETTE" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                            : isDark ? "bg-slate-950 text-slate-400 hover:text-slate-200" : "bg-slate-100 text-slate-500 hover:text-slate-800"}`}>
                          {t === "RECETTE" ? "Recette" : "Dépense"}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="relative flex-1">
                    <Calculator className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="number" required min="0" step="any" placeholder="0"
                      value={amount} onChange={e => setAmount(e.target.value)}
                      className={`${inp} pl-8 font-mono`} />
                  </div>
                </div>
              </div>

              {/* Total avec services */}
              {mode === "RESERVATION" && servicesTotalAmount > 0 && (
                <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${
                  isDark ? "bg-amber-950/30 border-amber-700/40" : "bg-amber-50 border-amber-200"}`}>
                  <div className="text-xs space-y-0.5">
                    <div className={`font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Loyer : <span className="font-mono font-bold">{(parseFloat(amount)||0).toLocaleString("fr-FR")} F</span>
                    </div>
                    <div className={`font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Services : <span className="font-mono font-bold text-amber-600 dark:text-amber-400">+{servicesTotalAmount.toLocaleString("fr-FR")} F</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[9px] uppercase font-bold ${isDark ? "text-slate-500" : "text-slate-400"}`}>Total facturé</div>
                    <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {((parseFloat(amount)||0) + servicesTotalAmount).toLocaleString("fr-FR")} F
                    </div>
                  </div>
                </div>
              )}

              {/* Champs communs */}
              <div className="grid grid-cols-2 gap-2">
                <div><label className={lbl}>Date</label>
                  <DateInput required value={date} onChange={setDate} className={inp} isDark={isDark} placeholder="JJ/MM/AAAA" /></div>
                <div><label className={lbl}>N° Pièce</label>
                  <input type="text" placeholder="007" value={pieceNo} onChange={e => setPieceNo(e.target.value)} className={`${inp} font-mono`} /></div>
              </div>

              <div>
                <label className={lbl}>Libellé</label>
                <input type="text" required placeholder="Description" value={libelle} onChange={e => setLibelle(e.target.value)} className={inp} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={lbl}>Unité</label>
                  <select value={unit} onChange={e => setUnit(e.target.value as PropertyUnit)} className={sel}
                    disabled={mode === "RESERVATION" && !editingTransaction}>
                    {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span>Catégorie</span>
                    {onOpenCategoryManager && (
                      <button type="button" onClick={onOpenCategoryManager} className="text-amber-500 hover:text-amber-400 text-[10px] font-semibold normal-case tracking-normal flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Gérer
                      </button>
                    )}
                  </label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className={sel}
                    disabled={mode === "RESERVATION" && !editingTransaction}>
                    {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className={`px-5 py-3 border-t flex justify-between items-center gap-2 shrink-0 ${
          isDark ? "border-slate-800 bg-slate-950/40" : "border-slate-100 bg-slate-50"}`}>
          <div className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {mode === "RESERVATION" && servicesTotalAmount > 0 && (
              <span>Total : <strong className={`font-mono ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                {((parseFloat(amount)||0) + servicesTotalAmount).toLocaleString("fr-FR")} F
              </strong></span>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-100"}`}>
              Annuler
            </button>
            <button type="submit" disabled={isSaving} className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-wait text-white text-sm font-black shadow-md shadow-emerald-600/20 transition-all">
              {isSaving ? "Enregistrement…" : editingTransaction ? "Enregistrer les modifications" : "Enregistrer l'opération"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
