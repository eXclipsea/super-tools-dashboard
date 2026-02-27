import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, openAIError } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAI();
    const { examples } = await request.json();

    if (!examples) {
      return NextResponse.json({ error: 'No examples provided' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert linguist specializing in voice fingerprinting and stylistic analysis. Your task is to deeply analyze the user\'s writing samples to extract their unique "voice fingerprint" — the subtle patterns that make their writing distinctly theirs. Focus on: sentence structure patterns (short punchy vs long flowing), vocabulary preferences (formal vs casual, specific word choices), punctuation habits (comma usage, ellipses, dashes), capitalization patterns, common phrases or filler words, humor style (sarcastic, dry, playful), emotional tone (warm, detached, enthusiastic), and any distinctive quirks. Return a detailed style profile.',
        },
        {
          role: 'user',
          content: `Analyze these writing samples and create a detailed voice fingerprint:

${examples}

Return JSON with:
- "description": 2-3 sentences capturing the essence of this writing style
- "characteristics": array of 8-12 specific traits (e.g., "Uses short punchy sentences", "Frequently uses ellipses...", "Mixes formal and casual vocabulary", "Sarcastic humor with dry delivery", "Overuses certain phrases like 'honestly' or 'tbh'")
- "commonPhrases": array of phrases/words they use often
- "sentencePatterns": describe their typical sentence structures
- "toneMarkers": what makes their tone distinctive`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    });

    const profile = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json({ profile });
  } catch (error: any) {
    return openAIError(error);
  }
}
