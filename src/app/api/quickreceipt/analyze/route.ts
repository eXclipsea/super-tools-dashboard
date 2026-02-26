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
              text: `Today is ${today}. This is a receipt image. Extract all the information from it. Return JSON in this exact format: {"storeName": "string", "date": "YYYY-MM-DD", "total": number, "category": "Food & Dining|Shopping|Transportation|Healthcare|Entertainment|Other", "items": [{"name": "string", "amount": number}]}. If you cannot read the date clearly, use today's date. Make sure total is a number (not a string). Only return the JSON.`,
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json(result);
  } catch (error) {
    console.error('QuickReceipt analyze error:', error);
    return NextResponse.json({ error: 'Failed to analyze receipt' }, { status: 500 });
  }
}
