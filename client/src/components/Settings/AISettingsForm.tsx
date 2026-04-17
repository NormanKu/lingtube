import { useTranslation } from 'react-i18next';
import { KeyRound, Loader2, ServerCog } from 'lucide-react';
import { AISectionIntro, AISettingsEmptyCatalog, StatusBanner } from './AISettingsShared';
import type { AISettingsFormProps } from './types';

export function AISettingsForm({
  status,
  isLoadingCatalog,
  catalog,
  draft,
  settings,
  activeProvider,
  personalKey,
  onProviderChange,
  onModelChange,
  onKeyModeChange,
  onPersonalKeyChange,
}: AISettingsFormProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
      <div className="mx-auto max-w-3xl space-y-7">
        {status && <StatusBanner tone={status.tone} message={status.message} />}

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <AISectionIntro
              badge={t('aiSettings.sectionProvider')}
              title={t('aiSettings.provider')}
              hint={t('aiSettings.providerHint')}
            />
            {isLoadingCatalog && <Loader2 size={18} className="animate-spin text-stone-400" />}
          </div>

          {catalog.length === 0 && !isLoadingCatalog ? (
            <AISettingsEmptyCatalog />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {catalog.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => onProviderChange(provider.id)}
                  className={`rounded-[28px] border p-5 text-left transition-all ${
                    draft.provider === provider.id
                      ? 'border-primary-300 bg-primary-50 shadow-[0_18px_36px_-32px_rgba(37,99,235,0.8)]'
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-stone-900">{provider.label}</p>
                      <p className="mt-1 text-sm text-stone-500">{provider.defaultModel}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      provider.hasServerKey
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {provider.hasServerKey ? t('aiSettings.serverReady') : t('aiSettings.serverMissing')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.95fr)]">
          <div className="space-y-4">
            <AISectionIntro
              badge={t('aiSettings.sectionModel')}
              title={t('aiSettings.model')}
              hint={t('aiSettings.modelHint')}
            />

            <label className="block rounded-[28px] border border-stone-200 bg-white p-5">
              <span className="mb-2 block text-sm font-medium text-stone-700">
                {t('aiSettings.model')}
              </span>
              <input
                type="text"
                value={draft.model}
                onChange={(event: any) => onModelChange(event.target.value)}
                placeholder={activeProvider?.defaultModel || settings.model}
                className="w-full rounded-2xl border border-stone-200 px-4 py-2.5 text-sm text-stone-700 outline-none transition-colors focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
              />
              <p className="mt-3 text-xs leading-relaxed text-stone-500">
                {t('aiSettings.modelTip', { model: activeProvider?.defaultModel || settings.model })}
              </p>
            </label>
          </div>

          <div className="space-y-4">
            <AISectionIntro
              badge={t('aiSettings.sectionKeyMode')}
              title={t('aiSettings.keyMode')}
              hint={t('aiSettings.keyModeHint')}
            />

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => onKeyModeChange('server')}
                className={`flex w-full items-start gap-3 rounded-[28px] border px-5 py-4 text-left transition-colors ${
                  draft.keyMode === 'server'
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <ServerCog size={18} className="mt-0.5 shrink-0 text-stone-500" />
                <div>
                  <p className="font-medium text-stone-900">{t('aiSettings.useServerKey')}</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-500">{t('aiSettings.useServerKeyHint')}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onKeyModeChange('personal')}
                className={`flex w-full items-start gap-3 rounded-[28px] border px-5 py-4 text-left transition-colors ${
                  draft.keyMode === 'personal'
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <KeyRound size={18} className="mt-0.5 shrink-0 text-stone-500" />
                <div>
                  <p className="font-medium text-stone-900">{t('aiSettings.usePersonalKey')}</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-500">{t('aiSettings.usePersonalKeyHint')}</p>
                </div>
              </button>
            </div>
          </div>
        </section>

        {draft.keyMode === 'personal' && (
          <section>
            <div className="mb-4">
              <AISectionIntro
                badge={t('aiSettings.sectionCredentials')}
                title={t('aiSettings.personalKey')}
              />
            </div>

            <div className="rounded-[28px] border border-stone-200 bg-stone-50/70 p-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">
                  {t('aiSettings.personalKey')}
                </span>
                <input
                  type="password"
                  value={personalKey}
                  onChange={(event: any) => onPersonalKeyChange(event.target.value)}
                  placeholder={t('aiSettings.personalKeyPlaceholder')}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-700 outline-none transition-colors focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                />
              </label>
              <p className="mt-3 text-xs leading-relaxed text-stone-500">
                {t('aiSettings.personalKeySessionHint')}
              </p>
            </div>
          </section>
        )}

        {draft.keyMode === 'server' && activeProvider && (
          <section className="rounded-[28px] border border-stone-200 bg-stone-50/70 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
              {t('aiSettings.sectionStatus')}
            </p>
            <div className="mt-3">
              <StatusBanner
                tone={activeProvider.hasServerKey ? 'success' : 'neutral'}
                message={activeProvider.hasServerKey
                  ? t('aiSettings.serverKeyAvailable', { provider: activeProvider.label })
                  : t('aiSettings.serverKeyUnavailable', { provider: activeProvider.label })}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
