import { NextResponse } from 'next/server';
import { RepoAnalysis } from '@/types/prospecting';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { repoUrl, manualDescription } = body;

    // Process Real GitHub API if URL provided
    let readmeText = '';
    let repoName = 'meu-projeto-saas';
    let stars = 0;
    let language = 'TypeScript';
    let topics: string[] = [];
    let githubDescription = '';

    if (repoUrl && repoUrl.includes('github.com')) {
      const clean = repoUrl.replace('https://github.com/', '').replace('http://github.com/', '').trim().replace(/\/$/, '');
      const parts = clean.split('/');
      if (parts.length >= 2) {
        const owner = parts[0];
        const repo = parts[1];
        repoName = repo;

        try {
          // 1. Fetch Repository Details
          const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: { 'User-Agent': 'LeadPulse-Real-GitHub-Engine/1.0' },
          });
          if (repoRes.ok) {
            const data = await repoRes.json();
            repoName = data.name || repo;
            githubDescription = data.description || '';
            stars = data.stargazers_count || 0;
            language = data.language || 'TypeScript';
            topics = data.topics || [];
          }

          // 2. Fetch README
          const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
            headers: { 'User-Agent': 'LeadPulse-Real-GitHub-Engine/1.0' },
          });

          if (ghRes.ok) {
            const data = await ghRes.json();
            if (data.content) {
              readmeText = Buffer.from(data.content, 'base64').toString('utf-8');
            }
          }
        } catch (e) {
          console.warn('GitHub API fetch warning:', e);
        }
      }
    }

    const textToAnalyze = `${repoName} ${githubDescription} ${readmeText || manualDescription || ''}`.toLowerCase();

    // Determine category ICP based on real text
    let targetBusinessTypes = ['Hamburgueria', 'Pizzaria', 'Restaurante'];
    let targetNiches = ['Gastronomia & Delivery'];
    let coreValueProp = 'Elimine taxas de 12% a 27% de apps terceiros com pedidos diretos pelo WhatsApp.';
    let searchKeywords = ['hamburgueria artesanal', 'pizzaria delivery'];
    let solvedPainPoints = [
      'Comissões abusivas de 15% a 27% em plataformas de entrega de terceiros',
      'Demora no atendimento manual do WhatsApp nos dias de pico',
      'Falta de canal de vendas direto e dependência de intermediários',
    ];

    let suggestedHashtags = ['#hamburgueria', '#delivery', '#pizzaria', '#restaurante', '#smashburger'];
    let prospectingPlanSummary = 'Varredura automática focada em estabelecimentos gastronômicos sem site e com forte presença no Instagram/WhatsApp no Brasil.';

    if (textToAnalyze.includes('barber') || textToAnalyze.includes('salao') || textToAnalyze.includes('beleza') || textToAnalyze.includes('estetica')) {
      targetBusinessTypes = ['Barbearia', 'Salão de Beleza', 'Clínica de Estética'];
      targetNiches = ['Beleza e Cuidados Pessoais'];
      coreValueProp = 'Aumente os agendamentos e zere faltas com marcação automática pelo WhatsApp 24h.';
      searchKeywords = ['barbearia premium', 'salão de beleza', 'centro de estética'];
      suggestedHashtags = ['#barbearia', '#salaodebeleza', '#estetica', '#barbershop', '#cabeloestilo'];
      prospectingPlanSummary = 'Varredura automática em barbearias e centros estéticos com foco em marcação de horários 24h e conversão no WhatsApp.';
      solvedPainPoints = [
        'Perda de clientes fora do horário comercial',
        'Alto índice de faltas e esquecimentos (no-show)',
        'Tempo perdido gerenciando agenda manualmente enquanto atende',
      ];
    } else if (textToAnalyze.includes('oficina') || textToAnalyze.includes('mecanica') || textToAnalyze.includes('auto') || textToAnalyze.includes('car')) {
      targetBusinessTypes = ['Oficina Mecânica', 'Centro Automotivo', 'Auto Peças'];
      targetNiches = ['Serviços Automotivos'];
      coreValueProp = 'Envie orçamentos ilustrados com fotos no WhatsApp e receba aprovação instantânea.';
      searchKeywords = ['oficina mecanica', 'centro automotivo', 'troca de oleo e freios'];
      suggestedHashtags = ['#oficinamecanica', '#centroautomotivo', '#trocadeoleo', '#manutencaoauto'];
      prospectingPlanSummary = 'Varredura em oficinas mecânicas e auto centros para envio de orçamentos rápidos e aprovação direta por WhatsApp.';
      solvedPainPoints = [
        'Demora na aprovação de orçamentos por telefone',
        'Falta de transparência e desconfiança sobre peças trocadas',
        'Controle manual de Ordens de Serviço',
      ];
    } else if (textToAnalyze.includes('clinica') || textToAnalyze.includes('odonto') || textToAnalyze.includes('dentista') || textToAnalyze.includes('saude')) {
      targetBusinessTypes = ['Clínica Odontológica', 'Consultório Médico', 'Clínica de Fisioterapia'];
      targetNiches = ['Saúde & Bem-estar'];
      coreValueProp = 'Secretária virtual com confirmação ativa de consultas via WhatsApp para zerar ausências.';
      searchKeywords = ['clinica odontologica', 'consultorio medico'];
      suggestedHashtags = ['#odontologia', '#dentista', '#consultoriomedico', '#sorriso', '#saudebucal'];
      prospectingPlanSummary = 'Varredura em clínicas odontológicas e consultórios com foco em eliminação de ausências e confirmação de consultas.';
      solvedPainPoints = [
        'Sobrecarga da recepção e telefonemas repetitivos',
        'Prejuízo com faltas em consultas agendadas',
        'Comunicação desarticulada de pós-atendimento',
      ];
    }

    const analysis: RepoAnalysis = {
      repoUrl: repoUrl || 'custom_input',
      repoName,
      description: githubDescription || manualDescription || coreValueProp,
      githubStars: stars,
      githubLanguage: language,
      githubTopics: topics,
      icp: {
        targetBusinessTypes,
        targetNiches,
        idealSize: 'Pequeno a Médio Porte',
        recommendedPitchStrategy: 'Abordagem consultiva focada em ROI, eliminação de taxas e demonstração ao vivo',
        idealLocationKeywords: searchKeywords,
      },
      coreValueProp,
      searchKeywords,
      solvedPainPoints,
      suggestedHashtags,
      prospectingPlanSummary,
      analyzedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
