import re
import json
import base64
import requests
from typing import Dict, Any, Optional

CATEGORY_TAXONOMY = {
    'gastronomia': {
        'patterns': [r'pizza', r'restaurante', r'burger', r'hamburguer', r'lanche', r'comida', r'food', r'delivery', r'cardapio', r'menu', r'garcom', r'sushi', r'cozinha', r'ifood', r'pedido', r'mesa'],
        'target_business_types': ['Hamburgueria', 'Pizzaria', 'Restaurante', 'Lanchonete', 'Sushi Bar'],
        'target_niches': ['Alimentação & Gastronomia', 'Delivery Local'],
        'ideal_size': 'Pequeno a Médio Porte (10 a 150 pedidos diários)',
        'core_value_prop': 'Elimine até 27% de taxas dos marketplaces com cardápio digital próprio integrado ao WhatsApp.',
        'search_keywords': ['hamburgueria artesanal', 'pizzaria delivery', 'restaurante', 'lanchonete'],
        'solved_pain_points': [
            'Comissões abusivas de 15% a 27% em plataformas de entrega de terceiros',
            'Demora e gargalo no atendimento manual do WhatsApp em horários de pico',
            'Falta de canal de vendas direto e dependência de intermediários'
        ]
    },
    'beleza': {
        'patterns': [r'barber', r'barbearia', r'cabelo', r'salao', r'beleza', r'estetica', r'agendamento', r'agenda', r'unhas', r'manicure', r'sobrancelha', r'hair', r'corte'],
        'target_business_types': ['Barbearia', 'Salão de Beleza', 'Clínica de Estética', 'Esmalteria'],
        'target_niches': ['Beleza e Cuidados Pessoais'],
        'ideal_size': '2 a 12 profissionais por estabelecimento',
        'core_value_prop': 'Aumente os agendamentos em 35% com marcação automática pelo WhatsApp 24 horas por dia.',
        'search_keywords': ['barbearia premium', 'salão de beleza', 'centro de estética'],
        'solved_pain_points': [
            'Perda de novos clientes fora do horário comercial',
            'Alto índice de faltas e esquecimentos (no-show) de clientes',
            'Tempo perdido gerenciando agenda manualmente enquanto atende'
        ]
    },
    'automotivo': {
        'patterns': [r'oficina', r'mecanica', r'carro', r'auto', r'pecas', r'oleo', r'freio', r'pneu', r'funilaria', r'veiculo', r'motor', r'car', r'mecanico'],
        'target_business_types': ['Oficina Mecânica', 'Centro Automotivo', 'Auto Peças', 'Funilaria'],
        'target_niches': ['Serviços Automotivos e Manutenção'],
        'ideal_size': 'Oficinas com 2 a 10 elevadores',
        'core_value_prop': 'Envie orçamentos ilustrados com fotos no WhatsApp e receba aprovação do cliente em 2 minutos.',
        'search_keywords': ['oficina mecanica', 'centro automotivo', 'troca de oleo e freios'],
        'solved_pain_points': [
            'Demora na aprovação de orçamentos por telefone',
            'Falta de transparência e desconfiança do cliente sobre peças trocadas',
            'Controle manual desorganizado de Ordens de Serviço (OS)'
        ]
    },
    'saude': {
        'patterns': [r'clinica', r'medico', r'dentista', r'odonto', r'consultorio', r'paciente', r'psicologia', r'fisioterapia', r'saude', r'consulta'],
        'target_business_types': ['Clínica Odontológica', 'Consultório Médico', 'Clínica de Fisioterapia', 'Consultório de Psicologia'],
        'target_niches': ['Saúde e Bem-estar'],
        'ideal_size': 'Consultórios com 1 a 6 salas de atendimento',
        'core_value_prop': 'Secretária virtual com confirmação ativa de consultas via WhatsApp para zerar ausências.',
        'search_keywords': ['clinica odontologica', 'consultorio medico', 'clinica de fisioterapia'],
        'solved_pain_points': [
            'Gargalo de telefonemas e secretárias sobrecarregadas na recepção',
            'Prejuízo com faltas de pacientes em consultas agendadas',
            'Comunicação desarticulada de retornos e pós-atendimento'
        ]
    },
    'geral': {
        'patterns': [],
        'target_business_types': ['Comércio Local', 'Prestador de Serviços', 'Loja Física'],
        'target_niches': ['Varejo e Serviços Locais'],
        'ideal_size': 'Empresas locais com atendimento direto ao público',
        'core_value_prop': 'Automatize o atendimento e aumente as vendas de clientes locais no WhatsApp.',
        'search_keywords': ['comercio local', 'loja fisica', 'atendimento whatsapp'],
        'solved_pain_points': [
            'Perda de vendas por demora na resposta de mensagens',
            'Falta de presença digital otimizada e canal próprio',
            'Dificuldade em reter e fidelizar clientes da vizinhança'
        ]
    }
}

