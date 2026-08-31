"use client";

import React from "react";
import { 
  FileSpreadsheet, 
  LayoutDashboard, 
  Building, 
  PieChart, 
  Bed,
  Tag
} from "lucide-react";

export type ActiveTab = "ledger" | "dashboard" | "units" | "analytics";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  totalTransactionsCount: number;
  theme: "light" | "dark";
  onOpenCategoryManager?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  totalTransactionsCount,
  theme,
  onOpenCategoryManager,
}) => {
  const isDark = theme === "dark";

  const navItems = [
    {
      id: "ledger" as ActiveTab,
      label: "Journal de Caisse",
      sublabel: "Sheet automatisé",
      icon: FileSpreadsheet,
      badge: totalTransactionsCount,
    },
    {
      id: "dashboard" as ActiveTab,
      label: "Tableau de Bord",
      sublabel: "Synthèse & KPI",
      icon: LayoutDashboard,
    },
    {
      id: "units" as ActiveTab,
      label: "Logements & Salle",
      sublabel: "Apparts 1-4 & Conf.",
      icon: Building,
    },
    {
      id: "analytics" as ActiveTab,
      label: "Analyse & Dépenses",
      sublabel: "Graphiques & Ratios",
      icon: PieChart,
    },
  ];

  return (
    <aside
      className={`w-full md:w-64 border-b md:border-b-0 md:border-r p-3 sm:p-4 flex flex-col justify-between shrink-0 transition-colors ${
        isDark
          ? "bg-slate-950/60 border-slate-800"
          : "bg-slate-50/80 border-slate-200"
      }`}
    >
      <div className="space-y-1">
        <div className={`px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          Navigation
        </div>
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all ${
                  isActive
                    ? isDark
                      ? "bg-amber-500/15 text-amber-300 border border-amber-500/40 font-bold shadow-sm"
                      : "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                    : isDark
                      ? "text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border border-transparent"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${
                      isActive
                        ? isDark ? "bg-amber-500 text-slate-950" : "bg-slate-950 text-amber-400"
                        : isDark ? "bg-slate-900 text-slate-400" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">{item.label}</div>
                    <div className={`text-[10px] ${
                      isActive
                        ? isDark ? "text-amber-200/80" : "text-slate-800"
                        : isDark ? "text-slate-500" : "text-slate-400"
                    }`}>
                      {item.sublabel}
                    </div>
                  </div>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-black border ${
                      isActive
                        ? isDark
                          ? "bg-amber-400 text-slate-950 border-amber-300"
                          : "bg-slate-950 text-amber-400 border-slate-900"
                        : isDark
                          ? "bg-slate-900 text-slate-400 border-slate-800"
                          : "bg-slate-200 text-slate-600 border-slate-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Category Management Button */}
        {onOpenCategoryManager && (
          <div className="pt-2">
            <button
              onClick={onOpenCategoryManager}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-left text-xs font-bold transition-all border ${
                isDark
                  ? "bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-amber-400"
                  : "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900"
              }`}
            >
              <div className={`p-1.5 rounded-xl ${isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-500 text-slate-950"}`}>
                <Tag className="w-3.5 h-3.5" />
              </div>
              <span>Gérer les Catégories</span>
            </button>
          </div>
        )}
      </div>

      {/* Property Badge Footer */}
      <div className={`hidden md:block mt-6 p-4 rounded-2xl border ${
        isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"
      }`}>
        <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400">
          <Bed className="w-4 h-4" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider">Patrimoine Géré</span>
        </div>
        <div className="text-xs space-y-1 font-medium">
          <div className="flex justify-between">
            <span className={isDark ? "text-slate-500" : "text-slate-500"}>Appartements:</span>
            <span className="text-amber-600 dark:text-amber-300 font-bold">4 Meublés</span>
          </div>
          <div className="flex justify-between">
            <span className={isDark ? "text-slate-500" : "text-slate-500"}>Salle Conférence:</span>
            <span className="text-indigo-600 dark:text-indigo-300 font-bold">1 Salle</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
