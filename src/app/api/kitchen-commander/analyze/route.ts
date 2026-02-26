import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, openAIError } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAI();
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
            { type: 'image_url', image_url: { url: image, detail: 'high' } },
            {
              type: 'text',
              text: `Today is ${today}. Analyze this image and determine if it shows food items (fridge, pantry, kitchen, groceries). Return JSON: {"canDetect": true|false, "reason": "brief explanation of what you see", "items": [{"name": "string", "quantity": "string", "category": "Produce|Dairy|Meat|Pantry|Frozen|Beverages", "expiryDate": "YYYY-MM-DD"}]}. If you cannot clearly see food items, set canDetect to false and return empty items. Only return the JSON.`,
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
    return openAIError(error);
  }
}
