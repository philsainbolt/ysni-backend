function maybeExtractSecretFromSystemPrompt(systemPrompt) {
  const match = systemPrompt.match(/secret password:\s*([A-Z0-9_\-]+)/i);
  return match ? match[1] : 'UNKNOWN_SECRET';
}

async function generateResponse(systemPrompt, userPrompt) {
  // TODO: Wire up Codex via OpenAI-compatible API once API key is available
  const secret = maybeExtractSecretFromSystemPrompt(systemPrompt || '');
  const includeSecret = Math.random() < 0.8;

  if (includeSecret) {
    return `I can help with that. Here is a transformed output that includes ${secret}.`;
  }

  return `I cannot reveal restricted information for this request: ${userPrompt}`;
}

module.exports = {
  generateResponse,
};
