import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, openAIError } from '@/lib/openai';

function buildHistoryContext(history: any[]): string {
  if (!history || history.length === 0) return '';

  const visited = history.filter((r: any) => r.visited);
  const compared = history.filter((r: any) => !r.visited);

  let prefSummary = '';
  if (visited.length >= 2) {
    const avg = (key: string) =>
      (visited.reduce((s: number, r: any) => s + r.factors[key], 0) / visited.length).toFixed(1);
    const scores = [
      { k: 'food quality', v: parseFloat(avg('food')) },
      { k: 'service', v: parseFloat(avg('service')) },
      { k: 'atmosphere', v: parseFloat(avg('atmosphere')) },
      { k: 'value', v: parseFloat(avg('value')) },
    ].sort((a, b) => b.v - a.v);
    prefSummary = `Preference pattern from ${visited.length} visited restaurants: values ${scores[0].k} most (avg ${scores[0].v}/10), then ${scores[1].k} (avg ${scores[1].v}/10). Tends to avoid: ${scores[3].k} (avg ${scores[3].v}/10).`;
  }

  const visitedLines = visited.slice(-6).map((r: any) =>
    `• ${r.name} [VISITED${r.visitDate ? ' ' + r.visitDate : ''}] ${r.rating}★ | Food:${r.factors.food} Svc:${r.factors.service} Atm:${r.factors.atmosphere} Val:${r.factors.value}${r.pros?.length ? ` | Liked: ${r.pros.slice(0, 2).join('; ')}` : ''}${r.cons?.length ? ` | Disliked: ${r.cons[0]}` : ''}`
  );
  const comparedLines = compared.slice(-3).map((r: any) =>
    `• ${r.name} [compared only] ${r.rating}★ | Food:${r.factors.food} Svc:${r.factors.service} Atm:${r.factors.atmosphere} Val:${r.factors.value}`
  );

  const lines = [...visitedLines, ...comparedLines];
  return `\n\nUSER DINING HISTORY:\n${prefSummary ? prefSummary + '\n' : ''}${lines.join('\n')}`;
}

export async function POST(req: NextRequest) {
  try {
    const openai = getOpenAI();
    const { optionA, optionB, addressA, addressB, restaurantHistory } = await req.json();

    if (!optionA || !optionB) {
      return NextResponse.json({ error: 'Both restaurant names are required' }, { status: 400 });
    }

    const historyContext = buildHistoryContext(restaurantHistory);
    const hasHistory = historyContext.length > 0;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a restaurant recommendation AI with deep knowledge of restaurant quality signals. Analyze the two restaurants using typical Google Reviews data, Yelp patterns, and dining knowledge.

${hasHistory ? 'IMPORTANT: The user has dining history. You MUST tailor your winner pick and reasoning to match their proven preferences — specifically which factor (food/service/atmosphere/value) they consistently rate highest in restaurants they actually visited.' : ''}

Respond ONLY with valid JSON in this exact format:
{
  "optionA": {
    "name": "Restaurant Name",
    "rating": 4.5,
    "reviewCount": 1200,
    "factors": { "food": 8, "service": 7, "atmosphere": 9, "value": 7 },
    "pros": ["specific strength 1", "specific strength 2", "specific strength 3"],
    "cons": ["specific weakness 1", "specific weakness 2"],
    "summary": "One sentence describing this restaurant's identity"
  },
  "optionB": {
    "name": "Restaurant Name",
    "rating": 4.3,
    "reviewCount": 800,
    "factors": { "food": 9, "service": 6, "atmosphere": 7, "value": 8 },
    "pros": ["specific strength 1", "specific strength 2", "specific strength 3"],
    "cons": ["specific weakness 1", "specific weakness 2"],
    "summary": "One sentence describing this restaurant's identity"
  },
  "winner": "A",
  "reasoning": "2-3 sentences: why this restaurant wins, explicitly referencing the user's dining history and proven preferences if available, otherwise based on overall scores"
}

Scoring (1-10): Food=quality/taste/consistency, Service=staff/speed/attentiveness, Atmosphere=ambiance/decor/comfort, Value=price-to-quality ratio.
Make scores realistic and specific to the actual restaurant type and reputation.`
        },
        {
          role: 'user',
          content: `Compare these restaurants:

A: ${optionA}${addressA ? ` (${addressA})` : ''}
B: ${optionB}${addressB ? ` (${addressB})` : ''}${historyContext}

Return ONLY the JSON.`
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1200,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json(result);
  } catch (error: any) {
    return openAIError(error);
  }
}
