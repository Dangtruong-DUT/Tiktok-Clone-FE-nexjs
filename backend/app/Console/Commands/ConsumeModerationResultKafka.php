<?php

namespace App\Console\Commands;

use App\Services\AiModerationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ConsumeModerationResultKafka extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'moderation:consume-kafka-results';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Consume AI moderation results from Kafka and apply moderation verdicts.';

    /**
     * ConsumeModerationResultKafka constructor.
     */
    public function __construct(
        private readonly AiModerationService $aiModerationService,
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if (!config('services.ai_moderation.enabled')) {
            $this->warn('AI moderation is disabled. Kafka consumer will not start.');
            return self::SUCCESS;
        }

        $bootstrapServers = (string) config('services.ai_moderation.kafka.bootstrap_servers', 'kafka:29092');
        $groupId = (string) config('services.ai_moderation.kafka.result_group_id', 'snapi-ai-moderation-result-consumer');
        $resultTopic = (string) config('services.ai_moderation.kafka.result_topic', 'moderation.result.v1');
        $brokerVersion = (string) config('services.ai_moderation.kafka.broker_version', '3.6.0');
        $consumerConfigClass = 'Kafka\\ConsumerConfig';
        $consumerClass = 'Kafka\\Consumer';

        if (!class_exists($consumerConfigClass) || !class_exists($consumerClass)) {
            $this->error('Kafka PHP client is missing. Install a compatible package that provides Kafka\\ConsumerConfig and Kafka\\Consumer.');
            return self::FAILURE;
        }

        $this->info("Starting moderation result consumer (topic: {$resultTopic}, group: {$groupId})");

        $consumerConfig = $consumerConfigClass::getInstance();
        $consumerConfig->setMetadataBrokerList($bootstrapServers);
        $consumerConfig->setGroupId($groupId);
        $consumerConfig->setTopics([$resultTopic]);
        $consumerConfig->setBrokerVersion($brokerVersion);
        $consumerConfig->setOffsetReset('earliest');
        $consumerConfig->setEnableAutoCommit(true);

        $consumer = new $consumerClass();

        try {
            $consumer->start(function ($topic, $part, $message): void {
                $payload = $this->extractPayload($message);
                if ($payload === null) {
                    Log::warning('Kafka moderation message ignored due to invalid payload', [
                        'topic' => $topic,
                        'partition' => $part,
                    ]);
                    return;
                }

                $this->aiModerationService->applyVerdict($payload);
            });
        } catch (\Throwable $exception) {
            Log::error('Kafka moderation consumer stopped unexpectedly', [
                'error' => $exception->getMessage(),
            ]);

            $this->error('Kafka moderation consumer failed: ' . $exception->getMessage());
            return self::FAILURE;
        }

        return self::SUCCESS;
    }

    /**
     * @param mixed $message
     * @return array<string,mixed>|null
     */
    private function extractPayload(mixed $message): ?array
    {
        $rawValue = null;

        if (is_object($message) && isset($message->value)) {
            $rawValue = $message->value;
        } elseif (is_array($message) && array_key_exists('value', $message)) {
            $rawValue = $message['value'];
        }

        if (is_array($rawValue)) {
            return $rawValue;
        }

        if (!is_string($rawValue)) {
            return null;
        }

        $decoded = json_decode($rawValue, true);
        if (!is_array($decoded)) {
            return null;
        }

        return $decoded;
    }
}
