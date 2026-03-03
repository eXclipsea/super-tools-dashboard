import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { openAIError } from '@/lib/openai';

function getGroqClient(apiKey: string) {
  return new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });
}

export async function POST(request: NextRequest) {
  try {
    const { examples, groqApiKey } = await request.json();

    if (!examples) {
      return NextResponse.json({ error: 'No examples provided' }, { status: 400 });
    }

    // Use user's Groq key if provided, otherwise fallback to server Groq
    const groq = groqApiKey?.startsWith('gsk_') 
      ? getGroqClient(groqApiKey)
      : new OpenAI({ 
          apiKey: process.env.GROQ_API_KEY!,
          baseURL: 'https://api.groq.com/openai/v1',
        });

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert linguist. Analyze the writing samples and extract the unique voice fingerprint. Focus on: sentence patterns, vocabulary preferences, punctuation habits, common phrases, humor style, emotional tone. Return concise JSON.',
        },
        {
          role: 'user',
          content: `Analyze these writing samples and create a voice fingerprint (max 800 tokens):

${examples.substring(0, 3000)}

Return JSON with:
- "description": 1-2 sentences capturing the writing style essence
- "characteristics": array of 6-8 specific traits
- "commonPhrases": array of 5-10 frequent phrases
- "sentencePatterns": brief description of sentence structures
- "toneMarkers": what makes the tone distinctive`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 800,
      temperature: 0.7,
    });

    const profile = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json({ profile });
  } catch (error: any) {
    return openAIError(error);
  }
}
