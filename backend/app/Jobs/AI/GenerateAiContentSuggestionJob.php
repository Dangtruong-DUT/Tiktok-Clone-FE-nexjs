<?php

namespace App\Jobs\AI;

use App\DTOs\AI\AiContentStudioInputData;
use App\Enums\Ai\AiContentSuggestionStatusEnum;
use App\Models\AiContentSuggestion;
use App\Services\AI\ContentStudio\AiContentStudioService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateAiContentSuggestionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /** @var int Maximum attempts before marking as failed. */
    public int $tries = 3;

    /** @var int Max execution time in seconds. */
    public int $timeout = 120;

    /** @var array<int,int> Seconds between retry attempts. */
    public array $backoff = [30, 60, 120];

    /**
     * @param  int                       $suggestionId  DB id of the AiContentSuggestion record.
     * @param  int                       $userId
     * @param  AiContentStudioInputData  $input
     */
    public function __construct(
        private readonly int $suggestionId,
        private readonly int $userId,
        private readonly AiContentStudioInputData $input,
    ) {
        $this->onQueue((string) config('ai.content_studio.queue', 'ai-content'));
    }

    /**
     * Execute the AI generation pipeline.
     */
    public function handle(AiContentStudioService $service): void
    {
        $suggestion = AiContentSuggestion::find($this->suggestionId);

        if (! $suggestion) {
            Log::channel((string) config('ai.logging.channel', 'ai'))->warning(
                'GenerateAiContentSuggestionJob: suggestion record not found.',
                ['suggestion_id' => $this->suggestionId]
            );

            return;
        }

        if ($suggestion->status === AiContentSuggestionStatusEnum::COMPLETED) {
            return;
        }

        $service->generate($suggestion, $this->input);
    }

    /**
     * Handle permanent failure after all retries exhausted.
     */
    public function failed(\Throwable $e): void
    {
        Log::channel((string) config('ai.logging.channel', 'ai'))->error(
            'GenerateAiContentSuggestionJob permanently failed.',
            [
                'suggestion_id' => $this->suggestionId,
                'error'         => $e->getMessage(),
            ]
        );

        AiContentSuggestion::find($this->suggestionId)?->update([
            'status'        => AiContentSuggestionStatusEnum::FAILED,
            'error_message' => 'Job exhausted all retries: ' . mb_substr($e->getMessage(), 0, 300),
        ]);
    }
}
