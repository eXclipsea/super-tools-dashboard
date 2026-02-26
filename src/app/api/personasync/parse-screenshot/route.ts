import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
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
            {
              type: 'image_url',
              image_url: { url: image, detail: 'high' },
            },
            {
              type: 'text',
              text: `Look at this screenshot and extract any message, email, or conversation text from it.

Return JSON:
{
  "hasText": true or false,
  "reason": "brief note about what you see (e.g. 'Found 3 iMessage conversations', 'Image appears to be a photo, not a screenshot with text')",
  "text": "the extracted message text, preserving line breaks between separate messages"
}

If there is no readable text (photo, blurry, wrong content), set hasText to false and explain in reason. Only return JSON.`,
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content!);

    return NextResponse.json({
      hasText: result.hasText ?? !!result.text,
      reason: result.reason || '',
      text: result.text || '',
    });
  } catch (error: any) {
    console.error('PersonaSync parse-screenshot error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to parse screenshot' }, { status: 500 });
  }
}
