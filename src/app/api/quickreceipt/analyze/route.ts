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
              text: `Today is ${today}. Is this a receipt, invoice, or bill? Return JSON: {"isReceipt": true|false, "reason": "what you see", "storeName": "string", "date": "YYYY-MM-DD", "total": number, "category": "Food & Dining|Shopping|Transportation|Healthcare|Entertainment|Other", "items": [{"name": "string", "amount": number}]}. If not a receipt, set isReceipt false and leave other fields empty. Only return JSON.`,
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
