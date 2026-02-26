import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
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
          content: `Settle this argument:

Claim A: "${claimA}"
Claim B: "${claimB}"

Analyze both claims and determine which is more accurate, factual, or reasonable.

Return JSON:
{
  "winner": "A" or "B" or "Tie",
  "reasoning": "detailed explanation of your verdict",
  "confidence": number between 0-100,
  "sources": ["source or evidence 1", "source 2", "source 3"],
  "roast": "funny roast or null",
  "analysisNote": "any caveat about why this was hard to settle, or empty string if clear-cut"
}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const verdict = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json({ verdict });
  } catch (error: any) {
    console.error('Argument Settler settle error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to settle argument' }, { status: 500 });
  }
}
