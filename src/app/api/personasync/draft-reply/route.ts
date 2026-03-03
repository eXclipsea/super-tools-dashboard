import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { openAIError } from '@/lib/openai';
import { TONE_INSTRUCTIONS } from '@/lib/tone';

function getGroqClient(apiKey: string) {
  return new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });
}

export async function POST(request: NextRequest) {
  try {
    const { styleProfile, inputMessage, tone = 'match', questionToAnswer, groqApiKey } = await request.json();

    if (!styleProfile || !inputMessage) {
      return NextResponse.json({ error: 'Missing style profile or input message' }, { status: 400 });
    }

    // Use user's Groq key if provided, otherwise fallback to server Groq
    const groq = groqApiKey?.startsWith('gsk_') 
      ? getGroqClient(groqApiKey)
      : new OpenAI({ 
          apiKey: process.env.GROQ_API_KEY!,
          baseURL: 'https://api.groq.com/openai/v1',
        });

    const toneInstruction = TONE_INSTRUCTIONS[tone] || '';
    const questionInstruction = questionToAnswer?.trim()
      ? `\nThe user specifically wants to address this in their reply: "${questionToAnswer.trim().substring(0, 300)}"`
      : '';

    const systemPrompt = tone === 'match'
      ? `You are ghostwriting as this person: ${styleProfile.description || 'the user'}.

Voice rules (follow exactly):
${styleProfile.characteristics?.slice(0, 6).map((c: string) => `- ${c}`).join('\n') || '- Write naturally'}
Common phrases they use: ${styleProfile.commonPhrases?.slice(0, 8).join(', ') || 'none'}
Sentence style: ${styleProfile.sentencePatterns || 'natural'}

Mimic their voice with high fidelity. Be concise (1-4 sentences unless the situation demands more).`
      : `You are ghostwriting a reply for someone.

${toneInstruction}

Reference their underlying voice (softer signal):
${styleProfile.characteristics?.slice(0, 4).map((c: string) => `- ${c}`).join('\n') || '- Write naturally'}

Be concise (1-4 sentences unless the situation demands more).`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Message to reply to:
"${inputMessage.substring(0, 600)}"${questionInstruction}

Return JSON:
{
  "summary": "2-4 bullet points summarizing the message",
  "draft": "the reply in the correct tone and voice"
}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
      temperature: tone === 'casual' ? 0.9 : tone === 'formal' ? 0.6 : 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json(result);
  } catch (error: any) {
    return openAIError(error);
  }
}
