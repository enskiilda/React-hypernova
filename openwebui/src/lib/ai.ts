const API_URL = '/api/chat';

export const AVAILABLE_MODELS = {
  KIMI_K2_THINKING: 'moonshotai/kimi-k2-thinking',
  SEED_36B: 'bytedance/seed-oss-36b-instruct',
  DEEPSEEK_V3_1: 'deepseek-ai/deepseek-v3.1',
  DEEPSEEK_R1: 'deepseek-ai/deepseek-r1-0528',
  NOVA_2_LITE: 'amazon/nova-2-lite-v1'
} as const;

export type ModelId = typeof AVAILABLE_MODELS[keyof typeof AVAILABLE_MODELS];

export async function* chatStream(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  model: ModelId = AVAILABLE_MODELS.KIMI_K2_THINKING
): AsyncGenerator<{ choices: Array<{ delta: { content?: string } }> }> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ')) {
        const data = trimmed.slice(6);
        if (data === '[DONE]') {
          return;
        }
        try {
          const parsed = JSON.parse(data);
          yield parsed;
        } catch (e) {
        }
      }
    }
  }
}
