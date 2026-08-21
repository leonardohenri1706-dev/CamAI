import requests
from typing import Dict, Any, Optional

def is_ceara_location(place_name: str, digital_health: Dict[str, Any]) -> bool:
    full_text = f"{place_name} {digital_health.get('formattedAddress', '')} {digital_health.get('city', '')} {digital_health.get('neighborhood', '')}".lower()
    raw_phone = str(digital_health.get('rawPhone') or digital_health.get('formattedPhone') or '')
    
    digits = ''.join(c for c in raw_phone if c.isdigit())
    if digits.startswith('55'):
        digits = digits[2:]
    if digits.startswith('85') or digits.startswith('88'):
        return True

    ceara_keywords = ['fortaleza', 'ceará', 'ceara', '- ce', ', ce', 'sobral', 'juazeiro', 'caucaia', 'maracanaú', 'maracanau', 'meireles', 'aldeota', 'varjota']
    return any(k in full_text for k in ceara_keywords)

def calculate_python_lead_score(
    place_name: str,
    category: str,
    digital_health: Dict[str, Any],
    repo_analysis: Dict[str, Any],
    pitch_tone: str = 'consultive',
    openrouter_api_key: Optional[str] = None,
    openrouter_model: Optional[str] = None,
    dev_name: str = 'Leonardo',
    demo_url: Optional[str] = None
) -> Dict[str, Any]:
    """
    Pure Python Lead Scoring algorithm (0-100%) and WhatsApp pitch generator.
    Works 100% locally in Python with zero AI required.
    """
    score = 0

    # 1. Website factor (No website = High Opportunity for developer product)
    has_website = digital_health.get('hasWebsite', False)
    website_url = digital_health.get('websiteUrl') or ''
    
    if not has_website or 'instagram' in website_url or 'linktr.ee' in website_url:
        no_website_bonus = 40
    else:
        no_website_bonus = 10
    score += no_website_bonus

    # 2. Review volume and popularity factor
    reviews_count = digital_health.get('reviewsCount', 0)
    rating = digital_health.get('rating', 4.5)

    if reviews_count >= 80 and rating >= 4.5:
        review_volume_bonus = 25
    elif reviews_count >= 30 and rating >= 4.0:
        review_volume_bonus = 20
    elif reviews_count >= 10:
        review_volume_bonus = 12
    else:
        review_volume_bonus = 5
    score += review_volume_bonus

    # 3. WhatsApp verified factor
    has_whatsapp = digital_health.get('hasWhatsApp', True)
    if has_whatsapp and digital_health.get('formattedPhone'):
        phone_bonus = 15
    elif digital_health.get('formattedPhone'):
        phone_bonus = 8
    else:
        phone_bonus = 0
    score += phone_bonus

    # 4. Category fit with repo ICP
    target_types = repo_analysis.get('icp', {}).get('targetBusinessTypes', [])
    is_direct_fit = any(category.lower() in t.lower() or t.lower() in category.lower() for t in target_types)

    if is_direct_fit:
        category_fit_bonus = 20
    else:
        category_fit_bonus = 10
    score += category_fit_bonus

    final_score = min(100, max(15, score))

    # Classification
    if final_score >= 75:
        classification = "Alta Prioridade"
    elif final_score >= 50:
        classification = "Média Prioridade"
    else:
        classification = "Baixa Prioridade"

    # Rationale synthesis in Portuguese
    rationale_parts = []
    if no_website_bonus >= 35:
        rationale_parts.append("Não possui site/canal direto próprio registrado (alta oportunidade de vendas).")
    else:
        rationale_parts.append("Já possui website ativo.")

    if reviews_count >= 30:
        rationale_parts.append(f"Fluxo consolidado com {reviews_count} avaliações ({rating} ★) no Google Maps.")
    else:
        rationale_parts.append(f"Possui {reviews_count} avaliações no Google.")

    repo_name = repo_analysis.get('repoName', 'sua solução de software')
    core_value_prop = repo_analysis.get('coreValueProp', 'automação de pedidos diretos e eliminação de taxas')

    if is_direct_fit:
        rationale_parts.append(f"Encaixe perfeito (100% ICP) com a proposta de {repo_name}.")

    rationale = f"{category} com alto volume de clientes locais. {' '.join(rationale_parts)} Alta probabilidade de conversão para {core_value_prop.lower()}"

    # Generate custom pitch matching high-converting reference standard in Pure Python
    custom_pitch = generate_python_custom_pitch(place_name, category, digital_health, repo_analysis, pitch_tone, dev_name, demo_url)

    # Advanced OpenRouter AI Enhancement if key configured
    if openrouter_api_key and len(openrouter_api_key.strip()) > 5:
        try:
            in_ceara = is_ceara_location(place_name, digital_health)
            region_rule = "Como este lead é no Ceará, utilize 'aqui no Ceará'." if in_ceara else "Como este lead é FORA do Ceará, utilize OBRIGATORIAMENTE 'em todo o Brasil' ou 'aqui no Brasil'."
            
            or_res = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {openrouter_api_key.strip()}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "LeadPulse B2B Outreaching",
                },
                json={
                    "model": openrouter_model or "openai/gpt-4o-mini",
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "Você é um especialista em Copywriting B2B e Cold WhatsApp Outbound para pequenos e médios negócios no Brasil.\n"
                                "Sua missão é gerar uma mensagem de prospecção de WhatsApp IRRESISTÍVEL, humana, altamente personalizada e persuasiva, "
                                "escrita por um engenheiro de software que desenvolve soluções digitais focadas em aumentar o lucro líquido do estabelecimento.\n\n"
                                "DIRETRIZES FUNDAMENTAIS:\n"
                                f"1. Regionalização: {region_rule}\n"
                                "2. Tom: Profissional, próximo, confiante e consultivo. NUNCA pareça um bot de spam ou vendedor genérico.\n"
                                "3. Gancho: Elogie o volume real do estabelecimento (mencionando sua nota e avaliações no Google).\n"
                                "4. Dor Aguda: Aponte a perda de 12% a 27% do faturamento para apps terceiros (iFood/outros) ou gargalo de atendimento manual nos dias de pico.\n"
                                "5. Solução Clara: Sistema web direto onde o cliente compra no WhatsApp, com endereço, taxa por bairro e detalhes calculados.\n"
                                "6. Prova Real: Inclua o link de teste da plataforma no ar.\n"
                                "7. Oferta Sem Fricção: Parametrização completa com o cardápio/catálogo deles e no ar em poucos dias.\n"
                                "8. Micro-CTA: Pergunta fechada de baixo esforço ('Podemos alinhar isso hoje antes de abrir o expediente? Me responda com um SIM').\n"
                                "9. Formatação: Quebras de linha limpas, bullets claros, emojis pontuais e elegantes. Retorne APENAS a mensagem pronta para envio."
                            )
                        },
                        {
                            "role": "user",
                            "content": (
                                f"Estabelecimento Alvo: {place_name} ({category})\n"
                                f"Avaliações no Google: {rating} ★ ({reviews_count} avaliações)\n"
                                f"Nome do Desenvolvedor: {dev_name}\n"
                                f"Link de Demonstração: {demo_url or 'https://pizzaria-arteedelicia.vercel.app/'}\n"
                                f"Tom Desejado: {pitch_tone}\n"
                                f"Estrutura Base de Referência:\n{custom_pitch}"
                            )
                        }
                    ],
                    "max_tokens": 450,
                    "temperature": 0.4
                },
                timeout=6
            )
            if or_res.status_code == 200:
                or_text = or_res.json().get("choices", [{}])[0].get("message", {}).get("content", "").strip()
                if or_text and len(or_text) > 50:
                    custom_pitch = or_text
        except Exception:
            pass

    return {
        'leadScorePercentage': final_score,
        'classification': classification,
        'rationale': rationale,
        'customPitch': custom_pitch,
        'factors': {
            'noWebsiteBonus': no_website_bonus,
            'reviewVolumeBonus': review_volume_bonus,
            'phoneVerifiedBonus': phone_bonus,
            'categoryFitBonus': category_fit_bonus,
        }
    }

