'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ExecutiveNavbar from '@/components/ExecutiveNavbar';
import ExecutiveCommandBar from '@/components/ExecutiveCommandBar';
import RepoAnalyzer from '@/components/RepoAnalyzer';
import ProgressBarSteps from '@/components/ProgressBarSteps';
import LeadDataTable from '@/components/LeadDataTable';
import LeadCard from '@/components/LeadCard';
import InteractiveMap from '@/components/InteractiveMap';
import LeadDetailDrawer from '@/components/LeadDetailDrawer';
import SavedLeadsDrawer from '@/components/SavedLeadsDrawer';
import ApiSettingsModal from '@/components/ApiSettingsModal';
import CrmSalesDashboard from '@/components/CrmSalesDashboard';
import { useProspectingStore } from '@/lib/store';
import { calculateLeadScore } from '@/lib/scoringEngine';
import { exportLeadsToCSV, exportLeadsToJSON } from '@/lib/exportUtils';
import { PlaceLead } from '@/types/prospecting';
import {
  Sparkles,
  Building,
  Filter,
  Flame,
  LayoutGrid,
  Table as TableIcon,
  Download,
  FileSpreadsheet,
  FileJson,
  Zap,
  MapPin,
  RefreshCw,
} from 'lucide-react';

export default function Home() {
  const {
    activeTab,
    leads,
    setLeads,
    currentLocation,
    currentRepo,
    filters,
    setFilters,
    pitchTone,
    apiSettings,
    fetchCrmData,
    setSelectedLead,
    setIsDetailOpen,
    isSearchingLeads,
    setIsSearchingLeads,
    setIsSavedDrawerOpen,
    setIsApiSettingsOpen,
  } = useProspectingStore();

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [currentProgressStep, setCurrentProgressStep] = useState(1);
  const [progressStatusText, setProgressStatusText] = useState('Iniciando varredura...');

  // Search Engine Executor
  const handleExecuteSearch = useCallback(
    async (query: string, category: string) => {
      setIsSearchingLeads(true);
      setCurrentProgressStep(1);
      setProgressStatusText(`Mapeando nós e estabelecimentos para "${query || category}"...`);

      try {
        let searchData: any = null;

        // Step 1: Query API
        try {
          const res = await fetch('/api/search-places', {
            method: 'POST',
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customQuery: query,
              category: category,
              location: currentLocation,
              openrouterApiKey:
                apiSettings.openrouterApiKey ||
                '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',
            }),
          });
          searchData = await res.json();
        } catch {
          // Fallback to local Django if running
          const res = await fetch('http://127.0.0.1:8000/api/django/search-places/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customQuery: query, category: category, location: currentLocation }),
          });
          searchData = await res.json();
        }

        if (searchData && searchData.success && Array.isArray(searchData.leads)) {
          setCurrentProgressStep(2);
          setProgressStatusText('Rastreando websites e diagnosticando saúde digital...');

          // Step 2: Score Leads with ICP
          let scoreData: any = null;
          try {
            const scoreRes = await fetch('/api/score-lead', {
              method: 'POST',
              cache: 'no-store',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                rawLeads: searchData.leads,
                repoAnalysis: currentRepo,
                pitchTone: pitchTone,
                devName: apiSettings.devName || 'Leonardo',
                demoUrl: apiSettings.demoUrl,
              }),
            });
            scoreData = await scoreRes.json();
          } catch {}

          setCurrentProgressStep(3);
          setProgressStatusText('Validando contatos de WhatsApp e DDDs regionais...');

          let finalLeads: PlaceLead[] = [];
          if (scoreData && scoreData.success && Array.isArray(scoreData.leads)) {
            finalLeads = scoreData.leads;
          } else {
            finalLeads = searchData.leads.map((l: any) => ({
              ...l,
              scoreResult: calculateLeadScore(
                l.displayName,
                l.category,
                l.digitalHealth,
                currentRepo,
                pitchTone,
                apiSettings.devName || 'Leonardo',
                apiSettings.demoUrl
              ),
            }));
          }

          setCurrentProgressStep(4);
          setProgressStatusText('Finalizando classificação e gerando abordagens...');

          setLeads(finalLeads);
          try {
            localStorage.setItem('leadradar_leads_cache', JSON.stringify(finalLeads));
          } catch {}
        }
      } catch (err) {
        console.error('Search execution error:', err);
      } finally {
        setIsSearchingLeads(false);
      }
    },
    [currentLocation, apiSettings, currentRepo, pitchTone, setIsSearchingLeads, setLeads]
  );

  // Initial load
  useEffect(() => {
    fetchCrmData();
    if (leads.length === 0) {
      try {
        const cached = localStorage.getItem('leadradar_leads_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLeads(parsed);
            return;
          }
        }
      } catch {}

      handleExecuteSearch('', 'Todas as PMEs');
    }
  }, [fetchCrmData, leads.length, handleExecuteSearch, setLeads]);

  // Filter and Sort leads
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        if (!lead.digitalHealth.hasWhatsApp || !lead.digitalHealth.rawPhone) {
          return false;
        }
        if (filters.onlyNoWebsite && lead.digitalHealth.hasWebsite) return false;
        if (filters.minScore > 0 && lead.scoreResult.leadScorePercentage < filters.minScore) return false;
        if (filters.minReviews > 0 && lead.digitalHealth.reviewsCount < filters.minReviews) return false;
        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'reviews') {
          return b.digitalHealth.reviewsCount - a.digitalHealth.reviewsCount;
        }
        if (filters.sortBy === 'noWebsiteFirst') {
          if (!a.digitalHealth.hasWebsite && b.digitalHealth.hasWebsite) return -1;
          if (a.digitalHealth.hasWebsite && !b.digitalHealth.hasWebsite) return 1;
        }
        return b.scoreResult.leadScorePercentage - a.scoreResult.leadScorePercentage;
      });
  }, [leads, filters]);

  // Metric counts
  const noWebsiteCount = useMemo(() => leads.filter((l) => !l.digitalHealth.hasWebsite).length, [leads]);
  const validWhatsAppCount = useMemo(() => leads.filter((l) => l.digitalHealth.hasWhatsApp && l.digitalHealth.rawPhone).length, [leads]);

  const handleOpenLeadDrawer = (lead: PlaceLead) => {
    setSelectedLead(lead);
    setIsDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Executive Top Navbar with Live Metrics */}
      <ExecutiveNavbar
        filteredCount={filteredLeads.length}
        noWebsiteCount={noWebsiteCount}
        validWhatsAppCount={validWhatsAppCount}
        onOpenSettings={() => setIsApiSettingsOpen(true)}
        onOpenSaved={() => setIsSavedDrawerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6">
        {/* VIEW 1: CRM & Sales Pipeline */}
        {activeTab === 'crm' && <CrmSalesDashboard />}

        {/* VIEW 2: Prospecting & Lead Radar */}
        {activeTab === 'prospecting' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Step 1: Product ICP Analyzer */}
            <RepoAnalyzer />

            {/* Step 2: Executive Command Bar */}
            <ExecutiveCommandBar onExecuteSearch={handleExecuteSearch} />

            {/* Real-time Progress Bar */}
            {isSearchingLeads && (
              <ProgressBarSteps
                currentStep={currentProgressStep}
                statusText={progressStatusText}
                totalLeadsFound={filteredLeads.length}
              />
            )}

            {/* View Switcher, Stats & Export Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-indigo-400" />
                    Radar de Estabelecimentos Comerciais
                  </h3>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono font-bold">
                    {filteredLeads.length} leads qualificados
                  </span>
                </div>
              </div>

              {/* Action Buttons: View Toggle & Exports */}
              <div className="flex items-center flex-wrap gap-2">
                {/* View Mode Toggle Switch */}
                <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                      viewMode === 'table'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Tabela Densa</span>
                  </button>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                      viewMode === 'cards'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Cards</span>
                  </button>
                </div>

                {/* Export Dropdown / Buttons */}
                <button
                  onClick={() => exportLeadsToCSV(filteredLeads)}
                  disabled={filteredLeads.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all active:scale-95 disabled:opacity-40"
                  title="Exportar para Excel / CRM (HubSpot, RD Station)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Exportar CSV</span>
                </button>

                <button
                  onClick={() => exportLeadsToJSON(filteredLeads)}
                  disabled={filteredLeads.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all active:scale-95 disabled:opacity-40"
                  title="Exportar JSON"
                >
                  <FileJson className="w-3.5 h-3.5 text-indigo-400" />
                  <span>JSON</span>
                </button>
              </div>
            </div>

            {/* Mode 1: Dense Data Table View */}
            {viewMode === 'table' ? (
              <div className="space-y-6">
                {filteredLeads.length === 0 && !isSearchingLeads ? (
                  <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 space-y-3">
                    <Building className="w-8 h-8 text-slate-600 mx-auto" />
                    <h4 className="font-bold text-slate-300 text-sm">Nenhum estabelecimento encontrado com os filtros atuais</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Digite uma cidade, DDD ou selecione outro nicho na Command Bar acima para prospectar novos clientes.
                    </p>
                  </div>
                ) : (
                  <LeadDataTable leads={filteredLeads} onSelectLead={handleOpenLeadDrawer} />
                )}
              </div>
            ) : (
              /* Mode 2: Split View - Dynamic Interactive Map + Lead Cards */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Interactive Map & Live Pins */}
                <div className="lg:col-span-5 space-y-3 sticky top-24">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Mapeamento Geográfico & Densidade • Brasil</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {filteredLeads.length} estabelecimentos
                    </span>
                  </div>

                  <InteractiveMap leads={filteredLeads} location={currentLocation} />
                </div>

                {/* Right Column: Ranked Lead Cards */}
                <div className="lg:col-span-7 space-y-4">
                  {filteredLeads.length === 0 && !isSearchingLeads ? (
                    <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 space-y-3">
                      <Building className="w-8 h-8 text-slate-600 mx-auto" />
                      <h4 className="font-bold text-slate-300 text-sm">Nenhum estabelecimento encontrado com os filtros atuais</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Digite uma cidade, DDD ou selecione outro nicho na Command Bar para prospectar.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {filteredLeads.map((lead) => (
                        <LeadCard key={lead.id} lead={lead} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Drawers & Modals */}
      <LeadDetailDrawer />
      <SavedLeadsDrawer />
      <ApiSettingsModal />
    </div>
  );
}
