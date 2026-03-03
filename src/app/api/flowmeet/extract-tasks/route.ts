import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, openAIError } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAI();
    const { content, docName } = await request.json();

    if (!content || content.length < 10) {
      return NextResponse.json({ tasks: [] });
    }

    // Truncate if too long
    const truncatedContent = content.slice(0, 8000);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that extracts actionable tasks from documents and meeting notes. 
          
Look for:
- Action items ("need to", "should", "must", "todo", "follow up")
- Deadlines and due dates
- Assigned responsibilities
- Decisions that require follow-up

Return ONLY a JSON object in this format:
{
  "tasks": ["task 1", "task 2", "task 3"]
}

Keep tasks concise (under 100 characters). If no clear tasks found, return empty array.`
        },
        {
          role: 'user',
          content: `Document: ${docName}\n\nContent:\n${truncatedContent}`
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"tasks":[]}');
    return NextResponse.json(result);
  } catch (error: any) {
    return openAIError(error);
  }
}
