'use client';

import React from 'react';
import { CheckCircle2, Loader2, Search, Globe, PhoneCall, Sparkles } from 'lucide-react';

interface ProgressBarStepsProps {
  currentStep: number; // 1 to 4
  statusText?: string;
  totalLeadsFound?: number;
}

const STEPS = [
  { id: 1, label: 'Mapeando Locais & OSM', icon: Search },
  { id: 2, label: 'Rastreando Websites', icon: Globe },
  { id: 3, label: 'Validando WhatsApps', icon: PhoneCall },
  { id: 4, label: 'Gerando Pitches de IA', icon: Sparkles },
];

export default function ProgressBarSteps({ currentStep, statusText, totalLeadsFound }: ProgressBarStepsProps) {
  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl space-y-3 backdrop-blur-md animate-in fade-in">
      {/* Header Status */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
          <span className="font-bold text-slate-200">
            {statusText || 'Executando motor de inteligência e busca profunda...'}
          </span>
        </div>
        {typeof totalLeadsFound === 'number' && totalLeadsFound > 0 && (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono font-bold text-[11px]">
            {totalLeadsFound} Leads Indexados
          </span>
        )}
      </div>

      {/* Steps Visual Pipeline */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
        {STEPS.map((step) => {
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-all ${
                isDone
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                  : isCurrent
                  ? 'bg-indigo-950/80 text-indigo-200 border-indigo-600/70 shadow-lg shadow-indigo-950/50'
                  : 'bg-slate-950/60 text-slate-500 border-slate-800/60'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
              ) : (
                <Icon className="w-4 h-4 text-slate-600 shrink-0" />
              )}
              <span className={`font-semibold line-clamp-1 ${isCurrent ? 'text-indigo-200 font-bold' : ''}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
