<?php

namespace App\DTOs\AI;

final readonly class CopilotHandlerResult
{
    public function __construct(
        public string  $text,
        public ?array  $structuredOutput = null,
        public array   $followUpChips    = [],
        public ?string $targetField      = null,
        public array   $tokenUsage       = [],
        public ?int    $latencyMs        = null,
    ) {}
}
