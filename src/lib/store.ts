import { create } from 'zustand';
import { RepoAnalysis, PlaceLead, FilterOptions, SearchLocation, ApiSettings, CRMStats, CrmStage } from '@/types/prospecting';
import { syncLeadToSupabase } from './supabase';

export const REAL_INITIAL_LOCATIONS: SearchLocation[] = [
  {
    name: '🇧🇷 Todo o Brasil (Busca Rápida)',
    city: 'Todo o Brasil',
    state: 'BR',
    center: { lat: -14.235004, lng: -51.92528 },
    zoom: 4,
  },
  {
    name: 'Fortaleza - Meireles & Aldeota',
    city: 'Fortaleza',
    state: 'CE',
    center: { lat: -3.731862, lng: -38.526670 },
    zoom: 14,
  },
  {
    name: 'São Paulo - Moema & Vila Olímpia',
    city: 'São Paulo',
    state: 'SP',
    center: { lat: -23.604, lng: -46.666 },
    zoom: 14,
  },
  {
    name: 'Rio de Janeiro - Copacabana & Ipanema',
    city: 'Rio de Janeiro',
    state: 'RJ',
    center: { lat: -22.969, lng: -43.186 },
    zoom: 14,
  },
  {
    name: 'Curitiba - Batel & Centro',
    city: 'Curitiba',
    state: 'PR',
    center: { lat: -25.438, lng: -49.282 },
    zoom: 14,
  },
  {
    name: 'Belo Horizonte - Savassi & Funcionários',
    city: 'Belo Horizonte',
    state: 'MG',
    center: { lat: -19.938, lng: -43.935 },
    zoom: 14,
  },
];

interface ProspectingState {
  activeTab: 'prospecting' | 'crm';
  currentRepo: RepoAnalysis;
  locations: SearchLocation[];
  currentLocation: SearchLocation;
  filters: FilterOptions;
  leads: PlaceLead[];
  savedLeads: PlaceLead[];
  crmLeads: PlaceLead[];
  crmStats: CRMStats | null;
  selectedLead: PlaceLead | null;
  isDetailOpen: boolean;
  isSavedDrawerOpen: boolean;
  isApiSettingsOpen: boolean;
  isAnalyzingRepo: boolean;
  isSearchingLeads: boolean;
  pitchTone: 'consultive' | 'direct' | 'promotional';
  apiSettings: ApiSettings;

  // Actions
  setActiveTab: (tab: 'prospecting' | 'crm') => void;
  setRepoAnalysis: (analysis: RepoAnalysis) => void;
  setLocations: (locations: SearchLocation[]) => void;
  addLocation: (location: SearchLocation) => void;
  setLocation: (location: SearchLocation) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  setLeads: (leads: PlaceLead[]) => void;
  setSelectedLead: (lead: PlaceLead | null) => void;
  setIsDetailOpen: (isOpen: boolean) => void;
  setIsSavedDrawerOpen: (isOpen: boolean) => void;
  setIsApiSettingsOpen: (isOpen: boolean) => void;
  setIsAnalyzingRepo: (isAnalyzing: boolean) => void;
  setIsSearchingLeads: (isSearching: boolean) => void;
  setPitchTone: (tone: 'consultive' | 'direct' | 'promotional') => void;
  setApiSettings: (settings: Partial<ApiSettings>) => void;
  toggleSaveLead: (leadId: string) => void;
  updateLeadCrmStatus: (leadId: string, status: CrmStage) => void;
  updateLeadPitch: (leadId: string, newPitch: string) => void;
  fetchCrmData: () => Promise<void>;
  updateLeadCrm: (leadId: string, updates: Partial<PlaceLead>) => Promise<void>;
  createManualLead: (leadData: Partial<PlaceLead>) => Promise<void>;
  deleteCrmLead: (leadId: string) => Promise<void>;
}

