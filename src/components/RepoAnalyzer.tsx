'use client';

import { useState } from 'react';
import { useProspectingStore } from '@/lib/store';
import {
  Github,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Target,
  ShieldCheck,
  Tag,
  Loader2,
  ArrowRight,
  Star,
  Code2,
  Layers,
  FileText,
  Search,
} from 'lucide-react';

export default function RepoAnalyzer() {
  const { currentRepo, setRepoAnalysis, isAnalyzingRepo, setIsAnalyzingRepo, apiSettings } = useProspectingStore();
  const [repoInput, setRepoInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualDescription, setManualDescription] = useState('');

  const handleAnalyze = async (customUrl?: string) => {
    const targetUrl = customUrl || repoInput.trim();
    if (!targetUrl && !manualDescription.trim()) return;

    setIsAnalyzingRepo(true);
    try {
      let data: any = null;

      // Try Django backend first, fallback to Next API
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
      }
    } catch (e) {
      console.error('Error analyzing repo:', e);
    } finally {
      setIsAnalyzingRepo(false);
    }
  };

  return (
    <section className="w-full glass-panel rounded-2xl p-5 border border-slate-800/80 shadow-2xl relative overflow-hidden space-y-4">
      {/* Glow background accent */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Row: Title & Inputs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 text-xs font-semibold">
              <Github className="w-3.5 h-3.5" /> Etapa 1: Ingestão de Produto Real (GitHub / Descrição)
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Zero Dados Mockados
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowManualInput(false)}
              className={`text-xs font-bold pb-1 border-b-2 transition-all flex items-center gap-1.5 ${
                !showManualInput ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Github className="w-3.5 h-3.5" /> Repositório GitHub Real
            </button>
            <button
              onClick={() => setShowManualInput(true)}
              className={`text-xs font-bold pb-1 border-b-2 transition-all flex items-center gap-1.5 ${
                showManualInput ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Descrição Manual do Software
            </button>
          </div>

          {/* GitHub Input */}
          {!showManualInput ? (
            <div className="flex items-center gap-2 max-w-2xl">
              <div className="relative flex-1">
                <Github className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  placeholder="Cole a URL de qualquer repositório (ex: https://github.com/usuario/meu-software-delivery)..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <button
                onClick={() => handleAnalyze()}
                disabled={isAnalyzingRepo || !repoInput.trim()}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap"
              >
                {isAnalyzingRepo ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analisando GitHub...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Analisar Repositório
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-2 max-w-2xl">
              <textarea
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                placeholder="Descreva seu produto ou sistema (ex: Desenvolvi uma plataforma web de pedidos diretos para pizzarias e hamburguerias que elimina comissão do iFood e imprime comanda no WhatsApp)..."
                rows={2}
                className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
              />
              <button
                onClick={() => handleAnalyze()}
                disabled={isAnalyzingRepo || !manualDescription.trim()}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap h-full"
              >
                {isAnalyzingRepo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Extrair ICP</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product & Extracted ICP Card */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
        {/* Real GitHub Metadata Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Target className="w-4 h-4" />
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
            <span className="text-[10px] text-slate-400 font-semibold uppercase mr-1">Nichos Alvo (ICP):</span>
            {currentRepo.icp.targetBusinessTypes.map((type, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-medium"
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Value Prop & Solved Pain Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800/60 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Proposta de Valor Central
            </span>
            <p className="text-slate-200 font-semibold leading-relaxed">
              {currentRepo.coreValueProp}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Dores Resolvidas nos Estabelecimentos
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
