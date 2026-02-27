import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, openAIError } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAI();
    const { styleProfile, inputMessage } = await request.json();

    if (!styleProfile || !inputMessage) {
      return NextResponse.json({ error: 'Missing style profile or input message' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a master impersonator who can perfectly mirror ANY writing style. Your task is to write a reply that sounds EXACTLY like the user wrote it themselves — so authentic that even their closest friends couldn't tell it was AI-generated.

CRITICAL INSTRUCTIONS:
1. MIRROR THESE EXACT TRAITS from the style profile:
   ${styleProfile.characteristics.map((c: string) => `- ${c}`).join('\n   ')}

2. INCORPORATE these common phrases when natural: ${styleProfile.commonPhrases?.join(', ') || 'none specified'}

3. MATCH these sentence patterns: ${styleProfile.sentencePatterns || 'not specified'}

4. EMBODY these tone markers: ${styleProfile.toneMarkers || 'not specified'}

5. Write as if YOU ARE THIS PERSON — use their quirks, filler words, punctuation habits, and emotional cadence.

DO NOT sound generic or AI-like. The goal is indistinguishable mimicry.`,
        },
        {
          role: 'user',
          content: `Write a reply to this message in the EXACT style described above:

"${inputMessage}"

Return JSON:
- "summary": bullet points of key items to address
- "draft": the actual reply text that sounds exactly like the person`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json(result);
  } catch (error: any) {
    return openAIError(error);
  }
}
