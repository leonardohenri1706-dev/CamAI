import { PlaceLead } from '@/types/prospecting';

/**
 * Export Leads to CSV format (HubSpot, RD Station, Kommo, Pipedrive compatible)
 */
export function exportLeadsToCSV(leads: PlaceLead[], filename = 'leads_prospeccao_leadradar.csv') {
  if (!leads || leads.length === 0) return;

  const headers = [
    'ID',
    'Nome da Empresa',
    'Categoria',
    'Telefone WhatsApp',
    'WhatsApp URL',
    'Cidade',
    'Bairro',
    'Endereço Completo',
    'Avaliação Google',
    'Número de Avaliações',
    'Possui Website',
    'URL Website',
    'Instagram Handle',
    'Instagram URL',
    'Oportunidade Score (%)',
    'Classificação',
    'Status CRM',
    'Pitch Sugerido'
  ];

  const rows = leads.map((l) => [
    `"${l.id}"`,
    `"${(l.displayName || '').replace(/"/g, '""')}"`,
    `"${(l.category || '').replace(/"/g, '""')}"`,
    `"${l.digitalHealth.formattedPhone || l.digitalHealth.rawPhone || ''}"`,
    `"${l.digitalHealth.rawPhone ? `https://api.whatsapp.com/send?phone=${l.digitalHealth.rawPhone}` : ''}"`,
    `"${(l.city || '').replace(/"/g, '""')}"`,
    `"${(l.neighborhood || '').replace(/"/g, '""')}"`,
    `"${(l.formattedAddress || '').replace(/"/g, '""')}"`,
    l.digitalHealth.rating || 0,
    l.digitalHealth.reviewsCount || 0,
    l.digitalHealth.hasWebsite ? 'Sim' : 'Não',
    `"${l.digitalHealth.websiteUrl || ''}"`,
    `"${l.digitalHealth.instagramHandle || ''}"`,
    `"${l.digitalHealth.instagramProfileUrl || ''}"`,
    l.scoreResult?.leadScorePercentage || 0,
    `"${l.scoreResult?.classification || ''}"`,
    `"${l.crmStatus || 'Novo'}"`,
    `"${(l.scoreResult?.customPitch || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export Leads to formatted JSON
 */
export function exportLeadsToJSON(leads: PlaceLead[], filename = 'leads_prospeccao_leadradar.json') {
  if (!leads || leads.length === 0) return;
  const jsonContent = JSON.stringify(leads, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
