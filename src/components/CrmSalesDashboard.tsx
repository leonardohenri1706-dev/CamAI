'use client';

import { useState, useEffect } from 'react';
import { useProspectingStore } from '@/lib/store';
import { PlaceLead, CrmStage } from '@/types/prospecting';
import { buildWhatsAppLink } from '@/lib/phoneVerifier';
import {
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  MessageSquare,
  Phone,
  ExternalLink,
  ChevronRight,
  Trash2,
  Edit3,
  Calendar,
  Sparkles,
  Building,
  MapPin,
  X,
  Send,
  AlertCircle,
  BarChart3,
  Kanban,
  Table,
  Layers,
} from 'lucide-react';

const STAGES: { id: CrmStage; label: string; color: string; badgeBg: string; border: string }[] = [
  { id: 'Novo', label: '1. Novos Leads', color: 'text-blue-400', badgeBg: 'bg-blue-950/80', border: 'border-blue-800' },
  { id: 'Contatado', label: '2. Contato Feito', color: 'text-amber-400', badgeBg: 'bg-amber-950/80', border: 'border-amber-800' },
  { id: 'Demonstracao', label: '3. Em Demonstração', color: 'text-purple-400', badgeBg: 'bg-purple-950/80', border: 'border-purple-800' },
  { id: 'Fechado', label: '4. Clientes Fechados', color: 'text-emerald-400', badgeBg: 'bg-emerald-950/80', border: 'border-emerald-800' },
  { id: 'Perdido', label: '5. Sem Interesse', color: 'text-slate-400', badgeBg: 'bg-slate-900', border: 'border-slate-800' },
];

