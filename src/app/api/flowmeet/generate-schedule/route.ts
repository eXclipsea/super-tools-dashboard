import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, openAIError } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAI();
    const { events, tasks, prompt } = await request.json();

    const systemPrompt = prompt
      ? `You are a smart task suggestion assistant. The user wants task suggestions for a specific day. Return JSON with a "suggestions" array of objects, each with "text" (string) and "priority" ("low"|"medium"|"high"). Suggest practical, actionable tasks. Do not repeat tasks the user already has.`
      : `You are a smart scheduling assistant. Create an optimized daily schedule based on calendar events and tasks. Return JSON:
{
  "schedule": [
    {
      "time": "9:00 AM",
      "endTime": "9:30 AM",
      "activity": "description",
      "type": "prep" | "meeting" | "task" | "break"
    }
  ],
  "advice": "brief scheduling tip"
}`;

    const userContent = prompt
      ? prompt
      : `Calendar Events: ${JSON.stringify(events?.slice(0, 10) || [])}
Tasks: ${JSON.stringify(tasks?.slice(0, 15) || [])}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"schedule":[],"advice":""}');
    return NextResponse.json(result);
  } catch (error: any) {
    return openAIError(error);
  }
}
