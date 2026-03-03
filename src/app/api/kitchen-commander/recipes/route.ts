import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, openAIError } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAI();
    const { items } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No pantry items provided' }, { status: 400 });
    }

    const itemNames = items.map((i: { name: string }) => i.name.toLowerCase());
    const itemList = items.map((i: { name: string; quantity: string }) => `${i.name} (${i.quantity})`).join(', ');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a professional chef and nutritionist. You suggest practical, delicious recipes based on available ingredients. You are precise with nutritional data and cooking instructions.`,
        },
        {
          role: 'user',
          content: `My pantry contains: ${itemList}

Suggest 4 recipes. For each recipe:

1. "name": Recipe name
2. "ingredients": Full ingredient list with exact measurements (e.g. "2 cups diced chicken breast", "1 tbsp olive oil"). Include ALL ingredients needed, even common ones like salt/oil.
3. "availableIngredients": List ONLY the ingredient names from MY PANTRY that this recipe uses (use the exact names from my pantry list above)
4. "missingIngredients": List any ingredients needed that are NOT in my pantry
5. "matchScore": Calculate as: (number of ingredients from my pantry used) / (total unique ingredients needed) * 100, rounded to nearest integer. This MUST be mathematically accurate.
6. "timeToCook": Total time (e.g. "25 mins", "1 hr 15 mins")
7. "difficulty": "Easy" | "Medium" | "Hard"
8. "calories": Estimated calories per serving (integer)
9. "servings": Number of servings
10. "macros": { "protein": "Xg", "carbs": "Xg", "fat": "Xg", "fiber": "Xg" }
11. "briefDescription": 1-sentence appetizing description (max 100 chars)
12. "fullInstructions": Detailed numbered step-by-step cooking instructions. Be thorough — include prep, cook temps, timing for each step, and plating tips. At least 5 steps.

Return JSON: {"recipes": [...]}

Sort recipes by matchScore descending (best matches first). Prefer recipes where most ingredients come from my pantry.`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4000,
    });

    const content = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json({ recipes: content.recipes || [] });
  } catch (error: any) {
    return openAIError(error);
  }
}
