'use client';

import { useState } from 'react';
import { useProspectingStore } from '@/lib/store';
import { X, Settings, Key, ShieldCheck, Check, Sparkles, Server, Compass, Bot, User, Link as LinkIcon, Database } from 'lucide-react';

export default function ApiSettingsModal() {
  const { isApiSettingsOpen, setIsApiSettingsOpen, apiSettings, setApiSettings } = useProspectingStore();

  const [devName, setDevName] = useState(apiSettings.devName || 'Leonardo');
  const [demoUrl, setDemoUrl] = useState(apiSettings.demoUrl || 'https://pizzaria-arteedelicia.vercel.app/');
  const [openrouterKey, setOpenrouterKey] = useState(apiSettings.openrouterApiKey || '');
  const [openrouterModel, setOpenrouterModel] = useState(apiSettings.openrouterModel || 'openai/gpt-4o-mini');
  const [placesKey, setPlacesKey] = useState(apiSettings.googlePlacesApiKey || '');
  const [useMock, setUseMock] = useState(apiSettings.useMockEngine);
  const [saved, setSaved] = useState(false);

  if (!isApiSettingsOpen) return null;

  const handleSave = () => {
    setApiSettings({
      devName: devName.trim() || 'Leonardo',
      demoUrl: demoUrl.trim() || 'https://pizzaria-arteedelicia.vercel.app/',
      openrouterApiKey: openrouterKey,
      openrouterModel: openrouterModel,
      googlePlacesApiKey: placesKey,
      useMockEngine: useMock,
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsApiSettingsOpen(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Settings className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-lg text-slate-100">Configurações do Prospector</h3>
              <p className="text-xs text-slate-400">Backend Django, Python NLP & Personalização do Pitch</p>
            </div>
          </div>

          <button
            onClick={() => setIsApiSettingsOpen(false)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Backend Status Banner */}
        <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-emerald-300">Backend Django + SQLite Ativo (Porta 8000)</h4>
              <p className="text-[11px] text-slate-300">
                Salvamento de dados, CRM e buscas em Python funcionando nativamente.
              </p>
            </div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Section 1: Personalização do Script de Vendas */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            Dados do Desenvolvedor (Usados no Pitch de WhatsApp)
          </h4>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Seu Nome:
            </label>
            <input
              type="text"
              value={devName}
              onChange={(e) => setDevName(e.target.value)}
              placeholder="Ex: Leonardo"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
              <LinkIcon className="w-3 h-3 text-cyan-400" />
              Link da Demonstração ao Vivo do seu Sistema:
            </label>
            <input
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://pizzaria-arteedelicia.vercel.app/"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Section 2: OpenRouter API (Opcional) */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-800/50 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-cyan-400" />
              OpenRouter API Key (Opcional - Se quiser IA adicional)
            </label>
            <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800">
              GPT-4o, Claude 3.5, Llama
            </span>
          </div>

          <div className="relative">
            <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={openrouterKey}
              onChange={(e) => setOpenrouterKey(e.target.value)}
              placeholder="sk-or-v1-... (Opcional)"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Modelo OpenRouter:
            </label>
            <select
              value={openrouterModel}
              onChange={(e) => setOpenrouterModel(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="openai/gpt-4o-mini">OpenAI GPT-4o Mini (Rápido e Econômico)</option>
              <option value="anthropic/claude-3.5-sonnet">Anthropic Claude 3.5 Sonnet (Máxima Persuasão B2B)</option>
              <option value="meta-llama/llama-3.3-70b-instruct">Meta Llama 3.3 70B Instruct</option>
              <option value="google/gemini-flash-1.5">Google Gemini Flash 1.5</option>
              <option value="deepseek/deepseek-chat">DeepSeek V3 / R1</option>
            </select>
          </div>
        </div>

        {/* Security Note */}
        <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          Suas configurações são salvas na sessão e sincronizadas com seu banco Django SQLite local.
        </p>

        {/* Save Action */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-slate-950" /> Configurações Atualizadas!
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" /> Salvar Preferências
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
