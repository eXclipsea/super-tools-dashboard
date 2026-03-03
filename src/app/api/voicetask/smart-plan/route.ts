import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, openAIError } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAI();
    const { tasks, mode, meetings, availableHours, startTime, endTime } = await request.json();

    if (mode === 'daily-summary') {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a personal AI assistant. Generate a concise daily summary based on the user's tasks and meetings. Include:
- What was accomplished today
- What's still pending
- Key highlights or concerns
- A motivational note

Return JSON:
{
  "summary": "brief overview paragraph",
  "accomplished": ["task 1", "task 2"],
  "pending": ["task 1", "task 2"],
  "highlights": ["highlight 1"],
  "tip": "a productivity tip or motivational note"
}`
          },
          {
            role: 'user',
            content: `Tasks: ${JSON.stringify(tasks || [])}\nMeetings: ${JSON.stringify(meetings || [])}`
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
      });

      const result = JSON.parse(response.choices[0].message.content!);
      return NextResponse.json(result);
    }

    if (mode === 'smart-schedule') {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a smart scheduling AI assistant. Given tasks and available time, create an optimized daily schedule.

Consider:
- Task priority and urgency
- Estimated time for each task
- Energy levels throughout the day (harder tasks earlier)
- Breaks between tasks
- Meeting blocks that can't be moved

Return JSON:
{
  "schedule": [
    {
      "time": "9:00 AM",
      "endTime": "9:30 AM",
      "task": "task description",
      "type": "task" | "meeting" | "break",
      "priority": "high" | "medium" | "low",
      "notes": "optional context"
    }
  ],
  "unscheduled": ["tasks that don't fit"],
  "advice": "brief scheduling advice"
}`
          },
          {
            role: 'user',
            content: `Tasks: ${JSON.stringify(tasks || [])}
Meetings: ${JSON.stringify(meetings || [])}
Available hours: ${availableHours || 8}
Start time: ${startTime || '9:00 AM'}
End time: ${endTime || '5:00 PM'}`
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1500,
      });

      const result = JSON.parse(response.choices[0].message.content!);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  } catch (error: any) {
    return openAIError(error);
  }
}
