<?php

namespace App\Console\Commands;

use App\Services\AI\AiModerationService;
use App\Support\JsonPayloadParser;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Junges\Kafka\Contracts\ConsumerMessage;
use Junges\Kafka\Contracts\MessageConsumer;
use Junges\Kafka\Facades\Kafka;

class ModerationResultProcessorCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'moderation:process-results';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Consume AI moderation results from Kafka and apply moderation verdicts.';

    /**
     * ModerationResultProcessorCommand constructor.
     */
    public function __construct(
        private readonly AiModerationService $aiModerationService,
        private readonly JsonPayloadParser $jsonPayloadParser,
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if (! config('services.ai_moderation.enabled')) {
            $this->warn('AI moderation is disabled. Kafka consumer will not start.');

            return self::SUCCESS;
        }

        $bootstrapServers = (string) config('services.ai_moderation.kafka.bootstrap_servers', 'kafka:29092');
        $groupId = (string) config('services.ai_moderation.kafka.result_group_id', 'snapi-ai-moderation-result-consumer');
        $resultTopic = (string) config('services.ai_moderation.kafka.result_topic', 'moderation.result.v1');

        $this->info("Starting moderation result consumer (topic: {$resultTopic}, group: {$groupId})");

        try {
            $consumer = Kafka::consumer([$resultTopic], $groupId, $bootstrapServers)
                ->withAutoCommit(false)
                ->withOption('auto.offset.reset', 'earliest')
                ->withHandler(function (ConsumerMessage $message, MessageConsumer $consumer): void {
                    $payload = $this->jsonPayloadParser->parse($message->getBody());
                    if ($payload === null) {
                        $consumer->commit($message);

                        return;
                    }
                    $this->aiModerationService->applyVerdict($payload);
                    $consumer->commit($message);
                })
                ->build();

            $consumer->consume();
        } catch (\Throwable $exception) {
            Log::error('Kafka moderation consumer stopped unexpectedly', [
                'error' => $exception->getMessage(),
            ]);

            $this->error('Kafka moderation consumer failed: '.$exception->getMessage());

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
