import { z } from 'zod/v4';

// ── Shared enums ─────────────────────────────────────────

const categoryEnum = z.enum(['daily', 'business', 'grammar', 'idiom', 'slang']);
const difficultyEnum = z.enum(['beginner', 'intermediate', 'advanced']);
const drillTypeEnum = z.enum(['substitution', 'transformation', 'response']);

// ── AI Response Schemas ──────────────────────────────────

export const sentenceSchema = z.object({
  id: z.string(),
  original: z.string(),
  translation: z.string(),
  startTime: z.number(),
  endTime: z.number(),
  categories: z.array(categoryEnum).default([]),
  difficulty: difficultyEnum.default('intermediate'),
  notes: z.string().default(''),
});

export const keySentencesResponseSchema = z.object({
  sentences: z.array(sentenceSchema),
});

export const clozeBlankSchema = z.object({
  answer: z.string(),
  hint: z.string(),
  position: z.number(),
  grammarNote: z.string().optional(),
  usageNote: z.string().optional(),
});

export const clozeExerciseSchema = z.object({
  sentenceId: z.string(),
  original: z.string(),
  blanked: z.string(),
  blanks: z.array(clozeBlankSchema),
  difficulty: difficultyEnum.default('intermediate'),
});

export const clozeResponseSchema = z.object({
  exercises: z.array(clozeExerciseSchema),
});

export const fsiDrillSchema = z.object({
  sentenceId: z.string(),
  drillType: drillTypeEnum,
  originalSentence: z.string(),
  prompt: z.string(),
  expectedAnswer: z.string(),
  alternatives: z.array(z.string()).default([]),
  difficulty: difficultyEnum.default('intermediate'),
  explanation: z.string().default(''),
  grammarPoint: z.string().optional(),
});

export const fsiResponseSchema = z.object({
  drills: z.array(fsiDrillSchema),
});

// ── Video Data Schema ────────────────────────────────────

export const transcriptSegmentSchema = z.object({
  text: z.string(),
  start: z.number(),
  duration: z.number(),
});

export const videoDataSchema = z.object({
  videoId: z.string(),
  title: z.string().optional(),
  lang: z.string(),
  generatedAt: z.string(),
  segments: z.array(transcriptSegmentSchema),
  sentences: z.array(sentenceSchema),
  clozeExercises: z.array(clozeExerciseSchema),
  fsiDrills: z.array(fsiDrillSchema),
});

// ── Request Schemas (input validation at API boundary) ───

const aiRequestOptionsSchema = z.object({
  provider: z.string().max(32).optional(),
  model: z.string().max(128).optional(),
  keyMode: z.enum(['server', 'personal']).optional(),
});

const transcriptInputSegmentSchema = z.object({
  text: z.string().max(2000),
  start: z.number().min(0).max(86400),
  duration: z.number().min(0).max(3600),
});

const inputSentenceSchema = z.object({
  id: z.string().min(1).max(64),
  original: z.string().min(1).max(2000),
  translation: z.string().max(2000),
  startTime: z.number().min(0).max(86400),
  endTime: z.number().min(0).max(86400),
  categories: z.array(categoryEnum).max(8).default([]),
  difficulty: difficultyEnum.default('intermediate'),
  notes: z.string().max(2000).default(''),
});

export const transcriptRequestSchema = z.object({
  url: z.string().min(1).max(2048),
  lang: z.string().max(16).optional(),
});

export const keySentencesRequestSchema = aiRequestOptionsSchema.extend({
  transcript: z.array(transcriptInputSegmentSchema).min(1).max(5000),
  targetLang: z.string().max(16).optional(),
});

export const clozeRequestSchema = aiRequestOptionsSchema.extend({
  sentences: z.array(inputSentenceSchema).min(1).max(500),
});

export const fsiRequestSchema = aiRequestOptionsSchema.extend({
  sentences: z.array(inputSentenceSchema).min(1).max(500),
  difficulty: difficultyEnum.optional(),
  drillTypes: z.array(drillTypeEnum).max(3).optional(),
});

export const aiValidationRequestSchema = aiRequestOptionsSchema;

// ── Type exports (inferred from schemas) ─────────────────

export type SentenceZ = z.infer<typeof sentenceSchema>;
export type ClozeExerciseZ = z.infer<typeof clozeExerciseSchema>;
export type FSIDrillZ = z.infer<typeof fsiDrillSchema>;
export type VideoDataZ = z.infer<typeof videoDataSchema>;
