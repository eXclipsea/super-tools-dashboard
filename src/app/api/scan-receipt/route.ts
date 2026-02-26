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
                text: `Please analyze this receipt image and extract the following information in JSON format:
                {
                  "merchant": "store name",
                  "date": "YYYY-MM-DD",
                  "total": "total amount with $",
                  "category": "expense category",
                  "items": [
                    {"name": "item name", "price": "price with $"}
                  ]
                }
                
                If you can't read the receipt clearly, respond with {"error": "Could not read receipt"}`
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
      return NextResponse.json({ error: 'Failed to process receipt' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const result = JSON.parse(content);
      return NextResponse.json(result);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return NextResponse.json({ error: 'Failed to parse receipt data' }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Receipt scanning error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
