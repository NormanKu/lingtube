import type {
  AIKeyMode,
  AIProvider,
  AIRequestOptions,
  AISettings,
} from 'lingtube-shared';
import { storage } from './storage.js';

const SESSION_PREFIX = 'lingtube:';
const SETTINGS_KEY = 'ai:settings';
const SESSION_KEYS_KEY = 'ai:personal-keys';
const SETTINGS_EVENT = 'lingtube:ai-settings-updated';

type PersonalKeyMap = Partial<Record<AIProvider, string>>;
type AISettingsOverrides = Partial<AIRequestOptions & { apiKey?: string }>;

export type ResolvedAIRequestSettings = AISettings & {
  apiKey: string;
};

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  keyMode: 'server',
};

function emitSettingsUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SETTINGS_EVENT));
  }
}

function getSessionValue<T>(key: string, defaultValue: T) {
  if (typeof sessionStorage === 'undefined') return defaultValue;
  try {
    const raw = sessionStorage.getItem(SESSION_PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setSessionValue<T>(key: string, value: T) {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_PREFIX + key, JSON.stringify(value));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('SessionStorage write failed:', message);
  }
}

export const aiSettingsStore = {
  eventName: SETTINGS_EVENT,

  getSettings() {
    return {
      ...DEFAULT_AI_SETTINGS,
      ...storage.get<Partial<AISettings>>(SETTINGS_KEY, {}),
    } satisfies AISettings;
  },

  saveSettings(settings: Partial<AISettings>) {
    storage.set(SETTINGS_KEY, {
      ...this.getSettings(),
      ...settings,
    });
    emitSettingsUpdate();
  },

  getAllPersonalKeys() {
    return getSessionValue<PersonalKeyMap>(SESSION_KEYS_KEY, {});
  },

  getPersonalKey(provider: AIProvider) {
    return this.getAllPersonalKeys()?.[provider] || '';
  },

  setPersonalKey(provider: AIProvider, apiKey: string) {
    const current = this.getAllPersonalKeys();
    setSessionValue(SESSION_KEYS_KEY, {
      ...current,
      [provider]: apiKey,
    });
    emitSettingsUpdate();
  },

  clearPersonalKey(provider: AIProvider) {
    const current = this.getAllPersonalKeys();
    const next = { ...current };
    delete next[provider];
    setSessionValue(SESSION_KEYS_KEY, next);
    emitSettingsUpdate();
  },

  getResolvedRequestSettings(overrides: AISettingsOverrides = {}) {
    const settings = {
      ...this.getSettings(),
      ...overrides,
    } as AISettings & { apiKey?: string; keyMode: AIKeyMode };
    const apiKey = settings.keyMode === 'personal'
      ? (overrides.apiKey ?? this.getPersonalKey(settings.provider))
      : '';

    return {
      provider: settings.provider,
      model: settings.model,
      keyMode: settings.keyMode,
      apiKey,
    } satisfies ResolvedAIRequestSettings;
  },
};
