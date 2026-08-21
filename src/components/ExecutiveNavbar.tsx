'use client';

import React from 'react';
import { useProspectingStore } from '@/lib/store';
import { exportLeadsToCSV, exportLeadsToJSON } from '@/lib/exportUtils';
import {
  Zap,
  Download,
  FileSpreadsheet,
  FileJson,
  Bookmark,
  Settings,
  Flame,
  Globe,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

interface ExecutiveNavbarProps {
  filteredCount: number;
  noWebsiteCount: number;
  validWhatsAppCount: number;
  onOpenSettings: () => void;
  onOpenSaved: () => void;
}

export default function ExecutiveNavbar({
  filteredCount,
  noWebsiteCount,
  validWhatsAppCount,
  onOpenSettings,
  onOpenSaved,
}: ExecutiveNavbarProps) {
  const { leads, savedLeads, activeTab, setActiveTab } = useProspectingStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl shadow-xl">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Live Metrics */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('prospecting')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">BotClientes</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 uppercase tracking-wide">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                SaaS de Prospecção B2B de Alta Conversão
              </p>
            </div>
          </div>

          {/* Real-time KPI Pills */}
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800/80 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="font-bold text-white">{filteredCount}</span>
              <span className="text-slate-400 text-[11px]">Leads Filtrados</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-300">
              <Flame className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-white">{noWebsiteCount}</span>
              <span className="text-emerald-300/80 text-[11px]">Sem Site (+40% Venda)</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-white">{validWhatsAppCount}</span>
              <span className="text-slate-400 text-[11px]">WhatsApps Válidos</span>
            </div>
          </div>
        </div>

        {/* Navigation & Fast Export Actions */}
        <div className="flex items-center gap-2.5">
          {/* Tab Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('prospecting')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'prospecting'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Radar de Prospecção
            </button>
            <button
              onClick={() => setActiveTab('crm')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'crm'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pipeline CRM
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={() => exportLeadsToCSV(leads)}
            disabled={leads.length === 0}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-all active:scale-95 disabled:opacity-40"
            title="Exportar para Excel / CRM (HubSpot, RD Station)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>

          {/* Saved Leads Drawer Button */}
          <button
            onClick={onOpenSaved}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 transition-all relative"
            title="Leads Salvos"
          >
            <Bookmark className="w-4 h-4" />
            {savedLeads.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-md">
                {savedLeads.length}
              </span>
            )}
          </button>

          {/* API Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-indigo-400 transition-all"
            title="Configurações & Chaves de API"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
