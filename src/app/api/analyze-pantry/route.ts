import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json();
    
    if (!imageData) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
    }

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this fridge/pantry image and identify food items. Return in JSON format:
                {
                  "items": [
                    {
                      "name": "item name",
                      "quantity": "estimated quantity",
                      "category": "Produce|Dairy|Meat|Pantry|Frozen|Beverages",
                      "expiryDate": "YYYY-MM-DD (if visible)",
                      "isOpened": false
                    }
                  ]
                }
                
                Only return actual food items you can clearly see. If no food items are visible, return {"items": []}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Data}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.statusText);
      return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const result = JSON.parse(content);
      return NextResponse.json(result);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return NextResponse.json({ error: 'Failed to parse analysis data' }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Pantry analysis error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
