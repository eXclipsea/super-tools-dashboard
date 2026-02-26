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
      ? 'Also add a short funny roast of the losing side (1-2 sentences). Put it in the "roast" field.'
      : 'Set "roast" to null.';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an objective, highly accurate fact-checker and debate referee. Category: ${category}. ${roastInstruction} Return valid JSON only.`,
        },
        {
          role: 'user',
          content: `Settle this argument:\n\nClaim A: "${claimA}"\nClaim B: "${claimB}"\n\nReturn JSON: {"winner": "A|B|Tie", "reasoning": "detailed explanation", "confidence": number 0-100, "sources": ["source1", "source2", "source3"], "roast": "funny roast or null", "analysisNote": "caveat if hard to settle, else empty string"}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const verdict = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json({ verdict });
  } catch (error: any) {
    return openAIError(error);
  }
}
