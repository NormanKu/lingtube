import type { TranscriptSegment, Sentence, ClozeExercise, FSIDrill, Difficulty, DrillType } from 'lingtube-shared';
import {
  buildClozePromptPair,
  buildFSIDrillsPromptPair,
  buildKeySentencesPromptPair,
  formatTranscriptForAnalysis,
} from 'lingtube-shared/prompts';
import { createAIProvider, type AIRequestContext } from './ai/index.js';
import {
  keySentencesResponseSchema,
  clozeResponseSchema,
  fsiResponseSchema,
} from '../schemas.js';

const MAX_RETRIES = 2;

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.warn(`AI call attempt ${i + 1} failed:`, (err as Error).message);
    }
  }
  throw lastError;
}

export async function extractKeySentences(
  segments: TranscriptSegment[],
  targetLang?: string,
  options: AIRequestContext = {}
): Promise<Sentence[]> {
  const ai = createAIProvider(options);
  const { system, user } = buildKeySentencesPromptPair({
    transcript: formatTranscriptForAnalysis(segments),
    targetLang,
  });

  const raw = await withRetry(() => ai.completeJSON(system, user));
  const parsed = keySentencesResponseSchema.parse(raw);
  return parsed.sentences;
}

export async function generateClozeTests(
  sentences: Sentence[],
  options: AIRequestContext = {}
): Promise<ClozeExercise[]> {
  const ai = createAIProvider(options);
  const { system, user } = buildClozePromptPair(sentences);

  const raw = await withRetry(() => ai.completeJSON(system, user));
  const parsed = clozeResponseSchema.parse(raw);
  return parsed.exercises;
}

export async function generateFSIDrills(
  sentences: Sentence[],
  difficulty?: Difficulty,
  drillTypes?: DrillType[],
  options: AIRequestContext = {}
): Promise<FSIDrill[]> {
  const ai = createAIProvider(options);
  const { system, user } = buildFSIDrillsPromptPair({
    sentences,
    difficulty,
    drillTypes,
  });

  const raw = await withRetry(() => ai.completeJSON(system, user));
  const parsed = fsiResponseSchema.parse(raw);
  return parsed.drills;
}
