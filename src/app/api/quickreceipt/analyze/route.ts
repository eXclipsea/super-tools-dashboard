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
              text: `Today is ${today}. Determine if this image is a receipt, invoice, or bill.

Return JSON with this exact structure:
{
  "isReceipt": true or false,
  "reason": "brief explanation of what you see",
  "storeName": "store or business name, or empty string",
  "date": "YYYY-MM-DD or empty string",
  "total": number or 0,
  "category": "Food & Dining|Shopping|Transportation|Healthcare|Entertainment|Other",
  "items": [{"name": "item name", "amount": number}]
}

If this is NOT a receipt, set isReceipt to false, explain in reason, and leave all other fields empty/zero. Only return JSON.`,
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content!);

    if (!result.isReceipt) {
      return NextResponse.json({
        error: `This doesn't look like a receipt. ${result.reason || 'Please upload a clear photo of a receipt or invoice.'}`,
        isReceipt: false,
      }, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('QuickReceipt analyze error:', error);
    const message = error?.message || 'Failed to analyze receipt';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
