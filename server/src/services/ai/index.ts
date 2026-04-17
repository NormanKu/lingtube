import type { AIKeyMode, AIProvider } from 'lingtube-shared';
import { OpenAIProvider } from './openai.js';
import { ClaudeProvider } from './claude.js';
import type { BaseAIProvider } from './base.js';
import { resolveAIProvider } from './catalog.js';

export interface AIProviderRequestOptions {
  provider?: AIProvider | string;
  model?: string;
  apiKey?: string;
}

export interface AIRequestContext extends AIProviderRequestOptions {
  keyMode?: AIKeyMode;
}

const providers: Record<AIProvider, (options: AIProviderRequestOptions) => BaseAIProvider> = {
  openai: (options) => new OpenAIProvider(options),
  claude: (options) => new ClaudeProvider(options),
};

export function createAIProvider(options: AIProviderRequestOptions = {}): BaseAIProvider {
  const providerName = resolveAIProvider(options.provider);
  return providers[providerName]({
    ...options,
    provider: providerName,
  });
}