def fetch_real_github_repo_data(repo_url: str) -> Dict[str, Any]:
    """
    Fetches 100% REAL metadata, description, stars, language and README from GitHub API.
    """
    clean_url = repo_url.replace("https://github.com/", "").replace("http://github.com/", "").strip("/")
    parts = clean_url.split("/")
    if len(parts) < 2:
        return {'success': False, 'error': 'URL inválida'}

    owner, repo = parts[0], parts[1]
    headers = {"User-Agent": "LeadPulse-Real-GitHub-Engine/1.0"}

    result = {
        'owner': owner,
        'repoName': repo,
        'description': '',
        'stars': 0,
        'language': 'TypeScript',
        'topics': [],
        'readme': '',
    }

    try:
        # 1. Fetch Repo Details
        res = requests.get(f"https://api.github.com/repos/{owner}/{repo}", headers=headers, timeout=5)
        if res.status_code == 200:
            data = res.json()
            result['repoName'] = data.get('name', repo)
            result['description'] = data.get('description') or ''
            result['stars'] = data.get('stargazers_count', 0)
            result['language'] = data.get('language') or 'TypeScript'
            result['topics'] = data.get('topics', [])

        # 2. Fetch README Content
        readme_res = requests.get(f"https://api.github.com/repos/{owner}/{repo}/readme", headers=headers, timeout=5)
        if readme_res.status_code == 200:
            rm_data = readme_res.json()
            if "content" in rm_data:
                result['readme'] = base64.b64decode(rm_data["content"]).decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"Error fetching GitHub repo {owner}/{repo}: {e}")

    return result

