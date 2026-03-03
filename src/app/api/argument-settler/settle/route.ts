import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, openAIError } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAI();
    const { claimA, claimB, category, roastMode } = await request.json();

    if (!claimA || !claimB) {
      return NextResponse.json({ error: 'Both claims are required' }, { status: 400 });
    }

    const roastInstruction = roastMode
      ? 'Add a short funny roast of the losing side (1-2 sentences) in a "roast" field.'
      : 'Set "roast" to null.';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert fact-checker and debate analyst. Always return valid JSON.',
        },
        {
          role: 'user',
          content: `Analyze this argument objectively.

Category: ${category}

Claim A: "${claimA.substring(0, 300)}"

Claim B: "${claimB.substring(0, 300)}"

Evaluate:
1. Facts vs opinions
2. Logical fallacies
3. Missing context
4. Evidence strength
5. Common misconceptions

${roastInstruction}

Return ONLY JSON:
{
  "winner": "A|B|Tie",
  "reasoning": "2-3 sentence analysis explaining the ruling",
  "confidence": number 0-100,
  "sources": ["2-3 key facts used"],
  "roast": "roast text or null",
  "analysisNote": "any caveats or limitations"
}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 600,
    });

    const content = response.choices[0].message.content || '{}';
    const verdict = JSON.parse(content);
    return NextResponse.json({ verdict });
  } catch (error: any) {
    return openAIError(error);
  }
}
