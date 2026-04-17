import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, Globe, RotateCcw, Sparkles } from 'lucide-react';
import { useLearning } from '../../hooks/useLearning';
import { useAISettings } from '../../hooks/useAISettings';
import { AISettingsPanel } from '../Settings/AISettingsPanel';

export function Header() {
  const { t, i18n } = useTranslation();
  const { getDueReviews } = useLearning();
  const { settings } = useAISettings();
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);
  const dueCount = getDueReviews().length;

  const providerLabel = settings.provider === 'claude' ? 'Claude' : 'OpenAI';
  const keyModeLabel = settings.keyMode === 'personal'
    ? t('aiSettings.personalKeyShort')
    : t('aiSettings.serverKeyShort');

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh-TW' : 'en');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-2.5">
        <Link to="/" className="flex items-center gap-2 font-bold text-primary-600">
          <BookOpen size={22} />
          <span className="text-lg">{t('app.title')}</span>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsAISettingsOpen(true)}
            className="flex min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
          >
            <Sparkles size={15} className="shrink-0" />
            <span className="sm:inline">{t('nav.aiSettings')}</span>
            <span className="hidden rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500 md:inline-flex">
              {providerLabel} · {keyModeLabel}
            </span>
          </button>

          <Link
            to="/review"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100"
          >
            <RotateCcw size={16} />
            <span className="hidden sm:inline">{t('nav.review')}</span>
            {dueCount > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                {dueCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={toggleLang}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100"
          >
            <Globe size={14} />
            {i18n.language === 'en' ? '中文' : 'EN'}
          </button>
        </nav>
      </div>

      <AISettingsPanel
        open={isAISettingsOpen}
        onClose={() => setIsAISettingsOpen(false)}
      />
    </header>
  );
}