export const useProspectingStore = create<ProspectingState>((set, get) => ({
  activeTab: 'prospecting',
  currentRepo: {
    repoUrl: 'https://github.com/cardapio-web/delivery-whatsapp',
    repoName: 'delivery-direto-whatsapp',
    description: 'Sistema web de pedidos diretos e cardápio digital integrado ao WhatsApp para estabelecimentos locais.',
    githubStars: 148,
    githubLanguage: 'TypeScript',
    githubTopics: ['nextjs', 'whatsapp-bot', 'delivery', 'cardapio-digital', 'saas'],
    icp: {
      targetBusinessTypes: ['Hamburgueria', 'Pizzaria', 'Restaurante'],
      targetNiches: ['Gastronomia & Delivery'],
      idealSize: 'Pequeno a Médio Porte',
      recommendedPitchStrategy: 'Abordagem consultiva focada em eliminação de taxas de 12% a 27% dos marketplaces',
      idealLocationKeywords: ['hamburgueria artesanal', 'pizzaria delivery'],
    },
    coreValueProp: 'Elimine até 27% de taxas dos marketplaces com pedidos diretos pelo WhatsApp.',
    searchKeywords: ['hamburgueria artesanal', 'pizzaria delivery'],
    solvedPainPoints: [
      'Comissões abusivas de 15% a 27% em plataformas de entrega de terceiros',
      'Gargalo no atendimento manual do WhatsApp nos horários de pico',
    ],
  },
  locations: REAL_INITIAL_LOCATIONS,
  currentLocation: REAL_INITIAL_LOCATIONS[0],
  filters: {
    onlyNoWebsite: false,
    minReviews: 0,
    minScore: 0,
    categoryFilter: 'Hamburgueria',
    sortBy: 'score',
    searchQuery: '',
  },
  leads: [],
  savedLeads: [],
  crmLeads: [],
  crmStats: null,
  selectedLead: null,
  isDetailOpen: false,
  isSavedDrawerOpen: false,
  isApiSettingsOpen: false,
  isAnalyzingRepo: false,
  isSearchingLeads: false,
  pitchTone: 'consultive',
  apiSettings: {
    useMockEngine: false,
    openrouterApiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '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',
    openrouterModel: 'openai/gpt-4o-mini',
    devName: 'Leonardo',
    demoUrl: 'https://pizzaria-arteedelicia.vercel.app/',
  },

  setActiveTab: (activeTab) => {
    set({ activeTab });
    if (activeTab === 'crm') {
      get().fetchCrmData();
    }
  },

  setRepoAnalysis: (analysis) => set({ currentRepo: analysis }),
  setLocations: (locations) => set({ locations }),
  addLocation: (location) =>
    set((state) => {
      const exists = state.locations.some((l) => l.name.toLowerCase() === location.name.toLowerCase());
      if (exists) return state;
      return {
        locations: [location, ...state.locations],
        currentLocation: location,
      };
    }),
  setLocation: (location) => set({ currentLocation: location }),
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  setLeads: (leads) => set({ leads }),
  setSelectedLead: (lead) => set({ selectedLead: lead, isDetailOpen: !!lead }),
  setIsDetailOpen: (isOpen) => set({ isDetailOpen: isOpen }),
  setIsSavedDrawerOpen: (isOpen) => set({ isSavedDrawerOpen: isOpen }),
  setIsApiSettingsOpen: (isOpen) => set({ isApiSettingsOpen: isOpen }),
  setIsAnalyzingRepo: (isAnalyzing) => set({ isAnalyzingRepo: isAnalyzing }),
  setIsSearchingLeads: (isSearching) => set({ isSearchingLeads: isSearching }),
  setPitchTone: (pitchTone) => set({ pitchTone }),
  setApiSettings: (settings) => set((state) => ({ apiSettings: { ...state.apiSettings, ...settings } })),

  fetchCrmData: async () => {
    try {
      const [leadsRes, statsRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/django/leads/'),
        fetch('http://127.0.0.1:8000/api/django/crm/stats/'),
      ]);

      const leadsData = await leadsRes.json();
      const statsData = await statsRes.json();

      if (leadsData.success && Array.isArray(leadsData.leads)) {
        const mappedLeads: PlaceLead[] = leadsData.leads.map((l: any) => ({
          id: l.lead_id || String(l.id),
          displayName: l.display_name,
          contactName: l.contact_name,
          category: l.category,
          formattedAddress: l.formatted_address,
          neighborhood: l.neighborhood,
          city: l.city,
          coordinates: { lat: l.latitude, lng: l.longitude },
          digitalHealth: {
            hasWebsite: l.has_website,
            websiteUrl: l.website_url,
            hasWhatsApp: l.has_whatsapp,
            formattedPhone: l.phone,
            rawPhone: l.raw_phone,
            rating: l.rating,
            reviewsCount: l.reviews_count,
            googleMapsUri: l.google_maps_uri,
            photoUrl: l.photo_url,
          },
          scoreResult: {
            leadScorePercentage: l.score_percentage,
            classification: l.classification,
            rationale: l.rationale,
            customPitch: l.custom_pitch,
            factors: { noWebsiteBonus: 35, reviewVolumeBonus: 20, phoneVerifiedBonus: 15, categoryFitBonus: 20 },
          },
          isSaved: l.is_saved,
          crmStatus: l.crm_status as CrmStage,
          monthlyFee: l.monthly_fee,
          setupFee: l.setup_fee,
          notes: l.notes,
          timelineLogs: l.timeline_logs || [],
        }));

        set({
          crmLeads: mappedLeads,
          savedLeads: mappedLeads,
        });
      }

      if (statsData.success && statsData.stats) {
        set({ crmStats: statsData.stats });
      }
    } catch (e) {
      console.warn('Error fetching CRM data from Django:', e);
    }
  },

  toggleSaveLead: (leadId) =>
    set((state) => {
      const updatedLeads = state.leads.map((lead) => {
        if (lead.id === leadId) {
          const newIsSaved = !lead.isSaved;
          if (newIsSaved) {
            const updatedItem = { ...lead, isSaved: true, crmStatus: 'Novo' as const };
            syncLeadToSupabase(updatedItem);
            fetch('http://127.0.0.1:8000/api/django/leads/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedItem),
            }).then(() => get().fetchCrmData()).catch(() => {});
          } else {
            fetch(`http://127.0.0.1:8000/api/django/leads/${lead.id}/`, {
              method: 'DELETE',
            }).then(() => get().fetchCrmData()).catch(() => {});
          }

          return { ...lead, isSaved: newIsSaved, crmStatus: newIsSaved ? ('Novo' as const) : undefined };
        }
        return lead;
      });

      const updatedSaved = updatedLeads.filter((l) => l.isSaved);
      const updatedSelected = state.selectedLead?.id === leadId ? updatedLeads.find((l) => l.id === leadId) || null : state.selectedLead;

      return {
        leads: updatedLeads,
        savedLeads: updatedSaved,
        selectedLead: updatedSelected,
      };
    }),

  updateLeadCrmStatus: (leadId, status) => {
    fetch(`http://127.0.0.1:8000/api/django/leads/${leadId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ crmStatus: status }),
    }).then(() => get().fetchCrmData()).catch(() => {});

    set((state) => ({
      leads: state.leads.map((l) => (l.id === leadId ? { ...l, crmStatus: status } : l)),
      savedLeads: state.savedLeads.map((l) => (l.id === leadId ? { ...l, crmStatus: status } : l)),
      crmLeads: state.crmLeads.map((l) => (l.id === leadId ? { ...l, crmStatus: status } : l)),
      selectedLead: state.selectedLead?.id === leadId ? { ...state.selectedLead, crmStatus: status } : state.selectedLead,
    }));
  },

  updateLeadPitch: (leadId, newPitch) => {
    fetch(`http://127.0.0.1:8000/api/django/leads/${leadId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customPitch: newPitch }),
    }).catch(() => {});

    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === leadId
          ? { ...l, scoreResult: { ...l.scoreResult, customPitch: newPitch } }
          : l
      ),
      selectedLead:
        state.selectedLead?.id === leadId
          ? { ...state.selectedLead, scoreResult: { ...state.selectedLead.scoreResult, customPitch: newPitch } }
          : state.selectedLead,
    }));
  },

  updateLeadCrm: async (leadId, updates) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/django/leads/${leadId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      await get().fetchCrmData();
    } catch (e) {
      console.error('Error updating lead CRM in Django:', e);
    }
  },

  createManualLead: async (leadData) => {
    try {
      await fetch('http://127.0.0.1:8000/api/django/leads/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });
      await get().fetchCrmData();
    } catch (e) {
      console.error('Error creating manual lead in Django:', e);
    }
  },

  deleteCrmLead: async (leadId) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/django/leads/${leadId}/`, {
        method: 'DELETE',
      });
      await get().fetchCrmData();
    } catch (e) {
      console.error('Error deleting lead from CRM:', e);
    }
  },
}));
