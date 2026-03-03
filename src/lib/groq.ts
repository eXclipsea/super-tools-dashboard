import { OpenAI } from 'openai';

export function getGroqClient(apiKey: string) {
  return new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });
}

export function getAIClient(groqApiKey?: string) {
  if (groqApiKey && groqApiKey.startsWith('gsk_')) {
    return {
      client: getGroqClient(groqApiKey),
      model: 'llama-3.3-70b-versatile', // Groq's fast model
      isGroq: true,
    };
  }
  
  // Fallback to OpenAI
  return {
    client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY! }),
    model: 'gpt-4o-mini',
    isGroq: false,
  };
}
