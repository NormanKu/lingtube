import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

const CATEGORIES = ['daily', 'business', 'grammar', 'idiom', 'slang'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

export function FilterBar({ filters, onChange }) {
  const { t } = useTranslation();

  const toggleCategory = (cat) => {
    const cats = filters.categories || [];
    const next = cats.includes(cat) ? cats.filter((c) => c !== cat) : [...cats, cat];
    onChange({ ...filters, categories: next });
  };

  return (
    <div className="space-y-2 border-b border-gray-100 px-4 py-3">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder={t('common.search')}
          className="w-full rounded-lg border-gray-200 pl-9 text-sm focus:border-primary-300 focus:ring-primary-200"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => toggleCategory(cat)}
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
              filters.categories?.includes(cat)
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {t(`categories.${cat}`)}
          </button>
        ))}

        <span className="mx-1 self-center text-gray-300">|</span>

        {/* Familiarity */}
        {['all', 'familiar', 'unfamiliar'].map((f) => (
          <button
            key={f}
            onClick={() => onChange({ ...filters, familiarity: f })}
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
              filters.familiarity === f
                ? 'bg-accent-100 text-accent-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {t(`video.${f}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
