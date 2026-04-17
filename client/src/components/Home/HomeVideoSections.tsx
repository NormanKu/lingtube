import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clapperboard, Trash2 } from 'lucide-react';
import { LoadingSpinner } from '../Common/LoadingSpinner.jsx';

type VideoSummary = {
  videoId: string;
  title?: string;
  generatedAt: string;
  sentenceCount: number;
  lang?: string;
};

type HistoryVideo = {
  videoId: string;
  title: string;
  analyzedAt: number;
  sentenceCount: number;
};

type AvailableVideosSectionProps = {
  videos: VideoSummary[];
  isLoading: boolean;
  onVideoClick: (videoId: string) => void;
};

type RecentVideosSectionProps = {
  videos: HistoryVideo[];
  onVideoClick: (videoId: string) => void;
  onDeleteHistory: (videoId: string) => void;
};

const LANG_TABS = [
  { key: 'all', label: 'All', flag: '🌐' },
  { key: 'en', label: 'English', flag: '🇬🇧' },
  { key: 'ja', label: '日本語', flag: '🇯🇵' },
  { key: 'es', label: 'Español', flag: '🇪🇸' },
];

function HomeVideoCard({ item, onClick }: { item: VideoSummary; onClick: (videoId: string) => void }) {
  const title = item.title || item.videoId;

  return (
    <button
      type="button"
      onClick={() => onClick(item.videoId)}
      className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:border-primary-300 hover:bg-primary-50"
    >
      <img
        src={`https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`}
        alt={title}
        className="h-16 w-28 shrink-0 rounded object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-700">
          {title}
        </p>
        <p className="text-xs text-gray-400">
          {new Date(item.generatedAt).toLocaleDateString()}
          {item.sentenceCount > 0 && ` · ${item.sentenceCount} sentences`}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
        Ready
      </span>
    </button>
  );
}

export function AvailableVideosSection({
  videos,
  isLoading,
  onVideoClick,
}: AvailableVideosSectionProps) {
  const [activeLang, setActiveLang] = useState('all');

  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          <Clapperboard size={18} className="mr-2 inline-block align-[-2px] text-primary-500" />
          Available Videos
        </h2>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-8">
          <LoadingSpinner text="Loading available videos..." />
        </div>
      </div>
    );
  }

  if (!videos.length) return null;

  const filteredVideos = activeLang === 'all'
    ? videos
    : videos.filter((video) => video.lang === activeLang);
  const availableLangs = new Set(videos.map((video) => video.lang));
  const tabs = LANG_TABS.filter((tab) => tab.key === 'all' || availableLangs.has(tab.key));

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">
        <Clapperboard size={18} className="mr-2 inline-block align-[-2px] text-primary-500" />
        Available Videos
      </h2>

      {tabs.length > 2 && (
        <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveLang(tab.key)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeLang === tab.key
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-1">{tab.flag}</span>
              {tab.label}
              <span className="ml-1 text-xs text-gray-400">
                ({tab.key === 'all' ? videos.length : videos.filter((video) => video.lang === tab.key).length})
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {filteredVideos.map((item) => (
          <HomeVideoCard key={item.videoId} item={item} onClick={onVideoClick} />
        ))}
        {filteredVideos.length === 0 && (
          <p className="rounded-lg bg-gray-100 py-6 text-center text-sm text-gray-400">
            No videos in this language yet
          </p>
        )}
      </div>
    </div>
  );
}

export function RecentVideosSection({
  videos,
  onVideoClick,
  onDeleteHistory,
}: RecentVideosSectionProps) {
  const { t } = useTranslation();

  if (!videos.length) return null;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-800">
        {t('home.recentVideos')}
      </h2>
      <div className="space-y-2">
        {videos.map((item) => (
          <div
            key={item.videoId}
            className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3"
          >
            <button
              type="button"
              onClick={() => onVideoClick(item.videoId)}
              className="min-w-0 flex-1 text-left"
            >
              <p className="truncate text-sm font-medium text-gray-700">{item.title}</p>
              <p className="text-xs text-gray-400">
                {new Date(item.analyzedAt).toLocaleDateString()}
                {item.sentenceCount > 0 && ` · ${item.sentenceCount} sentences`}
              </p>
            </button>
            <button
              type="button"
              onClick={() => onDeleteHistory(item.videoId)}
              className="shrink-0 rounded p-1 text-gray-300 transition-colors hover:text-red-400"
              aria-label={`Delete ${item.title}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
