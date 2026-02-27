import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, openAIError } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAI();
    const { text, style } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const stylePrompts: Record<string, string> = {
      shakespeare: `Transform this text into Shakespearean English. Use thee/thou/thy, ornate language, poetic flourishes, and iambic pentameter where natural. Make it sound like it came from a Shakespeare play.`,
      formal: `Transform this text into highly formal, professional language suitable for business emails, legal documents, or academic writing. Use precise vocabulary, proper grammar, and a respectful tone.`,
      presidential: `Transform this text into the style of a presidential speech. Use inspiring language, rhetorical devices, and the cadence of famous political addresses. Sound authoritative yet approachable.`,
      philosopher: `Transform this text into the style of a great philosopher (like Nietzsche, Socrates, or Confucius). Make it profound, contemplative, and wisdom-filled. Use philosophical depth.`,
      poet: `Transform this text into beautiful poetic language. Use metaphors, imagery, and lyrical flow. Make it sound like it could be in a poetry collection.`,
      medieval: `Transform this text into Medieval or Old English style. Use archaic words, chivalric language, and the tone of knights and castles.`,
      gangster: `Transform this text into 1920s-30s gangster/mobster slang. Use phrases like "see?", "fella", "dame", "ice", "heat", "the joint", "moolah" etc. Sound like you're from a classic noir film.`,
    };

    const selectedPrompt = stylePrompts[style] || stylePrompts.formal;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a master of language transformation. Your task is to rewrite text in a specific style while preserving the original meaning.

${selectedPrompt}

IMPORTANT:
- Keep the core meaning intact
- Transform the tone and vocabulary to match the requested style
- Be creative and authentic to the style
- Return only the transformed text, no explanations`,
        },
        {
          role: 'user',
          content: `Transform this text into ${style} style:

"${text}"

Return only the transformed text.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const transformedText = response.choices[0].message.content?.trim() || '';

    return NextResponse.json({ transformedText });
  } catch (error: any) {
    return openAIError(error);
  }
}
