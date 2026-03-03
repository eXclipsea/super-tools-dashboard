import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, openAIError } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const openai = getOpenAI();
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Remove data URL prefix if present
    const base64Image = image.includes(',') ? image.split(',')[1] : image;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a decluttering expert AI. Analyze the room photo and provide a structured decluttering plan.

Respond ONLY with a JSON object in this exact format:
{
  "roomType": "Kitchen/Living Room/Bedroom/etc",
  "clutterLevel": "light/moderate/heavy",
  "tasks": [
    "First specific decluttering task",
    "Second task",
    "Third task",
    ... (8-12 tasks total, ordered by priority)
  ],
  "tips": [
    "Helpful decluttering tip 1",
    "Tip 2",
    "Tip 3"
  ]
}

Tasks should be specific, actionable, and appropriate for the room type. For high clutter, focus on sorting and clearing surfaces first. For moderate clutter, focus on organizing. For light clutter, focus on tidying and maintenance.

Keep tasks achievable within 10-20 minutes each.`
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this room and create a decluttering task list. Return ONLY the JSON object.' },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json(result);
  } catch (error: any) {
    return openAIError(error);
  }
}
