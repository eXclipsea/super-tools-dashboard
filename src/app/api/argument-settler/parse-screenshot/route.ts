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
              text: 'This is a screenshot of a debate or argument between two people. Extract the two opposing claims or positions. Return JSON: {"claimA": "first person\'s position or claim", "claimB": "second person\'s position or claim"}. If you can only identify one clear debate topic, split it into two opposing sides.',
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Argument Settler parse-screenshot error:', error);
    return NextResponse.json({ error: 'Failed to parse screenshot' }, { status: 500 });
  }
}
