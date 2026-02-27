import { NextRequest, NextResponse } from 'next/server';
import { getClaude, openAIError } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const anthropic = getClaude();
    const { claimA, claimB, category, roastMode } = await request.json();

    if (!claimA || !claimB) {
      return NextResponse.json({ error: 'Both claims are required' }, { status: 400 });
    }

    const roastInstruction = roastMode
      ? 'Add a short funny roast of the losing side (1-2 sentences) in a "roast" field.'
      : 'Set "roast" to null.';

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: `You are an expert fact-checker. Analyze this argument objectively.

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
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '';
    const verdict = JSON.parse(content);
    return NextResponse.json({ verdict });
  } catch (error: any) {
    return openAIError(error);
  }
}
