const CHAT_MODEL = 'gpt-5-mini';
const EMBEDDING_MODEL = 'text-embedding-3-small';

function ensureApiKey() {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error('OPENAI_API_KEY is missing. Add it to server/.env before using the AI trip planner.');
    error.statusCode = 500;
    throw error;
  }
}

async function postJson(url, payload) {
  ensureApiKey();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    const error = new Error(`OpenAI request failed (${response.status}): ${body}`);
    error.statusCode = 502;
    throw error;
  }

  return response.json();
}

function extractOutputText(response) {
  const output = Array.isArray(response?.output) ? response.output : [];

  for (const item of output) {
    if (item?.type !== 'message') continue;
    const content = Array.isArray(item.content) ? item.content : [];
    for (const part of content) {
      if (part?.type === 'output_text' && typeof part.text === 'string') {
        return part.text;
      }
    }
  }

  return '';
}

async function createStructuredResponse({ schemaName, schema, systemPrompt, userPrompt }) {
  const response = await postJson('https://api.openai.com/v1/responses', {
    model: CHAT_MODEL,
    input: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: schemaName,
        strict: true,
        schema,
      },
    },
  });

  const outputText = extractOutputText(response);
  if (!outputText) {
    throw new Error('OpenAI returned an empty structured response.');
  }

  return JSON.parse(outputText);
}

async function createTextResponse({ systemPrompt, userPrompt, maxOutputTokens = 450 }) {
  const response = await postJson('https://api.openai.com/v1/responses', {
    model: CHAT_MODEL,
    input: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_output_tokens: maxOutputTokens,
  });

  return extractOutputText(response).trim();
}

async function createEmbedding(text) {
  const response = await postJson('https://api.openai.com/v1/embeddings', {
    model: EMBEDDING_MODEL,
    input: text,
  });

  return response?.data?.[0]?.embedding || null;
}

module.exports = {
  CHAT_MODEL,
  EMBEDDING_MODEL,
  createStructuredResponse,
  createTextResponse,
  createEmbedding,
};
