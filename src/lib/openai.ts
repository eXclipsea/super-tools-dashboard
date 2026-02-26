import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('MISSING_KEY');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export function openAIError(error: any): NextResponse {
  console.error('[OpenAI Error]', error?.name, error?.message);

  if (error?.message === 'MISSING_KEY') {
    return NextResponse.json(
      { error: 'OpenAI API key is not configured on the server. Go to Vercel → your project → Settings → Environment Variables and add OPENAI_API_KEY.' },
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
      { error: 'Could not reach OpenAI. Your API key may be missing or invalid — check OPENAI_API_KEY in your Vercel environment variables.' },
      { status: 503 }
    );
  }

  if (error?.status === 401 || error?.name === 'AuthenticationError') {
    return NextResponse.json(
      { error: 'Invalid OpenAI API key. Check that OPENAI_API_KEY is correct in your Vercel environment variables.' },
      { status: 401 }
    );
  }

  if (error?.status === 429 || error?.name === 'RateLimitError') {
    return NextResponse.json(
      { error: 'OpenAI rate limit hit. Wait a moment and try again.' },
      { status: 429 }
    );
  }

  return NextResponse.json(
    { error: error?.message || 'An unexpected error occurred' },
    { status: 500 }
  );
}
