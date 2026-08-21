'use client';

import React, { useState } from 'react';
import { PlaceLead, CrmStage } from '@/types/prospecting';
import { useProspectingStore } from '@/lib/store';
import { buildWhatsAppLink } from '@/lib/phoneVerifier';
import {
  MessageSquare,
  Globe,
  Star,
  ExternalLink,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  Sparkles,
  MapPin,
  TrendingUp,
  SlidersHorizontal,
  Flame,
} from 'lucide-react';

interface LeadDataTableProps {
  leads: PlaceLead[];
  onSelectLead: (lead: PlaceLead) => void;
}

export default function LeadDataTable({ leads, onSelectLead }: LeadDataTableProps) {
  const { toggleSaveLead, updateLeadCrmStatus } = useProspectingStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map((l) => l.id)));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleWhatsAppDirect = (lead: PlaceLead, e: React.MouseEvent) => {
    e.stopPropagation();
    const pitch = lead.scoreResult?.customPitch || `Olá ${lead.displayName}! Vi que vocês estão em ${lead.neighborhood || lead.city} e gostaria de apresentar uma oportunidade.`;
    const url = buildWhatsAppLink(lead.digitalHealth.rawPhone, pitch);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      updateLeadCrmStatus(lead.id, 'Contatado');
    }
  };

  const getCrmColor = (stage?: CrmStage) => {
    switch (stage) {
      case 'Contatado':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/60';
      case 'Demonstracao':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
      case 'Fechado':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
      case 'Perdido':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/60';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-800';
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/90 shadow-2xl backdrop-blur-xl">
      {/* Table Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-indigo-950/70 border-b border-indigo-800/50 text-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-indigo-200 font-semibold">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
              {selectedIds.size}
            </span>
            <span>Leads selecionados para ação rápida</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                leads.filter((l) => selectedIds.has(l.id)).forEach((l) => toggleSaveLead(l.id));
              }}
              className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium transition-all"
            >
              Salvar Selecionados
            </button>
          </div>
        </div>
      )}

      {/* Dense Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={leads.length > 0 && selectedIds.size === leads.length}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3">Oportunidade</th>
              <th className="py-3 px-4">Empresa & Segmento</th>
              <th className="py-3 px-4">Localização (Cidade / Bairro)</th>
              <th className="py-3 px-4">WhatsApp Direto</th>
              <th className="py-3 px-3">Grandes Avaliações</th>
              <th className="py-3 px-3">Website</th>
              <th className="py-3 px-3">Instagram</th>
              <th className="py-3 px-3">Status Pipeline</th>
              <th className="py-3 px-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {leads.map((lead) => {
              const isSelected = selectedIds.has(lead.id);
              const score = lead.scoreResult?.leadScorePercentage || 85;
              const hasWebsite = lead.digitalHealth.hasWebsite;
              const phone = lead.digitalHealth.formattedPhone || lead.digitalHealth.rawPhone || '';

              return (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className={`group cursor-pointer transition-colors duration-150 ${
                    isSelected ? 'bg-indigo-950/30' : 'hover:bg-slate-900/60'
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => toggleSelectOne(lead.id, e as any)}
                      className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                  </td>

                  {/* Opportunity Score */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`px-2 py-0.5 rounded-md font-mono font-black text-xs border ${
                          score >= 80
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                            : score >= 60
                            ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {score}%
                      </div>
                      {score >= 85 && <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </div>
                  </td>

                  {/* Company Name & Segment */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-1 max-w-[220px]">
                      {lead.displayName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium line-clamp-1">
                      {lead.category}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span className="font-semibold">{lead.city}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 pl-4 line-clamp-1 max-w-[180px]">
                      {lead.neighborhood || 'Centro'}
                    </div>
                  </td>

                  {/* WhatsApp Contact */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {lead.digitalHealth.hasWhatsApp && phone ? (
                      <button
                        onClick={(e) => handleWhatsAppDirect(lead, e)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/90 text-emerald-300 border border-emerald-700/70 font-mono font-bold text-xs hover:bg-emerald-900 transition-all shadow-sm group/btn active:scale-95"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400 group-hover/btn:scale-110 transition-transform" />
                        <span>{phone}</span>
                      </button>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Sem celular</span>
                    )}
                  </td>

                  {/* Reviews */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/50 font-bold text-[11px]">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                      <span>{typeof lead.digitalHealth.rating === 'number' ? lead.digitalHealth.rating.toFixed(1) : lead.digitalHealth.rating}</span>
                      <span className="text-amber-200/80 text-[10px]">({lead.digitalHealth.reviewsCount})</span>
                    </div>
                  </td>

                  {/* Website */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {!hasWebsite ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 text-[10px] font-bold">
                        <Globe className="w-3 h-3 text-emerald-400" /> Sem Site (+40%)
                      </span>
                    ) : (
                      <a
                        href={lead.digitalHealth.websiteUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 hover:text-indigo-300 border border-slate-800 text-[10px] font-medium"
                      >
                        <Globe className="w-3 h-3 text-slate-500" /> Ativo
                      </a>
                    )}
                  </td>

                  {/* Instagram */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {lead.digitalHealth.instagramHandle ? (
                      <a
                        href={lead.digitalHealth.instagramProfileUrl || `https://instagram.com/${lead.digitalHealth.instagramHandle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 text-[11px] font-semibold hover:bg-indigo-900 transition-all"
                      >
                        <span>{lead.digitalHealth.instagramHandle}</span>
                      </a>
                    ) : (
                      <span className="text-slate-500 text-[11px]">-</span>
                    )}
                  </td>

                  {/* Mini-CRM Status */}
                  <td className="py-3 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={lead.crmStatus || 'Novo'}
                      onChange={(e) => updateLeadCrmStatus(lead.id, e.target.value as CrmStage)}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold border cursor-pointer outline-none transition-all ${getCrmColor(
                        lead.crmStatus
                      )}`}
                    >
                      <option value="Novo" className="bg-slate-900 text-slate-200">Novo</option>
                      <option value="Contatado" className="bg-slate-900 text-blue-300">Contatado</option>
                      <option value="Demonstracao" className="bg-slate-900 text-purple-300">Demonstração</option>
                      <option value="Fechado" className="bg-slate-900 text-emerald-300">Fechado</option>
                      <option value="Perdido" className="bg-slate-900 text-rose-300">Perdido</option>
                    </select>
                  </td>

                  {/* Quick Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => toggleSaveLead(lead.id)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          lead.isSaved
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-900 text-slate-400 hover:text-amber-300 border-slate-800 hover:border-slate-700'
                        }`}
                        title="Salvar Lead"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onSelectLead(lead)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold text-xs flex items-center gap-1 transition-all"
                      >
                        <span>Raio-X</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
