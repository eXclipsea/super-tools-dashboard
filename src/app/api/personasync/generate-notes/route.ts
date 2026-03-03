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
    const { styleProfile, topic, tone = 'match', groqApiKey } = await request.json();

    if (!styleProfile || !topic) {
      return NextResponse.json({ error: 'Missing style profile or topic' }, { status: 400 });
    }

    // Use user's Groq key if provided, otherwise fallback to server Groq
    const groq = groqApiKey?.startsWith('gsk_') 
      ? getGroqClient(groqApiKey)
      : new OpenAI({ 
          apiKey: process.env.GROQ_API_KEY!,
          baseURL: 'https://api.groq.com/openai/v1',
        });

    const toneInstruction = TONE_INSTRUCTIONS[tone] || '';

    const systemPrompt = tone === 'match'
      ? `You are a note-taking assistant that writes exactly like this person: ${styleProfile.description || 'the user'}.

Voice rules (follow exactly):
${styleProfile.characteristics?.slice(0, 6).map((c: string) => `- ${c}`).join('\n') || '- Write naturally'}
Common phrases they use: ${styleProfile.commonPhrases?.slice(0, 8).join(', ') || 'none'}
Sentence style: ${styleProfile.sentencePatterns || 'natural'}

Write comprehensive notes in their exact voice and style. The notes should be well-structured, informative, and capture all key points about the topic. Use their natural phrasing, sentence structure, and organizational style.`
      : `You are a note-taking assistant.

${toneInstruction}

Reference the user's underlying voice (softer signal):
${styleProfile.characteristics?.slice(0, 4).map((c: string) => `- ${c}`).join('\n') || '- Write naturally'}

Write comprehensive notes that are well-structured and informative. Use an appropriate note-taking format (bullet points, sections, etc.).`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Write detailed notes about: "${topic.substring(0, 500)}"

The notes should be:
- Comprehensive and well-structured
- Written in the specified tone/voice
- Easy to review and study from
- Organized with clear sections if appropriate

Return JSON:
{
  "summary": "Brief overview of what these notes cover",
  "notes": "The complete notes written in the requested style"
}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
      temperature: tone === 'casual' ? 0.9 : tone === 'formal' ? 0.6 : 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json(result);
  } catch (error: any) {
    return openAIError(error);
  }
}
