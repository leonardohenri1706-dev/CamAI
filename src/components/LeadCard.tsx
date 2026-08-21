'use client';

import { PlaceLead } from '@/types/prospecting';
import { useProspectingStore } from '@/lib/store';
import { verifyAndFormatRealWhatsApp, buildWhatsAppLink } from '@/lib/phoneVerifier';
import { Star, MapPin, Globe, Phone, ExternalLink, MessageCircle, Sparkles, Bookmark, Eye, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
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
  let scoreGlowClass = '';
  if (score >= 75) {
    scoreBadgeBg = 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold';
    scoreGlowClass = 'glow-emerald';
  } else if (score >= 50) {
    scoreBadgeBg = 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold';
    scoreGlowClass = 'glow-amber';
  }

  // Direct WhatsApp Link
  const whatsappUrl = buildWhatsAppLink(
    digitalHealth.rawPhone || digitalHealth.formattedPhone,
    scoreResult.customPitch
  );

  return (
    <div className="glass-card rounded-2xl p-4 border transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between relative group">
      <div>
        {/* Thumbnail & Floating Score Badge */}
        <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3.5 bg-slate-900 border border-slate-800/80">
          {digitalHealth.photoUrl ? (
            <Image
              src={digitalHealth.photoUrl}
              alt={lead.displayName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
              Sem Foto
            </div>
          )}

          {/* Floating Score Badge */}
          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full border text-xs flex items-center gap-1.5 shadow-lg ${scoreBadgeBg} ${scoreGlowClass}`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Score: <strong>{score}%</strong></span>
          </div>

          {/* Category Tag */}
          <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-[11px] font-semibold text-cyan-300 border border-slate-800">
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
                : 'bg-slate-950/60 hover:bg-slate-900 text-slate-300 border-slate-700/60'
            }`}
            title={lead.isSaved ? 'Remover dos salvos' : 'Salvar no CRM'}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>

        {/* Title & Address */}
        <div className="space-y-1 mb-3">
          <h3 className="font-bold text-base text-slate-100 line-clamp-1 group-hover:text-cyan-300 transition-colors">
            {lead.displayName}
          </h3>
          <p className="text-xs text-slate-400 flex items-center gap-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{lead.formattedAddress}</span>
          </p>
        </div>

        {/* Digital Status Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
          {/* Website Status */}
          {!digitalHealth.hasWebsite ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 font-semibold shadow-sm">
              <Globe className="w-3 h-3 text-emerald-400" /> Sem Website (+40% Opp)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800 font-medium">
              <Globe className="w-3 h-3 text-slate-500" /> Website Ativo
            </span>
          )}

          {/* WhatsApp Badge */}
          {digitalHealth.hasWhatsApp && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-950/80 text-teal-300 border border-teal-800/50">
              <CheckCircle2 className="w-3 h-3 text-teal-400" /> WhatsApp OK
            </span>
          )}

          {/* Instagram Badge */}
          {digitalHealth.hasInstagram && digitalHealth.instagramHandle && (
            <a
              href={digitalHealth.instagramProfileUrl || `https://instagram.com/${digitalHealth.instagramHandle.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-950/80 text-pink-300 border border-pink-700/60 font-semibold hover:bg-pink-900/80 transition-all"
            >
              <span>📸 {digitalHealth.instagramHandle}</span>
              {digitalHealth.instagramFollowers && (
                <span className="text-[10px] opacity-80">({digitalHealth.instagramFollowers >= 1000 ? `${(digitalHealth.instagramFollowers / 1000).toFixed(1)}k` : digitalHealth.instagramFollowers})</span>
              )}
            </a>
          )}

          {/* Rating Badge */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 text-amber-300 border border-amber-950/80">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {digitalHealth.rating} ({digitalHealth.reviewsCount})
          </span>
        </div>

        {/* AI Rationale Snippet */}
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 mb-4 line-clamp-2 leading-relaxed">
          <strong className="text-cyan-400 font-semibold mr-1">IA:</strong>
          {scoreResult.rationale}
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
        {/* Lead Details & Pitch Button */}
        <button
          onClick={() => setSelectedLead(lead)}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700/60 transition-all active:scale-95"
        >
          <Eye className="w-3.5 h-3.5 text-cyan-400" /> Pitch & Detalhes
        </button>

        {/* WhatsApp Direct Link */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
          title="Disparar mensagem no WhatsApp Web"
        >
          <MessageCircle className="w-4 h-4 fill-slate-950 text-slate-950" /> WhatsApp
        </a>

        {/* Instagram Profile Direct Link */}
        {digitalHealth.instagramProfileUrl && (
          <a
            href={digitalHealth.instagramProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-pink-950/60 hover:bg-pink-900/80 text-pink-300 border border-pink-800/60 transition-all"
            title="Abrir perfil no Instagram"
          >
            📸
          </a>
        )}

        {/* External Google Maps link */}
        <a
          href={digitalHealth.googleMapsUri}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all"
          title="Abrir no Google Maps"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
