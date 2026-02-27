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
          content: `You are an expert fact-checker and debate referee. Your job is to objectively analyze both sides of an argument and determine which position is more accurate based on facts, logic, and evidence.

Category: ${category}

When evaluating claims:
1. Identify verifiable facts vs opinions
2. Check for logical fallacies
3. Consider missing context that changes the interpretation
4. Evaluate the strength of evidence for each side
5. Look for common misconceptions or widely-believed myths

${roastInstruction}

Be thorough but fair. If both sides have valid points, declare a tie. If the topic is subjective or opinion-based, note that in your analysis.

Return valid JSON only.`,
        },
        {
          role: 'user',
          content: `Settle this argument:

Claim A: "${claimA}"

Claim B: "${claimB}"

Return JSON with these exact fields:
{
  "winner": "A|B|Tie",
  "reasoning": "Detailed explanation of your analysis (2-4 sentences). Explain WHY one side wins or why it's a tie. Reference specific facts, logic, or common misconceptions.",
  "confidence": number 0-100,
  "sources": ["List 2-4 key facts or principles you used to determine the winner"],
  "roast": "${roastMode ? 'Funny roast of the losing side (1-2 sentences), or null if Tie' : 'null'}",
  "analysisNote": "Any caveats, context, or notes about limitations of this ruling (e.g., 'This depends on specific circumstances', 'Both sides have merit depending on context')"
}`,
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
