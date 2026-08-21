'use client';

import { useProspectingStore } from '@/lib/store';
import { X, Bookmark, Trash2, Eye, MessageCircle, Star, Sparkles, Building } from 'lucide-react';

export default function SavedLeadsDrawer() {
  const { savedLeads, isSavedDrawerOpen, setIsSavedDrawerOpen, setSelectedLead, toggleSaveLead, updateLeadCrmStatus } = useProspectingStore();

  if (!isSavedDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex-1" onClick={() => setIsSavedDrawerOpen(false)} />

      <aside className="w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="sticky top-0 z-20 glass-panel px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
                <Bookmark className="w-5 h-5 fill-current" />
              </span>
              <div>
                <h2 className="font-bold text-lg text-slate-100">Leads Salvos & Pipeline CRM</h2>
                <p className="text-xs text-slate-400">{savedLeads.length} estabelecimentos qualificados salvos</p>
              </div>
            </div>

            <button
              onClick={() => setIsSavedDrawerOpen(false)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of Saved Leads */}
          <div className="p-6 space-y-4">
            {savedLeads.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-3">
                <Building className="w-12 h-12 mx-auto text-slate-600" />
                <p className="text-sm">Nenhum lead salvo ainda.</p>
                <p className="text-xs text-slate-600">Clique no ícone de marcador nos cards de leads para salvar no seu CRM.</p>
              </div>
            ) : (
              savedLeads.map((lead) => {
                const whatsappNumber = lead.digitalHealth.rawPhone || '5511999990000';
                const encodedPitch = encodeURIComponent(lead.scoreResult.customPitch);
                const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedPitch}`;

                return (
                  <div
                    key={lead.id}
                    className="glass-card rounded-2xl p-4 border border-slate-800/80 space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300">
                          {lead.category}
                        </span>
                        <h3 className="font-bold text-base text-slate-100 mt-1">{lead.displayName}</h3>
                        <p className="text-xs text-slate-400">{lead.formattedAddress}</p>
                      </div>

                      {/* Score Badge */}
                      <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-extrabold flex items-center gap-1 shrink-0">
                        <Sparkles className="w-3 h-3 text-emerald-400" /> {lead.scoreResult.leadScorePercentage}%
                      </span>
                    </div>

                    {/* CRM Pipeline Status buttons */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/60">
                      <span className="text-[11px] text-slate-400 font-medium mr-1">Status:</span>
                      {(['Novo', 'Contatado', 'Demonstracao', 'Fechado', 'Perdido'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => updateLeadCrmStatus(lead.id, status)}
                          className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                            lead.crmStatus === status
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-700 font-bold'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {status === 'Demonstracao' ? 'Demonstração' : status}
                        </button>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setIsSavedDrawerOpen(false);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" /> Ver Pitch
                      </button>

                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" /> WhatsApp
                      </a>

                      <button
                        onClick={() => toggleSaveLead(lead.id)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-800 transition-all"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
