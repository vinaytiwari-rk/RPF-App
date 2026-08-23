import { queryExternalSearch } from './externalSearch.js';
import { GoogleGenAI, Type } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_SEARCH_API_KEY || process.env.VITE_GOOGLE_SEARCH_API_KEY;
    if (!apiKey) throw new Error('AI service is not configured');
    aiClient = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'rpf-foundation-app' } } });
  }
  return aiClient;
}

// No fabricated/offline claims. If AI is unavailable, optionally return verified web results;
// otherwise return an explicit unavailable response.
export async function handleOfflineFallback(message: string, language: string, res: any) {
  const isHi = language === 'hi' || /[\u0900-\u097F]/.test(message);
  try {
    const results = await queryExternalSearch(message);
    if (results?.length) {
      const intro = isHi ? 'मुझे उपलब्ध वेब परिणाम मिले हैं:\n\n' : 'Here are the available web results:\n\n';
      const reply = intro + results.map((r: any) => `🔗 **[${r.title}](${r.link})**\n${r.snippet || ''}`).join('\n\n');
      return res.json({ response: reply, source: 'web-search' });
    }
  } catch {}
  return res.status(503).json({
    success: false,
    error: 'AI service is temporarily unavailable.',
    message: isHi ? 'AI सेवा अभी उपलब्ध नहीं है। कृपया थोड़ी देर बाद पुनः प्रयास करें।' : 'The AI service is temporarily unavailable. Please try again later.'
  });
}

export { Type };
