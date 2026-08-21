'use client';

import React, { useState } from 'react';
import { useProspectingStore } from '@/lib/store';
import {
  Search,
  MapPin,
  Filter,
  Flame,
  Globe,
  Star,
  CheckCircle2,
  SlidersHorizontal,
  Sparkles,
  Layers,
  Phone,
} from 'lucide-react';

const POPULAR_NICHES = [
  'Todas as PMEs',
  'Hamburguerias & Lanches',
  'Pizzarias & Massas',
  'Restaurantes & Gastronomia',
  'Barbearias & Salões de Beleza',
  'Clínicas Odontológicas & Saúde',
  'Oficinas Mecânicas & Auto',
  'Pet Shops & Clínicas Veterinárias',
  'Lojas de Roupas & Vestuário',
];

const FAST_SEARCH_CHIPS = [
  { label: '🔥 Sem Site (+40% Venda)', query: 'estabelecimentos sem website proprio' },
  { label: '⭐ +600 Avaliações', query: 'estabelecimentos com mais de 600 avaliacoes' },
  { label: '📍 Aracati & Canoa (88)', query: 'Aracati' },
  { label: '📍 Mossoró (84)', query: 'Mossoró' },
  { label: '📍 Fortaleza (85)', query: 'Fortaleza' },
  { label: '📍 Beberibe (88)', query: 'Beberibe' },
  { label: '📍 São Paulo (11)', query: 'São Paulo' },
  { label: '📍 Rio de Janeiro (21)', query: 'Rio de Janeiro' },
];

export default function ExecutiveCommandBar({ onExecuteSearch }: { onExecuteSearch: (query: string, category: string) => void }) {
  const {
    currentLocation,
    setLocation,
    filters,
    setFilters,
    isSearchingLeads,
  } = useProspectingStore();

  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas as PMEs');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecuteSearch(searchInput.trim(), selectedCategory);
  };

  const handleChipClick = (chipQuery: string) => {
    setSearchInput(chipQuery);
    onExecuteSearch(chipQuery, selectedCategory);
  };

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-4 lg:p-5 shadow-2xl space-y-4 backdrop-blur-xl">
      {/* Command Search Form */}
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Main Search Query Input */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por Cidade, Bairro, Nicho ou DDD (ex: Aracati 88, Mossoró 84, Hamburgueria SP)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
          />
        </div>

        {/* Category / Segment Dropdown */}
        <div className="md:col-span-4 relative">
          <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all font-medium appearance-none cursor-pointer"
          >
            {POPULAR_NICHES.map((niche) => (
              <option key={niche} value={niche} className="bg-slate-900 text-slate-200">
                {niche}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Search Button */}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isSearchingLeads}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>{isSearchingLeads ? 'Minerando...' : 'Prospectar'}</span>
          </button>
        </div>
      </form>

      {/* Filter Badges & Fast Action Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
        {/* Toggleable Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-indigo-400" /> Filtros Rápidos:
          </span>

          <button
            type="button"
            onClick={() => setFilters({ onlyNoWebsite: !filters.onlyNoWebsite })}
            className={`px-3 py-1.5 rounded-lg border font-bold text-xs flex items-center gap-1.5 transition-all ${
              filters.onlyNoWebsite
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80 shadow-sm shadow-emerald-950/50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-emerald-400" />
            <span>Apenas Sem Website (+40%)</span>
          </button>

          <button
            type="button"
            onClick={() => setFilters({ minReviews: filters.minReviews > 0 ? 0 : 600 })}
            className={`px-3 py-1.5 rounded-lg border font-bold text-xs flex items-center gap-1.5 transition-all ${
              filters.minReviews >= 600
                ? 'bg-amber-950/90 text-amber-300 border-amber-700/80 shadow-sm shadow-amber-950/50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>+600 Avaliações</span>
          </button>

          <button
            type="button"
            onClick={() => setFilters({ minScore: filters.minScore > 0 ? 0 : 80 })}
            className={`px-3 py-1.5 rounded-lg border font-bold text-xs flex items-center gap-1.5 transition-all ${
              filters.minScore >= 80
                ? 'bg-indigo-950/90 text-indigo-300 border-indigo-700/80 shadow-sm shadow-indigo-950/50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Oportunidade Alta (80%+)</span>
          </button>
        </div>

        {/* Quick Regional Search Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {FAST_SEARCH_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => handleChipClick(chip.query)}
              className="px-2.5 py-1 rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-slate-400 hover:text-indigo-300 text-[11px] font-medium transition-all active:scale-95"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
