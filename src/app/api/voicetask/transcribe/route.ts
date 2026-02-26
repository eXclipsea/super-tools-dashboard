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

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'text',
    });

    const transcript = typeof transcription === 'string' ? transcription : (transcription as any).text || '';

    if (!transcript.trim()) {
      return NextResponse.json({ transcript: '', tasks: [] });
    }

    // Parse tasks from transcript with GPT-4o
    const today = new Date().toISOString().split('T')[0];
    const tasksResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Today is ${today}. Extract actionable tasks from voice transcripts. Be smart about urgency and priority. Return valid JSON only.`,
        },
        {
          role: 'user',
          content: `Extract all tasks from this transcript:\n\n"${transcript}"\n\nFor each task identify urgency and priority. Return JSON: {"tasks": [{"text": "task description", "category": "urgent|later", "priority": "high|medium|low", "dueDate": "YYYY-MM-DD or null"}]}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const parsed = JSON.parse(tasksResponse.choices[0].message.content!);
    const tasks = parsed.tasks || [];

    return NextResponse.json({ transcript, tasks });
  } catch (error) {
    console.error('VoiceTask transcribe error:', error);
    return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 });
  }
}
