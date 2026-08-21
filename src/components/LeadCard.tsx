'use client';

import { PlaceLead } from '@/types/prospecting';
import { useProspectingStore } from '@/lib/store';
import { buildWhatsAppLink } from '@/lib/phoneVerifier';
import {
  Star,
  MapPin,
  Globe,
  ExternalLink,
  MessageCircle,
  Bookmark,
  Eye,
  CheckCircle2,
  Phone,
  Zap,
  TrendingUp,
  Instagram,
} from 'lucide-react';
import Image from 'next/image';

interface LeadCardProps {
  lead: PlaceLead;
}

export default function LeadCard({ lead }: LeadCardProps) {
  const { setSelectedLead, toggleSaveLead } = useProspectingStore();
  const { scoreResult, digitalHealth } = lead;
  const score = scoreResult.leadScorePercentage;

  // Score badge styling
  let scoreBadgeBg = 'bg-slate-800 text-slate-300 border-slate-700';
  if (score >= 75) {
    scoreBadgeBg = 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-sm';
  } else if (score >= 50) {
    scoreBadgeBg = 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-sm';
  }

  // Direct WhatsApp Link
  const whatsappUrl = buildWhatsAppLink(
    digitalHealth.rawPhone || digitalHealth.formattedPhone,
    scoreResult.customPitch
  );

  return (
    <div className="glass-card rounded-2xl p-4 border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-200 flex flex-col justify-between relative group">
      <div>
        {/* Thumbnail & Floating Score Badge */}
        <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3 bg-slate-900 border border-slate-800/80">
          {digitalHealth.photoUrl ? (
            <Image
              src={digitalHealth.photoUrl}
              alt={lead.displayName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500 text-xs">
              Sem Imagem
            </div>
          )}

          {/* Floating Opportunity Score Badge */}
          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full border text-xs flex items-center gap-1.5 shadow-md ${scoreBadgeBg}`}>
            <Zap className="w-3.5 h-3.5" />
            <span>Oportunidade: <strong>{score}%</strong></span>
          </div>

          {/* Category Tag */}
          <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md bg-slate-950/90 backdrop-blur-md text-[11px] font-bold text-slate-200 border border-slate-800">
            {lead.category}
          </div>

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveLead(lead.id);
            }}
            className={`absolute top-3 left-3 p-2 rounded-xl backdrop-blur-md border transition-all ${
              lead.isSaved
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-950/70 hover:bg-slate-900 text-slate-300 border-slate-700/60'
            }`}
            title={lead.isSaved ? 'Remover dos salvos' : 'Salvar no CRM'}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>

        {/* Business Name & Address */}
        <div className="space-y-1 mb-3">
          <h3 className="font-extrabold text-base text-slate-100 line-clamp-1 group-hover:text-indigo-300 transition-colors">
            {lead.displayName}
          </h3>
          <p className="text-xs text-slate-400 flex items-center gap-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>{lead.formattedAddress}</span>
          </p>
        </div>

        {/* Digital Diagnostics Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
          {/* Website Status */}
          {!digitalHealth.hasWebsite ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 font-bold">
              <Globe className="w-3 h-3 text-emerald-400" /> Sem Website (+40% Potencial)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800 font-medium">
              <Globe className="w-3 h-3 text-slate-500" /> Website Ativo
            </span>
          )}

          {/* WhatsApp Badge */}
          {digitalHealth.hasWhatsApp && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-950/80 text-teal-300 border border-teal-800/50 font-medium">
              <CheckCircle2 className="w-3 h-3 text-teal-400" /> WhatsApp OK
            </span>
          )}

          {/* Instagram Handle & Followers */}
          {digitalHealth.hasInstagram && digitalHealth.instagramHandle && (
            <a
              href={digitalHealth.instagramProfileUrl || `https://instagram.com/${digitalHealth.instagramHandle.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 font-semibold hover:bg-indigo-900/80 transition-all"
            >
              <span>{digitalHealth.instagramHandle}</span>
              {digitalHealth.instagramFollowers && (
                <span className="text-[10px] text-slate-400">({digitalHealth.instagramFollowers >= 1000 ? `${(digitalHealth.instagramFollowers / 1000).toFixed(1)}k` : digitalHealth.instagramFollowers})</span>
              )}
            </a>
          )}

          {/* Rating & Grandes Avaliações */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800/60 font-bold shadow-sm">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <span>{typeof digitalHealth.rating === 'number' ? digitalHealth.rating.toFixed(1) : digitalHealth.rating}</span>
            <span className="text-amber-200/80 text-[10px]">({digitalHealth.reviewsCount} avaliações no Maps)</span>
          </span>
        </div>

        {/* Instagram Recent Post Snippet */}
        {digitalHealth.recentPostSnippet && (
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 mb-2.5 line-clamp-2 leading-relaxed">
            <span className="font-bold text-indigo-400 mr-1">Post Recente:</span>
            "{digitalHealth.recentPostSnippet.replace(/^Post( recente)?:?\s*"?/i, '').replace(/"$/, '')}"
          </div>
        )}

        {/* Strategic Diagnostic Rationale */}
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 mb-4 line-clamp-2 leading-relaxed">
          <strong className="text-indigo-300 font-bold mr-1">Diagnóstico:</strong>
          {scoreResult.rationale}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
        {/* Details & Script Drawer */}
        <button
          onClick={() => setSelectedLead(lead)}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700/60 transition-all active:scale-95"
        >
          <Eye className="w-3.5 h-3.5 text-indigo-400" /> Script & Diagnóstico
        </button>

        {/* WhatsApp Button */}
        {digitalHealth.hasWhatsApp && digitalHealth.rawPhone ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            title="Disparar mensagem no WhatsApp Web"
          >
            <MessageCircle className="w-4 h-4 fill-slate-950 text-slate-950" /> WhatsApp
          </a>
        ) : digitalHealth.hasInstagram && digitalHealth.instagramProfileUrl ? (
          <a
            href={digitalHealth.instagramProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
            title="Abrir perfil no Instagram"
          >
            Direct Insta
          </a>
        ) : (
          <a
            href={digitalHealth.googleMapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-2.5 rounded-xl bg-slate-900 text-slate-400 text-[11px] font-medium flex items-center justify-center gap-1 border border-slate-800"
          >
            <Phone className="w-3 h-3 text-slate-500" /> Sem Contato
          </a>
        )}

        {/* Google Maps External link */}
        <a
          href={digitalHealth.googleMapsUri}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all"
          title="Ver no Google Maps"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
