import { DigitalHealth, RepoAnalysis, ScoreResult } from '@/types/prospecting';

export function isCearaLocation(placeName: string, digitalHealth?: DigitalHealth, addressOrCity?: string): boolean {
  if (!digitalHealth) return false;
  const fullText = `${placeName} ${addressOrCity || ''}`.toLowerCase();
  const phone = (digitalHealth.rawPhone || digitalHealth.formattedPhone || '').replace(/\D/g, '');
  const digits = phone.startsWith('55') ? phone.slice(2) : phone;
  if (digits.startsWith('85') || digits.startsWith('88')) {
    return true;
  }
  const cearaKeys = ['fortaleza', 'ceará', 'ceara', '- ce', ', ce', 'sobral', 'juazeiro', 'caucaia', 'maracanaú', 'maracanau', 'meireles', 'aldeota', 'varjota'];
  return cearaKeys.some((k) => fullText.includes(k));
}

export function calculateLeadScore(
  placeName: string,
  category: string,
  digitalHealth: DigitalHealth,
  repoAnalysis: RepoAnalysis,
  pitchTone: 'consultive' | 'direct' | 'promotional' = 'consultive',
  devName: string = 'Leonardo',
  demoUrl?: string
): ScoreResult {
  let score = 0;

  // 1. Website factor (No website = High Opportunity)
  let noWebsiteBonus = 0;
  if (!digitalHealth.hasWebsite || digitalHealth.websiteUrl?.includes('instagram') || digitalHealth.websiteUrl?.includes('linktr.ee')) {
    noWebsiteBonus = 40;
  } else {
    noWebsiteBonus = 10;
  }
  score += noWebsiteBonus;

  // 2. Review volume and popularity factor
  let reviewVolumeBonus = 0;
  if (digitalHealth.reviewsCount >= 80 && digitalHealth.rating >= 4.5) {
    reviewVolumeBonus = 25;
  } else if (digitalHealth.reviewsCount >= 30 && digitalHealth.rating >= 4.0) {
    reviewVolumeBonus = 20;
  } else if (digitalHealth.reviewsCount >= 10) {
    reviewVolumeBonus = 12;
  } else {
    reviewVolumeBonus = 5;
  }
  score += reviewVolumeBonus;

  // 3. WhatsApp verified factor
  let phoneVerifiedBonus = 0;
  if (digitalHealth.hasWhatsApp && digitalHealth.formattedPhone) {
    phoneVerifiedBonus = 15;
  } else if (digitalHealth.formattedPhone) {
    phoneVerifiedBonus = 8;
  }
  score += phoneVerifiedBonus;

  // 4. Category fit with repo ICP
  let categoryFitBonus = 0;
  const isDirectFit = repoAnalysis.icp.targetBusinessTypes.some(
    (t) => category.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(category.toLowerCase())
  );

  if (isDirectFit) {
    categoryFitBonus = 20;
  } else {
    categoryFitBonus = 10;
  }
  score += categoryFitBonus;

  const finalScore = Math.min(100, Math.max(15, score));

  let classification: 'Alta Prioridade' | 'Média Prioridade' | 'Baixa Prioridade' = 'Baixa Prioridade';
  if (finalScore >= 75) {
    classification = 'Alta Prioridade';
  } else if (finalScore >= 50) {
    classification = 'Média Prioridade';
  }

  const rationaleParts: string[] = [];
  if (noWebsiteBonus >= 35) {
    rationaleParts.push('Não possui canal direto próprio (alta oportunidade para implantar sistema web).');
  } else {
    rationaleParts.push('Possui website ativo.');
  }

  if (digitalHealth.reviewsCount >= 30) {
    rationaleParts.push(`Fluxo consolidado com ${digitalHealth.reviewsCount} avaliações (${digitalHealth.rating} ★) no Google Maps.`);
  } else {
    rationaleParts.push(`Possui ${digitalHealth.reviewsCount} avaliações no Google.`);
  }

  const rationale = `${category} com alto fluxo de clientes. ${rationaleParts.join(' ')} Alta probabilidade de conversão para ${repoAnalysis.coreValueProp.toLowerCase()}`;

  const customPitch = generateCustomPitch(
    placeName,
    category,
    digitalHealth,
    repoAnalysis,
    pitchTone,
    devName,
    demoUrl
  );

  return {
    leadScorePercentage: finalScore,
    classification,
    rationale,
    customPitch,
    factors: {
      noWebsiteBonus,
      reviewVolumeBonus,
      phoneVerifiedBonus,
      categoryFitBonus,
    },
  };
}

