import type {
  AIProviderCatalogResponse,
  AIRequestOptions,
  AIValidationResponse,
  ClozeRequest,
  ClozeResponse,
  DrillType,
  FSIDrillsResponse,
  KeySentencesResponse,
  TranscriptRequest,
  TranscriptResponse,
  TranscriptSegment,
  VideoData,
  Difficulty,
  Sentence,
} from 'lingtube-shared';
import { aiSettingsStore, type ResolvedAIRequestSettings } from '../stores/aiSettingsStore';

type ApiErrorPayload = {
  error?: string;
  message?: string;
};

type RequestOptions = {
  headers?: Record<string, string>;
};

export type AvailableVideoSummary = {
  videoId: string;
  title?: string;
  lang?: string;
  generatedAt: string;
  sentenceCount: number;
};

export type AvailableVideosResponse = {
  videos: AvailableVideoSummary[];
};

type AIRequestOverrides = Partial<AIRequestOptions & { apiKey?: string }>;

async function parseErrorResponse(res: Response) {
  const err = await res.json().catch(() => ({ error: 'Request failed' } as ApiErrorPayload));
  throw new Error(err.error || err.message || `HTTP ${res.status}`);
}

async function request<TResponse, TBody>(url: string, body: TBody, options: RequestOptions = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    await parseErrorResponse(res);
  }

  return res.json() as Promise<TResponse>;
}

async function get<TResponse>(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    await parseErrorResponse(res);
  }
  return res.json() as Promise<TResponse>;
}

function getAIRequestInit(overrides: AIRequestOverrides = {}) {
  const resolved = aiSettingsStore.getResolvedRequestSettings(overrides);
  const headers: Record<string, string> = {};

  if (resolved.keyMode === 'personal' && resolved.apiKey) {
    headers['x-lingtube-api-key'] = resolved.apiKey;
  }

  return {
    headers,
    provider: resolved.provider,
    model: resolved.model,
    keyMode: resolved.keyMode,
  } satisfies Omit<ResolvedAIRequestSettings, 'apiKey'> & { headers: Record<string, string> };
}

export async function loadVideoData(videoId: string) {
  return get<VideoData>(`/api/data/${videoId}`);
}

export async function listVideos() {
  return get<AvailableVideosResponse>('/api/data');
}

export async function fetchTranscript(url: string, lang?: string) {
  const payload: TranscriptRequest = { url, lang };
  return request<TranscriptResponse, TranscriptRequest>('/api/transcript', payload);
}

export async function fetchAIProviders() {
  return get<AIProviderCatalogResponse>('/api/ai/providers');
}

export async function validateAIConnection(overrides: AIRequestOverrides = {}) {
  const resolved = aiSettingsStore.getResolvedRequestSettings(overrides);
  const headers: Record<string, string> = {};

  if (resolved.keyMode === 'personal' && resolved.apiKey) {
    headers['x-lingtube-api-key'] = resolved.apiKey;
  }

  return request<AIValidationResponse, AIRequestOptions>(
    '/api/ai/validate',
    {
      provider: resolved.provider,
      model: resolved.model,
      keyMode: resolved.keyMode,
    },
    { headers }
  );
}

export async function analyzeKeySentences(
  transcript: TranscriptSegment[],
  provider?: AIRequestOptions['provider'],
  model?: string
) {
  const ai = getAIRequestInit({ provider, model });
  return request<KeySentencesResponse, {
    transcript: TranscriptSegment[];
    provider?: AIRequestOptions['provider'];
    model?: string;
    keyMode?: AIRequestOptions['keyMode'];
  }>(
    '/api/analyze/key-sentences',
    {
      transcript,
      provider: ai.provider,
      model: ai.model,
      keyMode: ai.keyMode,
    },
    { headers: ai.headers }
  );
}

export async function generateCloze(
  sentences: Sentence[],
  provider?: AIRequestOptions['provider'],
  model?: string
) {
  const ai = getAIRequestInit({ provider, model });
  const payload: ClozeRequest = {
    sentences,
    provider: ai.provider,
    model: ai.model,
    keyMode: ai.keyMode,
  };
  return request<ClozeResponse, ClozeRequest>('/api/analyze/cloze', payload, { headers: ai.headers });
}

export async function generateFSIDrills(
  sentences: Sentence[],
  difficulty?: Difficulty,
  drillTypes?: DrillType[],
  provider?: AIRequestOptions['provider'],
  model?: string
) {
  const ai = getAIRequestInit({ provider, model });
  const payload = {
    sentences,
    difficulty,
    drillTypes,
    provider: ai.provider,
    model: ai.model,
    keyMode: ai.keyMode,
  };
  return request<FSIDrillsResponse, typeof payload>('/api/analyze/fsi', payload, { headers: ai.headers });
}
