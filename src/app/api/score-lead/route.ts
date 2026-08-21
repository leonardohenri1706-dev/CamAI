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
                    content: `Você é um especialista em Copywriting B2B de altíssima conversão para WhatsApp Web no Brasil.
Escreva uma mensagem extremamente bem estruturada e organizada para o responsável do estabelecimento "*${lead.displayName}*".

A mensagem DEVE seguir a seguinte estrutura obrigatória:
1. Saudação personalizada com elogio e prova social (${lead.digitalHealth.rating}★ com ${lead.digitalHealth.reviewsCount} avaliações no Google).
2. Título "*BENEFÍCIOS REAIS DO NOSSO PRODUTO:*" com marcadores destacando:
   - 💰 Economia de 12% a 27% de comissão.
   - ⚡ Atendimento 100% automático no WhatsApp.
   - 🎯 Vendas diretas pela própria marca.
3. Link de demonstração em destaque: "👉 *Clique para Testar a Demonstração ao Vivo:* https://botclientes.vercel.app".
4. *MÚLTIPLOS CTAS (Chamadas de Ação):*
   - 👉 Responda "SIM" para receber a versão grátis com a marca da empresa.
   - 👉 Ou me diga o melhor horário para um bate-papo rápido de 3 minutos hoje.

Retorne apenas o texto final formatado para WhatsApp com emojis e *negritos*. Não use placeholders.`,
                  },
                ],
                max_tokens: 450,
                temperature: 0.6,
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
