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
      ? 'Also add a short, funny, roast of the losing side (1-2 sentences). Include it in the "roast" field.'
      : 'Leave the "roast" field as null.';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an objective, highly accurate fact-checker and debate referee. You analyze claims using logic, evidence, and reasoning. Category of this debate: ${category}. ${roastInstruction} Always return valid JSON.`,
        },
        {
          role: 'user',
          content: `Settle this argument:\n\nClaim A: "${claimA}"\nClaim B: "${claimB}"\n\nDetermine which claim is more accurate/correct and why. Provide your confidence level (0-100) and list the key sources or evidence. Return JSON: {"winner": "A|B|Tie", "reasoning": "detailed explanation", "confidence": number, "sources": ["source1", "source2", "source3"], "roast": "funny roast or null"}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const verdict = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json({ verdict });
  } catch (error) {
    console.error('Argument Settler settle error:', error);
    return NextResponse.json({ error: 'Failed to settle argument' }, { status: 500 });
  }
}
