'use client';

import { useProspectingStore } from '@/lib/store';
import {
  Compass,
  Bookmark,
  Settings,
  TrendingUp,
  DollarSign,
  Search,
} from 'lucide-react';

export default function Header() {
  const {
    activeTab,
    setActiveTab,
    savedLeads,
    crmLeads,
    crmStats,
    leads,
    setIsSavedDrawerOpen,
    setIsApiSettingsOpen,
  } = useProspectingStore();

  const hotLeadsCount = leads.filter((l) => l.scoreResult.leadScorePercentage >= 75).length;
  const closedCount = crmStats?.closedCount ?? crmLeads.filter((l) => l.crmStatus === 'Fechado').length;
  const mrr = crmStats?.totalMrr ?? crmLeads.filter((l) => l.crmStatus === 'Fechado').reduce((acc, l) => acc + (l.monthlyFee || 150), 0);

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-2.5 flex items-center justify-between gap-4">
      {/* Brand & Platform Identity */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => setActiveTab('prospecting')}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/20 cursor-pointer transition-transform active:scale-95"
        >
          <Compass className="w-5 h-5 text-slate-950" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1
              onClick={() => setActiveTab('prospecting')}
              className="font-black text-lg tracking-tight text-white cursor-pointer hover:text-indigo-300 transition-colors"
            >
              LeadRadar <span className="text-indigo-400 font-semibold text-sm">PRO</span>
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
              Outbound Intelligence
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium hidden md:block">
            Motor de Prospecção Comercial & Qualificação de PMEs no Brasil
          </p>
        </div>
      </div>

      {/* Center Navigation: Radar de Leads vs. CRM & Negociações */}
      <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800/80">
        <button
          onClick={() => setActiveTab('prospecting')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'prospecting'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Radar de Prospecção</span>
          {leads.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${activeTab === 'prospecting' ? 'bg-indigo-950 text-indigo-200' : 'bg-slate-800 text-slate-400'}`}>
              {leads.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('crm')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all relative ${
            activeTab === 'crm'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Pipeline & CRM</span>
          {crmLeads.length > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
                activeTab === 'crm' ? 'bg-slate-950 text-emerald-300' : 'bg-emerald-500 text-slate-950'
              }`}
            >
              {crmLeads.length}
            </span>
          )}
        </button>
      </div>

      {/* Right KPI Metrics & Settings */}
      <div className="flex items-center gap-2">
        {/* Hot Leads Badge */}
        {hotLeadsCount > 0 && (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span><strong>{hotLeadsCount}</strong> Alta Prioridade</span>
          </div>
        )}

        {/* MRR Stats Badge */}
        {mrr > 0 && (
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>MRR: <strong>R$ {mrr.toLocaleString('pt-BR')}</strong>/mês</span>
          </div>
        )}

        {/* Saved Leads Button */}
        <button
          onClick={() => setIsSavedDrawerOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
          title="Ver leads salvos"
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="hidden sm:inline">Salvos</span>
          {savedLeads.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold font-mono">
              {savedLeads.length}
            </span>
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setIsApiSettingsOpen(true)}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all"
          title="Configurações e Chaves de Integração"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
