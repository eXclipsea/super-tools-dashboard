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
              text: `Today is ${today}. Analyze this image and determine if it shows food items (fridge, pantry, kitchen, groceries, etc).

Return JSON with this exact structure:
{
  "canDetect": true or false,
  "reason": "brief explanation of what you see and why you can or cannot identify food items",
  "items": [{"name": "string", "quantity": "string", "category": "Produce|Dairy|Meat|Pantry|Frozen|Beverages", "expiryDate": "YYYY-MM-DD"}]
}

If you cannot clearly see food items (image is blurry, not food-related, too dark, etc), set canDetect to false, explain why in reason, and return empty items array. Only return the JSON.`,
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1200,
    });

    const content = JSON.parse(response.choices[0].message.content!);

    return NextResponse.json({
      canDetect: content.canDetect ?? (content.items?.length > 0),
      reason: content.reason || '',
      items: content.items || [],
    });
  } catch (error: any) {
    console.error('Kitchen Commander analyze error:', error);
    const message = error?.message || 'Failed to analyze image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
