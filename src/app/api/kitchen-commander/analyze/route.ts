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
              text: `You are a food inventory expert. Today is ${today}.

Analyze this image carefully. Does it show food items, groceries, fridge contents, pantry items, or kitchen ingredients? Look for:
- Packaged foods (boxes, cans, bags)
- Fresh produce (fruits, vegetables)
- Dairy items (milk, cheese, yogurt)
- Meats and proteins
- Beverages
- Condiments and sauces

For each food item you can identify, estimate:
- Name (be specific: "Organic Whole Milk" not just "Milk")
- Quantity (e.g., "1 gallon", "12 count", "2 lbs", "1 bunch")
- Category: Produce | Dairy | Meat | Pantry | Frozen | Beverages
- Estimated expiry date (best guess based on typical shelf life, format YYYY-MM-DD)

Return JSON with these exact fields:
{
  "canDetect": true|false,
  "reason": "brief explanation of what food items you see",
  "items": [
    {
      "name": "specific food item name",
      "quantity": "amount with units",
      "category": "Produce|Dairy|Meat|Pantry|Frozen|Beverages",
      "expiryDate": "YYYY-MM-DD"
    }
  ]
}

If you cannot clearly see food items (photo is blurry, dark, or shows non-food objects), set canDetect to false and return empty items.
Only return valid JSON.`,
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
