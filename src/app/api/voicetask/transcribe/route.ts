import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Step 1: Transcribe with Whisper
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
        aiMessage: "Whisper didn't detect any speech in this recording. Make sure your microphone is working and you're speaking clearly. Background noise can sometimes cause this.",
      });
    }

    // Step 2: Parse tasks from transcript with GPT-4o
    const today = new Date().toISOString().split('T')[0];
    const tasksResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Today is ${today}. You extract actionable tasks from voice transcripts. Be smart about urgency and priority. Return valid JSON only.`,
        },
        {
          role: 'user',
          content: `Transcript: "${transcript}"

Extract every actionable task from this. A task is something that needs to be done (call someone, buy something, schedule something, complete something, etc).

Return JSON:
{
  "tasks": [{"text": "clear task description", "category": "urgent|later", "priority": "high|medium|low", "dueDate": "YYYY-MM-DD or null"}],
  "foundTasks": true or false,
  "reason": "brief note about what you found or why no tasks were detected"
}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const parsed = JSON.parse(tasksResponse.choices[0].message.content!);
    const tasks = parsed.tasks || [];

    let aiMessage: string | undefined;
    if (tasks.length === 0) {
      aiMessage = `Whisper heard: "${transcript}" — but no actionable tasks were found. Try phrases like "Call John by Friday", "Buy groceries tomorrow", or "Submit the report next week".`;
    }

    return NextResponse.json({ transcript, tasks, aiMessage });
  } catch (error: any) {
    console.error('VoiceTask transcribe error:', error);
    const message = error?.message || 'Failed to transcribe audio';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
