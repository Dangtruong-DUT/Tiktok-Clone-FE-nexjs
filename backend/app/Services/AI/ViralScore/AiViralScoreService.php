<?php

namespace App\Services\AI\ViralScore;

use App\Enums\Ai\AiContentSuggestionStatusEnum;
use App\Enums\Ai\ViralScoreLevelEnum;
use App\Models\AiViralScore;
use App\Repositories\AiViralScoreRepository;
use App\Services\AI\AiPromptBuilderService;
use App\Services\AI\GeminiAiService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AiViralScoreService
{
    private const CACHE_TTL_SECONDS = 600;

    /**
     * Weighted contribution of each dimension to overall_score.
     * Must sum to 1.0.
     */
    private const DIMENSION_WEIGHTS = [
        'hook_strength'      => 0.30,
        'engagement_trigger' => 0.25,
        'hashtag_quality'    => 0.20,
        'audience_clarity'   => 0.15,
        'format_fit'         => 0.10,
    ];

    public function __construct(
        private readonly AiViralScoreRepository $repository,
        private readonly GeminiAiService        $gemini,
        private readonly AiPromptBuilderService $promptBuilder,
    ) {}

    public function initiateAsync(int $userId, string $caption, array $hashtags): AiViralScore
    {
        $hash = $this->buildHash($userId, $caption, $hashtags);

        if ($cached = $this->getFromCache($hash)) {
            return $cached;
        }

        /** @var AiViralScore */
        return $this->repository->create([
            'uuid'     => (string) Str::uuid(),
            'user_id'  => $userId,
            'caption'  => $caption,
            'hashtags' => $hashtags,
            'status'   => AiContentSuggestionStatusEnum::PENDING,
        ]);
    }

    public function analyze(AiViralScore $score): void
    {
        $this->repository->update($score->id, ['status' => AiContentSuggestionStatusEnum::PROCESSING]);

        try {
            $this->analyzeWithGemini($score);
        } catch (\Throwable $e) {
            // Gemini failed — fall back to rule-based scoring so the user always gets a result
            $this->analyzeWithRules($score, $e->getMessage());
        }
    }

    public function findByUuidForUser(string $uuid, int $userId): AiViralScore
    {
        return $this->repository->findByUuidAndUserOrFail($uuid, $userId);
    }

    // ── Private: Gemini path ─────────────────────────────────────────────────

    private function analyzeWithGemini(AiViralScore $score): void
    {
        $result = $this->gemini->generateJson(
            $this->promptBuilder->viralScoreSystem(),
            $this->promptBuilder->viralScoreUser($score->caption ?? '', $score->hashtags ?? []),
            ['breakdown'],
        );

        $data      = $result['data'];
        $breakdown = $this->normalizeBreakdown((array) ($data['breakdown'] ?? []));

        // overall_score is calculated deterministically — never trusted from AI
        $overallScore = $this->weightedScore($breakdown);
        $level        = ViralScoreLevelEnum::fromScore($overallScore);

        $updated = $this->repository->update($score->id, [
            'status'             => AiContentSuggestionStatusEnum::COMPLETED,
            'overall_score'      => $overallScore,
            'level'              => $level,
            'breakdown'          => $breakdown,
            'strengths'          => array_values(array_filter((array) ($data['strengths']       ?? []))),
            'weaknesses'         => array_values(array_filter((array) ($data['weaknesses']      ?? []))),
            'recommendations'    => array_values(array_filter((array) ($data['recommendations'] ?? []))),
            'improved_caption'   => $data['improved_caption']   ?? null,
            'suggested_hashtags' => $data['suggested_hashtags'] ?? [],
            'token_usage'        => $result['token_usage'],
            'analyzed_at'        => now(),
            'error_message'      => null,
        ]);

        $hash = $this->buildHash($score->user_id, $score->caption ?? '', $score->hashtags ?? []);
        Cache::put($this->cacheKey($hash), $updated->id, self::CACHE_TTL_SECONDS);
    }

    // ── Private: Rule-based fallback ─────────────────────────────────────────

    private function analyzeWithRules(AiViralScore $score, string $geminiError): void
    {
        $caption   = $score->caption ?? '';
        $hashtags  = $score->hashtags ?? [];
        $breakdown = $this->ruleBasedBreakdown($caption, $hashtags);

        $overallScore = $this->weightedScore($breakdown);
        $level        = ViralScoreLevelEnum::fromScore($overallScore);

        $this->repository->update($score->id, [
            'status'          => AiContentSuggestionStatusEnum::COMPLETED,
            'overall_score'   => $overallScore,
            'level'           => $level,
            'breakdown'       => $breakdown,
            'strengths'       => $this->ruleBasedStrengths($breakdown),
            'weaknesses'      => $this->ruleBasedWeaknesses($breakdown),
            'recommendations' => ['Thêm hook hấp dẫn ở câu đầu', 'Dùng 5–10 hashtag phù hợp chủ đề và niche'],
            'error_message'   => 'AI analysis unavailable, showing rule-based estimate. Reason: ' . mb_substr($geminiError, 0, 100),
            'analyzed_at'     => now(),
        ]);
    }

    // ── Private: Scoring helpers ─────────────────────────────────────────────

    /**
     * Calculates overall_score as a fixed weighted average of breakdown dimensions.
     * This is the single source of truth for the score — never use AI-reported overall_score.
     */
    private function weightedScore(array $breakdown): float
    {
        $score = 0.0;

        foreach (self::DIMENSION_WEIGHTS as $dimension => $weight) {
            $score += ($breakdown[$dimension] ?? 0) * $weight;
        }

        return round(max(0, min(100, $score)), 2);
    }

    /**
     * Clamps each dimension to [0, 100] and ensures all expected keys are present.
     *
     * @param  array<string,mixed>  $raw
     * @return array<string,float>
     */
    private function normalizeBreakdown(array $raw): array
    {
        $normalized = [];

        foreach (array_keys(self::DIMENSION_WEIGHTS) as $dimension) {
            $normalized[$dimension] = (float) max(0, min(100, $raw[$dimension] ?? 0));
        }

        return $normalized;
    }

    /**
     * Deterministic rule-based breakdown — used as fallback when Gemini is unavailable.
     *
     * @return array<string,float>
     */
    private function ruleBasedBreakdown(string $caption, array $hashtags): array
    {
        $len          = mb_strlen($caption);
        $hashtagCount = count($hashtags);
        $hasQuestion  = str_contains($caption, '?');
        $hasExclaim   = str_contains($caption, '!');
        $hasEmoji     = (bool) preg_match('/[\x{1F300}-\x{1FAFF}]/u', $caption);
        $hasCta       = (bool) preg_match('/\b(xem|thả tim|chia sẻ|follow|like|comment|watch|share|subscribe)\b/ui', $caption);
        $capsRatio    = $len > 0
            ? mb_strlen(preg_replace('/[^A-Z]/u', '', $caption)) / $len
            : 0;

        // hook_strength: first ~50 chars matter most
        $firstLine   = mb_substr($caption, 0, 50);
        $hookScore   = 30.0
            + ($hasQuestion ? 20 : 0)
            + ($hasExclaim  ? 15 : 0)
            + ($hasEmoji    ? 15 : 0)
            + (str_contains($firstLine, '?') || str_contains($firstLine, '!') ? 10 : 0)
            - ($capsRatio > 0.5 ? 15 : 0);

        // hashtag_quality: optimal 5–10
        $hashtagScore = match (true) {
            $hashtagCount === 0  => 5.0,
            $hashtagCount < 3    => 30.0,
            $hashtagCount <= 10  => 70.0,
            $hashtagCount <= 15  => 55.0,
            default              => 35.0,
        };

        // audience_clarity: hard to judge without AI context — moderate default
        $audienceScore = 45.0;

        // engagement_trigger
        $engagementScore = 35.0
            + ($hasQuestion ? 20 : 0)
            + ($hasCta      ? 20 : 0)
            + ($hasEmoji    ? 10 : 0)
            - ($capsRatio > 0.5 ? 10 : 0);

        // format_fit: penalize extremes in length
        $formatScore = match (true) {
            $len < 20   => 20.0,
            $len < 50   => 45.0,
            $len <= 200 => 70.0,
            $len <= 300 => 55.0,
            default     => 35.0,
        };

        return [
            'hook_strength'      => (float) max(0, min(100, $hookScore)),
            'hashtag_quality'    => (float) max(0, min(100, $hashtagScore)),
            'audience_clarity'   => (float) max(0, min(100, $audienceScore)),
            'engagement_trigger' => (float) max(0, min(100, $engagementScore)),
            'format_fit'         => (float) max(0, min(100, $formatScore)),
        ];
    }

    /** @return string[] */
    private function ruleBasedStrengths(array $breakdown): array
    {
        $strengths = [];

        if ($breakdown['hook_strength'] >= 60) {
            $strengths[] = 'Hook mở đầu có tiềm năng thu hút người xem.';
        }
        if ($breakdown['hashtag_quality'] >= 60) {
            $strengths[] = 'Số lượng và độ đa dạng hashtag ở mức tốt.';
        }
        if ($breakdown['engagement_trigger'] >= 60) {
            $strengths[] = 'Caption có yếu tố kích thích tương tác.';
        }

        return $strengths ?: ['Caption có nội dung cơ bản.'];
    }

    /** @return string[] */
    private function ruleBasedWeaknesses(array $breakdown): array
    {
        $weaknesses = [];

        if ($breakdown['hook_strength'] < 50) {
            $weaknesses[] = 'Hook chưa đủ hấp dẫn để dừng scroll.';
        }
        if ($breakdown['hashtag_quality'] < 50) {
            $weaknesses[] = 'Hashtag quá ít hoặc quá nhiều so với mức tối ưu (5–10).';
        }
        if ($breakdown['engagement_trigger'] < 50) {
            $weaknesses[] = 'Thiếu call-to-action hoặc yếu tố tương tác.';
        }
        if ($breakdown['format_fit'] < 50) {
            $weaknesses[] = 'Độ dài caption chưa phù hợp nền tảng short-form.';
        }

        return $weaknesses;
    }

    // ── Private: Cache helpers ───────────────────────────────────────────────

    private function buildHash(int $userId, string $caption, array $hashtags): string
    {
        return hash('sha256', $userId . $caption . implode('', $hashtags));
    }

    private function cacheKey(string $hash): string
    {
        return "ai:viral-score:{$hash}";
    }

    private function getFromCache(string $hash): ?AiViralScore
    {
        $id = Cache::get($this->cacheKey($hash));
        if (! $id) {
            return null;
        }

        /** @var AiViralScore|null */
        $record = $this->repository->find((int) $id);

        return ($record && $record->status === AiContentSuggestionStatusEnum::COMPLETED)
            ? $record
            : null;
    }
}