import { useTranslation } from 'react-i18next';
import { Link2 } from 'lucide-react';
import { Button } from '../Common/Button.jsx';
import { LoadingSpinner } from '../Common/LoadingSpinner.jsx';

type HomeHeroProps = {
  url: string;
  loading: boolean;
  error: string;
  onUrlChange: (value: string) => void;
  onAnalyze: () => void;
};

export function HomeHero({
  url,
  loading,
  error,
  onUrlChange,
  onAnalyze,
}: HomeHeroProps) {
  const { t } = useTranslation();

  return (
    <div className="py-12 text-center">
      <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
        {t('home.heading')}
      </h1>
      <p className="mb-8 text-gray-500">{t('home.subheading')}</p>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="url"
            value={url}
            onChange={(event: any) => onUrlChange(event.target.value)}
            onKeyDown={(event: any) => event.key === 'Enter' && onAnalyze()}
            placeholder={t('home.placeholder')}
            className="w-full rounded-xl border-gray-200 py-3 pl-11 pr-4 text-sm focus:border-primary-300 focus:ring-primary-200"
          />
        </div>
        <Button size="lg" onClick={onAnalyze} disabled={loading || !url.trim()}>
          {loading ? t('home.analyzing') : t('home.analyze')}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      {loading && <LoadingSpinner text={t('home.analyzing')} />}
    </div>
  );
}
