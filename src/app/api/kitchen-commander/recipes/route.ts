import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No pantry items provided' }, { status: 400 });
    }

    const itemList = items.map((i: { name: string; quantity: string }) => `${i.name} (${i.quantity})`).join(', ');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a creative chef who suggests practical recipes based on available ingredients. Always return valid JSON.',
        },
        {
          role: 'user',
          content: `I have these ingredients: ${itemList}. Suggest 4 recipes I can make. For each recipe calculate a match score (0-100) based on how many required ingredients I already have. Return JSON: {"recipes": [{"name": "string", "ingredients": ["string"], "matchScore": number, "timeToCook": "string", "difficulty": "Easy|Medium|Hard", "calories": number, "instructions": "string"}]}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    });

    const content = JSON.parse(response.choices[0].message.content!);
    const recipes = content.recipes || [];

    return NextResponse.json({ recipes });
  } catch (error) {
    console.error('Kitchen Commander recipes error:', error);
    return NextResponse.json({ error: 'Failed to generate recipes' }, { status: 500 });
  }
}
