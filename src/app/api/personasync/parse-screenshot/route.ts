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
              text: 'Extract all the message or email text from this screenshot. Return only the raw text content of the messages, preserving line breaks between separate messages. Do not include any UI elements, timestamps, sender names, or other metadata — just the message body text.',
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const text = response.choices[0].message.content || '';
    return NextResponse.json({ text });
  } catch (error) {
    console.error('PersonaSync parse-screenshot error:', error);
    return NextResponse.json({ error: 'Failed to parse screenshot' }, { status: 500 });
  }
}
