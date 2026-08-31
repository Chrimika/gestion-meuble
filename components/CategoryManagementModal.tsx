"use client";

import React, { useState } from "react";
import { CategoryItem } from "@/types/finance";
import { X, Plus, Tag, Trash2, ShieldCheck, AlertCircle } from "lucide-react";

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  onAddCategory: (name: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  theme: "light" | "dark";
}

export const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
  theme,
}) => {
  const isDark = theme === "dark";
  const [newCatName, setNewCatName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await onAddCategory(newCatName.trim());
      setNewCatName("");
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'ajout de la catégorie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat: CategoryItem) => {
    if (!cat.isCustom) return;
    if (confirm(`Voulez-vous vraiment supprimer la catégorie "${cat.name}" ?`)) {
      setError(null);
      try {
        await onDeleteCategory(cat.id);
      } catch (err: any) {
        setError(err.message || "Erreur lors de la suppression de la catégorie.");
      }
    }
  };

  const systemCategories = categories.filter((c) => !c.isCustom);
  const customCategories = categories.filter((c) => c.isCustom);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border transition-colors ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? "border-slate-800" : "border-slate-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-black text-base ${isDark ? "text-white" : "text-slate-900"}`}>
                Gestion des Catégories
              </h3>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Stockées localement dans votre base SQLite
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDark
                ? "text-slate-400 hover:text-white hover:bg-slate-800"
                : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form: Add New Category */}
          <form onSubmit={handleAdd} className="space-y-2">
            <label className={`text-xs font-bold block ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              Ajouter une Catégorie Personnalisée
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Frais de Ménage, Impôts..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className={`flex-1 p-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-colors ${
                  isDark
                    ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                }`}
              />
              <button
                type="submit"
                disabled={isSubmitting || !newCatName.trim()}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>
          </form>

          {/* Custom Categories List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Vos Catégories Personnalisées ({customCategories.length})
              </span>
            </div>

            {customCategories.length === 0 ? (
              <div
                className={`p-4 rounded-2xl border text-center text-xs ${
                  isDark
                    ? "bg-slate-950/40 border-slate-800/80 text-slate-500"
                    : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                Aucune catégorie personnalisée ajoutée pour le moment.
              </div>
            ) : (
              <div className="space-y-1.5">
                {customCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
                      isDark
                        ? "bg-slate-950 border-slate-800 text-slate-200"
                        : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-sm font-semibold">{cat.name}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(cat)}
                      title="Supprimer la catégorie"
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Default Categories */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Catégories Standard du Système ({systemCategories.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {systemCategories.map((cat) => (
                <span
                  key={cat.id}
                  className={`text-xs font-medium px-3 py-1.5 rounded-xl border ${
                    isDark
                      ? "bg-slate-950/60 border-slate-800 text-slate-400"
                      : "bg-slate-100 border-slate-200 text-slate-600"
                  }`}
                >
                  {cat.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t flex justify-end ${
            isDark ? "border-slate-800 bg-slate-950/40" : "border-slate-100 bg-slate-50"
          }`}
        >
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