def generate_python_custom_pitch(
    place_name: str,
    category: str,
    digital_health: Dict[str, Any],
    repo_analysis: Dict[str, Any],
    tone: str = 'consultive',
    dev_name: str = 'Leonardo',
    demo_url: Optional[str] = None
) -> str:
    short_name = place_name.split('-')[0].strip()
    rating = digital_health.get('rating', 4.8)
    reviews_count = digital_health.get('reviewsCount', 95)
    live_demo = demo_url or 'https://pizzaria-arteedelicia.vercel.app/'
    cat_lower = category.lower()

    # Regional Context: Ceará vs Todo o Brasil
    in_ceara = is_ceara_location(place_name, digital_health)
    region_phrase = "aqui no Ceará" if in_ceara else "em todo o Brasil"

    # Dynamic Sector & Niche Specific Vocabulary
    if 'hamburg' in cat_lower or 'burger' in cat_lower or 'lanche' in cat_lower:
        sector = 'hamburguerias & lanches'
        specific_recognition = f"Analisando o fluxo forte da {short_name} ({rating} ★ no Google com {reviews_count} avaliações)"
        primary_pain = "o gargalo de atendimento no WhatsApp nos dias de pico (quinta a domingo) e a dependência de taxas de 12% a 27% dos marketplaces"
        automation_benefit = "O pedido chega formatado com ponto da carne, adicionais, taxa de entrega calculada por bairro e direto para a chapa/cozinha."
        timing_cta = "antes de abrir a chapa hoje"
        onboarding_text = f"Posso parametrizar todo o sistema com a identidade visual, fotos dos burgers e cardápio completo da {short_name}."
    elif 'pizza' in cat_lower:
        sector = 'gastronomia & pizzarias'
        specific_recognition = f"Analisando o atendimento de pizzarias com alto volume como a {short_name} ({rating} ★ no Google)"
        primary_pain = "o atraso no WhatsApp nos dias de pico e o envio manual de cardápio em PDF"
        automation_benefit = "A comanda chega calculada com pizzas meia-a-meia, bordas recheadas, taxa de entrega por bairro e pronta para o forno."
        timing_cta = "antes de abrir o forno hoje"
        onboarding_text = f"Posso parametrizar todo o sistema com a marca, fotos e cardápio completo da {short_name}."
    elif any(k in cat_lower for k in ['barber', 'salao', 'beleza', 'cabelo']):
        sector = 'estética e barbearias'
        specific_recognition = f"Acompanhando o sucesso e as excelentes avaliações da {short_name} ({rating} ★ com {reviews_count} clientes no Google)"
        primary_pain = "a perda de tempo respondendo mensagens enquanto atende e as faltas de clientes sem aviso prévio"
        automation_benefit = "Agendamento 24h em tempo real, com confirmação e lembretes anti-falta automáticos direto no WhatsApp."
        timing_cta = "antes de fechar a agenda da semana"
        onboarding_text = f"Posso configurar o sistema com os profissionais, fotos e serviços da {short_name}."
    elif any(k in cat_lower for k in ['oficina', 'mecanica', 'auto', 'car']):
        sector = 'serviços automotivos'
        specific_recognition = f"Acompanhando o movimento e a reputação da {short_name} ({rating} ★ no Google)"
        primary_pain = "a demora na aprovação de orçamentos por telefone e a desorganização de ordens de serviço"
        automation_benefit = "Orçamentos com foto da peça e valores são aprovados pelo cliente em 1 clique no WhatsApp."
        timing_cta = "no início do expediente"
        onboarding_text = f"Posso estruturar toda a tabela de serviços e dados da {short_name}."
    elif any(k in cat_lower for k in ['clinica', 'odonto', 'saude', 'dentista']):
        sector = 'saúde & odontologia'
        specific_recognition = f"Analisando a consolidação da {short_name} ({rating} ★ no Google)"
        primary_pain = "a sobrecarga da recepção com confirmação manual e dúvidas repetitivas de pacientes"
        automation_benefit = "Triagem automática, envio de orientações pré-consulta e confirmação instantânea na agenda."
        timing_cta = "antes de abrir o consultório hoje"
        onboarding_text = f"Posso personalizar todo o fluxo para as especialidades da {short_name}."
    else:
        sector = category.lower()
        specific_recognition = f"Analisando o excelente fluxo da {short_name} ({rating} ★ com {reviews_count} avaliações no Google)"
        primary_pain = "o atraso no atendimento manual e a perda de vendas nos horários de pico"
        automation_benefit = "Atendimento 100% estruturado com catálogo digital, cálculo de frete e fechamento de pedidos em segundos."
        timing_cta = "antes do próximo pico de atendimento"
        onboarding_text = f"Posso parametrizar todo o sistema com a marca e produtos da {short_name}."

    # TONE 1: DIRECT (10-second fast read for busy business owners)
    if tone == 'direct':
        return (
            f"Olá, responsável pela {short_name}, tudo bem?\n\n"
            f"Meu nome é {dev_name}, sou engenheiro de software e desenvolvo soluções focadas em *lucro líquido direto* para o setor de {sector} {region_phrase}.\n\n"
            f"Notei o volume forte de vocês ({rating} ★ com {reviews_count} avaliações no Google), mas vi que muitos clientes ainda dependem de atendimento manual ou de apps que cobram de 12% a 27% de comissão.\n\n"
            f"🚀 O que desenvolvi para vocês:\n"
            f"• Canal Próprio no WhatsApp: Clientes pedem direto sem intermediários.\n"
            f"• Automação: {automation_benefit}\n\n"
            f"🔗 Teste o sistema funcionando em tempo real:\n"
            f"{live_demo}\n\n"
            f"{onboarding_text} e coloco rodando no ar ainda esta semana.\n\n"
            f"Podemos alinhar isso hoje {timing_cta}? Me responde aqui com um *SIM* ou me diga qual o melhor horário para um bate-papo de 5 minutos."
        )

    # TONE 2: PROMOTIONAL / IRRESISTIBLE OFFER (Free tailored demo ready to test)
    if tone == 'promotional':
        return (
            f"Olá, gestor da {short_name}! Tudo bem?\n\n"
            f"Meu nome é {dev_name} e sou especialista em automação comercial para {sector} {region_phrase}.\n\n"
            f"{specific_recognition}, estruturei uma oportunidade exclusiva:\n\n"
            f"💡 *O que estamos entregando para o seu negócio:*\n"
            f"1. Eliminação imediata de {primaryPain}.\n"
            f"2. {automation_benefit}\n"
            f"3. Economia de milhares de reais em taxas de plataformas terceiras.\n\n"
            f"🔗 Veja uma demonstração real da tecnologia em ação:\n"
            f"{live_demo}\n\n"
            f"🎁 *Proposta sem custo de setup:* Monto uma versão demonstrativa já personalizada com as fotos e produtos da {short_name} para vocês testarem na prática sem compromisso.\n\n"
            f"Se fizer sentido testar na sua operação, me responda *QUERO TESTAR* que preparo a demonstração hoje!"
        )

    # TONE 3: CONSULTIVE / REFERENCE HIGH CONVERSION STANDARD (Padrão Leonardo)
    return (
        f"Olá, responsável pela {short_name}, tudo bem?\n\n"
        f"Meu nome é {dev_name}, sou engenheiro de software e desenvolvo soluções digitais focadas em redução de custos operacionais e aumento de lucro para o setor de {sector} {region_phrase}.\n\n"
        f"{specific_recognition}, estruturei uma aplicação web de pedidos diretos que elimina {primary_pain} e substitui o envio manual de cardápio.\n\n"
        f"Principais ganhos com a plataforma:\n"
        f"• Economia imediata: Seus clientes compram direto de você, sem você repassar 12% a 25% do faturamento para apps de terceiros.\n"
        f"• Atendimento automatizado: {automation_benefit}\n\n"
        f"Veja a plataforma rodando em tempo real:\n"
        f"🔗 Clique aqui para testar o sistema: {live_demo}\n\n"
        f"Próximos passos para implantar no seu negócio:\n"
        f"1. {onboarding_text}\n"
        f"2. Se fizer sentido para a sua operação, coloco tudo rodando no ar esta semana.\n\n"
        f"Podemos alinhar isso hoje {timing_cta}? Me responde aqui com um 'SIM' ou me diga qual o melhor horário para conversarmos rapidamente."
    )
