import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, openAIError } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAI();
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert food inventory analyst with deep knowledge of grocery products, fresh produce, and kitchen ingredients. You excel at identifying foods even when partially visible, in bags, behind other items, or in unclear lighting. Today is ${today}.`,
        },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: image, detail: 'high' } },
            {
              type: 'text',
              text: `Analyze this image thoroughly for ALL food items. Be aggressive in identification — if something looks like it could be food, include it. Check every shelf, drawer, door compartment, and corner.

Look for ALL of these:
- Fresh produce (fruits, vegetables, herbs, leafy greens)
- Dairy (milk, cheese, yogurt, butter, cream, eggs)
- Meats & proteins (chicken, beef, pork, fish, tofu, deli meats)
- Condiments & sauces (ketchup, mustard, soy sauce, hot sauce, mayo, dressings, jams)
- Beverages (juice, soda, water, beer, wine, milk alternatives)
- Pantry staples (bread, rice, pasta, cereal, flour, sugar, oil, canned goods)
- Frozen items (ice cream, frozen vegetables, frozen meals, pizza)
- Snacks (chips, crackers, nuts, granola bars, cookies)
- Leftovers & prepared foods (containers, wrapped items, takeout)
- Baking ingredients (baking soda, vanilla extract, chocolate chips)

For EACH item provide:
- name: Be specific with brand if visible (e.g. "Chobani Greek Yogurt" not just "yogurt"). If no brand visible, still be descriptive (e.g. "Roma Tomatoes" not "tomatoes")
- quantity: Estimate realistically (e.g. "1 gallon", "6 count", "2 lbs", "1 bunch", "3 bottles")
- category: Produce | Dairy | Meat | Pantry | Frozen | Beverages | Condiments | Snacks
- expiryDate: Best guess in YYYY-MM-DD format based on typical shelf life from today

Return JSON:
{
  "canDetect": true,
  "reason": "brief summary of what you see (e.g. 'Well-stocked fridge with produce, dairy, and condiments')",
  "items": [{ "name": "", "quantity": "", "category": "", "expiryDate": "" }]
}

If you truly cannot see ANY food (image is completely blurry, pitch black, or shows no food at all), set canDetect to false. But err on the side of detecting — even a single visible food item means canDetect is true.`,
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2500,
    });

    const content = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json({
      canDetect: content.canDetect ?? (content.items?.length > 0),
      reason: content.reason || '',
      items: content.items || [],
    });
  } catch (error: any) {
    return openAIError(error);
  }
}
