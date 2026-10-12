// Vercel serverless function: POST /api/chat  { messages: [{role:'user'|'assistant', content}], mode?: 'chat'|'voice' }
import { SYSTEM_PROMPT, fallbackAnswer } from './_profile.js';

const MODEL = 'gemini-2.5-flash';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const messages = Array.isArray(body?.messages) ? body.messages.slice(-10) : [];
  const mode = body?.mode === 'voice' ? 'voice' : 'chat';
  const last = messages[messages.length - 1];
  if (!last || typeof last.content !== 'string' || !last.content.trim()) {
    return res.status(400).json({ error: 'Empty message' });
  }
  const clean = messages
    .filter((m) => m && typeof m.content === 'string')
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content.slice(0, 600) }] }));

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(200).json({ reply: fallbackAnswer(last.content), source: 'fallback' });

  const style = mode === 'voice'
    ? 'Reply in plain spoken English, no markdown, no lists, under 55 words.'
    : 'Reply in under 90 words. Plain text only, no markdown or asterisks; short lines starting with "- " are fine.';

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${SYSTEM_PROMPT}\n${style}` }] },
        contents: clean,
        generationConfig: { temperature: 0.4, maxOutputTokens: 400, thinkingConfig: { thinkingBudget: 0 } },
      }),
    });
    if (!r.ok) throw new Error(`Gemini ${r.status}`);
    const data = await r.json();
    const raw = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('').trim();
    // Plain text only: strip markdown emphasis/headings the model sometimes adds.
    const reply = raw
      ?.replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      .replace(/^#{1,6}\s*/gm, '')
      .replace(/^\s*[*•]\s+/gm, '- ')
      .replace(/\n{3,}/g, '\n\n');
    if (!reply) throw new Error('Empty reply');
    return res.status(200).json({ reply, source: 'ai' });
  } catch (err) {
    console.error('chat error', err);
    return res.status(200).json({ reply: fallbackAnswer(last.content), source: 'fallback' });
  }
}
