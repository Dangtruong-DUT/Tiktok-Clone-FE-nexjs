<?php

namespace App\Services\AI\Copilot\Gateway;

/**
 * Structured output from the AI Gateway.
 * Represents the classified task intent and routing metadata extracted by Gemini.
 *
 * @property list<string>        $entities
 * @property array<string,mixed> $filters
 */
final readonly class GatewayTask
{
    /**
     * @param  list<string>        $entities
     * @param  array<string,mixed> $filters
     */
    public function __construct(
        public string  $taskType,
        public string  $scope,
        public string  $subject,
        public string  $intent,
        public array   $entities,
        public array   $filters,
        public ?string $period,
        public ?string $compareWith,
        public bool    $needsTools,
        public bool    $needsRag,
        public bool    $needsClarification,
        public ?string $clarificationQuestion,
        public float   $confidence,
    ) {}

    /**
     * Build GatewayTask from raw decoded JSON payload.
     * Validates enum-like fields and applies scope-based subject defaults.
     *
     * @param  array<string,mixed>  $payload
     */
    public static function fromArray(array $payload): self
    {
        $validTaskTypes = ['content_generation', 'app_knowledge', 'navigation', 'analytics', 'video_review', 'unknown'];
        $validScopes    = ['creator', 'admin', 'system', 'public'];
        $validSubjects  = ['self', 'platform', 'specific_user', 'specific_post', 'specific_video'];

        $scope   = in_array($payload['scope'] ?? '', $validScopes, true) ? $payload['scope'] : 'creator';
        $subject = in_array($payload['subject'] ?? '', $validSubjects, true)
            ? $payload['subject']
            : match ($scope) {
                'admin', 'system' => 'platform',
                default           => 'self',
            };

        return new self(
            taskType:              in_array($payload['task_type'] ?? '', $validTaskTypes, true) ? $payload['task_type'] : 'unknown',
            scope:                 $scope,
            subject:               $subject,
            intent:                (string) ($payload['intent'] ?? 'unclear'),
            entities:              (array)  ($payload['entities'] ?? []),
            filters:               (array)  ($payload['filters'] ?? []),
            period:                $payload['period'] ?? null,
            compareWith:           $payload['compare_with'] ?? null,
            needsTools:            (bool)   ($payload['needs_tools'] ?? false),
            needsRag:              (bool)   ($payload['needs_rag'] ?? false),
            needsClarification:    (bool)   ($payload['needs_clarification'] ?? false),
            clarificationQuestion: $payload['clarification_question'] ?? null,
            confidence:            (float)  ($payload['confidence'] ?? 0.0),
        );
    }

    /**
     * Build the canonical unknown/clarification fallback task.
     * Used when Gemini JSON parse fails or returns an invalid task_type.
     */
    public static function unknown(): self
    {
        return new self(
            taskType:              'unknown',
            scope:                 'creator',
            subject:               'self',
            intent:                'unclear',
            entities:              [],
            filters:               [],
            period:                null,
            compareWith:           null,
            needsTools:            false,
            needsRag:              false,
            needsClarification:    true,
            clarificationQuestion: (string) trans('copilot.messages.clarification'),
            confidence:            0.0,
        );
    }
}
