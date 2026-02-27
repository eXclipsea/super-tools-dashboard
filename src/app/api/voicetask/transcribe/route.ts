import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, openAIError } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAI();
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Step 1: Whisper transcription
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'text',
    });

    const transcript = typeof transcription === 'string' ? transcription : (transcription as any).text || '';

    if (!transcript.trim()) {
      return NextResponse.json({
        transcript: '',
        tasks: [],
        aiMessage: "Whisper didn't detect any speech. Make sure your microphone is working and you're speaking clearly.",
      });
    }

    // Step 2: GPT-4o task extraction
    const today = new Date().toISOString().split('T')[0];
    const tasksResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a task extraction expert. Today is ${today}.

Your job is to analyze voice transcripts and extract every actionable task, to-do item, or reminder mentioned.

For each task you find, determine:
- Text: Clear, actionable description of what needs to be done
- Category: 
  * "urgent" = time-sensitive, important, or deadline-driven
  * "later" = can be done anytime, not urgent
- Priority: 
  * "high" = critical tasks with tight deadlines or major consequences
  * "medium" = important but not urgent
  * "low" = minor tasks, nice-to-haves
- Due Date: 
  * Extract specific dates mentioned ("by Friday", "next Tuesday", "March 15th")
  * Format as YYYY-MM-DD based on today's date
  * If no specific date mentioned, use null

Look for phrases like:
- "I need to...", "I should...", "I have to..."
- "Call...", "Email...", "Meet with..."
- "Buy...", "Get...", "Pick up..."
- "Don't forget to...", "Remember to..."
- Deadlines: "by Friday", "before Monday", "tomorrow", "next week"

Return JSON with these exact fields:
{
  "tasks": [
    {
      "text": "specific actionable task description",
      "category": "urgent|later",
      "priority": "high|medium|low",
      "dueDate": "YYYY-MM-DD or null"
    }
  ],
  "foundTasks": true|false,
  "reason": "brief summary of what tasks were found or why none were found"
}`,
        },
        {
          role: 'user',
          content: `Analyze this transcript and extract all actionable tasks:

"${transcript}"`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const parsed = JSON.parse(tasksResponse.choices[0].message.content!);
    const tasks = parsed.tasks || [];

    let aiMessage: string | undefined;
    if (tasks.length === 0) {
      aiMessage = `Whisper heard: "${transcript}" — but no actionable tasks were found. Try phrases like "Call John by Friday" or "Buy groceries tomorrow".`;
    }

    return NextResponse.json({ transcript, tasks, aiMessage });
  } catch (error: any) {
    return openAIError(error);
  }
}
