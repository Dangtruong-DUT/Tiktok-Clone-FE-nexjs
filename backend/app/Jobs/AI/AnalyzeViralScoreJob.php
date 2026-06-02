<?php

namespace App\Jobs\AI;

use App\Models\AiViralScore;
use App\Services\AI\ViralScore\AiViralScoreService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class AnalyzeViralScoreJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 2;
    public int $timeout = 90;

    public function __construct(
        private readonly int $viralScoreId,
    ) {
        $this->onQueue((string) config('ai.content_studio.queue', 'ai-content'));
    }

    public function handle(AiViralScoreService $service): void
    {
        $score = AiViralScore::findOrFail($this->viralScoreId);
        $service->analyze($score);
    }
}
