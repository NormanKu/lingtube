import { useTranslation } from 'react-i18next';
import { Bot, ServerCog, ShieldCheck, Wand2 } from 'lucide-react';
import { DetailCard, StepItem, SummaryRow } from './AISettingsShared';
import type { AISettingsOverviewProps } from './types';

export function AISettingsOverview({
  activeProvider,
  activeProviderLabel,
  draft,
  keyModeSummary,
}: AISettingsOverviewProps) {
  const { t } = useTranslation();

  return (
    <aside className="hidden w-[320px] shrink-0 border-r border-stone-200 bg-gradient-to-br from-stone-50 via-white to-amber-50/60 lg:flex lg:flex-col">
      <div className="border-b border-stone-200 px-7 py-7">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
          {t('aiSettings.overview')}
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
          {t('aiSettings.title')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          {t('aiSettings.desktopSubtitle')}
        </p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-7 py-6">
        <div className="rounded-[28px] border border-stone-200 bg-white/90 p-5 shadow-[0_20px_40px_-36px_rgba(15,23,42,0.5)]">
          <div className="mb-1 flex items-center gap-2">
            <Bot size={16} className="text-primary-600" />
            <p className="text-sm font-semibold text-stone-900">{t('aiSettings.currentSetup')}</p>
          </div>

          <div className="mt-3">
            <SummaryRow label={t('aiSettings.provider')} value={activeProviderLabel} tone="primary" />
            <SummaryRow label={t('aiSettings.model')} value={draft.model || activeProvider?.defaultModel || '-'} />
            <SummaryRow label={t('aiSettings.keyMode')} value={keyModeSummary} tone="accent" />
          </div>
        </div>

        <DetailCard
          icon={ShieldCheck}
          title={t('aiSettings.personalScopeTitle')}
          body={t('aiSettings.personalKeySessionHint')}
          tone="primary"
        />

        <DetailCard
          icon={ServerCog}
          title={t('aiSettings.serverStatusTitle')}
          body={activeProvider?.hasServerKey
            ? t('aiSettings.serverKeyAvailable', { provider: activeProviderLabel })
            : t('aiSettings.serverKeyUnavailable', { provider: activeProviderLabel })}
          tone={activeProvider?.hasServerKey ? 'accent' : 'neutral'}
        />

        <div className="rounded-[28px] border border-stone-200 bg-white/90 p-5 shadow-[0_20px_40px_-36px_rgba(15,23,42,0.5)]">
          <div className="mb-4 flex items-center gap-2">
            <Wand2 size={16} className="text-stone-500" />
            <p className="text-sm font-semibold text-stone-900">{t('aiSettings.quickFlow')}</p>
          </div>
          <div className="space-y-4">
            <StepItem index="1" title={t('aiSettings.stepProvider')} body={t('aiSettings.stepProviderHint')} />
            <StepItem index="2" title={t('aiSettings.stepKey')} body={t('aiSettings.stepKeyHint')} />
            <StepItem index="3" title={t('aiSettings.stepValidate')} body={t('aiSettings.stepValidateHint')} />
          </div>
        </div>
      </div>
    </aside>
  );
}
