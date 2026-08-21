'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PlaceLead, SearchLocation } from '@/types/prospecting';
import { MapPin, Loader2 } from 'lucide-react';

const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
});

interface InteractiveMapProps {
  leads: PlaceLead[];
  location: SearchLocation;
}

export default function InteractiveMap({ leads, location }: InteractiveMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="w-full h-full min-h-[450px] lg:min-h-[600px] rounded-2xl glass-panel p-2 border border-slate-800/80 shadow-2xl relative">
      {/* Top Floating Badge */}
      <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-emerald-800/80 text-xs font-semibold text-slate-200 flex items-center gap-2 shadow-xl">
        <MapPin className="w-4 h-4 text-emerald-400" />
        <span>{location.name}</span>
        <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/90 px-2.5 py-0.5 rounded-md border border-emerald-700/60 font-extrabold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {leads.filter((l) => l.digitalHealth.hasWhatsApp && l.digitalHealth.isVerified !== false).length} com WhatsApp Verificado
        </span>
      </div>

      {!isMounted ? (
        <div className="w-full h-full min-h-[400px] rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="text-xs font-semibold">Carregando Mapa Interativo Leaflet...</span>
        </div>
      ) : (
        <MapInner leads={leads} location={location} />
      )}
    </div>
  );
}
