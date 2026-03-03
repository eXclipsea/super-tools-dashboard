import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, openAIError } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const openai = getOpenAI();
    const { goal, currentLevel, targetLevel, timeOfDay, obstacles, motivation, timeframe } = await req.json();

    if (!goal) {
      return NextResponse.json({ error: 'Goal is required' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a habit formation expert. Create a personalized, unique habit building plan based on the user's specific situation.

The plan should be creative and tailored - not just "do more each day." Consider:
- Starting point and current level
- Specific obstacles and how to overcome them
- Best time of day for this person
- Motivation and why this matters
- Variety to keep it interesting
- Rest days when appropriate
- Different types of activities that build toward the same goal

Respond ONLY with a JSON object in this exact format:
{
  "description": "Brief description of the plan approach",
  "days": [
    {
      "day": 1,
      "task": "Specific action for this day",
      "duration": "5 minutes",
      "details": "Why this task and how to do it"
    },
    ... (continue for all days)
  ]
}

Each day should have a unique, specific task. Don't just increase duration - vary the activities, intensity, focus areas, and approach. Make it engaging and realistic given the user's obstacles and motivation.`
        },
        {
          role: 'user',
          content: `Create a personalized ${timeframe || 30}-day habit plan for:

Goal: ${goal}
Current level: ${currentLevel || 'Just starting'}
Target: ${targetLevel || 'Build a consistent habit'}
Best time: ${timeOfDay || 'Flexible'}
Obstacles: ${obstacles || 'None specified'}
Why this matters: ${motivation || 'Personal improvement'}

Return ONLY the JSON with daily tasks.`
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4000,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json(result);
  } catch (error: any) {
    return openAIError(error);
  }
}
