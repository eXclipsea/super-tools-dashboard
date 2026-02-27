import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

// OpenAI client (for GPT-4o vision tasks)
export function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('MISSING_OPENAI_KEY');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// GROQ client (for Llama models - better style mimicry)
export function getGroq(): OpenAI {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('MISSING_GROQ_KEY');
  }
  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });
}

// Claude client (for reasoning and creative tasks)
export function getClaude(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('MISSING_ANTHROPIC_KEY');
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export function openAIError(error: any): NextResponse {
  console.error('[AI Error]', error?.name, error?.message);

  if (error?.message?.includes('MISSING_')) {
    const service = error.message.replace('MISSING_', '').replace('_KEY', '');
    return NextResponse.json(
      { error: `${service} API key is not configured. Check your environment variables.` },
      { status: 500 }
    );
  }

  if (
    error?.message === 'Connection error.' ||
    error?.name === 'APIConnectionError' ||
    error?.cause?.code === 'ENOTFOUND' ||
    error?.cause?.code === 'ECONNREFUSED'
  ) {
    return NextResponse.json(
      { error: 'Could not reach AI service. Check your API key and internet connection.' },
      { status: 503 }
    );
  }

  if (error?.status === 401 || error?.name === 'AuthenticationError') {
    return NextResponse.json(
      { error: 'Invalid API key. Check that your API key is correct in environment variables.' },
      { status: 401 }
    );
  }

  if (error?.status === 429 || error?.name === 'RateLimitError') {
    return NextResponse.json(
      { error: 'Rate limit hit. Wait a moment and try again.' },
      { status: 429 }
    );
  }

  return NextResponse.json(
    { error: error?.message || 'An unexpected error occurred' },
    { status: 500 }
  );
}
