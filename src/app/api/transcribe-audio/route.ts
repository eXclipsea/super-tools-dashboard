import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Create FormData for OpenAI Whisper API
    const whisperFormData = new FormData();
    whisperFormData.append('file', audioFile);
    whisperFormData.append('model', 'whisper-1');
    whisperFormData.append('language', 'en');

    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: whisperFormData
    });

    if (!response.ok) {
      console.error('Whisper API error:', response.statusText);
      return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 });
    }

    const data = await response.json();
    const transcript = data.text;

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json({ error: 'No speech detected in audio' }, { status: 400 });
    }

    // Now use GPT to extract tasks from the transcript
    const taskResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Extract tasks from this transcript and return in JSON format:
            {
              "tasks": [
                {
                  "text": "task description",
                  "priority": "high|medium|low",
                  "category": "urgent|later",
                  "dueDate": "YYYY-MM-DD (if mentioned)"
                }
              ]
            }
            
            Transcript: "${transcript}"
            
            Only return actual tasks, not general conversation. If no tasks found, return {"tasks": []}`
          }
        ],
        max_tokens: 500
      })
    });

    if (!taskResponse.ok) {
      console.error('Task extraction error:', taskResponse.statusText);
      return NextResponse.json({ 
        transcript,
        tasks: [],
        error: 'Failed to extract tasks from transcript'
      }, { status: 500 });
    }

    const taskData = await taskResponse.json();
    const taskContent = taskData.choices[0].message.content;
    
    try {
      const taskResult = JSON.parse(taskContent);
      return NextResponse.json({
        transcript,
        tasks: taskResult.tasks || []
      });
    } catch (parseError) {
      console.error('Failed to parse task response:', taskContent);
      return NextResponse.json({
        transcript,
        tasks: [],
        error: 'Failed to parse tasks'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Audio transcription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
