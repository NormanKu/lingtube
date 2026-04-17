// ── Transcript ───────────────────────────────────────────

export interface TranscriptSegment {
  text: string;
  start: number; // seconds
  duration: number; // seconds
}

// ── Sentence ─────────────────────────────────────────────

export type Category = 'daily' | 'business' | 'grammar' | 'idiom' | 'slang';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Sentence {
  id: string;
  original: string;
  translation: string;
  startTime: number;
  endTime: number;
  categories: Category[];
  difficulty: Difficulty;
  notes: string;
}

// ── Cloze ────────────────────────────────────────────────

export interface ClozeBlank {
  answer: string;
  hint: string;
  position: number;
  grammarNote?: string;
  usageNote?: string;
}

export interface ClozeExercise {
  sentenceId: string;
  original: string;
  blanked: string;
  blanks: ClozeBlank[];
  difficulty: Difficulty;
}

// ── FSI Drill ────────────────────────────────────────────

export type DrillType = 'substitution' | 'transformation' | 'response';

export interface FSIDrill {
  sentenceId: string;
  drillType: DrillType;
  originalSentence: string;
  prompt: string;
  expectedAnswer: string;
  alternatives: string[];
  difficulty: Difficulty;
  explanation: string;
  grammarPoint?: string;
}

// ── Video Data (stored as JSON) ──────────────────────────

export interface VideoData {
  videoId: string;
  title?: string;
  lang: string;
  generatedAt: string;
  segments: TranscriptSegment[];
  sentences: Sentence[];
  clozeExercises: ClozeExercise[];
  fsiDrills: FSIDrill[];
}

// ── Learning Progress ────────────────────────────────────

export interface SentenceProgress {
  familiar: boolean;
  correctCount: number;
  incorrectCount: number;
  easeFactor: number;
  interval: number;
  repetitions: number;
  lastReviewed: number | null;
  nextReview: number | null;
}

export interface DueReviewItem extends SentenceProgress {
  videoId: string;
  sentenceId: string;
}

// ── API Contracts ────────────────────────────────────────

export type AIProvider = 'openai' | 'claude';
export type AIKeyMode = 'server' | 'personal';

export interface AIRequestOptions {
  provider?: AIProvider;
  model?: string;
  keyMode?: AIKeyMode;
}

export interface AIProviderCatalogItem {
  id: AIProvider;
  label: string;
  defaultModel: string;
  apiKeyEnvVar: string;
  hasServerKey: boolean;
}

export interface AIProviderCatalogResponse {
  defaultProvider: AIProvider;
  providers: AIProviderCatalogItem[];
}

export interface AISettings {
  provider: AIProvider;
  model: string;
  keyMode: AIKeyMode;
}

export interface AIValidationRequest extends AIRequestOptions {}

export interface AIValidationResponse {
  ok: boolean;
  message: string;
}

export interface TranscriptRequest {
  url: string;
  lang?: string;
}

export interface TranscriptResponse {
  videoId: string;
  title?: string;
  segments: TranscriptSegment[];
}

export interface KeySentencesRequest extends AIRequestOptions {
  transcript: TranscriptSegment[];
  targetLang?: string;
}

export interface KeySentencesResponse {
  sentences: Sentence[];
}

export interface ClozeRequest extends AIRequestOptions {
  sentences: Sentence[];
}

export interface ClozeResponse {
  exercises: ClozeExercise[];
}

export interface FSIDrillsRequest extends AIRequestOptions {
  sentences: Sentence[];
  difficulty?: Difficulty;
  drillTypes?: DrillType[];
}

export interface FSIDrillsResponse {
  drills: FSIDrill[];
}

// ── History ──────────────────────────────────────────────

export interface HistoryEntry {
  videoId: string;
  title: string;
  analyzedAt: number;
  sentenceCount: number;
}

// ── Filters ──────────────────────────────────────────────

export type FamiliarityFilter = 'all' | 'familiar' | 'unfamiliar';

export interface SentenceFilters {
  categories: Category[];
  difficulty: Difficulty | null;
  familiarity: FamiliarityFilter;
  search: string;
}
