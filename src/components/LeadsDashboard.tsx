// src/components/LeadsDashboard.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Instagram,
  Globe,
  Star,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  Sparkles,
  Phone,
  MapPin,
  ChevronRight,
  Filter,
} from 'lucide-react';

export interface Lead {
  id: string;
  name: string;
  category: string;
  address: string;
  suburb?: string;
  city: string;
  phoneRaw?: string;
  cleanPhone?: string;
  isValidCellphone: boolean;
  website?: string;
  instagramUrl?: string;
  isInstagramExact: boolean;
  rating?: number;
  userRatingCount?: number;
  painPoints?: string[];
  aiPitch?: string;
}

interface LeadsDashboardProps {
  initialLeads?: Lead[];
  onSelectLead?: (lead: Lead) => void;
}

export function LeadsDashboard({ initialLeads = [], onSelectLead }: LeadsDashboardProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterOnlyValidPhone, setFilterOnlyValidPhone] = useState(false);
  const [filterWithWebsite, setFilterWithWebsite] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);

  // Sync leads if initialLeads prop updates
  React.useEffect(() => {
    if (initialLeads && initialLeads.length > 0) {
      setLeads(initialLeads);
    }
  }, [initialLeads]);

  // Formatação de telefone (DD) 9XXXX-XXXX
  const formatPhone = (phone?: string) => {
    if (!phone) return 'Sem número';
    const digits = phone.replace(/\D/g, '').replace(/^55/, '');
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  // Filtros rápidos
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (filterOnlyValidPhone && !lead.isValidCellphone) return false;
      if (filterWithWebsite && !lead.website) return false;
      return true;
    });
  }, [leads, filterOnlyValidPhone, filterWithWebsite]);

  // Exportação CSV
  const exportToCSV = () => {
    const headers = ['Nome', 'Nicho', 'Cidade', 'Telefone', 'Valido Celular', 'Site', 'Instagram', 'Avaliacao'];
    const rows = filteredLeads.map((l) => [
      `"${l.name}"`,
      `"${l.category}"`,
      `"${l.city}"`,
      `"${l.cleanPhone || l.phoneRaw || ''}"`,
      l.isValidCellphone ? 'Sim' : 'Não',
      `"${l.website || ''}"`,
      `"${l.instagramUrl || ''}"`,
      l.rating || 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_prospector_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copiar Pitch
  const handleCopyPitch = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  // Gerar link de WhatsApp com mensagem pré-preenchida
  const getWhatsAppLink = (lead: Lead) => {
    if (!lead.cleanPhone) return '#';
    const defaultMsg = `Olá ${lead.name}! Vi a empresa de vocês aqui em ${lead.city} e gostaria de apresentar uma oportunidade.`;
    const message = lead.aiPitch || defaultMsg;
    return `https://api.whatsapp.com/send?phone=55${lead.cleanPhone}&text=${encodeURIComponent(message)}`;
  };

  const handleRowClick = (lead: Lead) => {
    setSelectedLead(lead);
    if (onSelectLead) onSelectLead(lead);
  };

  return (
    <div className="w-full rounded-2xl bg-slate-950/80 border border-slate-800 p-4 md:p-6 font-sans space-y-4 shadow-2xl backdrop-blur-xl">
      {/* Header & Ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Radar de Prospecção & CRM
            <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-medium">
              {filteredLeads.length} leads
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Gerencie, filtre e inicie contatos diretamente pelo WhatsApp.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-medium transition active:scale-95 shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 px-2">
          <Filter className="w-3.5 h-3.5 text-indigo-400" /> Filtros Rápidos:
        </span>

        <button
          onClick={() => setFilterOnlyValidPhone(!filterOnlyValidPhone)}
          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition flex items-center gap-1.5 ${
            filterOnlyValidPhone
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Apenas Celular Válido
        </button>

        <button
          onClick={() => setFilterWithWebsite(!filterWithWebsite)}
          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition flex items-center gap-1.5 ${
            filterWithWebsite
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
          }`}
        >
          <Globe className="w-3.5 h-3.5" /> Com Website
        </button>
      </div>

      {/* Tabela de Leads */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Empresa / Nicho</th>
                <th className="py-3 px-4">Localização</th>
                <th className="py-3 px-4">WhatsApp / Telefone</th>
                <th className="py-3 px-4">Canais</th>
                <th className="py-3 px-4 text-center">Google</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                    Nenhum lead encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => handleRowClick(lead)}
                    className="hover:bg-slate-800/40 transition cursor-pointer group"
                  >
                    {/* Nome & Nicho */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white group-hover:text-indigo-300 transition">
                        {lead.name}
                      </div>
                      <div className="text-xs text-slate-400 font-medium">{lead.category}</div>
                    </td>

                    {/* Localização */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate max-w-[180px]">
                          {lead.suburb ? `${lead.suburb}, ` : ''}
                          {lead.city}
                        </span>
                      </div>
                    </td>

                    {/* Telefone */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {lead.isValidCellphone ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-xs font-mono font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            {formatPhone(lead.cleanPhone)}
                          </span>
                        ) : lead.phoneRaw ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-800/60 text-xs font-mono font-bold">
                            <Phone className="w-3.5 h-3.5 text-amber-400" />
                            {formatPhone(lead.phoneRaw)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">Sem telefone</span>
                        )}
                      </div>
                    </td>

                    {/* Canais (Site + Insta) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {lead.website ? (
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition"
                            title="Acessar Website"
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="p-1.5 text-slate-600">
                            <Globe className="w-3.5 h-3.5" />
                          </span>
                        )}

                        {lead.instagramUrl ? (
                          <a
                            href={lead.instagramUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`p-1.5 rounded-lg transition ${
                              lead.isInstagramExact
                                ? 'bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 border border-pink-500/30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                            title={lead.isInstagramExact ? 'Instagram Verificado' : 'Busca de Instagram'}
                          >
                            <Instagram className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="p-1.5 text-slate-600">
                            <Instagram className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Avaliação */}
                    <td className="py-3.5 px-4 text-center">
                      {lead.rating ? (
                        <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-800/40">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {lead.rating.toFixed(1)}
                          <span className="text-amber-200/80 text-[10px]">({lead.userRatingCount || 0})</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600">-</span>
                      )}
                    </td>

                    {/* Ação Rápida */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {lead.isValidCellphone ? (
                        <a
                          href={getWhatsAppLink(lead)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm transition active:scale-95"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Disparar
                        </a>
                      ) : (
                        <button
                          onClick={() => handleRowClick(lead)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs transition"
                        >
                          Ver <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Lateral (Raio-X do Lead) */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              {/* Header do Drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">{selectedLead.name}</h2>
                  <span className="text-xs text-indigo-400 font-medium">{selectedLead.category}</span>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Informações Básicas */}
              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>{selectedLead.address || 'Endereço não disponível'}</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{formatPhone(selectedLead.cleanPhone || selectedLead.phoneRaw)}</span>
                  {selectedLead.isValidCellphone && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30">
                      WhatsApp Ativo
                    </span>
                  )}
                </div>

                {selectedLead.website && (
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                    <a
                      href={selectedLead.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:underline flex items-center gap-1 truncate"
                    >
                      {selectedLead.website} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Dores Identificadas */}
              <div className="mt-6 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Oportunidades & Dores
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  {!selectedLead.website && <li>• Não possui website institucional registrado.</li>}
                  {!selectedLead.isInstagramExact && <li>• Sem presença oficial no Instagram vinculada.</li>}
                  {selectedLead.rating && selectedLead.rating < 4.2 && (
                    <li>• Avaliação no Google ({selectedLead.rating}) tem margem para recuperação de reputação.</li>
                  )}
                  {selectedLead.isValidCellphone && <li>• Contato direto via celular validado disponível.</li>}
                </ul>
              </div>

              {/* Pitch Comercial com IA */}
              <div className="mt-5 p-3.5 bg-indigo-950/20 border border-indigo-500/20 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Pitch de Abordagem (IA)
                  </h3>
                  <button
                    onClick={() =>
                      handleCopyPitch(
                        selectedLead.aiPitch ||
                          `Olá ${selectedLead.name}! Vi a empresa de vocês aqui em ${selectedLead.city}...`
                      )
                    }
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition"
                  >
                    <Copy className="w-3 h-3" /> {copiedPitch ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/40 p-2.5 rounded border border-indigo-500/10">
                  "{selectedLead.aiPitch ||
                    `Olá ${selectedLead.name}, notei que vocês estão localizados no ${
                      selectedLead.suburb || selectedLead.city
                    }. Vocês teriam disponibilidade essa semana para conversar sobre captação de novos clientes?`}"
                </p>
              </div>
            </div>

            {/* Footer do Drawer com Botão de Disparo */}
            <div className="pt-6 border-t border-slate-800">
              {selectedLead.isValidCellphone ? (
                <a
                  href={getWhatsAppLink(selectedLead)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/20 transition active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  Abrir Conversa no WhatsApp
                </a>
              ) : (
                <div className="text-center py-2.5 px-3 bg-slate-800 text-slate-400 rounded-xl text-xs">
                  Número de WhatsApp não verificado para disparo direto.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default LeadsDashboard;