export function generateCustomPitch(
  placeName: string,
  category: string,
  digitalHealth: DigitalHealth,
  repoAnalysis: RepoAnalysis,
  tone: 'consultive' | 'direct' | 'promotional' = 'consultive',
  devName: string = 'Leonardo',
  demoUrl?: string
): string {
  const shortName = placeName.split('-')[0].trim();
  const liveDemo = demoUrl || 'https://pizzaria-arteedelicia.vercel.app/';
  const catLower = category.toLowerCase();

  const inCeara = isCearaLocation(placeName, digitalHealth);
  const regionPhrase = inCeara ? 'aqui no Ceará e no Nordeste' : 'no setor gastronômico e comercial';

  let sector = 'setor gastronômico e comércio local';
  let mainIcon = '🍕';
  let painDescription = `elimina o atraso no WhatsApp nos dias de pico (quinta a domingo) e substitui o envio manual de cardápio.`;
  let automatedDetail = `A comanda chega calculada com endereço, taxa de entrega por bairro e detalhes de borda/recheio prontos para a cozinha.`;
  let timingCta = `antes de abrir o forno`;
  let onboardingText = `Posso parametrizar todo o sistema com a marca, fotos e cardápio completo da *${shortName}*.`;

  if (catLower.includes('hamburg') || catLower.includes('burger') || catLower.includes('lanche')) {
    sector = 'setor de hamburguerias e delivery';
    mainIcon = '🍔';
    painDescription = `elimina o atraso no WhatsApp nos dias de pico (quinta a domingo) e substitui o envio manual de cardápio.`;
    automatedDetail = `O pedido chega calculado com ponto da carne, adicionais, taxa de entrega por bairro e pronto para a chapa.`;
    timingCta = `antes de abrir a chapa`;
    onboardingText = `Posso parametrizar todo o sistema com a marca, fotos e cardápio completo da *${shortName}*.`;
  } else if (catLower.includes('barber') || catLower.includes('salao') || catLower.includes('beleza') || catLower.includes('cabelo')) {
    sector = 'setor de barbearias e estética';
    mainIcon = '💈';
    painDescription = `elimina a perda de tempo no WhatsApp respondendo agendamentos e reduz faltas de clientes sem aviso.`;
    automatedDetail = `O agendamento entra 24h em tempo real com profissional, serviço e horário confirmado no WhatsApp.`;
    timingCta = `antes de fechar a agenda da semana`;
    onboardingText = `Posso parametrizar todo o sistema com os profissionais, fotos e serviços da *${shortName}*.`;
  } else if (catLower.includes('oficina') || catLower.includes('mecanica') || catLower.includes('auto')) {
    sector = 'serviços automotivos';
    mainIcon = '🚗';
    painDescription = `elimina o atraso na aprovação de orçamentos e organiza as ordens de serviço direto no WhatsApp.`;
    automatedDetail = `O orçamento com fotos e valores é aprovado em 1 clique pelo cliente no WhatsApp.`;
    timingCta = `no início do expediente`;
    onboardingText = `Posso parametrizar todo o sistema com a tabela de serviços da *${shortName}*.`;
  }

  // USER'S MASTER PROMPT TEMPLATE (Dynamic with Emojis & Bold formatting)
  return (
    `👋 *Olá, responsável pela ${shortName}, tudo bem?*\n\n` +
    `👨‍💻 Meu nome é *${devName}*, sou engenheiro de software e desenvolvo soluções digitais focadas em redução de custos operacionais para o ${sector} ${regionPhrase}.\n\n` +
    `${mainIcon} Analisando o atendimento de estabelecimentos com alto volume como a *${shortName}*, estruturei uma aplicação web de pedidos diretos que ${painDescription}\n\n` +
    `🚀 *Principais ganhos com a plataforma:*\n\n` +
    `💰 *Economia imediata:* Seus clientes compram direto de você, sem você repassar 12% a 25% do faturamento para apps de terceiros.\n\n` +
    `⚡ *Atendimento automatizado:* ${automatedDetail}\n\n` +
    `🌐 *Veja a plataforma rodando em tempo real:*\n` +
    `🔗 *Clique aqui para testar o sistema:* ${liveDemo}\n\n` +
    `📋 *Próximos passos para implantar no seu negócio:*\n\n` +
    `✨ ${onboardingText}\n\n` +
    `📦 Se fizer sentido para o seu delivery/negócio, coloco a sua operação rodando no ar esta semana.\n\n` +
    `📲 *Podemos alinhar isso hoje ${timingCta}?* Me responde aqui com um '*SIM*' ou me diga qual o melhor horário para conversarmos rapidamente! 🔥`
  );
}
