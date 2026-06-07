<?php

namespace App\Services;

use App\Models\WellnessRule;
use App\Repositories\WellnessRuleRepository;
use App\Services\WellnessAiService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class WellnessRuleService
{
    private const MAX_RULES_PER_USER = 10;

    public function __construct(
        private readonly WellnessRuleRepository    $repository,
        private readonly WellnessAiService         $aiService,
        private readonly ScreenTimeTrackingService $screenTimeService,
    ) {}

    public function listForUser(int $userId): Collection
    {
        return $this->repository->getForUser($userId);
    }

    public function create(int $userId, array $data): WellnessRule
    {
        if ($this->repository->countForUser($userId) >= self::MAX_RULES_PER_USER) {
            throw new \RuntimeException('Maximum rule limit (' . self::MAX_RULES_PER_USER . ') reached. Delete an existing rule first.');
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
    }

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

    public function delete(WellnessRule $rule): void
    {
        $this->repository->delete($rule->id);
    }

    /**
     * Fetch the user's screen-time stats and return AI-generated wellness insights.
     *
     * @return array{summary: string, patterns: string[], concerns: string[], recommendations: string[], suggested_rules: array[]}
     */
    public function analyzeUsage(int $userId, string $period = 'week'): array
    {
        $stats = $this->screenTimeService->getStats($userId, $period);

        return $this->aiService->analyzeUsage($stats);
    }

    /** Parse natural language rule text — does NOT save, returns preview. */
    public function parseNaturalLanguage(string $text): array
    {
        return $this->aiService->parseRule($text);
    }

    public function findByUuidForUser(string $uuid, int $userId): WellnessRule
    {
        return $this->repository->findByUuidAndUserOrFail($uuid, $userId);
    }
}
