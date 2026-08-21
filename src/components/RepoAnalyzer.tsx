'use client';

import { useState } from 'react';
import { useProspectingStore } from '@/lib/store';
import {
  Briefcase,
  Layers,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Tag,
  Loader2,
  Star,
  Code2,
  FileText,
  Search,
  Sparkles,
  Zap,
  Target,
  BarChart3,
  Github,
} from 'lucide-react';

export default function RepoAnalyzer() {
  const {
    currentRepo,
    setRepoAnalysis,
    isAnalyzingRepo,
    setIsAnalyzingRepo,
    setLeads,
    isSearchingLeads,
    setIsSearchingLeads,
    currentLocation,
    pitchTone,
    apiSettings,
  } = useProspectingStore();

  const [repoInput, setRepoInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualDescription, setManualDescription] = useState('');
  const [autoSearchCount, setAutoSearchCount] = useState<number | null>(null);

  // Trigger Automatic Deep Outbound Search
  const triggerAutomaticDeepSearch = async (analysis: any) => {
    setIsSearchingLeads(true);
    setAutoSearchCount(null);
    try {
      const activeCategory = analysis.icp?.targetBusinessTypes?.[0] || 'Hamburgueria';
      const targetQuery = analysis.suggestedHashtags?.[0] || analysis.searchKeywords?.[0] || activeCategory;

      let searchData: any = null;
      try {
        const djangoRes = await fetch('http://127.0.0.1:8000/api/django/search-places/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: currentLocation,
            customQuery: targetQuery,
            category: activeCategory,
            searchMode: 'deep',
          }),
        });
        searchData = await djangoRes.json();
      } catch {
        const nextRes = await fetch('/api/search-places', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: currentLocation,
            customQuery: targetQuery,
            keywords: analysis.searchKeywords,
            category: activeCategory,
            searchMode: 'deep',
            openrouterApiKey: apiSettings.openrouterApiKey || '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',
            openrouterModel: apiSettings.openrouterModel,
          }),
        });
        searchData = await nextRes.json();
      }

      if (searchData && searchData.success && Array.isArray(searchData.leads)) {
        let scoreData: any = null;
        try {
          const scoreRes = await fetch('http://127.0.0.1:8000/api/django/score-lead/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              rawLeads: searchData.leads,
              repoAnalysis: analysis,
              pitchTone: pitchTone,
              openrouterApiKey: apiSettings.openrouterApiKey,
              openrouterModel: apiSettings.openrouterModel,
              devName: apiSettings.devName || 'Leonardo',
              demoUrl: apiSettings.demoUrl,
            }),
          });
          scoreData = await scoreRes.json();
        } catch {
          const nextScoreRes = await fetch('/api/score-lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              rawLeads: searchData.leads,
              repoAnalysis: analysis,
              pitchTone: pitchTone,
              openrouterApiKey: apiSettings.openrouterApiKey,
              openrouterModel: apiSettings.openrouterModel,
              devName: apiSettings.devName || 'Leonardo',
              demoUrl: apiSettings.demoUrl,
            }),
          });
          scoreData = await nextScoreRes.json();
        }

        if (scoreData && scoreData.success && Array.isArray(scoreData.leads)) {
          setLeads(scoreData.leads);
          setAutoSearchCount(scoreData.leads.length);
        } else {
          setLeads(searchData.leads);
          setAutoSearchCount(searchData.leads.length);
        }
      }
    } catch (err) {
      console.error('Auto deep search error:', err);
    } finally {
      setIsSearchingLeads(false);
    }
  };

  const handleAnalyze = async (customUrl?: string) => {
    const targetUrl = customUrl || repoInput.trim();
    if (!targetUrl && !manualDescription.trim()) return;

    setIsAnalyzingRepo(true);
    try {
      let data: any = null;

      try {
        const djangoRes = await fetch('http://127.0.0.1:8000/api/django/analyze-repo/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repoUrl: targetUrl,
            manualDescription: showManualInput ? manualDescription : undefined,
            openrouterApiKey: apiSettings.openrouterApiKey,
            openrouterModel: apiSettings.openrouterModel,
          }),
        });
        data = await djangoRes.json();
      } catch {
        const nextRes = await fetch('/api/analyze-repo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repoUrl: targetUrl,
            manualDescription: showManualInput ? manualDescription : undefined,
            openrouterApiKey: apiSettings.openrouterApiKey,
            openrouterModel: apiSettings.openrouterModel,
          }),
        });
        data = await nextRes.json();
      }

      if (data && data.success && data.analysis) {
        setRepoAnalysis(data.analysis);
        triggerAutomaticDeepSearch(data.analysis);
      }
    } catch (e) {
      console.error('Error analyzing offer:', e);
    } finally {
      setIsAnalyzingRepo(false);
    }
  };

  return (
    <section className="w-full glass-panel rounded-2xl p-5 border border-slate-800/80 shadow-xl space-y-4">
      {/* Header Row: Target Offer Config */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-950/80 text-indigo-400 border border-indigo-800/50">
                <Target className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm font-extrabold text-white">
                  Oferta Comercial & Perfil de Cliente Ideal (ICP)
                </h2>
                <p className="text-xs text-slate-400">
                  Defina o software ou produto para mapear automaticamente os alvos comerciais de maior conversão
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Varredura de Contatos Ativa
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => setShowManualInput(false)}
              className={`text-xs font-bold pb-1 border-b-2 transition-all flex items-center gap-1.5 ${
                !showManualInput ? 'border-indigo-500 text-indigo-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Github className="w-3.5 h-3.5" /> URL do Repositório (GitHub)
            </button>
            <button
              onClick={() => setShowManualInput(true)}
              className={`text-xs font-bold pb-1 border-b-2 transition-all flex items-center gap-1.5 ${
                showManualInput ? 'border-indigo-500 text-indigo-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Descrição da Solução / SaaS
            </button>
          </div>

          {/* Offer Input Bar */}
          {!showManualInput ? (
            <div className="flex items-center gap-2 max-w-2xl">
              <div className="relative flex-1">
                <Github className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  placeholder="Ex: https://github.com/usuario/meu-software-delivery..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <button
                onClick={() => handleAnalyze()}
                disabled={isAnalyzingRepo || !repoInput.trim()}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap"
              >
                {isAnalyzingRepo ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mapeando Mercado...
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" /> Mapear Alvos & Prospectar
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-2 max-w-2xl">
              <textarea
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                placeholder="Descreva o seu sistema ou serviço comercial (ex: Plataforma de pedidos diretos para pizzarias e hamburguerias que elimina comissão do iFood e conecta direto no WhatsApp)..."
                rows={2}
                className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 resize-none font-sans"
              />
              <button
                onClick={() => handleAnalyze()}
                disabled={isAnalyzingRepo || !manualDescription.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap h-full"
              >
                {isAnalyzingRepo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Mapear ICP</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Target Offer Blueprint Card */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
        {/* Solution Metadata & Target Niches */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-950/80 text-indigo-400 border border-indigo-800/60">
              <Briefcase className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                {currentRepo.repoName}
                {currentRepo.githubStars !== undefined && currentRepo.githubStars > 0 && (
                  <span className="text-[11px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {currentRepo.githubStars} stars
                  </span>
                )}
                {currentRepo.githubLanguage && (
                  <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800 flex items-center gap-1">
                    <Code2 className="w-3 h-3" /> {currentRepo.githubLanguage}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-1">{currentRepo.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase mr-1">Nichos Alvo:</span>
            {currentRepo.icp.targetBusinessTypes.map((type, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2.5 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800/80 font-bold"
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Strategic Prospecting Plan Summary */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <h4 className="font-bold text-xs text-indigo-200">
                Estratégia de Abordagem & Mapeamento de Oportunidades
              </h4>
            </div>

            {/* Auto Search Status */}
            {isSearchingLeads ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-amber-950/80 border border-amber-700/60 px-3 py-1 rounded-full animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                Varredura de Leads em Andamento...
              </span>
            ) : autoSearchCount !== null ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Varredura Concluída ({autoSearchCount} Estabelecimentos Localizados)
              </span>
            ) : null}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {currentRepo.prospectingPlanSummary || 'Prospecção focada em estabelecimentos com alta demanda local, sem website ativo e com canal de atendimento pelo WhatsApp/Instagram.'}
          </p>

          {/* Suggested Hashtags */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-900">
            <span className="text-[11px] text-slate-400 font-bold">Hashtags Comerciais Mapeadas:</span>
            {(currentRepo.suggestedHashtags || ['#hamburgueria', '#delivery', '#pizzaria', '#barbearia', '#estetica']).map((tag, idx) => (
              <span key={idx} className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-indigo-300 border border-slate-800 font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Value Prop & Solved Pain Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-indigo-400" /> Proposta de Valor Central
            </span>
            <p className="text-slate-200 font-semibold leading-relaxed">
              {currentRepo.coreValueProp}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Principais Dores dos Clientes
            </span>
            <ul className="text-slate-300 space-y-0.5 list-disc list-inside text-[11px]">
              {currentRepo.solvedPainPoints.slice(0, 2).map((pain, i) => (
                <li key={i} className="truncate">{pain}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
