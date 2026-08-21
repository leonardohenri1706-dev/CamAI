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
                'X-Title': 'LeadPulse B2B Prospector',
              },
              body: JSON.stringify({
                model: openrouterModel || 'openai/gpt-4o-mini',
                messages: [
                  {
                    role: 'system',
                    content: `Você é um copywriter B2B sênior especializado em mensagens curtas, humanizadas e de alta conversão para WhatsApp Web para pequenos empresários locais.
Escreva uma mensagem de WhatsApp direta e persuasiva citando o nome do estabelecimento (${lead.displayName}), suas avaliações (${lead.digitalHealth.rating} estrelas no Google) e a proposta de valor do produto (${repoAnalysis.coreValueProp}).
Tom desejado: ${pitchTone || 'consultivo'}.
Retorne apenas o texto da mensagem formatada para WhatsApp (com emojis pontuais e *negritos*). Não use placeholders.`,
                  },
                ],
                max_tokens: 250,
                temperature: 0.7,
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
