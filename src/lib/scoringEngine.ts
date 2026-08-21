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
  const rating = digitalHealth.rating || 4.8;
  const reviewsCount = digitalHealth.reviewsCount || 95;
  const liveDemo = demoUrl || 'https://pizzaria-arteedelicia.vercel.app/';
  const catLower = category.toLowerCase();

  // Regional Context: Ceará vs Todo o Brasil
  const inCeara = isCearaLocation(placeName, digitalHealth);
  const regionPhrase = inCeara ? 'aqui no Ceará' : 'em todo o Brasil';

  // Dynamic Sector & Niche Specific Vocabulary
  let sector = 'empresas de delivery e comércio local';
  let specificRecognition = `Analisando o excelente fluxo da ${shortName} (${rating} ★ com ${reviewsCount} avaliações no Google)`;
  let primaryPain = 'o gargalo de atendimento no WhatsApp nos horários de pico e a dependência de taxas abusivas de terceiros';
  let automationBenefit = 'O pedido chega 100% formatado com itens, adicionais, endereço e taxa calculada direto no WhatsApp.';
  let timingCta = 'antes do próximo pico de atendimento';
  let onboardingText = `Posso parametrizar todo o sistema com a identidade visual e cardápio/catálogo completo da ${shortName}.`;

  if (catLower.includes('hamburg') || catLower.includes('burger') || catLower.includes('lanche')) {
    sector = 'hamburguerias & lanches';
    specificRecognition = `Analisando o fluxo forte da ${shortName} (${rating} ★ no Google com ${reviewsCount} avaliações)`;
    primaryPain = 'o gargalo de atendimento no WhatsApp nos dias de pico (quinta a domingo) e a dependência de taxas de 12% a 27% dos marketplaces';
    automationBenefit = 'O pedido chega formatado com ponto da carne, adicionais, taxa de entrega calculada por bairro e direto para a chapa/cozinha.';
    timingCta = 'antes de abrir a chapa hoje';
    onboardingText = `Posso parametrizar todo o sistema com a identidade visual, fotos dos burgers e cardápio completo da ${shortName}.`;
  } else if (catLower.includes('pizza')) {
    sector = 'gastronomia & pizzarias';
    specificRecognition = `Analisando o atendimento de pizzarias com alto volume como a ${shortName} (${rating} ★ no Google)`;
    primaryPain = 'o atraso no WhatsApp nos dias de pico e o envio manual de cardápio em PDF';
    automationBenefit = 'A comanda chega calculada com pizzas meia-a-meia, bordas recheadas, taxa de entrega por bairro e pronta para o forno.';
    timingCta = 'antes de abrir o forno hoje';
    onboardingText = `Posso parametrizar todo o sistema com a marca, fotos e cardápio completo da ${shortName}.`;
  } else if (catLower.includes('barber') || catLower.includes('salao') || catLower.includes('beleza') || catLower.includes('cabelo')) {
    sector = 'estética e barbearias';
    specificRecognition = `Acompanhando o sucesso e as excelentes avaliações da ${shortName} (${rating} ★ com ${reviewsCount} clientes no Google)`;
    primaryPain = 'a perda de tempo respondendo mensagens enquanto atende e as faltas de clientes sem aviso prévio';
    automationBenefit = 'Agendamento 24h em tempo real, com confirmação e lembretes anti-falta automáticos direto no WhatsApp.';
    timingCta = 'antes de fechar a agenda da semana';
    onboardingText = `Posso configurar o sistema com os profissionais, fotos e serviços da ${shortName}.`;
  } else if (catLower.includes('oficina') || catLower.includes('mecanica') || catLower.includes('auto') || catLower.includes('car')) {
    sector = 'serviços automotivos';
    specificRecognition = `Acompanhando o movimento e a reputação da ${shortName} (${rating} ★ no Google)`;
    primaryPain = 'a demora na aprovação de orçamentos por telefone e a desorganização de ordens de serviço';
    automationBenefit = 'Orçamentos com foto da peça e valores são aprovados pelo cliente em 1 clique no WhatsApp.';
    timingCta = 'no início do expediente';
    onboardingText = `Posso estruturar toda a tabela de serviços e dados da ${shortName}.`;
  } else if (catLower.includes('clinica') || catLower.includes('odonto') || catLower.includes('saude') || catLower.includes('dentista')) {
    sector = 'saúde & odontologia';
    specificRecognition = `Analisando a consolidação da ${shortName} (${rating} ★ no Google)`;
    primaryPain = 'a sobrecarga da recepção com confirmação manual e dúvidas repetitivas de pacientes';
    automationBenefit = 'Triagem automática, envio de orientações pré-consulta e confirmação instantânea na agenda.';
    timingCta = 'antes de abrir o consultório hoje';
    onboardingText = `Posso personalizar todo o fluxo para as especialidades da ${shortName}.`;
  }

  // TONE 1: DIRECT (10-second fast read)
  if (tone === 'direct') {
    return (
      `Olá, responsável pela ${shortName}, tudo bem?\n\n` +
      `Meu nome é ${devName}, sou engenheiro de software e desenvolvo soluções focadas em *lucro líquido direto* para o setor de ${sector} ${regionPhrase}.\n\n` +
      `Notei o volume forte de vocês (${rating} ★ com ${reviewsCount} avaliações no Google), mas vi que muitos clientes ainda dependem de atendimento manual ou de apps que cobram de 12% a 27% de comissão.\n\n` +
      `🚀 O que desenvolvi para vocês:\n` +
      `• Canal Próprio no WhatsApp: Clientes pedem direto sem intermediários.\n` +
      `• Automação: ${automationBenefit}\n\n` +
      `🔗 Teste o sistema funcionando em tempo real:\n` +
      `${liveDemo}\n\n` +
      `${onboardingText} e coloco rodando no ar ainda esta semana.\n\n` +
      `Podemos alinhar isso hoje ${timingCta}? Me responde aqui com um *SIM* ou me diga qual o melhor horário para um bate-papo de 5 minutos.`
    );
  }

  // TONE 2: PROMOTIONAL / IRRESISTIBLE OFFER
  if (tone === 'promotional') {
    return (
      `Olá, gestor da ${shortName}! Tudo bem?\n\n` +
      `Meu nome é ${devName} e sou especialista em automação comercial para ${sector} ${regionPhrase}.\n\n` +
      `${specificRecognition}, estruturei uma oportunidade exclusiva:\n\n` +
      `💡 *O que estamos entregando para o seu negócio:*\n` +
      `1. Eliminação imediata de ${primaryPain}.\n` +
      `2. ${automationBenefit}\n` +
      `3. Economia de milhares de reais em taxas de plataformas terceiras.\n\n` +
      `🔗 Veja uma demonstração real da tecnologia em ação:\n` +
      `${liveDemo}\n\n` +
      `🎁 *Proposta sem custo de setup:* Monto uma versão demonstrativa já personalizada com as fotos e produtos da ${shortName} para vocês testarem na prática sem compromisso.\n\n` +
      `Se fizer sentido testar na sua operação, me responda *QUERO TESTAR* que preparo a demonstração hoje!`
    );
  }

  // TONE 3: CONSULTIVE / REFERENCE HIGH CONVERSION STANDARD (Padrão Leonardo)
  return (
    `Olá, responsável pela ${shortName}, tudo bem?\n\n` +
    `Meu nome é ${devName}, sou engenheiro de software e desenvolvo soluções digitais focadas em redução de custos operacionais e aumento de lucro para o setor de ${sector} ${regionPhrase}.\n\n` +
    `${specificRecognition}, estruturei uma aplicação web de pedidos diretos que elimina ${primaryPain} e substitui o envio manual de cardápio.\n\n` +
    `Principais ganhos com a plataforma:\n` +
    `• Economia imediata: Seus clientes compram direto de você, sem você repassar 12% a 25% do faturamento para apps de terceiros.\n` +
    `• Atendimento automatizado: ${automationBenefit}\n\n` +
    `Veja a plataforma rodando em tempo real:\n` +
    `🔗 Clique aqui para testar o sistema: ${liveDemo}\n\n` +
    `Próximos passos para implantar no seu negócio:\n` +
    `1. ${onboardingText}\n` +
    `2. Se fizer sentido para a sua operação, coloco tudo rodando no ar esta semana.\n\n` +
    `Podemos alinhar isso hoje ${timingCta}? Me responde aqui com um 'SIM' ou me diga qual o melhor horário para conversarmos rapidamente.`
  );
}
