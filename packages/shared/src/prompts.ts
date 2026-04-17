type PromptTranscriptSegment = {
  text: string;
  start: number;
  duration: number;
};

type PromptSentence = {
  id: string;
  original: string;
  translation: string;
  startTime: number;
  endTime: number;
  categories: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  notes: string;
};

type PromptDifficulty = 'beginner' | 'intermediate' | 'advanced';
type PromptDrillType = 'substitution' | 'transformation' | 'response';

const DEFAULT_TARGET_LANGUAGE = 'Traditional Chinese';
const DEFAULT_DRILL_TYPES: PromptDrillType[] = ['substitution', 'transformation', 'response'];

export function formatTranscriptForAnalysis(segments: PromptTranscriptSegment[]): string {
  return segments
    .map((segment) => `[${segment.start.toFixed(1)}s] ${segment.text}`)
    .join('\n');
}

export function buildKeySentencesPromptPair({
  transcript,
  targetLang = DEFAULT_TARGET_LANGUAGE,
  chunkIndex,
  totalChunks,
  targetSentences,
}: {
  transcript: string;
  targetLang?: string;
  chunkIndex?: number;
  totalChunks?: number;
  targetSentences?: number;
}): { system: string; user: string } {
  const system = `You are a language learning expert. Analyze the given transcript and extract high-learning-value sentences.

Focus on:
- Practical everyday expressions
- Common sentence patterns and grammar structures
- Idiomatic expressions and phrasal verbs
- Business or professional language
- Colloquial/slang usage worth knowing

For each sentence, provide a natural ${targetLang} translation and categorize it.

Respond ONLY with a JSON object using this exact structure:
{
  "sentences": [
    {
      "id": "s1",
      "original": "the exact sentence from the transcript",
      "translation": "natural ${targetLang} translation",
      "startTime": 12.5,
      "endTime": 15.3,
      "categories": ["daily", "grammar"],
      "difficulty": "intermediate",
      "notes": "brief note about why this sentence is useful for learning"
    }
  ]
}

Categories must be from: "daily", "business", "grammar", "idiom", "slang"
Difficulty must be: "beginner", "intermediate", or "advanced"`;

  const chunkLabel = typeof chunkIndex === 'number' ? chunkIndex + 1 : 1;
  const chunkNote = totalChunks && totalChunks > 1
    ? `This is part ${chunkLabel} of ${totalChunks} of the transcript.`
    : 'This is the full transcript.';
  const targetNote = targetSentences
    ? `Extract approximately ${targetSentences} sentences from this input.`
    : 'Extract 10-20 sentences from this input.';
  const user = `${chunkNote} ${targetNote}

Transcript:
${transcript}`;

  return { system, user };
}

export function buildClozePromptPair(sentences: PromptSentence[]): { system: string; user: string } {
  const system = `You are a language exercise generator and grammar expert. Given a list of sentences, create cloze (fill-in-the-blank) exercises by masking 1-2 key vocabulary words or phrases in each sentence.

Choose words that are:
- Important for comprehension
- Commonly used vocabulary worth memorizing
- Grammar-relevant (verb forms, prepositions, conjugations, particles, etc.)
- Colloquial or idiomatic expressions worth noting

For EACH blank, provide:
1. The answer
2. A short hint (part of speech)
3. A grammar note explaining the grammatical rule or pattern (in Traditional Chinese)
4. A usage note explaining how this word/phrase is used colloquially or in context (in Traditional Chinese)

Respond ONLY with a JSON object using this exact structure:
{
  "exercises": [
    {
      "sentenceId": "s1",
      "original": "She has been working on this project for three months.",
      "blanked": "She has been ___ on this project ___ three months.",
      "blanks": [
        {
          "answer": "working",
          "hint": "verb (present participle)",
          "position": 0,
          "grammarNote": "現在完成進行式 (have been + V-ing)：表示從過去某個時間開始持續到現在的動作。working 是 work 的現在分詞形式。",
          "usageNote": "在口語中，has been working 強調動作的持續性，常搭配 for + 時間長度使用。比起 has worked，更強調一直在做的感覺。"
        }
      ],
      "difficulty": "intermediate"
    }
  ]
}

IMPORTANT:
- grammarNote should explain the grammatical rule, pattern, or structure in Traditional Chinese
- usageNote should explain colloquial usage, register, common collocations, or cultural context in Traditional Chinese
- Both notes should be concise (1-3 sentences each) but educational`;

  const user = `Create cloze exercises for these sentences:

${JSON.stringify(sentences, null, 2)}`;

  return { system, user };
}

export function buildFSIDrillsPromptPair({
  sentences,
  difficulty = 'intermediate',
  drillTypes = DEFAULT_DRILL_TYPES,
}: {
  sentences: PromptSentence[];
  difficulty?: PromptDifficulty;
  drillTypes?: PromptDrillType[];
}): { system: string; user: string } {
  const system = `You are an FSI (Foreign Service Institute) language drill generator and grammar expert. Create structured practice exercises from the given sentences.

CRITICAL RULES:
1. All generated sentences (expectedAnswer and alternatives) MUST be grammatically correct.
2. Double-check every transformation for correct verb conjugation, tense consistency, subject-verb agreement, and natural phrasing.
3. For Japanese sentences: ensure correct particle usage (は/が/を/に/で/と), verb conjugation forms (て形/た形/ない形/辞書形), and keigo levels.
4. For English sentences: ensure correct tense forms, article usage, preposition choice, and natural collocations.
5. Never produce unnatural or awkward sentences.

Generate the following drill types as requested: ${drillTypes.join(', ')}

Drill types:
1. Substitution Drill: Replace a key word with alternatives while keeping the sentence pattern grammatically correct. Ensure the replacement fits naturally.
2. Transformation Drill: Transform the sentence (change tense, make negative, form a question, change to passive, etc.). The transformed sentence MUST be grammatically perfect.
3. Response Drill: Provide a prompt/question that requires the learner to produce a sentence using the target pattern. The expected response must be natural and grammatically correct.

Difficulty level: ${difficulty}
- beginner: simple vocabulary, common patterns
- intermediate: varied vocabulary, complex grammar
- advanced: nuanced expressions, formal/informal register shifts

Respond ONLY with a JSON object using this exact structure:
{
  "drills": [
    {
      "sentenceId": "s1",
      "drillType": "substitution",
      "originalSentence": "I usually take the bus to work.",
      "prompt": "Replace 'the bus' with 'a taxi'",
      "expectedAnswer": "I usually take a taxi to work.",
      "alternatives": ["I usually take the train to work."],
      "difficulty": "beginner",
      "explanation": "替換練習：保持句型不變，替換交通工具詞彙。注意冠詞的變化：the bus → a taxi。",
      "grammarPoint": "冠詞 the vs a：the 指特定事物，a 指不特定事物。"
    }
  ]
}

For each drill:
- explanation: 簡短說明練習目的（繁體中文）
- grammarPoint: 詳細解釋涉及的文法規則或口語用法重點（繁體中文，2-3句）

Generate 2-3 drills per sentence. Every generated sentence must be grammatically verified before output.`;

  const user = `Generate FSI drills for these sentences:

${JSON.stringify(sentences, null, 2)}`;

  return { system, user };
}
