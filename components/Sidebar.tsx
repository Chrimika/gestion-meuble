"use client";

import React from "react";
import {
  FileSpreadsheet,
  LayoutDashboard,
  Building,
  PieChart,
  Tag,
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
      sublabel: "Toutes les opérations",
      icon: FileSpreadsheet,
      badge: totalTransactionsCount,
      color: "amber",
    },
    {
      id: "dashboard" as ActiveTab,
      label: "Tableau de Bord",
      sublabel: "Synthèse & KPI",
      icon: LayoutDashboard,
      color: "indigo",
    },
    {
      id: "units" as ActiveTab,
      label: "Logements & Salle",
      sublabel: "Par unité",
      icon: Building,
      color: "cyan",
    },
    {
      id: "analytics" as ActiveTab,
      label: "Analyse & Ratios",
      sublabel: "Graphiques budgétaires",
      icon: PieChart,
      color: "violet",
    },
  ];

  const colorMap: Record<string, { active: string; icon: string; badge: string }> = {
    amber: {
      active: isDark
        ? "bg-amber-500/15 border-amber-500/40 text-amber-200"
        : "bg-amber-500 border-amber-600 text-slate-950",
      icon: isDark ? "bg-amber-500 text-slate-950" : "bg-slate-900 text-amber-400",
      badge: isDark ? "bg-amber-400 text-slate-950" : "bg-slate-900 text-amber-300",
    },
    indigo: {
      active: isDark
        ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-200"
        : "bg-indigo-600 border-indigo-700 text-white",
      icon: isDark ? "bg-indigo-500 text-white" : "bg-white/20 text-white",
      badge: isDark ? "bg-indigo-400 text-slate-950" : "bg-white/20 text-white",
    },
    cyan: {
      active: isDark
        ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-200"
        : "bg-cyan-600 border-cyan-700 text-white",
      icon: isDark ? "bg-cyan-500 text-slate-950" : "bg-white/20 text-white",
      badge: isDark ? "bg-cyan-400 text-slate-950" : "bg-white/20 text-white",
    },
    violet: {
      active: isDark
        ? "bg-violet-500/15 border-violet-500/40 text-violet-200"
        : "bg-violet-600 border-violet-700 text-white",
      icon: isDark ? "bg-violet-500 text-white" : "bg-white/20 text-white",
      badge: isDark ? "bg-violet-400 text-slate-950" : "bg-white/20 text-white",
    },
  };

  return (
    <aside
      className={`no-print shrink-0 flex flex-col border-r transition-colors overflow-hidden ${
        isDark ? "bg-slate-950 border-slate-800" : "bg-slate-900 border-slate-700"
      }`}
      style={{ width: 220 }}
    >
      {/* ── Brand avec logo ── */}
      <div className={`px-3 py-3 border-b flex items-center gap-2.5 ${isDark ? "border-slate-800" : "border-slate-700"}`}>
        <img
          src="/logo.jpeg"
          alt="St Raphaël"
          className="rounded-lg object-cover shrink-0"
          style={{ width: 34, height: 34 }}
        />
        <div className="leading-none min-w-0">
          <div className="text-[11px] font-black text-white tracking-tight leading-tight truncate">
            Résidence St Raphaël
          </div>
          <div className="text-[9px] text-slate-500 font-medium truncate">
            Ekoumdoum · Yaoundé
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 px-2 pb-1.5">
          Menu Principal
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const colors = colorMap[item.color];

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all border ${
                isActive
                  ? colors.active + " font-bold shadow-sm"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive ? colors.icon : isDark ? "bg-slate-800 text-slate-500" : "bg-slate-800 text-slate-500"
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold leading-tight truncate">{item.label}</div>
                  <div className={`text-[10px] leading-tight truncate ${isActive ? "opacity-70" : "text-slate-600"}`}>
                    {item.sublabel}
                  </div>
                </div>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black shrink-0 ml-1 ${
                  isActive ? colors.badge : "bg-slate-800 text-slate-500"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Bottom tools ── */}
      <div className={`p-3 border-t space-y-1 ${isDark ? "border-slate-800" : "border-slate-700"}`}>
        {onOpenCategoryManager && (
          <button
            onClick={onOpenCategoryManager}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-xs font-semibold">Catégories</span>
          </button>
        )}

        {/* Property summary */}
        <div className={`mt-2 p-3 rounded-xl ${isDark ? "bg-slate-900/60" : "bg-slate-800/60"}`}>
          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">Patrimoine géré</div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Appartements</span>
              <span className="text-amber-400 font-bold">4 meublés</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Salle conf.</span>
              <span className="text-indigo-400 font-bold">1 salle</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
