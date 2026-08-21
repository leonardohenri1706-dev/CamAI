'use client';

import { useEffect } from 'react';
import Header from '@/components/Header';
import RepoAnalyzer from '@/components/RepoAnalyzer';
import SearchFilters from '@/components/SearchFilters';
import LeadCard from '@/components/LeadCard';
import InteractiveMap from '@/components/InteractiveMap';
import LeadDetailDrawer from '@/components/LeadDetailDrawer';
import SavedLeadsDrawer from '@/components/SavedLeadsDrawer';
import ApiSettingsModal from '@/components/ApiSettingsModal';
import CrmSalesDashboard from '@/components/CrmSalesDashboard';
import { useProspectingStore } from '@/lib/store';
import { calculateLeadScore } from '@/lib/scoringEngine';
import { PlaceLead } from '@/types/prospecting';
import { Sparkles, Building, Filter, Flame } from 'lucide-react';

export default function Home() {
  const {
    activeTab,
    leads,
    setLeads,
    currentLocation,
    currentRepo,
    filters,
    pitchTone,
    apiSettings,
    fetchCrmData,
  } = useProspectingStore();

  // Initial load: Fetch CRM data and initial real leads from OpenStreetMap
  useEffect(() => {
    fetchCrmData();
    if (leads.length === 0) {
      const fetchInitialLeads = async () => {
        let searchData: any = null;
        try {
          const res = await fetch('http://127.0.0.1:8000/api/django/search-places/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ location: currentLocation, category: 'Hamburgueria' }),
          });
          searchData = await res.json();
        } catch {
          const res = await fetch('/api/search-places', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ location: currentLocation, category: 'Hamburgueria' }),
          });
          searchData = await res.json();
        }

        if (searchData && searchData.success && Array.isArray(searchData.leads)) {
          let scoreData: any = null;
          try {
            const scoreRes = await fetch('http://127.0.0.1:8000/api/django/score-lead/', {
              method: 'POST',
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
          } catch {
            const scoreRes = await fetch('/api/score-lead', {
              method: 'POST',
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
          }

          if (scoreData && scoreData.success && Array.isArray(scoreData.leads)) {
            setLeads(scoreData.leads);
          } else {
            const scored = searchData.leads.map((l: any) => ({
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
            setLeads(scored);
          }
        }
      };

      fetchInitialLeads();
    }
  }, [fetchCrmData, leads.length, currentLocation, currentRepo, pitchTone, apiSettings, setLeads]);

  // Filter and Sort prospecting leads (Only verified WhatsApp leads)
  const filteredLeads = leads
    .filter((lead) => {
      // Must be strictly verified on WhatsApp
      if (!lead.digitalHealth.hasWhatsApp || lead.digitalHealth.isVerified === false) return false;
      if (filters.sourceFilter === 'google_maps' && lead.source === 'instagram') return false;
      if (filters.sourceFilter === 'instagram' && lead.source !== 'instagram') return false;
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6">
        {/* VIEW 1: CRM & Sales Dashboard */}
        {activeTab === 'crm' && <CrmSalesDashboard />}

        {/* VIEW 2: Prospecting & Map Search */}
        {activeTab === 'prospecting' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Step 1: Repo / Product ICP Analyzer */}
            <RepoAnalyzer />

            {/* Step 2: Location & Search Filters with Maps Autocomplete */}
            <SearchFilters />

            {/* Step 3: Split View - Dynamic Interactive Map + Leads Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Interactive Map & Live Pins */}
              <div className="lg:col-span-5 space-y-3 sticky top-24">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>Mapa Interativo • {currentLocation.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {filteredLeads.length} estabelecimentos reais
                  </span>
                </div>

                <InteractiveMap leads={filteredLeads} location={currentLocation} />
              </div>

              {/* Right Column: Ranked Leads List */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Oportunidades Ranqueadas
                    </h3>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                      {filteredLeads.length} leads
                    </span>
                  </div>
                </div>

                {/* Lead Cards List */}
                {filteredLeads.length === 0 ? (
                  <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 space-y-3">
                    <Building className="w-8 h-8 text-slate-600 mx-auto" />
                    <h4 className="font-semibold text-slate-300 text-sm">Nenhum estabelecimento encontrado</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Digite uma cidade no campo de localização acima ou selecione outro nicho para buscar no mapa.
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
