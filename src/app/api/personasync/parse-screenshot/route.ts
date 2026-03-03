import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, openAIError } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAI();
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
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
      response_format: { type: 'json_object' },
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
