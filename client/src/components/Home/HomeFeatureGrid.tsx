import { useTranslation } from 'react-i18next';
import { PenTool, Play, Sparkles, Target } from 'lucide-react';

const FEATURES = [
  { icon: Sparkles, key: 'sentences' },
  { icon: PenTool, key: 'cloze' },
  { icon: Target, key: 'fsi' },
  { icon: Play, key: 'video' },
];

export function HomeFeatureGrid() {
  const { t } = useTranslation();

  return (
    <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {FEATURES.map(({ icon: Icon, key }) => (
        <div key={key} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <Icon size={24} className="mx-auto mb-2 text-primary-500" />
          <h3 className="text-sm font-medium text-gray-800">
            {t(`home.features.${key}`)}
          </h3>
          <p className="mt-1 text-xs text-gray-400">
            {t(`home.features.${key}Desc`)}
          </p>
        </div>
      ))}
    </div>
  );
}
