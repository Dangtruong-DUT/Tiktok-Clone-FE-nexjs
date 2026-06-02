<?php

namespace App\Jobs\AI;

use App\Models\AiCreatorConversation;
use App\Services\AI\Conversation\AiCreatorChatService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateAiCreatorContentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 2;
    public int $timeout = 120;

    public function __construct(
        private readonly int $conversationId,
    ) {
        $this->onQueue((string) config('ai.content_studio.queue', 'ai-content'));
    }

    public function handle(AiCreatorChatService $service): void
    {
        $conversation = AiCreatorConversation::findOrFail($this->conversationId);
        $service->generateContent($conversation);
    }
}
