<?php

namespace App\Services;

use App\Exceptions\http\BusinessException;
use App\Models\WellnessRule;
use App\Repositories\WellnessRuleRepository;
use App\Services\WellnessAiService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WellnessRuleService
{
    private const MAX_RULES_PER_USER = 10;

    /**
     * Create a new service instance.
     *
     * @param  WellnessRuleRepository  $repository
     * @param  WellnessAiService  $aiService
     * @param  ScreenTimeTrackingService  $screenTimeService
     */
    public function __construct(
        private readonly WellnessRuleRepository    $repository,
        private readonly WellnessAiService         $aiService,
        private readonly ScreenTimeTrackingService $screenTimeService,
    ) {}

    /**
     * Get all wellness rules for a user.
     *
     * @param  int  $userId
     * @return Collection<int,WellnessRule>
     */
    public function listForUser(int $userId): Collection
    {
        return $this->repository->getForUser($userId);
    }

    /**
     * Create a new wellness rule for a user.
     *
     * @param  int  $userId
     * @param  array<string,mixed>  $data
     * @return WellnessRule
     */
    public function create(int $userId, array $data): WellnessRule
    {
        return DB::transaction(function () use ($userId, $data): WellnessRule {
            // Lock the user's existing rules to prevent race-condition over-count
            WellnessRule::where('user_id', $userId)->lockForUpdate()->count();

            if ($this->repository->countForUser($userId) >= self::MAX_RULES_PER_USER) {
                throw new BusinessException(
                    'Maximum rule limit (' . self::MAX_RULES_PER_USER . ') reached. Delete an existing rule first.'
                );
            }

            /** @var WellnessRule */
            return $this->repository->create([
                'uuid'                   => (string) Str::uuid(),
                'user_id'                => $userId,
                'type'                   => $data['type'],
                'conditions'             => $data['conditions'],
                'action'                 => $data['action'],
                'title'                  => $data['title'],
                'message'                => $data['message'],
                'is_enabled'             => $data['is_enabled'] ?? true,
                'natural_language_input' => $data['natural_language_input'] ?? null,
            ]);
        });
    }

    /**
     * Update an existing wellness rule.
     *
     * @param  WellnessRule  $rule
     * @param  array<string,mixed>  $data
     * @return WellnessRule
     */
    public function update(WellnessRule $rule, array $data): WellnessRule
    {
        /** @var WellnessRule */
        return $this->repository->update($rule->id, [
            'type'       => $data['type']       ?? $rule->type,
            'conditions' => $data['conditions'] ?? $rule->conditions,
            'action'     => $data['action']     ?? $rule->action,
            'title'      => $data['title']      ?? $rule->title,
            'message'    => $data['message']    ?? $rule->message,
            'is_enabled' => $data['is_enabled'] ?? $rule->is_enabled,
        ]);
    }

    /**
     * Delete a wellness rule.
     *
     * @param  WellnessRule  $rule
     * @return void
     */
    public function delete(WellnessRule $rule): void
    {
        $this->repository->delete($rule->id);
    }

    /**
     * Fetch the user's screen-time stats and return AI-generated wellness insights.
     *
     * @param  int  $userId
     * @param  string  $period
     * @return array{summary: string, patterns: string[], concerns: string[], recommendations: string[], suggested_rules: array[]}
     */
    public function analyzeUsage(int $userId, string $period = 'week'): array
    {
        $stats = $this->screenTimeService->getStats($userId, $period);

        return $this->aiService->analyzeUsage($stats);
    }

    /**
     * Parse natural-language rule text and return a preview without saving it.
     *
     * @param  string  $text
     * @return array<string,mixed>
     */
    public function parseNaturalLanguage(string $text): array
    {
        return $this->aiService->parseRule($text);
    }

    /**
     * Find a wellness rule by UUID for the given user.
     *
     * @param  string  $uuid
     * @param  int  $userId
     * @return WellnessRule
     */
    public function findByUuidForUser(string $uuid, int $userId): WellnessRule
    {
        return $this->repository->findByUuidAndUserOrFail($uuid, $userId);
    }
}
