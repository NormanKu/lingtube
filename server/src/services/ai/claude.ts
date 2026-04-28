import Anthropic from '@anthropic-ai/sdk';
import { BaseAIProvider, type AICompleteOptions } from './base.js';

interface ClaudeProviderOptions {
  apiKey?: string;
  model?: string;
}

export class ClaudeProvider extends BaseAIProvider {
  private client: Anthropic;
  private model = 'claude-sonnet-4-20250514';

  constructor(options: ClaudeProviderOptions = {}) {
    super();
    const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Claude API key is not configured');
    }
    this.model = options.model || this.model;
    this.client = new Anthropic({ apiKey });
  }

  async complete(
    systemPrompt: string,
    userPrompt: string,
    options: AICompleteOptions = {}
  ): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options.maxTokens ?? 4096,
      ...(typeof options.temperature === 'number' ? { temperature: options.temperature } : {}),
      system: systemPrompt,
      messages: [{ role: 'user' as const, content: userPrompt }],
    });

    const block = response.content[0];
    return block?.type === 'text' ? block.text : '';
  }
}
