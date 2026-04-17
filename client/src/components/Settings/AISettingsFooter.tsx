import { useTranslation } from 'react-i18next';
import { Loader2, Save, Sparkles } from 'lucide-react';
import { Button } from '../Common/Button.jsx';
import type { AISettingsFooterProps } from './types';

export function AISettingsFooter({
  isValidating,
  onValidate,
  onClose,
  onSave,
}: AISettingsFooterProps) {
  const { t } = useTranslation();

  return (
    <div className="border-t border-stone-200 bg-white px-5 py-4 sm:px-7">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <Button variant="ghost" onClick={onValidate} disabled={isValidating}>
          {isValidating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {isValidating ? t('aiSettings.validating') : t('aiSettings.validate')}
        </Button>

        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onClose}>
            {t('aiSettings.cancel')}
          </Button>
          <Button onClick={onSave}>
            <Save size={14} />
            {t('aiSettings.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
