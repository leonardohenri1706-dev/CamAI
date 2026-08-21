'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { PlaceLead, SearchLocation } from '@/types/prospecting';
import { useProspectingStore } from '@/lib/store';
import { buildWhatsAppLink } from '@/lib/phoneVerifier';
import { Star, Globe, MessageCircle, Eye, Sparkles, Phone, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

interface MapInnerProps {
  leads: PlaceLead[];
  location: SearchLocation;
}

// Auto fit bounds for ALL leads so maximum pins are visible
function MapBoundsUpdater({ leads, location }: { leads: PlaceLead[]; location: SearchLocation }) {
  const map = useMap();

  useEffect(() => {
    if (leads && leads.length > 1) {
      try {
        const bounds = L.latLngBounds(leads.map((l) => [l.coordinates.lat, l.coordinates.lng]));
        map.fitBounds(bounds, { padding: [35, 35], maxZoom: 15 });
      } catch {
        map.setView([location.center.lat, location.center.lng], 13, { animate: true });
      }
    } else {
      map.setView([location.center.lat, location.center.lng], 14, { animate: true });
    }
  }, [leads, location, map]);

  return null;
}

// Create custom SVG Leaflet pin icons
function createCustomIcon(score: number) {
  let color = '#64748b'; // Cold Gray
  if (score >= 75) {
    color = '#10b981'; // Emerald Green
  } else if (score >= 50) {
    color = '#f59e0b'; // Amber Yellow
  }

  const svgHtml = `
    <svg width="34" height="44" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 0C8.05888 0 0 8.05888 0 18C0 29.5 18 46 18 46C18 46 36 29.5 36 18C36 8.05888 27.9411 0 18 0Z" fill="${color}" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"/>
      <circle cx="18" cy="18" r="12" fill="#0f172a"/>
      <text x="18" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle">${score}%</text>
    </svg>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-map-pin',
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -40],
  });
}

export default function MapInner({ leads, location }: MapInnerProps) {
  const { setSelectedLead } = useProspectingStore();

  // Strictly filter leads with verified WhatsApp mobile numbers
  const verifiedLeads = leads.filter((l) => l.digitalHealth.hasWhatsApp && l.digitalHealth.isVerified !== false);

  const handleLaunchWhatsApp = (lead: PlaceLead) => {
    const rawPhone = lead.digitalHealth.rawPhone || lead.digitalHealth.formattedPhone || '';
    const pitch = lead.scoreResult.customPitch || `Olá, responsável pelo ${lead.displayName}, tudo bem?`;
    const url = buildWhatsAppLink(rawPhone, pitch);
    window.open(url, '_blank');
  };

  return (
    <MapContainer
      center={[location.center.lat, location.center.lng]}
      zoom={location.zoom}
      scrollWheelZoom={true}
      className="w-full h-full rounded-2xl z-10"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      <MapBoundsUpdater leads={verifiedLeads} location={location} />

      {/* Render ONLY verified WhatsApp markers */}
      {verifiedLeads.map((lead) => {
        const score = lead.scoreResult?.leadScorePercentage || 80;
        const icon = createCustomIcon(score);

        return (
          <Marker
            key={lead.id}
            position={[lead.coordinates.lat, lead.coordinates.lng]}
            icon={icon}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-1 space-y-2.5 max-w-[240px]">
                {/* Photo Header */}
                <div className="relative h-24 w-full rounded-xl overflow-hidden bg-slate-800">
                  <Image
                    src={lead.digitalHealth.photoUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80'}
                    alt={lead.displayName}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-950/90 text-white text-[10px] font-extrabold flex items-center gap-1 border border-slate-700">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>{score}%</span>
                  </div>
                </div>

                {/* Info */}
                <div>
                  <h4 className="font-bold text-xs text-slate-900 leading-tight">
                    {lead.displayName}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {lead.neighborhood || lead.city} • {lead.category}
                  </p>
                </div>

                {/* Rating & Phone */}
                <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-100 p-1.5 rounded-lg">
                  <div className="flex items-center gap-1 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{lead.digitalHealth.rating}</span>
                    <span className="text-[10px] text-slate-400">({lead.digitalHealth.reviewsCount})</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                    <ShieldCheck className="w-3 h-3" /> Zap Válido
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-1 pt-1">
                  <a
                    href={lead.digitalHealth.googleMapsUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center gap-1 transition-all border border-blue-200"
                    title="Ver no Google Maps"
                  >
                    <Globe className="w-3 h-3" /> Maps
                  </a>

                  <button
                    onClick={() => setSelectedLead(lead)}
                    className="py-1.5 px-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <Eye className="w-3 h-3" /> Detalhes
                  </button>

                  <button
                    onClick={() => handleLaunchWhatsApp(lead)}
                    className="py-1.5 px-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all shadow"
                  >
                    <MessageCircle className="w-3 h-3" /> Zap
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
