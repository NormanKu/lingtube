import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import type { AISettingsHeaderProps } from './types';

export function AISettingsHeader({ onClose }: AISettingsHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="border-b border-stone-200 bg-white/90 px-5 py-5 backdrop-blur-sm sm:px-7">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400 lg:hidden">
            {t('aiSettings.badge')}
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-stone-900">
            {t('aiSettings.title')}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-500 lg:hidden">
            {t('aiSettings.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 active:bg-stone-300"
          aria-label={t('aiSettings.close')}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
