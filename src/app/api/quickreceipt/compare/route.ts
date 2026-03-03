import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, openAIError } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAI();
    const { items } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided for comparison' }, { status: 400 });
    }

    const itemsList = items.map((i: { name: string; quantity?: string }) => 
      `${i.name}${i.quantity ? ` (${i.quantity})` : ''}`
    ).join(', ');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a grocery price comparison expert. Given a list of grocery items, provide estimated price comparisons across major US stores.

For each item, provide:
- The item name and a standardized unit weight/size
- Estimated price at 3-4 major stores (Walmart, Target, Costco, Trader Joe's, Kroger, Whole Foods, etc.)
- Price per unit weight (per oz, per lb, per count) for fair comparison
- Which store offers the best value

IMPORTANT: These are ESTIMATES based on typical pricing. Actual prices vary by location and time.

Return JSON:
{
  "comparisons": [
    {
      "item": "item name",
      "unitSize": "standard size (e.g. 16 oz, 1 lb, 12 count)",
      "stores": [
        { "store": "Store Name", "price": 3.99, "pricePerUnit": "0.25/oz", "inStock": true },
        { "store": "Store Name", "price": 4.49, "pricePerUnit": "0.28/oz", "inStock": true }
      ],
      "bestValue": "Store Name",
      "savings": "You save $X.XX vs the most expensive option"
    }
  ],
  "totalBestStore": "Store with lowest total",
  "totalByStore": [
    { "store": "Store Name", "estimatedTotal": 25.99 }
  ]
}`
        },
        {
          role: 'user',
          content: `Compare prices for these grocery items across major stores: ${itemsList}`
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json(result);
  } catch (error: any) {
    return openAIError(error);
  }
}