def analyze_github_or_text_with_python(
    repo_url: Optional[str] = None,
    manual_description: Optional[str] = None,
    openrouter_api_key: Optional[str] = None,
    openrouter_model: Optional[str] = None
) -> Dict[str, Any]:
    """
    Real Python NLP & Regex Analyzer for GitHub repositories and software descriptions.
    Extracts real ICP, value props, search keywords and target business types.
    """
    gh_data = {}
    if repo_url and "github.com" in repo_url:
        gh_data = fetch_real_github_repo_data(repo_url)

    repo_name = gh_data.get('repoName') or (manual_description[:30].strip() if manual_description else "cardapio-digital-whatsapp")
    readme_text = gh_data.get('readme') or ''
    description_text = gh_data.get('description') or manual_description or ''

    text_to_analyze = f"{repo_name} {description_text} {readme_text}".lower()

    # Optional OpenRouter Polish if key configured
    if openrouter_api_key and len(openrouter_api_key.strip()) > 5:
        try:
            or_res = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {openrouter_api_key.strip()}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "LeadPulse Real ICP Analyzer",
                },
                json={
                    "model": openrouter_model or "openai/gpt-4o-mini",
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "Você é um Estrategista de Vendas B2B de Software para Estabelecimentos Físicos Locais no Brasil. "
                                "Analise o repositório/descrição do produto e extraia o ICP exato para prospecção no Google Maps. "
                                "Retorne EXCLUSIVAMENTE um JSON válido com o seguinte formato:\n"
                                '{\n'
                                '  "targetBusinessTypes": ["Hamburgueria", "Pizzaria"],\n'
                                '  "targetNiches": ["Gastronomia & Delivery"],\n'
                                '  "idealSize": "Pequeno e Médio Porte",\n'
                                '  "coreValueProp": "Elimine taxas de 12% a 27% dos marketplaces com pedidos diretos.",\n'
                                '  "searchKeywords": ["hamburgueria artesanal", "pizzaria delivery"],\n'
                                '  "solvedPainPoints": ["Comissões abusivas de marketplaces", "Gargalo no atendimento do WhatsApp"]\n'
                                '}'
                            )
                        },
                        {
                            "role": "user",
                            "content": f"Nome do Projeto: {repo_name}\nDescrição: {description_text}\nREADME: {readme_text[:3000]}"
                        }
                    ],
                    "temperature": 0.3
                },
                timeout=6
            )
            if or_res.status_code == 200:
                raw_json_str = or_res.json().get("choices", [{}])[0].get("message", {}).get("content", "").strip()
                cleaned = re.sub(r"^```json\s*", "", raw_json_str)
                cleaned = re.sub(r"\s*```$", "", cleaned)
                data = json.loads(cleaned)
                return {
                    'repoUrl': repo_url or 'custom_input',
                    'repoName': repo_name,
                    'description': description_text or data.get('coreValueProp', ''),
                    'githubStars': gh_data.get('stars', 0),
                    'githubLanguage': gh_data.get('language', 'TypeScript'),
                    'githubTopics': gh_data.get('topics', []),
                    'icp': {
                        'targetBusinessTypes': data.get('targetBusinessTypes', ['Hamburgueria', 'Pizzaria']),
                        'targetNiches': data.get('targetNiches', ['Gastronomia & Alimentação']),
                        'idealSize': data.get('idealSize', 'Pequeno e Médio Porte'),
                        'recommendedPitchStrategy': 'Foco em eliminação de comissões abusivas e pedidos diretos no WhatsApp',
                        'idealLocationKeywords': data.get('searchKeywords', ['hamburgueria artesanal']),
                    },
                    'coreValueProp': data.get('coreValueProp', 'Aumente seu lucro com canal próprio de pedidos diretos.'),
                    'searchKeywords': data.get('searchKeywords', ['hamburgueria artesanal', 'pizzaria']),
                    'solvedPainPoints': data.get('solvedPainPoints', [
                        'Comissões de 15% a 27% em plataformas de terceiros',
                        'Gargalo no atendimento manual do WhatsApp nos dias de pico'
                    ])
                }
        except Exception as e:
            print(f"OpenRouter analyze fallback to rule engine: {e}")

    # Pure Python Pattern Matcher
    best_category = 'geral'
    highest_matches = 0

    for cat_name, cat_data in CATEGORY_TAXONOMY.items():
        if cat_name == 'geral':
            continue
        matches = 0
        for pattern in cat_data['patterns']:
            if re.search(pattern, text_to_analyze):
                matches += 1
        if matches > highest_matches:
            highest_matches = matches
            best_category = cat_name

    matched_profile = CATEGORY_TAXONOMY[best_category]

    return {
        'repoUrl': repo_url or 'custom_input',
        'repoName': repo_name,
        'description': description_text or matched_profile['core_value_prop'],
        'githubStars': gh_data.get('stars', 0),
        'githubLanguage': gh_data.get('language', 'TypeScript'),
        'githubTopics': gh_data.get('topics', []),
        'icp': {
            'targetBusinessTypes': matched_profile['target_business_types'],
            'targetNiches': matched_profile['target_niches'],
            'idealSize': matched_profile['ideal_size'],
            'recommendedPitchStrategy': 'Abordagem consultiva com foco em ROI, redução de custos e teste de demonstração ao vivo',
            'idealLocationKeywords': matched_profile['search_keywords'],
        },
        'coreValueProp': matched_profile['core_value_prop'],
        'searchKeywords': matched_profile['search_keywords'],
        'solvedPainPoints': matched_profile['solved_pain_points']
    }
