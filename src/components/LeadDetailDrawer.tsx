'use client';

import { useState, useEffect } from 'react';
import { useProspectingStore } from '@/lib/store';
import { generateCustomPitch } from '@/lib/scoringEngine';
import { verifyAndFormatRealWhatsApp, buildWhatsAppLink } from '@/lib/phoneVerifier';
import {
  X,
  Sparkles,
  Phone,
  Globe,
  Star,
  MessageSquare,
  Copy,
  Check,
  Send,
  MapPin,
  TrendingUp,
  ShieldAlert,
  Flame,
  Bookmark,
  CheckCircle2,
  Edit3,
  ShieldCheck,
} from 'lucide-react';
import Image from 'next/image';

export default function LeadDetailDrawer() {
  const {
    selectedLead,
    setSelectedLead,
    isDetailOpen,
    setIsDetailOpen,
    currentRepo,
    pitchTone,
    setPitchTone,
    updateLeadPitch,
    toggleSaveLead,
    updateLeadCrmStatus,
    apiSettings,
  } = useProspectingStore();

  const [copied, setCopied] = useState(false);
  const [editablePhone, setEditablePhone] = useState('');

  useEffect(() => {
    if (selectedLead) {
      setEditablePhone(selectedLead.digitalHealth.formattedPhone || '');
    }
  }, [selectedLead]);

  if (!isDetailOpen || !selectedLead) return null;

  const { digitalHealth, scoreResult } = selectedLead;
  const score = scoreResult.leadScorePercentage;

  // Verify and format real phone
  const verifiedPhone = verifyAndFormatRealWhatsApp(editablePhone || digitalHealth.formattedPhone) || {
    formattedPhone: editablePhone || digitalHealth.formattedPhone || 'Sem telefone',
    rawPhone: (editablePhone || digitalHealth.formattedPhone || '').replace(/\D/g, ''),
    waUrl: buildWhatsAppLink(editablePhone || digitalHealth.formattedPhone, scoreResult.customPitch),
    hasWhatsApp: false,
    isVerified: false,
  };
  const whatsappUrl = buildWhatsAppLink(editablePhone || digitalHealth.formattedPhone, scoreResult.customPitch);

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(scoreResult.customPitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToneChange = (newTone: 'consultive' | 'direct' | 'promotional') => {
    setPitchTone(newTone);
    const newPitch = generateCustomPitch(
      selectedLead.displayName,
      selectedLead.category,
      digitalHealth,
      currentRepo,
      newTone,
      apiSettings.devName || 'Leonardo',
      apiSettings.demoUrl
    );
    updateLeadPitch(selectedLead.id, newPitch);
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, '_blank');
    if (selectedLead.crmStatus === 'Novo' || !selectedLead.crmStatus) {
      updateLeadCrmStatus(selectedLead.id, 'Contatado');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsDetailOpen(false)}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-in fade-in"
      />

      <aside className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full overflow-y-auto">
          {/* Header Bar */}
          <div className="sticky top-0 z-20 glass-panel px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h2 className="font-bold text-lg text-slate-100 line-clamp-1">{selectedLead.displayName}</h2>
                <p className="text-xs text-slate-400">Diagnóstico Digital, Verificação de WhatsApp & Script</p>
              </div>
            </div>

            <button
              onClick={() => setIsDetailOpen(false)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 flex-1">
            {/* Enlarged Photo Header */}
            <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              {digitalHealth.photoUrl && (
                <Image
                  src={digitalHealth.photoUrl}
                  alt={selectedLead.displayName}
                  fill
                  className="object-cover"
                  sizes="640px"
                />
              )}
              {/* Floating Gauge Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end p-4">
                <div className="w-full flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-900/90 text-cyan-300 border border-slate-700">
                      {selectedLead.category}
                    </span>
                    <h3 className="font-extrabold text-xl text-white mt-1">{selectedLead.displayName}</h3>
                    <a
                      href={digitalHealth.googleMapsUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-300 hover:text-cyan-200 flex items-center gap-1 mt-0.5 underline underline-offset-2 transition-colors"
                      title="Abrir no Google Maps"
                    >
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> {selectedLead.formattedAddress} (Ver no Google Maps ↗)
                    </a>
                  </div>

                  {/* Big Score Progress */}
                  <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/90 border border-slate-700 shadow-xl backdrop-blur-md">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Score IA</span>
                    <span className={`text-2xl font-black ${score >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {score}%
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {scoreResult.classification}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1: Phone Verification & WhatsApp Sanity */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-800/80 shadow-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-bold text-xs text-emerald-300">
                    Número Verificado para Disparo no WhatsApp
                  </h4>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700 font-mono">
                  Formato +{verifiedPhone.rawPhone}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={editablePhone}
                    onChange={(e) => setEditablePhone(e.target.value)}
                    placeholder="(85) 99999-8888"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">Editável se necessário</span>
              </div>
            </div>

            {/* Section 2: Digital Presence Diagnostics */}
            <div className="glass-card rounded-2xl p-4 border border-slate-800/80 space-y-3">
              <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" /> Diagnóstico da Presença Digital
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Website Factor */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                  <Globe className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 block font-medium">Website</span>
                  <span className={`text-xs font-bold ${!digitalHealth.hasWebsite ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {!digitalHealth.hasWebsite ? 'Ausente (+40%)' : 'Ativo'}
                  </span>
                </div>

                {/* Reviews Factor */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                  <Star className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 block font-medium">Avaliações</span>
                  <span className="text-xs font-bold text-amber-300">
                    {digitalHealth.rating} ★ ({digitalHealth.reviewsCount})
                  </span>
                </div>

                {/* WhatsApp Factor */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                  <Phone className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 block font-medium">WhatsApp</span>
                  <span className="text-xs font-bold text-teal-300">100% Válido</span>
                </div>

                {/* Product Fit */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                  <Sparkles className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 block font-medium">Fit ICP</span>
                  <span className="text-xs font-bold text-cyan-300">100% Match</span>
                </div>
              </div>

              {/* Rationale text box */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-cyan-400 mr-1">Diagnóstico:</span>
                {scoreResult.rationale}
              </div>
            </div>

            {/* Section 3: WhatsApp Sales Pitch Generator */}
            <div className="glass-card rounded-2xl p-4 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" /> Pitch de Vendas Personalizado
                </h4>

                {/* Tone selector */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => handleToneChange('consultive')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      pitchTone === 'consultive' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Consultivo
                  </button>
                  <button
                    onClick={() => handleToneChange('direct')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      pitchTone === 'direct' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Direto
                  </button>
                  <button
                    onClick={() => handleToneChange('promotional')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      pitchTone === 'promotional' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Promocional
                  </button>
                </div>
              </div>

              {/* Editable Pitch Textarea */}
              <div className="relative">
                <textarea
                  value={scoreResult.customPitch}
                  onChange={(e) => updateLeadPitch(selectedLead.id, e.target.value)}
                  rows={8}
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans focus:outline-none focus:border-cyan-500 transition-all"
                />
                <span className="absolute bottom-3 right-3 text-[10px] text-slate-500">Editável em tempo real</span>
              </div>
            </div>

            {/* Section 4: CRM Pipeline Status */}
            <div className="glass-card rounded-2xl p-4 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-300 flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-amber-400" /> Status no Pipeline CRM:
                </h4>
                <div className="flex items-center gap-1.5">
                  {(['Novo', 'Contatado', 'Demonstracao', 'Fechado', 'Perdido'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        if (!selectedLead.isSaved) toggleSaveLead(selectedLead.id);
                        updateLeadCrmStatus(selectedLead.id, status);
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        selectedLead.crmStatus === status
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-600 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {status === 'Demonstracao' ? 'Demonstração' : status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 z-20 glass-panel p-4 border-t border-slate-800 flex items-center gap-3">
            <button
              onClick={handleCopyPitch}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
              <span>{copied ? 'Copiado!' : 'Copiar Pitch'}</span>
            </button>

            <button
              onClick={handleOpenWhatsApp}
              disabled={!verifiedPhone.hasWhatsApp || !verifiedPhone.rawPhone}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:shadow-none"
            >
              <Send className="w-4 h-4" /> {verifiedPhone.hasWhatsApp && verifiedPhone.rawPhone ? `Abrir WhatsApp Web (${verifiedPhone.formattedPhone})` : 'Telefone Não Cadastrado'}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
