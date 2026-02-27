import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, openAIError } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAI();
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'Please upload an image first' }, { status: 400 });
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
              text: `You are a receipt analysis expert. Today is ${today}. 

Analyze this image carefully. Is it a receipt, invoice, or bill? Look for:
- Store/merchant name (usually at top)
- Date of purchase
- Total amount (look for "Total", "Amount Due", final number)
- Itemized list with names and prices
- Category (Food & Dining, Shopping, Transportation, Healthcare, Entertainment, or Other)

Return JSON with these exact fields:
{
  "isReceipt": true|false,
  "reason": "brief explanation of what you see in the image",
  "storeName": "the merchant name or 'Unknown Store'",
  "date": "YYYY-MM-DD format, or ${today} if unclear",
  "total": number (just the numeric value, no $ sign),
  "category": "one of: Food & Dining|Shopping|Transportation|Healthcare|Entertainment|Other",
  "items": [
    {"name": "item description", "amount": number},
    {"name": "item description", "amount": number}
  ]
}

If this is NOT a receipt (photo of random objects, document, etc), set isReceipt to false and leave other fields empty.
If the receipt is blurry or unreadable, still try your best to extract what you can see.
Only return valid JSON.`,
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content!);

    if (!result.isReceipt) {
      return NextResponse.json(
        { error: `Please upload an actual receipt. ${result.reason || 'Try a clearer photo of a receipt or invoice.'}`, isReceipt: false },
        { status: 422 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return openAIError(error);
  }
}
