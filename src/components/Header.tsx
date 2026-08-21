'use client';

import { useProspectingStore } from '@/lib/store';
import { Target, Bookmark, Settings, Sparkles, Code2, Zap, MapPin, TrendingUp, Users, DollarSign } from 'lucide-react';

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
    currentRepo,
  } = useProspectingStore();

  const hotLeadsCount = leads.filter((l) => l.scoreResult.leadScorePercentage >= 75).length;
  const closedCount = crmStats?.closedCount ?? crmLeads.filter((l) => l.crmStatus === 'Fechado').length;
  const mrr = crmStats?.totalMrr ?? crmLeads.filter((l) => l.crmStatus === 'Fechado').reduce((acc, l) => acc + (l.monthlyFee || 150), 0);

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => setActiveTab('prospecting')}
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 cursor-pointer"
        >
          <Target className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1
              onClick={() => setActiveTab('prospecting')}
              className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 cursor-pointer"
            >
              LeadPulse <span className="text-cyan-400 font-semibold">B2B</span>
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
              <Sparkles className="w-3 h-3 text-cyan-400" /> SaaS Prospecção
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Prospecção com Maps Real + CRM & Vendas Django
          </p>
        </div>
      </div>

      {/* Center Navigation Tabs: Prospecção vs CRM */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('prospecting')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'prospecting'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Prospecção & Mapa</span>
        </button>

        <button
          onClick={() => setActiveTab('crm')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all relative ${
            activeTab === 'crm'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>CRM & Vendas</span>
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

      {/* Right Stats & Actions */}
      <div className="flex items-center gap-2.5">
        {/* MRR pill if > 0 */}
        {mrr > 0 && (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-300 font-mono">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>MRR: <strong>R$ {mrr}</strong>/mês</span>
          </div>
        )}

        {/* Settings Button */}
        <button
          onClick={() => setIsApiSettingsOpen(true)}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all"
          title="Configurações & Chaves"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
