import { useCallback, useEffect, useState } from 'react';
import type { AIProvider, AISettings } from 'lingtube-shared';
import { aiSettingsStore } from '../stores/aiSettingsStore';

export function useAISettings() {
  const [settings, setSettings] = useState(aiSettingsStore.getSettings() as AISettings);

  const syncSettings = useCallback(() => {
    setSettings(aiSettingsStore.getSettings());
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === 'lingtube:ai:settings') {
        syncSettings();
      }
    };
    const handleCustomUpdate = () => syncSettings();

    window.addEventListener('storage', handleStorage);
    window.addEventListener(aiSettingsStore.eventName, handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(aiSettingsStore.eventName, handleCustomUpdate);
    };
  }, [syncSettings]);

  const saveSettings = useCallback((nextSettings: Partial<AISettings>) => {
    aiSettingsStore.saveSettings(nextSettings);
    syncSettings();
  }, [syncSettings]);

  const getPersonalKey = useCallback((provider: AIProvider) => (
    aiSettingsStore.getPersonalKey(provider)
  ), []);

  const setPersonalKey = useCallback((provider: AIProvider, apiKey: string) => {
    aiSettingsStore.setPersonalKey(provider, apiKey);
  }, []);

  const clearPersonalKey = useCallback((provider: AIProvider) => {
    aiSettingsStore.clearPersonalKey(provider);
  }, []);

  return {
    settings,
    saveSettings,
    getPersonalKey,
    setPersonalKey,
    clearPersonalKey,
  };
}
