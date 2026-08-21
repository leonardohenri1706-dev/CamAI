'use client';

import { useState, useEffect, useRef } from 'react';
import { useProspectingStore } from '@/lib/store';
import { SearchLocation } from '@/types/prospecting';
import {
  MapPin,
  Search,
  Globe,
  Star,
  Flame,
  ArrowUpDown,
  Loader2,
  Compass,
  Plus,
  X,
  CheckCircle2,
  Navigation,
  Database
} from 'lucide-react';

export default function SearchFilters() {
  const {
    locations,
    setLocations,
    addLocation,
    currentLocation,
    setLocation,
    filters,
    setFilters,
    currentRepo,
    setLeads,
    isSearchingLeads,
    setIsSearchingLeads,
    pitchTone,
    apiSettings,
  } = useProspectingStore();

  const [customCityInput, setCustomCityInput] = useState('');
  const [suggestions, setSuggestions] = useState<SearchLocation[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [isSavingLocation, setIsSavingLocation] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load saved locations from Django backend on mount
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/django/locations/')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.locations) && data.locations.length > 0) {
          const mapped = data.locations.map((loc: any) => ({
            id: loc.id,
            name: loc.name,
            city: loc.city,
            state: loc.state,
            center: { lat: loc.latitude, lng: loc.longitude },
            zoom: loc.zoom || 14,
            isCustom: loc.is_custom,
          }));
          setLocations(mapped);
        }
      })
      .catch(() => {});
  }, [setLocations]);

  // Autocomplete fetch as user types (debounced 250ms)
  const handleInputChange = (val: string) => {
    setCustomCityInput(val);
    setSelectedIndex(-1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val || val.trim().length < 2) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        let result: any = null;
        try {
          const djangoRes = await fetch(`http://127.0.0.1:8000/api/django/locations/autocomplete/?q=${encodeURIComponent(val.trim())}`);
          result = await djangoRes.json();
        } catch {
          const nextRes = await fetch(`/api/autocomplete-location?q=${encodeURIComponent(val.trim())}`);
          result = await nextRes.json();
        }

        if (result && result.success && Array.isArray(result.suggestions) && result.suggestions.length > 0) {
          setSuggestions(result.suggestions);
          setIsDropdownOpen(true);
        } else {
          setSuggestions([]);
          setIsDropdownOpen(false);
        }
      } catch (err) {
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 250);
  };

  const handleSelectSuggestion = (loc: SearchLocation) => {
    setIsDropdownOpen(false);
    setCustomCityInput(loc.name);
    setLocation(loc);
    handleSearchLeads(loc.name, loc);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isDropdownOpen && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        } else {
          setIsDropdownOpen(false);
          handleSearchLeads();
        }
        return;
      }
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        return;
      }
    } else if (e.key === 'Enter') {
      handleSearchLeads();
    }
  };

  const handleSearchLeads = async (
    customQueryText?: string,
    explicitLocation?: SearchLocation,
    explicitCategory?: string,
    explicitMode?: 'fast' | 'deep'
  ) => {
    setIsSearchingLeads(true);
    setIsDropdownOpen(false);
    try {
      const queryToSend = customQueryText || (customCityInput.trim() ? customCityInput.trim() : currentLocation.name);
      const targetLoc = explicitLocation || currentLocation;

      const activeCategory = explicitCategory || (filters.categoryFilter !== 'Todas' ? filters.categoryFilter : (currentRepo.icp.targetBusinessTypes[0] || 'Hamburgueria'));
      const activeMode = explicitMode || filters.searchMode || 'fast';

      // 1. Search places (via Django Backend or Next API)
      let searchData: any = null;
      try {
        const djangoSearchRes = await fetch('http://127.0.0.1:8000/api/django/search-places/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: targetLoc,
            customQuery: queryToSend,
            category: activeCategory,
            searchMode: activeMode,
          }),
        });
        searchData = await djangoSearchRes.json();
      } catch {
        const nextRes = await fetch('/api/search-places', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: targetLoc,
            customQuery: queryToSend,
            keywords: currentRepo.searchKeywords,
            category: activeCategory,
            searchMode: activeMode,
            openrouterApiKey: apiSettings.openrouterApiKey || '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',
            googlePlacesApiKey: apiSettings.googlePlacesApiKey,
          }),
        });
        searchData = await nextRes.json();
      }

      if (searchData && searchData.success && searchData.leads) {
        // Update map location center
        if (searchData.center) {
          setLocation({
            name: searchData.locationName || queryToSend,
            city: searchData.city || queryToSend.split(',')[0].trim(),
            state: 'BR',
            center: searchData.center,
            zoom: 14,
          });
        }

        // 2. Score leads with Python / Heuristic engine
        let scoreData: any = null;
        try {
          const djangoScoreRes = await fetch('http://127.0.0.1:8000/api/django/score-lead/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              rawLeads: searchData.leads,
              repoAnalysis: currentRepo,
              pitchTone: pitchTone,
              openrouterApiKey: apiSettings.openrouterApiKey,
              openrouterModel: apiSettings.openrouterModel,
            }),
          });
          scoreData = await djangoScoreRes.json();
        } catch {
          const nextScoreRes = await fetch('/api/score-lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              rawLeads: searchData.leads,
              repoAnalysis: currentRepo,
              pitchTone: pitchTone,
              openrouterApiKey: apiSettings.openrouterApiKey,
              openrouterModel: apiSettings.openrouterModel,
            }),
          });
          scoreData = await nextScoreRes.json();
        }

        if (scoreData && scoreData.success && scoreData.leads) {
          setLeads(scoreData.leads);
        }
      }
    } catch (e) {
      console.error('Search leads error:', e);
    } finally {
      setIsSearchingLeads(false);
    }
  };

  const handleSelectPreset = (loc: SearchLocation) => {
    setLocation(loc);
    setCustomCityInput('');
    setIsDropdownOpen(false);
    handleSearchLeads(loc.name, loc);
  };

  const handleSaveNewLocation = async () => {
    if (!newLocationName.trim()) return;
    setIsSavingLocation(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/django/locations/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newLocationName.trim() }),
      });
      const data = await res.json();
      if (data.success && data.location) {
        addLocation(data.location);
        setLocation(data.location);
        setIsAddLocationOpen(false);
        setNewLocationName('');
        handleSearchLeads(data.location.name, data.location);
      }
    } catch {
      const nextRes = await fetch('/api/search-places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customQuery: newLocationName.trim() }),
      });
      const nextData = await nextRes.json();
      if (nextData.success && nextData.center) {
        const newLoc: SearchLocation = {
          name: nextData.locationName || newLocationName.trim(),
          city: newLocationName.split(',')[0].trim(),
          state: 'BR',
          center: nextData.center,
          zoom: 14,
          isCustom: true,
        };
        addLocation(newLoc);
        setLocation(newLoc);
        setIsAddLocationOpen(false);
        setNewLocationName('');
        handleSearchLeads(newLoc.name, newLoc);
      }
    } finally {
      setIsSavingLocation(false);
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-4 border border-slate-800/80 shadow-lg space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Nationwide Prospecting Header */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Etapa 2: Prospecção Nacional de Clientes em Potencial (Todo o Brasil)</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-extrabold flex items-center gap-1 bg-emerald-950/80 border border-emerald-700/60 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Cobertura Nacional Ativa
            </span>
          </div>

          <p className="text-xs text-slate-400">
            A busca vasculha o Brasil inteiro sem restrição de localização para encontrar e ranquear os melhores estabelecimentos comerciais.
          </p>
        </div>

        {/* Search Mode Selector: Fast vs Deep (1000+ leads) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl">
            <span className="text-[11px] text-slate-400 font-extrabold px-1.5">Modo:</span>
            {[
              { label: '⚡ Busca Rápida', val: 'fast', desc: 'Retorno instantâneo dos clientes verificados principais' },
              { label: '🔥 Busca Profunda (Até 10.000 Leads)', val: 'deep', desc: 'Varredura massiva em todos os 2.400+ municípios com mais de 7 mil habitantes no Brasil' },
            ].map((mode) => (
              <button
                key={mode.val}
                onClick={() => {
                  setFilters({ searchMode: mode.val as any });
                  handleSearchLeads(undefined, undefined, undefined, mode.val as any);
                }}
                title={mode.desc}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all active:scale-95 flex items-center gap-1 ${
                  (filters.searchMode || 'fast') === mode.val
                    ? mode.val === 'deep'
                      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-slate-950 font-black shadow-lg shadow-orange-500/20'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Search Trigger Button */}
          <button
            onClick={() => handleSearchLeads()}
            disabled={isSearchingLeads}
            className="w-full lg:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {isSearchingLeads ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> {filters.searchMode === 'deep' ? 'Varrendo 15 capitais (~1000+ Leads)...' : 'Buscando no Brasil...'}
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-slate-950" /> {filters.searchMode === 'deep' ? 'Executar Busca Profunda' : 'Buscar Leads'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add Location Modal / Popover */}
      {isAddLocationOpen && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-800/80 shadow-2xl space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <h4 className="font-bold text-xs text-slate-100">Adicionar & Salvar Nova Localização (Django DB)</h4>
            </div>
            <button
              onClick={() => setIsAddLocationOpen(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            Digite o nome da cidade ou bairro. O backend Python fará a geocodificação automática e salvará permanentemente no banco SQLite do Django.
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveNewLocation()}
              placeholder="Ex: Santos - Gonzaga, SP / Gramado, RS / Vitória - Praia do Canto"
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleSaveNewLocation}
              disabled={isSavingLocation || !newLocationName.trim()}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow active:scale-95 disabled:opacity-50"
            >
              {isSavingLocation ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Geocodificando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Salvar no Django
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Niche Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
            <span className="text-[11px] text-cyan-400 font-extrabold px-2">Nicho:</span>
            {[
              { label: '🍔 Burgers', val: 'Hamburgueria' },
              { label: '🍕 Pizzarias', val: 'Pizzaria' },
              { label: '💈 Barbearias', val: 'Barbearia' },
              { label: '🍽️ Restaurantes', val: 'Restaurante' },
              { label: '🚗 Oficinas', val: 'Oficina Mecânica' },
              { label: '🦷 Odonto', val: 'Clínica Odontológica' },
            ].map((niche) => (
              <button
                key={niche.val}
                onClick={() => {
                  setFilters({ categoryFilter: niche.val });
                  handleSearchLeads(undefined, undefined, niche.val);
                }}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all active:scale-95 ${
                  filters.categoryFilter === niche.val
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {niche.label}
              </button>
            ))}
          </div>

          {/* Dual Source Filter: Google Maps + Instagram */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
            <span className="text-[11px] text-pink-400 font-extrabold px-2 flex items-center gap-1">
              ⚡ Origem:
            </span>
            {[
              { label: '🔥 Todos (Maps + Instagram)', val: 'all' },
              { label: '🗺️ Google Maps', val: 'google_maps' },
              { label: '📸 Instagram', val: 'instagram' },
            ].map((src) => (
              <button
                key={src.val}
                onClick={() => setFilters({ sourceFilter: src.val as any })}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all active:scale-95 ${
                  (filters.sourceFilter || 'all') === src.val
                    ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white shadow-sm font-black'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {src.label}
              </button>
            ))}
          </div>

          {/* WhatsApp Verified Filter Status */}
          <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-700/60 px-3 py-1.5 rounded-xl text-emerald-300 font-extrabold text-[11px] shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zap Verificado</span>
          </div>

          {/* Quick Filter: No Website + Has Instagram (Gold Opportunities) */}
          <button
            onClick={() => setFilters({ onlyNoWebsite: !filters.onlyNoWebsite, sourceFilter: 'all' })}
            className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
              filters.onlyNoWebsite
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-slate-950 border-emerald-400 font-black shadow-lg ring-1 ring-emerald-400'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:text-white'
            }`}
            title="Filtrar pequenas empresas e pizzarias no interior sem site mas com Instagram ativo"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>🍕 Interior + Insta sem Site (Oportunidade Ouro)</span>
          </button>

          {/* Quick Filter: Instagram Direct Prospecting */}
          <button
            onClick={() => setFilters({ sourceFilter: filters.sourceFilter === 'instagram' ? 'all' : 'instagram' })}
            className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 active:scale-95 ${
              filters.sourceFilter === 'instagram'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-pink-400 font-extrabold shadow-md'
                : 'bg-slate-900/80 text-pink-300 border-slate-800 hover:text-white'
            }`}
            title="Filtrar PMEs ativas com perfil autêntico no Instagram para prospecção via Direct DM"
          >
            <span>📸 Prospecção via Instagram Direct</span>
          </button>

          {/* Minimum Reviews Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-xl text-slate-300">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>Avaliações mínimas:</span>
            <select
              value={filters.minReviews}
              onChange={(e) => setFilters({ minReviews: Number(e.target.value) })}
              className="bg-transparent text-cyan-300 font-bold focus:outline-none cursor-pointer ml-1"
            >
              <option value={0} className="bg-slate-900 text-slate-200">Qualquer</option>
              <option value={30} className="bg-slate-900 text-slate-200">30+ avaliações</option>
              <option value={80} className="bg-slate-900 text-slate-200">80+ avaliações</option>
              <option value={150} className="bg-slate-900 text-slate-200">150+ avaliações</option>
            </select>
          </div>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
          <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ordenar por:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ sortBy: e.target.value as any })}
            className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="score" className="bg-slate-900 text-slate-200">Maior Score de Venda</option>
            <option value="reviews" className="bg-slate-900 text-slate-200">Mais Avaliações no Google</option>
            <option value="noWebsiteFirst" className="bg-slate-900 text-slate-200">Sem Website Primeiro</option>
          </select>
        </div>
      </div>
    </div>
  );
}
