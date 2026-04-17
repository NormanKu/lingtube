import type { AIProvider, AIProviderCatalogItem, AIProviderCatalogResponse } from 'lingtube-shared';

const AI_PROVIDER_DEFINITIONS: Record<AIProvider, Omit<AIProviderCatalogItem, 'hasServerKey'>> = {
  openai: {
    id: 'openai',
    label: 'OpenAI',
    defaultModel: 'gpt-4o-mini',
    apiKeyEnvVar: 'OPENAI_API_KEY',
  },
  claude: {
    id: 'claude',
    label: 'Claude',
    defaultModel: 'claude-sonnet-4-20250514',
    apiKeyEnvVar: 'ANTHROPIC_API_KEY',
  },
};

export function isAIProvider(value: string | undefined): value is AIProvider {
  return typeof value === 'string' && value in AI_PROVIDER_DEFINITIONS;
}

export function resolveAIProvider(value?: string): AIProvider {
  if (isAIProvider(value)) return value;
  const envProvider = process.env.AI_PROVIDER;
  if (isAIProvider(envProvider)) return envProvider;
  return 'openai';
}

export function getProviderCatalogItem(provider: AIProvider): AIProviderCatalogItem {
  const item = AI_PROVIDER_DEFINITIONS[provider];
  return {
    ...item,
    hasServerKey: Boolean(process.env[item.apiKeyEnvVar]),
  };
}

export function getProviderCatalog(): AIProviderCatalogResponse {
  const defaultProvider = resolveAIProvider(process.env.AI_PROVIDER);
  return {
    defaultProvider,
    providers: Object.keys(AI_PROVIDER_DEFINITIONS).map((provider) =>
      getProviderCatalogItem(provider as AIProvider)
    ),
  };
}
