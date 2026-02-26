import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];

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
              text: `Today is ${today}. Analyze this fridge or pantry image. Identify every food item you can see. For each item estimate the quantity and a realistic expiry date based on typical shelf life from today. Return JSON in this exact format: {"items": [{"name": "string", "quantity": "string", "category": "Produce|Dairy|Meat|Pantry|Frozen|Beverages", "expiryDate": "YYYY-MM-DD"}]}. Only return the JSON, nothing else.`,
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const content = JSON.parse(response.choices[0].message.content!);
    const items = content.items || [];

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Kitchen Commander analyze error:', error);
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
  }
}
