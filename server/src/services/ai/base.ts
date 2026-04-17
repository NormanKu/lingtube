export interface AICompleteOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json' | 'text';
}

export abstract class BaseAIProvider {
  abstract complete(
    systemPrompt: string,
    userPrompt: string,
    options?: AICompleteOptions
  ): Promise<string>;

  async validateConnection(): Promise<void> {
    await this.complete(
      'You are a connection check. Reply with exactly OK.',
      'Reply with exactly OK.',
      { temperature: 0, maxTokens: 16 }
    );
  }

  async completeJSON<T = unknown>(
    systemPrompt: string,
    userPrompt: string,
    options?: AICompleteOptions
  ): Promise<T> {
    const raw = await this.complete(systemPrompt, userPrompt, {
      ...options,
      responseFormat: 'json',
    });

    try {
      return JSON.parse(raw) as T;
    } catch {
      // Fallback: extract JSON from markdown code blocks
      const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        return JSON.parse(match[1].trim()) as T;
      }
      throw new Error('Failed to parse AI response as JSON');
    }
  }
}
