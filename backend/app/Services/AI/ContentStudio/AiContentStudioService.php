<?php

namespace App\Services\AI\ContentStudio;

use App\DTOs\AI\AiContentStudioInputData;
use App\DTOs\AI\AiContentStudioOutputData;
use App\Enums\Ai\AiContentIntentEnum;
use App\Enums\Ai\AiContentSuggestionStatusEnum;
use App\Exceptions\Http\ServiceUnavailableException;
use App\Exceptions\Http\TooManyRequestsException;
use App\Jobs\AI\GenerateAiContentSuggestionJob;
use App\Models\AiContentSuggestion;
use App\Models\AiStudioSetting;
use App\Services\AI\Providers\GeminiClient;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AiContentStudioService
{
    private const SYSTEM_PROMPT = <<<'PROMPT'
You are an AI Content Studio Assistant for a social short video platform. Your sole purpose is to analyze video metadata provided by creators and generate structured content suggestions.

## ROLE
You are an expert social media content strategist specializing in short-form video platforms (TikTok, Instagram Reels, YouTube Shorts). You understand platform algorithms, audience engagement, and content best practices across multiple languages including Vietnamese, English, Japanese, Korean, and Chinese.

## OUTPUT RULES
- MUST return ONLY a valid JSON object. No markdown. No code fences. No explanations. No preamble. No trailing text.
- The response MUST start with `{` and end with `}`.
- All string values must be properly escaped JSON strings.

## LANGUAGE RULES
- ALL caption fields (short_caption, professional_caption, viral_caption), topic, target_audience, and safety_notes MUST be written in the language specified by creator_language.
- Vietnamese (vi): Write naturally, colloquially, use Vietnamese internet culture. Avoid overly formal language.
- English (en): Write in natural, platform-appropriate English.
- For other languages (ja/ko/zh): Write in that respective language.
- If creator_language is "other": default to English.
- hashtags: May mix English and creator_language hashtags (most platforms use English hashtags widely).
- category_suggestion and content_intent: ALWAYS in English (system fields).

## CAPTION RULES
- short_caption: 50–150 characters. Hook-based, punchy, concise. No excessive emoji.
- professional_caption: 150–300 characters. Informative, credible, suitable for brand or educational content.
- viral_caption: 100–250 characters. Engaging, curiosity-driven, emotion-triggering. MUST NOT make false claims or clickbait with fabricated facts.
- Do NOT use excessive punctuation (!!!), ALL CAPS spam, or keyword stuffing.
- Base captions only on information present in the input. Do not invent story elements.

## HASHTAG RULES
- Generate EXACTLY 10 hashtags.
- Each hashtag MUST start with `#`.
- Hashtags MUST NOT contain spaces. Use camelCase or concatenation (e.g., #PhoBo, #LearnVietnamese).
- Mix: 2–3 broad/trending tags, 4–5 topic-specific tags, 2–3 niche/long-tail tags.
- Do NOT repeat hashtags.

## SAFETY RULES
- Do NOT generate content promoting: violence, hate speech, sexual content, self-harm, illegal activities, scams, misinformation, spam, or discrimination.
- If input signals unsafe content: set safety_notes to describe the concern and generate only safe, generic alternatives.

## ANTI-HALLUCINATION RULES
- Base ALL output strictly on the input provided.
- If input is minimal, generate output but use generic captions and lower confidence_score accordingly.
- Do NOT invent specific facts, statistics, names, or events not present in the input.

## FALLBACK RULES
- If input has enough data for only partial suggestions: still return complete JSON with all required fields.
- For missing context: keep captions generic but useful. Do not return empty strings for required fields.
- confidence_score reflects input quality: 0.9–1.0 (rich input), 0.6–0.8 (partial), 0.3–0.5 (minimal).

## CATEGORY SUGGESTION
- Suggest ONE most appropriate category from: Entertainment, Education, Gaming, Food, Travel, Fitness, Beauty, Fashion, Technology, Music, Comedy, News, Sports, Lifestyle, DIY, Finance, Pets, Art, Science, Other.
- If current_category is provided and appropriate, confirm it. Suggest a better one only if clearly mismatched.

## CONTENT INTENT
- Classify intent as exactly one of: educational, entertainment, review, tutorial, vlog, promotional, storytelling, news, lifestyle, other.

## REQUIRED OUTPUT SCHEMA
{
  "short_caption": "string",
  "professional_caption": "string",
  "viral_caption": "string",
  "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7","#tag8","#tag9","#tag10"],
  "topic": "string",
  "category_suggestion": "string",
  "target_audience": "string",
  "content_intent": "educational|entertainment|review|tutorial|vlog|promotional|storytelling|news|lifestyle|other",
  "confidence_score": 0.0,
  "safety_notes": null
}
PROMPT;

    private const USER_PROMPT_TEMPLATE = <<<'PROMPT'
Analyze the following video metadata and generate content suggestions.

=== VIDEO INFORMATION ===
Video Title: {{video_title}}
Video Description: {{video_description}}
Video Transcript: {{video_transcript}}
OCR Text (on-screen text): {{ocr_text}}
Creator Language: {{creator_language}}
Current Category: {{video_category}}

=== INSTRUCTIONS ===
1. Analyze all provided information above.
2. Generate content suggestions strictly based on the information provided.
3. All captions, topic, and target_audience MUST be written in: {{creator_language}}.
4. Generate EXACTLY 10 hashtags (no spaces within hashtags).
5. Return ONLY a valid JSON object matching the required schema. No other text.
PROMPT;

    public function __construct(
        private readonly GeminiClient $geminiClient,
    ) {}

    /**
     * Create a pending suggestion record and dispatch async queue job.
     *
     * @throws ServiceUnavailableException when AI Studio is disabled by admin
     * @throws TooManyRequestsException when user or global daily quota is exceeded
     */
    public function initiateAsync(int $userId, AiContentStudioInputData $input): AiContentSuggestion
    {
        $settings = AiStudioSetting::current();

        if (! $settings->is_enabled) {
            throw new ServiceUnavailableException('AI Content Studio is currently disabled.');
        }

        $hash = $this->buildRequestHash($userId, $input);

        if (! $input->regenerate) {
            if ($cached = $this->getFromCache($userId, $hash)) {
                return $cached;
            }

            $existing = AiContentSuggestion::where('user_id', $userId)
                ->where('request_hash', $hash)
                ->whereIn('status', [
                    AiContentSuggestionStatusEnum::PENDING,
                    AiContentSuggestionStatusEnum::PROCESSING,
                    AiContentSuggestionStatusEnum::COMPLETED,
                ])
                ->latest()
                ->first();

            if ($existing) {
                return $existing;
            }
        }

        $this->checkQuota($userId, $settings);

        $suggestion = AiContentSuggestion::create([
            'uuid'              => (string) Str::uuid(),
            'user_id'           => $userId,
            'video_title'       => $input->videoTitle,
            'video_description' => $input->videoDescription,
            'video_transcript'  => $input->videoTranscript,
            'ocr_text'          => $input->ocrText,
            'creator_language'  => $input->creatorLanguage,
            'input_category'    => $input->videoCategory,
            'status'            => AiContentSuggestionStatusEnum::PENDING,
            'provider'          => (string) config('ai.provider', 'gemini'),
            'model'             => $settings->gemini_model ?: (string) config('ai.gemini.model'),
            'prompt_version'    => (string) config('ai.prompt_version', 'v1'),
            'request_hash'      => $hash,
        ]);

        GenerateAiContentSuggestionJob::dispatch($suggestion->id, $userId, $input);

        return $suggestion;
    }

    /**
     * Run generation synchronously — called by the queue job.
     */
    public function generate(AiContentSuggestion $suggestion, AiContentStudioInputData $input): void
    {
        $startTime = microtime(true);

        $suggestion->update(['status' => AiContentSuggestionStatusEnum::PROCESSING]);

        try {
            $sanitized  = $this->sanitizeInput($input);
            $userPrompt = $this->buildUserPrompt($sanitized);

            $result       = $this->geminiClient->generate(self::SYSTEM_PROMPT, $userPrompt);
            $parsedOutput = $this->parseAndValidate($result['text']);
            $latencyMs    = (int) ((microtime(true) - $startTime) * 1000);

            $suggestion->update([
                'status'               => AiContentSuggestionStatusEnum::COMPLETED,
                'short_caption'        => $parsedOutput->shortCaption,
                'professional_caption' => $parsedOutput->professionalCaption,
                'viral_caption'        => $parsedOutput->viralCaption,
                'hashtags'             => $parsedOutput->hashtags,
                'topic'                => $parsedOutput->topic,
                'category_suggestion'  => $parsedOutput->categorySuggestion,
                'target_audience'      => $parsedOutput->targetAudience,
                'content_intent'       => AiContentIntentEnum::tryFrom($parsedOutput->contentIntent) ?? AiContentIntentEnum::OTHER,
                'confidence_score'     => $parsedOutput->confidenceScore,
                'safety_notes'         => $parsedOutput->safetyNotes,
                'token_usage'          => $result['token_usage'],
                'raw_response'         => config('ai.logging.log_raw_response') ? ['text' => mb_substr($result['text'], 0, 2000)] : null,
                'generated_at'         => now(),
                'error_message'        => null,
            ]);

            $this->storeInCache($suggestion->user_id, $suggestion->request_hash, $suggestion);
            $this->logRequest($suggestion, $latencyMs, 'success');

        } catch (\Throwable $e) {
            $latencyMs = (int) ((microtime(true) - $startTime) * 1000);
            $fallback  = $this->buildFallback($input, $e->getMessage());

            $suggestion->update([
                'status'               => AiContentSuggestionStatusEnum::FAILED,
                'error_message'        => mb_substr($e->getMessage(), 0, 500),
                'short_caption'        => $fallback->shortCaption,
                'professional_caption' => $fallback->professionalCaption,
                'viral_caption'        => $fallback->viralCaption,
                'hashtags'             => $fallback->hashtags,
                'topic'                => $fallback->topic,
                'category_suggestion'  => $fallback->categorySuggestion,
                'target_audience'      => $fallback->targetAudience,
                'content_intent'       => AiContentIntentEnum::OTHER,
                'confidence_score'     => $fallback->confidenceScore,
                'safety_notes'         => $fallback->safetyNotes,
                'generated_at'         => now(),
            ]);

            $this->logRequest($suggestion, $latencyMs, 'failed', $e->getMessage());
        }
    }

    /**
     * Mark a suggestion as applied and record timestamp.
     */
    public function applySuggestion(AiContentSuggestion $suggestion): AiContentSuggestion
    {
        $suggestion->update(['applied_at' => now()]);

        return $suggestion->fresh();
    }

    // ─── Private helpers ────────────────────────────────────────────────────

    private function checkQuota(int $userId, AiStudioSetting $settings): void
    {
        $userDaily = AiContentSuggestion::where('user_id', $userId)
            ->where('created_at', '>=', now()->startOfDay())
            ->count();

        if ($userDaily >= $settings->daily_limit_per_user) {
            throw new TooManyRequestsException(
                "Daily AI request limit ({$settings->daily_limit_per_user}) reached. Try again tomorrow."
            );
        }

        $globalDaily = AiContentSuggestion::where('created_at', '>=', now()->startOfDay())->count();

        if ($globalDaily >= $settings->global_daily_limit) {
            throw new TooManyRequestsException('Global AI request limit reached. Try again later.');
        }
    }

    private function buildRequestHash(int $userId, AiContentStudioInputData $input): string
    {
        return hash('sha256', $userId . json_encode($input->toArray()));
    }

    private function cacheKey(int $userId, string $hash): string
    {
        return "ai:content-studio:suggestion:{$userId}:{$hash}";
    }

    private function getFromCache(int $userId, string $hash): ?AiContentSuggestion
    {
        $id = Cache::get($this->cacheKey($userId, $hash));
        if (! $id) {
            return null;
        }

        $suggestion = AiContentSuggestion::find($id);

        if ($suggestion && $suggestion->status === AiContentSuggestionStatusEnum::COMPLETED) {
            return $suggestion;
        }

        return null;
    }

    private function storeInCache(int $userId, string $hash, AiContentSuggestion $suggestion): void
    {
        $ttl = (int) config('ai.content_studio.cache_ttl_seconds', 21600);
        Cache::put($this->cacheKey($userId, $hash), $suggestion->id, $ttl);
    }

    private function sanitizeInput(AiContentStudioInputData $input): AiContentStudioInputData
    {
        $maxLen = (int) config('ai.content_studio.max_input_length', 3000);

        return new AiContentStudioInputData(
            videoTitle:       $this->sanitizeField($input->videoTitle, 200),
            videoDescription: $this->sanitizeField($input->videoDescription, 500),
            videoTranscript:  $this->sanitizeField($input->videoTranscript, $maxLen),
            ocrText:          $this->sanitizeField($input->ocrText, 500),
            creatorLanguage:  $input->creatorLanguage,
            videoCategory:    $this->sanitizeField($input->videoCategory, 100),
        );
    }

    private function sanitizeField(?string $value, int $maxLen): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        $value = strip_tags($value);
        $value = (string) preg_replace('/\s+/', ' ', $value);

        return mb_substr(trim($value), 0, $maxLen);
    }

    private function buildUserPrompt(AiContentStudioInputData $input): string
    {
        $replace = [
            '{{video_title}}'       => $input->videoTitle       ?? '[Not provided]',
            '{{video_description}}' => $input->videoDescription ?? '[Not provided]',
            '{{video_transcript}}'  => $input->videoTranscript  ?? '[Not provided]',
            '{{ocr_text}}'          => $input->ocrText          ?? '[Not provided]',
            '{{creator_language}}'  => $input->creatorLanguage,
            '{{video_category}}'    => $input->videoCategory    ?? '[Not specified]',
        ];

        return str_replace(array_keys($replace), array_values($replace), self::USER_PROMPT_TEMPLATE);
    }

    private function parseAndValidate(string $rawText): AiContentStudioOutputData
    {
        $clean = (string) preg_replace('/^```(?:json)?\s*/m', '', $rawText);
        $clean = (string) preg_replace('/```\s*$/m', '', $clean);
        $clean = trim($clean);

        $data = json_decode($clean, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \RuntimeException('Gemini returned invalid JSON: ' . json_last_error_msg());
        }

        $required = [
            'short_caption', 'professional_caption', 'viral_caption',
            'hashtags', 'topic', 'category_suggestion',
            'target_audience', 'content_intent', 'confidence_score',
        ];

        foreach ($required as $field) {
            if (! array_key_exists($field, $data)) {
                throw new \RuntimeException("Missing required field in AI response: {$field}");
            }
        }

        $hashtags = array_map(
            fn ($h) => str_starts_with((string) $h, '#') ? (string) $h : '#' . (string) $h,
            (array) ($data['hashtags'] ?? [])
        );
        $hashtags = array_values(array_unique(array_filter($hashtags)));
        while (count($hashtags) < 10) {
            $hashtags[] = '#content';
        }
        $hashtags = array_slice($hashtags, 0, 10);

        $validIntents = array_column(AiContentIntentEnum::cases(), 'value');
        $intent       = in_array($data['content_intent'] ?? '', $validIntents, true)
            ? $data['content_intent']
            : 'other';

        return new AiContentStudioOutputData(
            shortCaption:        (string) ($data['short_caption']        ?? ''),
            professionalCaption: (string) ($data['professional_caption'] ?? ''),
            viralCaption:        (string) ($data['viral_caption']        ?? ''),
            hashtags:            $hashtags,
            topic:               (string) ($data['topic']                ?? ''),
            categorySuggestion:  (string) ($data['category_suggestion']  ?? 'Other'),
            targetAudience:      (string) ($data['target_audience']      ?? ''),
            contentIntent:       $intent,
            confidenceScore:     (float) max(0, min(1, $data['confidence_score'] ?? 0.5)),
            safetyNotes:         isset($data['safety_notes']) && $data['safety_notes'] !== null
                ? (string) $data['safety_notes']
                : null,
        );
    }

    private function buildFallback(AiContentStudioInputData $input, string $reason): AiContentStudioOutputData
    {
        $title    = $input->videoTitle       ?? 'Video';
        $desc     = $input->videoDescription ?? $title;
        $cat      = $input->videoCategory    ?? 'lifestyle';
        $catLower = strtolower($cat);

        return new AiContentStudioOutputData(
            shortCaption:        $title,
            professionalCaption: $desc,
            viralCaption:        $title,
            hashtags:            [
                "#{$catLower}", '#video', '#content', '#creator',
                '#viral', '#trending', '#fyp', '#foryou', '#share', '#watch',
            ],
            topic:               $catLower,
            categorySuggestion:  $cat ?: 'Other',
            targetAudience:      'General audience',
            contentIntent:       'other',
            confidenceScore:     0.1,
            safetyNotes:         "AI generation failed. Reason: " . mb_substr($reason, 0, 200) . ". Showing fallback suggestions.",
        );
    }

    private function logRequest(AiContentSuggestion $suggestion, int $latencyMs, string $status, ?string $error = null): void
    {
        $channel = (string) config('ai.logging.channel', 'ai');
        $context = [
            'request_id'     => $suggestion->uuid,
            'user_id'        => $suggestion->user_id,
            'provider'       => $suggestion->provider,
            'model'          => $suggestion->model,
            'prompt_version' => $suggestion->prompt_version,
            'request_hash'   => $suggestion->request_hash,
            'latency_ms'     => $latencyMs,
            'status'         => $status,
            'token_usage'    => $suggestion->token_usage,
        ];

        if ($error) {
            $context['error'] = mb_substr($error, 0, 300);
        }

        if ($status === 'success') {
            Log::channel($channel)->info('AI Content Studio request completed', $context);
        } else {
            Log::channel($channel)->error('AI Content Studio request failed', $context);
        }
    }
}
