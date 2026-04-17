import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import type {
  AISectionIntroProps,
  DetailCardProps,
  StatusBannerProps,
  StepItemProps,
  SummaryRowProps,
} from './types';

export function StatusBanner({ tone = 'neutral', message }: StatusBannerProps) {
  const styles = tone === 'success'
    ? 'border-green-200 bg-green-50 text-green-700'
    : tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-stone-200 bg-stone-50 text-stone-600';

  const Icon = tone === 'success' ? CheckCircle2 : tone === 'error' ? AlertCircle : Sparkles;

  return (
    <div className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${styles}`}>
      <Icon size={16} className="mt-0.5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

export function SummaryRow({ label, value, tone = 'default' }: SummaryRowProps) {
  const toneClass = tone === 'primary'
    ? 'text-primary-700'
    : tone === 'accent'
      ? 'text-amber-700'
      : 'text-stone-900';

  return (
    <div className="flex items-start justify-between gap-4 border-b border-stone-100 py-3 last:border-b-0">
      <span className="text-sm text-stone-500">{label}</span>
      <span className={`text-right text-sm font-medium ${toneClass}`}>{value}</span>
    </div>
  );
}

export function DetailCard({ icon: Icon, title, body, tone = 'neutral' }: DetailCardProps) {
  const toneClass = tone === 'primary'
    ? 'border-primary-200 bg-primary-50/70'
    : tone === 'accent'
      ? 'border-amber-200 bg-amber-50/70'
      : 'border-stone-200 bg-white/90';

  const iconClass = tone === 'primary'
    ? 'text-primary-600'
    : tone === 'accent'
      ? 'text-amber-600'
      : 'text-stone-500';

  return (
    <div className={`rounded-3xl border p-4 ${toneClass}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 shrink-0 ${iconClass}`}>
          <Icon size={18} />
        </span>
        <div>
          <p className="text-sm font-semibold text-stone-900">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">{body}</p>
        </div>
      </div>
    </div>
  );
}

export function StepItem({ index, title, body }: StepItemProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-primary-700 shadow-sm ring-1 ring-primary-100">
        {index}
      </span>
      <div>
        <p className="text-sm font-semibold text-stone-900">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-stone-600">{body}</p>
      </div>
    </div>
  );
}

export function AISectionIntro({ badge, title, hint }: AISectionIntroProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
        {badge}
      </p>
      <h3 className="mt-1 text-lg font-semibold text-stone-900">{title}</h3>
      {hint && <p className="mt-1 text-sm text-stone-500">{hint}</p>}
    </div>
  );
}

export function AISettingsEmptyCatalog() {
  const { t } = useTranslation();

  return (
    <div className="rounded-[28px] border border-dashed border-stone-300 bg-stone-50 px-5 py-8 text-sm text-stone-500">
      {t('aiSettings.loadFailed')}
    </div>
  );
}
