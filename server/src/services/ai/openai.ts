import OpenAI from 'openai';
import { BaseAIProvider, type AICompleteOptions } from './base.js';

interface OpenAIProviderOptions {
  apiKey?: string;
  model?: string;
}

export class OpenAIProvider extends BaseAIProvider {
  private client: OpenAI;
  private model = 'gpt-4o-mini';

  constructor(options: OpenAIProviderOptions = {}) {
    super();
    const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }
    this.model = options.model || this.model;
    this.client = new OpenAI({ apiKey });
  }

  async complete(
    systemPrompt: string,
    userPrompt: string,
    options: AICompleteOptions = {}
  ): Promise<string> {
    const params: OpenAI.ChatCompletionCreateParamsNonStreaming = {
      model: this.model,
      messages: [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userPrompt },
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
    };

    if (options.responseFormat === 'json') {
      params.response_format = { type: 'json_object' };
    }

    const response = await this.client.chat.completions.create(params);
    return response.choices[0].message.content ?? '';
  }
}
