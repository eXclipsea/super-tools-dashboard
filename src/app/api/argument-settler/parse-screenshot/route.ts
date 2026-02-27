import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, openAIError } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAI();
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: image, detail: 'high' } },
            {
              type: 'text',
              text: 'You are an expert at analyzing debates and arguments from screenshots.\n\nLook at this screenshot carefully. It likely shows:\n- A text conversation with two people disagreeing\n- A social media post with conflicting opinions\n- A debate topic or poll\n- Any situation where two opposing viewpoints are presented\n\nIdentify the TWO main opposing positions/claims being argued.\n\nReturn JSON with these exact fields:\n{\n  "claimA": "First position/opinion being argued (be specific and clear)",\n  "claimB": "Second position/opinion being argued (the opposing view)",\n  "context": "Brief description of where this argument is happening (iMessage, Twitter, Reddit, etc)"\n}\n\nIf you cannot identify two clear opposing claims, set both to "Unable to determine".',\n            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json(result);
  } catch (error: any) {
    return openAIError(error);
  }
}
