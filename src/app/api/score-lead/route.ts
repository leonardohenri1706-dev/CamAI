import { NextResponse } from 'next/server';
import { PlaceLead, RepoAnalysis } from '@/types/prospecting';
import { calculateLeadScore } from '@/lib/scoringEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      rawLeads,
      repoAnalysis,
      pitchTone,
      openrouterApiKey,
      openrouterModel,
    }: {
      rawLeads: Omit<PlaceLead, 'scoreResult'>[];
      repoAnalysis: RepoAnalysis;
      pitchTone: 'consultive' | 'direct' | 'promotional';
      openrouterApiKey?: string;
      openrouterModel?: string;
    } = body;

    if (!rawLeads || !Array.isArray(rawLeads)) {
      return NextResponse.json({ success: false, error: 'Raw leads array is required' }, { status: 400 });
    }

    const openrouterKey = openrouterApiKey || process.env.OPENROUTER_API_KEY;

    const scoredLeads: PlaceLead[] = await Promise.all(
      rawLeads.map(async (lead) => {
        let scoreResult = calculateLeadScore(
          lead.displayName,
          lead.category,
          lead.digitalHealth,
          repoAnalysis,
          pitchTone || 'consultive'
        );

        // If OpenRouter key is provided and lead is top priority, optionally enhance pitch via LLM
        if (openrouterKey && openrouterKey.trim().length > 5 && scoreResult.leadScorePercentage >= 65) {
          try {
            const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openrouterKey.trim()}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'BotClientes Prospector AI',
              },
              body: JSON.stringify({
                model: openrouterModel || 'openai/gpt-4o-mini',
                messages: [
                  {
                    role: 'system',
                    content: `Você é um copywriter B2B sênior de altíssima conversão para WhatsApp Web no Brasil.
Escreva uma mensagem de WhatsApp persuasiva para o responsável do estabelecimento "*${lead.displayName}*", seguindo ESTRITAMENTE o modelo de pitch abaixo enriquecido com emojis dinâmicos e *negritos*:

MODELO OBRIGATÓRIO:
👋 *Olá, responsável pela ${lead.displayName}, tudo bem?*

👨‍💻 Meu nome é Leonardo, sou engenheiro de software e desenvolvo soluções digitais focadas em redução de custos operacionais para o setor de ${lead.category} aqui no Nordeste e Brasil.

🍕 Analisando o atendimento de estabelecimentos com alto volume como a *${lead.displayName}*, estruturei uma aplicação web de pedidos diretos que elimina o atraso no WhatsApp nos dias de pico (quinta a domingo) e substitui o envio manual de cardápio.

🚀 *Principais ganhos com a plataforma:*

💰 *Economia imediata:* Seus clientes compram direto de você, sem você repassar 12% a 25% do faturamento para apps de terceiros.

⚡ *Atendimento automatizado:* A comanda/pedido chega calculada com endereço, taxa de entrega por bairro e detalhes dos itens prontos para a cozinha/equipe.

🌐 *Veja a plataforma rodando em tempo real:*
🔗 *Clique aqui para testar o sistema:* https://pizzaria-arteedelicia.vercel.app/

📋 *Próximos passos para implantar no seu negócio:*

✨ Posso parametrizar todo o sistema com a marca, fotos e cardápio/catálogo completo da *${lead.displayName}*.

📦 Se fizer sentido para a sua operação, coloco tudo rodando no ar esta semana.

📲 *Podemos alinhar isso hoje antes de abrir o forno/expediente?* Me responde aqui com um '*SIM*' ou me diga qual o melhor horário para conversarmos rapidamente! 🔥

Retorne APENAS o texto final formatado para WhatsApp. Não use placeholders genéricos.`,
                  },
                ],
                max_tokens: 500,
                temperature: 0.5,
              }),
            });

            if (orRes.ok) {
              const orData = await orRes.json();
              const generatedPitch = orData.choices?.[0]?.message?.content?.trim();
              if (generatedPitch) {
                scoreResult = {
                  ...scoreResult,
                  customPitch: generatedPitch,
                };
              }
            }
          } catch (e) {
            // Keep default calculated pitch on any network timeout
          }
        }

        return {
          ...lead,
          scoreResult,
        };
      })
    );

    // Sort leads by highest lead score by default
    scoredLeads.sort((a, b) => b.scoreResult.leadScorePercentage - a.scoreResult.leadScorePercentage);

    return NextResponse.json({ success: true, leads: scoredLeads });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
