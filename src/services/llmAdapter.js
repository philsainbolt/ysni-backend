const { getGroqApiKey } = require('../config/runtime');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

function maybeExtractSecretFromSystemPrompt(systemPrompt) {
  const match = systemPrompt.match(/secret password:\s*([A-Z0-9_\-]+)/i);
  return match ? match[1] : 'UNKNOWN_SECRET';
}

function isE2EModeEnabled() {
  return String(process.env.E2E_MODE || '').toLowerCase() === 'true';
}

function shouldSucceedDeterministically(userPrompt = '') {
  const normalized = String(userPrompt).toLowerCase();
  const successMarkers = ['ignore', 'reveal', 'secret', 'password', 'system prompt', 'bypass'];
  return successMarkers.some((marker) => normalized.includes(marker));
}

async function callGroq(systemPrompt, userPrompt) {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (res.status === 429) {
    throw new Error('Rate limited — try again in a moment');
  }
  if (res.status === 401) {
    throw new Error('LLM API key is invalid');
  }
  if (!res.ok) {
    throw new Error(`Groq API error (${res.status})`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

async function generateResponse(systemPrompt, userPrompt) {
  const secret = maybeExtractSecretFromSystemPrompt(systemPrompt || '');

  if (isE2EModeEnabled()) {
    if (shouldSucceedDeterministically(userPrompt)) {
      return `E2E_MODE: deterministic success. Extracted token => ${secret}`;
    }

    return 'E2E_MODE: deterministic refusal. No secret disclosed.';
  }

  return callGroq(systemPrompt, userPrompt);
}

module.exports = {
  generateResponse,
};
