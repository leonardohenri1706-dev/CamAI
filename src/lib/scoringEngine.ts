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
  const liveDemo = demoUrl || 'https://botclientes.vercel.app';
  const catLower = category.toLowerCase();

  const inCeara = isCearaLocation(placeName, digitalHealth);
  const regionPhrase = inCeara ? 'aqui no Ceará' : 'em todo o Brasil';

  let sector = 'empresas de delivery e comércio local';
  let specificRecognition = `🏆 Parabéns pelo excelente trabalho na ${shortName} (${rating} ★ com ${reviewsCount} avaliações no Google)!`;
  let primaryBenefit = '💰 Economia de 12% a 27% de faturamento em comissões de marketplaces terceiros.';
  let secondaryBenefit = '⚡ Atendimento 100% automático no WhatsApp sem filas e sem atrasos.';
  let automationDetail = 'O pedido/agendamento chega calculado com endereço, itens e taxa de entrega pronto no WhatsApp.';
  let timingCta = 'antes do próximo pico de atendimento';
  let onboardingText = `Monto toda a plataforma com a logo, fotos e catálogo completo da ${shortName}.`;

  if (catLower.includes('hamburg') || catLower.includes('burger') || catLower.includes('lanche')) {
    sector = 'hamburguerias & lanches';
    specificRecognition = `🏆 Parabéns pela reputação da ${shortName} (${rating} ★ com ${reviewsCount} avaliações no Google)!`;
    primaryBenefit = '💰 Lucro Líquido Direto: Elimina taxas de 12% a 27% mantendo 100% da margem das suas vendas.';
    secondaryBenefit = '🔥 Atendimento Sem Gargalos: Clientes fazem o pedido completo pelo WhatsApp sem sobrecarregar a equipe.';
    automationDetail = 'O pedido chega formatado com ponto da carne, adicionais, taxa por bairro e pronto para a chapa.';
    timingCta = 'antes de abrir a chapa hoje';
    onboardingText = `Posso parametrizar o sistema com a identidade visual, fotos dos burgers e cardápio da ${shortName}.`;
  } else if (catLower.includes('pizza')) {
    sector = 'pizzarias & gastronomia';
    specificRecognition = `🏆 Acompanhando o alto fluxo e sucesso da ${shortName} (${rating} ★ no Google com ${reviewsCount} avaliações)!`;
    primaryBenefit = '💰 100% de Vendas Diretas: Elimina comissões de terceiros e fideliza o cliente com sua própria marca.';
    secondaryBenefit = '🍕 Agilidade nos Dias de Pico: Fim da lentidão de respostas manuais e envio de PDF pesado.';
    automationDetail = 'Comanda calculada com pizzas meia-a-meia, bordas recheadas e taxa por bairro pronta para a cozinha.';
    timingCta = 'antes de acender o forno hoje';
    onboardingText = `Montamos a plataforma totalmente personalizada com a marca e cardápio da ${shortName}.`;
  } else if (catLower.includes('barber') || catLower.includes('salao') || catLower.includes('beleza') || catLower.includes('cabelo')) {
    sector = 'barbearias e estética';
    specificRecognition = `🏆 Excelente trabalho e forte engajamento na ${shortName} (${rating} ★ no Google com ${reviewsCount} avaliações)!`;
    primaryBenefit = '📅 Agendamento Automático 24/7: Clientes marcam horários sem você precisar parar o atendimento.';
    secondaryBenefit = '🚫 Lembretes Anti-Falta: Reduz em até 80% o no-show enviando lembretes automáticos no WhatsApp.';
    automationDetail = 'O cliente escolhe o profissional, serviço e horário disponível com confirmação instantânea.';
    timingCta = 'antes de fechar a agenda da semana';
    onboardingText = `Cadastramos os profissionais, fotos e serviços da ${shortName}.`;
  } else if (catLower.includes('oficina') || catLower.includes('mecanica') || catLower.includes('auto') || catLower.includes('car')) {
    sector = 'serviços automotivos';
    specificRecognition = `🏆 Acompanhando o movimento e a reputação da ${shortName} (${rating} ★ no Google)!`;
    primaryBenefit = '🔧 Orçamentos Aprovados Mais Rápido: Envie propostas com foto da peça e valores com aprovação em 1 clique.';
    secondaryBenefit = '📱 Comunicação Organizada: Fim da perda de ordens de serviço e mensagens perdidas no WhatsApp.';
    automationDetail = 'Cliente recebe a ordem de serviço detalhada com fotos e autoriza no WhatsApp com agilidade.';
    timingCta = 'no início do expediente';
    onboardingText = `Estruturamos toda a tabela de serviços e dados da ${shortName}.`;
  } else if (catLower.includes('clinica') || catLower.includes('odonto') || catLower.includes('saude') || catLower.includes('dentista')) {
    sector = 'saúde & odontologia';
    specificRecognition = `🏆 Destaque em atendimento e avaliações na ${shortName} (${rating} ★ no Google com ${reviewsCount} avaliações)!`;
    primaryBenefit = '🏥 Recepção Desafogada: Triagem e confirmação automática de consultas no WhatsApp.';
    secondaryBenefit = '⏱️ Menos Faltas: Envio automático de orientações pré-consulta e confirmação imediata de presença.';
    automationDetail = 'Pacientes escolhem datas, confirmam procedimentos e recebem lembretes sem tomar tempo da secretária.';
    timingCta = 'antes de abrir o consultório hoje';
    onboardingText = `Personalizamos todo o fluxo para as especialidades da ${shortName}.`;
  }

  // MULTI-CTA HIGH-CONVERSION PITCH (Tones)
  if (tone === 'direct') {
    return (
      `Olá, equipe da *${shortName}*! Tudo bem?\n\n` +
      `Meu nome é *${devName}*, sou especialista em soluções tecnológicas de vendas para ${sector} ${regionPhrase}.\n\n` +
      `${specificRecognition}\n\n` +
      `Desenvolvemos uma aplicação web de canal próprio direto no WhatsApp para potencializar o faturamento da *${shortName}*:\n\n` +
      `✨ *PRINCIPAIS BENEFÍCIOS DO NOSSO PRODUTO:*\n` +
      `${primaryBenefit}\n` +
      `${secondaryBenefit}\n` +
      `⚙️ *Como Funciona:* ${automationDetail}\n\n` +
      `👇 *VEJA A TECNOLOGIA EM AÇÃO NA PRÁTICA:* 👇\n` +
      `👉 *Clique Aqui para Testar a Demonstração ao Vivo:* ${liveDemo}\n\n` +
      `🎁 *OFERTA ESPECIAL:* ${onboardingText} e colocamos no ar ${timingCta}!\n\n` +
      `📲 *COMO DESEJA PROSSEGUIR?*\n` +
      `1️⃣ Responda com a palavra *SIM* para receber a versão personalizada sem custo.\n` +
      `2️⃣ Ou me diga qual o melhor horário hoje para uma conversa rápida de 3 minutos!`
    );
  }

  if (tone === 'promotional') {
    return (
      `🔥 *OPORTUNIDADE DE EXPANSÃO PARA A ${shortName.toUpperCase()}!* 🔥\n\n` +
      `Olá, gestor da *${shortName}*! Tudo bem?\n\n` +
      `Meu nome é *${devName}* e ajudo ${sector} ${regionPhrase} a multiplicarem suas vendas diretas sem pagar comissões para terceiros.\n\n` +
      `${specificRecognition}\n\n` +
      `🚀 *BENEFÍCIOS EXCLUSIVOS DO NOSSO SISTEMA WEB:* \n` +
      `1. ${primaryBenefit}\n` +
      `2. ${secondaryBenefit}\n` +
      `3. 📲 *Vendas Automatizadas:* ${automationDetail}\n\n` +
      `👇 *ACESSE A DEMONSTRAÇÃO COMPLETA AO VIVO:* 👇\n` +
      `🔗 *Testar Sistema em Tempo Real:* ${liveDemo}\n\n` +
      `🎁 *CONDIÇÃO EXCLUSIVA DE IMPLANTAÇÃO:* ${onboardingText} sem taxa de adesão inicial!\n\n` +
      `👇 *ESCOLHA SUA OPÇÃO DE ATENDIMENTO:* 👇\n` +
      `💬 Responda *QUERO TESTAR* para ativarmos sua demonstração personalizada agora mesmo!\n` +
      `📞 Ou me diga o melhor horário para ligar para você hoje!`
    );
  }

  // DEFAULT / CONSULTIVE (High-Conversion Master Standard)
  return (
    `Olá, responsável pela *${shortName}*, tudo bem?\n\n` +
    `Meu nome é *${devName}*, sou especialista em engenharia de softwares comerciais e desenvolvo soluções de alto lucro para ${sector} ${regionPhrase}.\n\n` +
    `${specificRecognition}\n\n` +
    `Estruturamos um sistema exclusivo de vendas e atendimento via WhatsApp para a *${shortName}*:\n\n` +
    `💎 *BENEFÍCIOS REAIS DO NOSSO PRODUTO:*\n` +
    `• ${primaryBenefit}\n` +
    `• ${secondaryBenefit}\n` +
    `• 🎯 *Automação Inteligente:* ${automationDetail}\n\n` +
    `👇 *EXPERIMENTE A PLATAFORMA EM FUNCIONAMENTO:* 👇\n` +
    `👉 *Clique para Testar a Demonstração ao Vivo:* ${liveDemo}\n\n` +
    `📋 *COMO IMPLANTAMOS NA SUA EMPRESA:*\n` +
    `1. ${onboardingText}\n` +
    `2. Deixamos tudo testado e pronto para operar ${timingCta}.\n\n` +
    `📲 *PRÓXIMOS PASSOS (CHAMADAS DE AÇÃO):*\n` +
    `👉 Responda *SIM* para receber a versão grátis com a marca da ${shortName}.\n` +
    `👉 Ou me diga qual o melhor horário para um bate-papo de 3 minutos hoje!`
  );
}
