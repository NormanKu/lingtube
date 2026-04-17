import type { AIKeyMode, AIProviderCatalogItem, AISettings } from 'lingtube-shared';

export type AISettingsStatusTone = 'neutral' | 'success' | 'error';

export type AISettingsStatus = {
  tone: AISettingsStatusTone;
  message: string;
};

export type AISettingsPanelProps = {
  open: boolean;
  onClose?: () => void;
};

export type AISettingsHeaderProps = {
  onClose?: () => void;
};

export type AISettingsFooterProps = {
  isValidating: boolean;
  onValidate: () => void;
  onClose?: () => void;
  onSave: () => void;
};

export type AISettingsOverviewProps = {
  activeProvider: AIProviderCatalogItem | null;
  activeProviderLabel: string;
  draft: AISettings;
  keyModeSummary: string;
};

export type AISettingsFormProps = {
  status: AISettingsStatus | null;
  isLoadingCatalog: boolean;
  catalog: AIProviderCatalogItem[];
  draft: AISettings;
  settings: AISettings;
  activeProvider: AIProviderCatalogItem | null;
  personalKey: string;
  onProviderChange: (providerId: AIProviderCatalogItem['id']) => void;
  onModelChange: (model: string) => void;
  onKeyModeChange: (keyMode: AIKeyMode) => void;
  onPersonalKeyChange: (value: string) => void;
};

export type StatusBannerProps = {
  tone?: AISettingsStatusTone;
  message: string;
};

export type SummaryRowProps = {
  label: string;
  value: string;
  tone?: 'default' | 'primary' | 'accent';
};

export type DetailCardProps = {
  icon: any;
  title: string;
  body: string;
  tone?: 'neutral' | 'primary' | 'accent';
};

export type StepItemProps = {
  index: string;
  title: string;
  body: string;
};

export type AISectionIntroProps = {
  badge: string;
  title: string;
  hint?: string;
};
