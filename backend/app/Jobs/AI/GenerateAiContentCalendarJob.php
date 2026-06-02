<?php

namespace App\Jobs\AI;

use App\Models\AiContentCalendar;
use App\Services\AI\Calendar\AiContentCalendarService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateAiContentCalendarJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 2;
    public int $timeout = 120;

    public function __construct(
        private readonly int $calendarId,
    ) {
        $this->onQueue((string) config('ai.content_studio.queue', 'ai-content'));
    }

    public function handle(AiContentCalendarService $service): void
    {
        $calendar = AiContentCalendar::findOrFail($this->calendarId);
        $service->generate($calendar);
    }
}