export default function CrmSalesDashboard() {
  const {
    crmLeads,
    crmStats,
    fetchCrmData,
    updateLeadCrm,
    createManualLead,
    deleteCrmLead,
    setSelectedLead,
    setIsDetailOpen,
    setActiveTab,
  } = useProspectingStore();

  const [viewMode, setViewMode] = useState<'kanban' | 'table' | 'analytics'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<PlaceLead | null>(null);

  // New Lead Form State
  const [formData, setFormData] = useState({
    displayName: '',
    contactName: '',
    category: 'Hamburgueria',
    city: 'Fortaleza',
    neighborhood: '',
    phone: '',
    monthlyFee: 150,
    setupFee: 400,
    crmStatus: 'Novo' as CrmStage,
    notes: '',
  });

  useEffect(() => {
    fetchCrmData();
  }, [fetchCrmData]);

  const handleSaveNewLead = async () => {
    if (!formData.displayName.trim()) return;
    await createManualLead({
      displayName: formData.displayName.trim(),
      contactName: formData.contactName.trim(),
      category: formData.category,
      city: formData.city,
      neighborhood: formData.neighborhood,
      formattedAddress: `${formData.displayName} - ${formData.neighborhood || formData.city}`,
      digitalHealth: {
        hasWebsite: false,
        hasWhatsApp: true,
        formattedPhone: formData.phone || '(85) 99999-0000',
        rawPhone: `55${(formData.phone || '85999990000').replace(/\D/g, '')}`,
        rating: 4.8,
        reviewsCount: 80,
        googleMapsUri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.displayName + ' ' + formData.city)}`,
      },
      scoreResult: {
        leadScorePercentage: 85,
        classification: 'Alta Prioridade',
        rationale: 'Lead adicionado diretamente no CRM de Vendas.',
        customPitch: '',
        factors: { noWebsiteBonus: 35, reviewVolumeBonus: 20, phoneVerifiedBonus: 15, categoryFitBonus: 20 },
      },
      monthlyFee: Number(formData.monthlyFee),
      setupFee: Number(formData.setupFee),
      crmStatus: formData.crmStatus,
      notes: formData.notes,
    });
    setIsAddModalOpen(false);
    setFormData({
      displayName: '',
      contactName: '',
      category: 'Hamburgueria',
      city: 'Fortaleza',
      neighborhood: '',
      phone: '',
      monthlyFee: 150,
      setupFee: 400,
      crmStatus: 'Novo',
      notes: '',
    });
  };

  const handleUpdateEditingLead = async () => {
    if (!editingLead) return;
    await updateLeadCrm(editingLead.id, {
      displayName: editingLead.displayName,
      contactName: editingLead.contactName,
      category: editingLead.category,
      monthlyFee: Number(editingLead.monthlyFee || 0),
      setupFee: Number(editingLead.setupFee || 0),
      crmStatus: editingLead.crmStatus,
      notes: editingLead.notes,
    });
    setEditingLead(null);
  };

  const handleLaunchWhatsApp = (lead: PlaceLead) => {
    const rawPhone = lead.digitalHealth.rawPhone || lead.digitalHealth.formattedPhone || '';
    const pitch = lead.scoreResult.customPitch || `Olá, responsável pelo ${lead.displayName}, tudo bem?`;
    const waUrl = buildWhatsAppLink(rawPhone, pitch);
    window.open(waUrl, '_blank');

    // Update status to Contatado if it was Novo
    if (lead.crmStatus === 'Novo') {
      updateLeadCrm(lead.id, { crmStatus: 'Contatado' });
    }
  };

  const filteredLeads = crmLeads.filter((lead) => {
    const matchesSearch =
      lead.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || lead.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = crmStats || {
    totalLeads: crmLeads.length,
    closedCount: crmLeads.filter((l) => l.crmStatus === 'Fechado').length,
    inNegotiationCount: crmLeads.filter((l) => l.crmStatus === 'Contatado' || l.crmStatus === 'Demonstracao').length,
    newCount: crmLeads.filter((l) => l.crmStatus === 'Novo').length,
    lostCount: crmLeads.filter((l) => l.crmStatus === 'Perdido').length,
    conversionRate: crmLeads.length > 0 ? Math.round((crmLeads.filter((l) => l.crmStatus === 'Fechado').length / crmLeads.length) * 100) : 0,
    totalMrr: crmLeads.filter((l) => l.crmStatus === 'Fechado').reduce((acc, l) => acc + (l.monthlyFee || 150), 0),
    totalSetupRevenue: crmLeads.filter((l) => l.crmStatus === 'Fechado').reduce((acc, l) => acc + (l.setupFee || 400), 0),
    pipelineValue: crmLeads
      .filter((l) => l.crmStatus !== 'Fechado' && l.crmStatus !== 'Perdido')
      .reduce((acc, l) => acc + (l.monthlyFee || 150) * 12 + (l.setupFee || 400), 0),
    stageCounts: {
      Novo: crmLeads.filter((l) => l.crmStatus === 'Novo').length,
      Contatado: crmLeads.filter((l) => l.crmStatus === 'Contatado').length,
      Demonstracao: crmLeads.filter((l) => l.crmStatus === 'Demonstracao').length,
      Fechado: crmLeads.filter((l) => l.crmStatus === 'Fechado').length,
      Perdido: crmLeads.filter((l) => l.crmStatus === 'Perdido').length,
    },
    nicheBreakdown: [],
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header & Metric Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            CRM & Dashboard de Vendas (Dados Reais no Django)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Gerencie seus clientes, contratos recorrentes (MRR), funil de vendas e histórico de interações.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Novo Cliente Manual
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Card 1: MRR Fechado */}
        <div className="glass-panel rounded-2xl p-4 border border-emerald-800/60 bg-emerald-950/20 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-1">
            <span>MRR Recorrente</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-xl md:text-2xl font-black text-emerald-300">
            R$ {stats.totalMrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            <span className="text-[11px] font-normal text-emerald-400/80">/mês</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Receita de contratos fechados</span>
        </div>

        {/* Card 2: Pipeline Ativo */}
        <div className="glass-panel rounded-2xl p-4 border border-cyan-800/60 bg-cyan-950/20 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold mb-1">
            <span>Pipeline Ativo</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-xl md:text-2xl font-black text-cyan-300">
            R$ {stats.pipelineValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Potencial anual em negociação</span>
        </div>

        {/* Card 3: Clientes Fechados */}
        <div className="glass-panel rounded-2xl p-4 border border-purple-800/60 bg-purple-950/20 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-purple-400 font-semibold mb-1">
            <span>Clientes Fechados</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xl md:text-2xl font-black text-purple-300">
            {stats.closedCount}
            <span className="text-xs font-normal text-slate-400 ml-1">contratos</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Setup: R$ {stats.totalSetupRevenue}</span>
        </div>

        {/* Card 4: Taxa de Conversão */}
        <div className="glass-panel rounded-2xl p-4 border border-amber-800/60 bg-amber-950/20 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-1">
            <span>Taxa de Conversão</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xl md:text-2xl font-black text-amber-300">
            {stats.conversionRate}%
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Fechados vs Total de Leads</span>
        </div>

        {/* Card 5: Total no CRM */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 bg-slate-900/60 shadow-lg relative overflow-hidden col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-1">
            <span>Leads no Funil</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-100">
            {stats.totalLeads}
            <span className="text-xs font-normal text-slate-400 ml-1">empresas</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">{stats.inNegotiationCount} em contato ativo</span>
        </div>
      </div>

      {/* View Switcher & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        {/* Tab view mode */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              viewMode === 'kanban' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" /> Funil Kanban
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              viewMode === 'table' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" /> Tabela de Clientes
          </button>
          <button
            onClick={() => setViewMode('analytics')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              viewMode === 'analytics' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Relatório por Nicho
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente, contato..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Empty State when no leads are in CRM */}
      {crmLeads.length === 0 && (
        <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800 space-y-4 max-w-lg mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center mx-auto shadow-xl">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Nenhum cliente no CRM ainda</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Você pode salvar estabelecimentos qualificados durante a busca no mapa usando o botão 🔖 ou cadastrar manualmente novos clientes aqui.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('prospecting')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow"
            >
              <Search className="w-4 h-4" /> Buscar no Mapa
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700"
            >
              <Plus className="w-4 h-4" /> Cadastrar Manualmente
            </button>
          </div>
        </div>
      )}

      {/* View 1: Kanban Pipeline */}
      {crmLeads.length > 0 && viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => (l.crmStatus || 'Novo') === stage.id);
            const stageTotalMrr = stageLeads.reduce((acc, l) => acc + (l.monthlyFee || 150), 0);

            return (
              <div
                key={stage.id}
                className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-3 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${stage.color}`}>{stage.label}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                      {stageLeads.length}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    R$ {stageTotalMrr}/mês
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {stageLeads.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-center p-3 rounded-xl border border-dashed border-slate-800/80 text-slate-500 text-[11px]">
                      <span>Nenhum lead nesta etapa</span>
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 hover:border-cyan-600/70 transition-all shadow group space-y-2.5"
                      >
                        {/* Title & Category */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-white truncate group-hover:text-cyan-300 transition-colors">
                              {lead.displayName}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                              <span className="truncate">{lead.neighborhood || lead.city}</span>
                            </div>
                          </div>

                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono shrink-0">
                            {lead.scoreResult.leadScorePercentage}%
                          </span>
                        </div>

                        {/* Deal Values */}
                        <div className="flex items-center justify-between text-[11px] bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800 text-slate-300 font-mono">
                          <span className="text-emerald-400 font-bold">R$ {lead.monthlyFee || 150}/mês</span>
                          <span className="text-slate-400 text-[10px]">Setup R$ {lead.setupFee || 400}</span>
                        </div>

                        {/* Quick Notes if any */}
                        {lead.notes && (
                          <p className="text-[10px] text-slate-400 line-clamp-2 italic bg-slate-900/40 p-1.5 rounded border border-slate-800/40">
                            "{lead.notes}"
                          </p>
                        )}

                        {/* Actions & WhatsApp trigger */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                          {/* Stage Quick Switcher */}
                          <select
                            value={lead.crmStatus || 'Novo'}
                            onChange={(e) => updateLeadCrm(lead.id, { crmStatus: e.target.value as CrmStage })}
                            className="bg-slate-900 text-[10px] text-slate-300 border border-slate-800 rounded px-1.5 py-1 focus:outline-none focus:border-cyan-500 cursor-pointer"
                          >
                            <option value="Novo">Novo</option>
                            <option value="Contatado">Contatado</option>
                            <option value="Demonstracao">Demonstração</option>
                            <option value="Fechado">Fechado</option>
                            <option value="Perdido">Perdido</option>
                          </select>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingLead(lead)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                              title="Editar Detalhes & Valores"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>

                            <button
                              onClick={() => handleLaunchWhatsApp(lead)}
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-[10px] flex items-center gap-1 shadow transition-all active:scale-95"
                              title="Disparar Pitch no WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3 text-slate-950" /> WhatsApp
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View 2: Data Table */}
      {crmLeads.length > 0 && viewMode === 'table' && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5 font-bold">Estabelecimento</th>
                  <th className="p-3.5 font-bold">Nicho / Categoria</th>
                  <th className="p-3.5 font-bold">Localização</th>
                  <th className="p-3.5 font-bold">Status Funil</th>
                  <th className="p-3.5 font-bold">Mensalidade (MRR)</th>
                  <th className="p-3.5 font-bold">Setup</th>
                  <th className="p-3.5 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3.5 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <div>
                          <span>{lead.displayName}</span>
                          {lead.contactName && (
                            <span className="text-[10px] text-slate-500 block">Contato: {lead.contactName}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-400">{lead.category}</td>
                    <td className="p-3.5 text-slate-400">{lead.neighborhood || lead.city}</td>
                    <td className="p-3.5">
                      <select
                        value={lead.crmStatus || 'Novo'}
                        onChange={(e) => updateLeadCrm(lead.id, { crmStatus: e.target.value as CrmStage })}
                        className="bg-slate-900 text-xs font-semibold text-cyan-300 border border-slate-800 rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500 cursor-pointer"
                      >
                        <option value="Novo">Novo Lead</option>
                        <option value="Contatado">Contato Feito</option>
                        <option value="Demonstracao">Em Demonstração</option>
                        <option value="Fechado">Cliente Fechado</option>
                        <option value="Perdido">Sem Interesse</option>
                      </select>
                    </td>
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">
                      R$ {lead.monthlyFee || 150}/mês
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">
                      R$ {lead.setupFee || 400}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleLaunchWhatsApp(lead)}
                          className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow"
                          title="Disparar Pitch WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingLead(lead)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteCrmLead(lead.id)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors"
                          title="Remover do CRM"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 3: Analytics by Niche */}
      {viewMode === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Desempenho Financeiro por Nicho
            </h3>
            <div className="space-y-3">
              {stats.nicheBreakdown.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Nenhum dado por nicho registrado.</p>
              ) : (
                stats.nicheBreakdown.map((niche, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{niche.category}</span>
                      <span className="font-mono text-emerald-400 font-bold">R$ {niche.mrr}/mês ({niche.closed} fechados)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, Math.max(10, (niche.count / (stats.totalLeads || 1)) * 100))}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Distribuição das Etapas do Funil
            </h3>
            <div className="space-y-2.5">
              {STAGES.map((s) => {
                const count = stats.stageCounts[s.id] || 0;
                const pct = stats.totalLeads > 0 ? Math.round((count / stats.totalLeads) * 100) : 0;
                return (
                  <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${s.color.replace('text-', 'bg-')}`} />
                      <span className="font-semibold text-slate-200">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-slate-400">{count} leads</span>
                      <span className="font-bold text-cyan-300">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Cliente Manual */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <Plus className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-base text-white">Cadastrar Novo Cliente no CRM</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Nome da Empresa / Estabelecimento:</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Ex: Burger Prime Fortaleza"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Nome do Contato / Sócio:</label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="Ex: Carlos Mendes"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">WhatsApp:</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(85) 99999-8888"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Nicho:</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Hamburgueria">Hamburgueria</option>
                    <option value="Pizzaria">Pizzaria</option>
                    <option value="Restaurante">Restaurante</option>
                    <option value="Barbearia">Barbearia</option>
                    <option value="Salão de Beleza">Salão de Beleza</option>
                    <option value="Oficina Mecânica">Oficina Mecânica</option>
                    <option value="Clínica Odontológica">Clínica Odontológica</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Cidade / Bairro:</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Fortaleza - Meireles"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Mensalidade (R$/mês):</label>
                  <input
                    type="number"
                    value={formData.monthlyFee}
                    onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Taxa de Setup (R$):</label>
                  <input
                    type="number"
                    value={formData.setupFee}
                    onChange={(e) => setFormData({ ...formData, setupFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Etapa Inicial no Funil:</label>
                <select
                  value={formData.crmStatus}
                  onChange={(e) => setFormData({ ...formData, crmStatus: e.target.value as CrmStage })}
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Novo">1. Novo Lead</option>
                  <option value="Contatado">2. Contato Feito</option>
                  <option value="Demonstracao">3. Em Demonstração</option>
                  <option value="Fechado">4. Cliente Fechado (Ganha)</option>
                  <option value="Perdido">5. Sem Interesse</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Notas & Histórico:</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ex: Proprietário tem interesse em eliminar comissão de apps..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNewLead}
                disabled={!formData.displayName.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow disabled:opacity-50"
              >
                Salvar no Banco Django
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar Detalhes do Cliente */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Editar Cliente: {editingLead.displayName}</h3>
              <button onClick={() => setEditingLead(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Nome do Estabelecimento:</label>
                <input
                  type="text"
                  value={editingLead.displayName}
                  onChange={(e) => setEditingLead({ ...editingLead, displayName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Contato / Responsável:</label>
                  <input
                    type="text"
                    value={editingLead.contactName || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, contactName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Etapa no Funil:</label>
                  <select
                    value={editingLead.crmStatus || 'Novo'}
                    onChange={(e) => setEditingLead({ ...editingLead, crmStatus: e.target.value as CrmStage })}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    <option value="Novo">1. Novo Lead</option>
                    <option value="Contatado">2. Contato Feito</option>
                    <option value="Demonstracao">3. Em Demonstração</option>
                    <option value="Fechado">4. Cliente Fechado</option>
                    <option value="Perdido">5. Sem Interesse</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Mensalidade Recorrente (MRR R$):</label>
                  <input
                    type="number"
                    value={editingLead.monthlyFee || 150}
                    onChange={(e) => setEditingLead({ ...editingLead, monthlyFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Taxa de Setup (R$):</label>
                  <input
                    type="number"
                    value={editingLead.setupFee || 400}
                    onChange={(e) => setEditingLead({ ...editingLead, setupFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Notas da Negociação:</label>
                <textarea
                  rows={3}
                  value={editingLead.notes || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 resize-none"
                />
              </div>

              {/* Timeline Logs if any */}
              {editingLead.timelineLogs && editingLead.timelineLogs.length > 0 && (
                <div className="pt-2">
                  <label className="text-slate-400 block mb-1.5 font-semibold">Histórico de Eventos:</label>
                  <div className="space-y-1.5 max-h-28 overflow-y-auto">
                    {editingLead.timelineLogs.map((log, i) => (
                      <div key={i} className="text-[10px] p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-300">{log.event}</span>
                        <span className="text-slate-500 font-mono">{log.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-800">
              <button
                onClick={() => {
                  deleteCrmLead(editingLead.id);
                  setEditingLead(null);
                }}
                className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-semibold flex items-center gap-1 border border-red-800/50"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remover
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateEditingLead}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
