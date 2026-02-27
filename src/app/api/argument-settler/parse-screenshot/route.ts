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
              text: `You are an expert at analyzing debates and arguments from screenshots.

Look at this screenshot carefully. It likely shows:
- A text conversation with two people disagreeing
- A social media post with conflicting opinions
- A debate topic or poll
- Any situation where two opposing viewpoints are presented

Identify the TWO main opposing positions/claims being argued.

Return JSON with these exact fields:
{
  "claimA": "First position/opinion being argued (be specific and clear)",
  "claimB": "Second position/opinion being argued (the opposing view)",
  "context": "Brief description of where this argument is happening (iMessage, Twitter, Reddit, etc)"
}

If you cannot identify two clear opposing claims, set both to "Unable to determine".`,
            },
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
