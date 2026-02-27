import { NextRequest, NextResponse } from 'next/server';
import { getGroq, openAIError } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const groq = getGroq();
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const response = await groq.chat.completions.create({
      model: 'llama-3.2-11b-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: image, detail: 'high' } },
            {
              type: 'text',
              text: 'Look at this screenshot of a messaging app. Extract ONLY the messages sent by the user (blue bubbles). Ignore others (gray bubbles). Return JSON: {"hasText": true|false, "reason": "brief note", "text": "user messages only"}.',
            },
          ],
        },
      ],
      max_tokens: 400,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json({
      hasText: result.hasText ?? !!result.text,
      reason: result.reason || '',
      text: result.text || '',
    });
  } catch (error: any) {
    return openAIError(error);
  }
}
