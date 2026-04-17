import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AIKeyMode, AIProviderCatalogItem, AISettings } from 'lingtube-shared';
import { fetchAIProviders, validateAIConnection } from '../../services/api';
import { useAISettings } from '../../hooks/useAISettings';
import { AISettingsFooter } from './AISettingsFooter';
import { AISettingsForm } from './AISettingsForm';
import { AISettingsHeader } from './AISettingsHeader';
import { AISettingsOverview } from './AISettingsOverview';
import type { AISettingsPanelProps, AISettingsStatus } from './types';

export function AISettingsPanel({ open, onClose }: AISettingsPanelProps) {
  const { t } = useTranslation();
  const { settings, saveSettings, getPersonalKey, setPersonalKey } = useAISettings();
  const [catalog, setCatalog] = useState([] as AIProviderCatalogItem[]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [draft, setDraft] = useState(settings as AISettings);
  const [personalKey, setPersonalKeyInput] = useState('');
  const [status, setStatus] = useState(null as AISettingsStatus | null);

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    setDraft(settings);
    setPersonalKeyInput(getPersonalKey(settings.provider));
    setStatus(null);
    setIsLoadingCatalog(true);
    window.addEventListener('keydown', handleKeyDown);

    fetchAIProviders()
      .then((response) => {
        if (cancelled) return;
        const providers = response.providers || [];
        setCatalog(providers);
        const matchingProvider = providers.find((item: AIProviderCatalogItem) => item.id === settings.provider);
        if (!settings.model && matchingProvider?.defaultModel) {
          setDraft((current: AISettings) => ({ ...current, model: matchingProvider.defaultModel }));
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setStatus({
          tone: 'error',
          message: err instanceof Error ? err.message : t('aiSettings.loadFailed'),
        });
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCatalog(false);
      });

    return () => {
      cancelled = true;
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [getPersonalKey, onClose, open, settings, t]);

  const activeProvider = useMemo(
    () => catalog.find((item: AIProviderCatalogItem) => item.id === draft.provider) || null,
    [catalog, draft.provider]
  );

  const activeProviderLabel = activeProvider?.label || (draft.provider === 'claude' ? 'Claude' : 'OpenAI');
  const keyModeSummary = draft.keyMode === 'personal'
    ? t('aiSettings.personalKeyShort')
    : t('aiSettings.serverKeyShort');

  const handleProviderChange = (providerId: AIProviderCatalogItem['id']) => {
    const nextProvider = catalog.find((item: AIProviderCatalogItem) => item.id === providerId);
    setDraft((current: AISettings) => ({
      ...current,
      provider: providerId,
      model: nextProvider?.defaultModel || current.model,
    }));
    setPersonalKeyInput(getPersonalKey(providerId));
    setStatus(null);
  };

  const handleValidate = async () => {
    if (draft.keyMode === 'personal' && !personalKey.trim()) {
      setStatus({ tone: 'error', message: t('aiSettings.personalKeyRequired') });
      return;
    }

    setIsValidating(true);
    setStatus(null);
    try {
      const result = await validateAIConnection({
        provider: draft.provider,
        model: draft.model.trim(),
        keyMode: draft.keyMode,
        apiKey: personalKey.trim(),
      });
      setStatus({ tone: 'success', message: result.message || t('aiSettings.validationSuccess') });
    } catch (err: unknown) {
      setStatus({
        tone: 'error',
        message: err instanceof Error ? err.message : t('aiSettings.validationFailed'),
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    const normalizedModel = draft.model.trim() || activeProvider?.defaultModel || settings.model;
    if (draft.keyMode === 'personal' && !personalKey.trim()) {
      setStatus({ tone: 'error', message: t('aiSettings.personalKeyRequired') });
      return;
    }

    saveSettings({
      provider: draft.provider,
      model: normalizedModel,
      keyMode: draft.keyMode,
    });

    if (personalKey.trim()) {
      setPersonalKey(draft.provider, personalKey.trim());
    }

    setStatus({ tone: 'success', message: t('aiSettings.settingsSaved') });
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-stone-950/40 px-6 py-6">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 mx-auto flex h-[calc(100vh-3rem)] w-full max-w-5xl overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-[0_40px_120px_-48px_rgba(15,23,42,0.65)]">
        <AISettingsOverview
          activeProvider={activeProvider}
          activeProviderLabel={activeProviderLabel}
          draft={draft}
          keyModeSummary={keyModeSummary}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <AISettingsHeader onClose={onClose} />
          <AISettingsForm
            status={status}
            isLoadingCatalog={isLoadingCatalog}
            catalog={catalog}
            draft={draft}
            settings={settings}
            activeProvider={activeProvider}
            personalKey={personalKey}
            onProviderChange={handleProviderChange}
            onModelChange={(model: string) => setDraft((current: AISettings) => ({ ...current, model }))}
            onKeyModeChange={(keyMode: AIKeyMode) => setDraft((current: AISettings) => ({ ...current, keyMode }))}
            onPersonalKeyChange={setPersonalKeyInput}
          />
          <AISettingsFooter
            isValidating={isValidating}
            onValidate={handleValidate}
            onClose={onClose}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
}
