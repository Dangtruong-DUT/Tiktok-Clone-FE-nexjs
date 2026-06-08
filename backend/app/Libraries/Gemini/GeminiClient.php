<?php

namespace App\Libraries\Gemini;

use App\Contracts\AI\GeminiClientInterface;
use App\Exceptions\http\BusinessException;
use App\DTOs\AI\Gemini\GeminiRequest;
use App\DTOs\AI\Gemini\GeminiResponse;
use Gemini\Contracts\ClientContract as VendorGeminiClient;
use Gemini\Enums\TaskType;
use Gemini\Responses\GenerativeModel\GenerateContentResponse;
use Illuminate\Support\Facades\Log;

class GeminiClient implements GeminiClientInterface
{
    public function __construct(
        private readonly VendorGeminiClient $client,
        private readonly GeminiRequestBuilder $requestBuilder,
        private readonly GeminiResponseParser $responseParser,
    ) {}

    /**
     * Sends a GeminiRequest and returns a GeminiResponse.
      * Handles both single-response and streaming interactions based on the request configuration.
      * For streaming requests, the $onChunk callback is invoked with each new content delta and final token usage when the stream ends.
      * @param GeminiRequest $request The request object containing system prompt, user contents, and generation configuration.
      * @return GeminiResponse The response object containing
     */
    public function send(GeminiRequest $request): GeminiResponse
    {
        $response = $this->withRetry(function () use ($request) {
            [$history, $lastParts] = $this->requestBuilder->splitContents($request->contents);

            $model = $this->client->generativeModel(model: $request->config->model)
                ->withSystemInstruction($this->requestBuilder->systemInstruction($request->systemPrompt))
                ->withGenerationConfig($this->requestBuilder->generationConfig($request->config));

            $userContent = $this->requestBuilder->userContentFromParts($lastParts);

            if ($history === []) {
                return $model->generateContent($userContent);
            }

            return $model->startChat(history: $history)
                ->sendMessage($userContent);
        });

        return new GeminiResponse(
            text:       $this->responseParser->text($response),
            tokenUsage: $this->responseParser->usage($response->usageMetadata),
        );
    }

    /**
     * @phpstan-import-type GeminiStreamChunkHandler from GeminiClientInterface
     * @phpstan-import-type GeminiTokenUsage from GeminiClientInterface
     *
     * @param GeminiStreamChunkHandler $onChunk
     */
    public function stream(GeminiRequest $request, callable $onChunk): GeminiResponse
    {
        $tokenUsage = $this->withRetry(function () use ($request, $onChunk) {
            [$history, $lastParts] = $this->requestBuilder->splitContents($request->contents);

            $model = $this->client->generativeModel(model: $request->config->model)
                ->withSystemInstruction($this->requestBuilder->systemInstruction($request->systemPrompt))
                ->withGenerationConfig($this->requestBuilder->generationConfig($request->config));

            $userContent = $this->requestBuilder->userContentFromParts($lastParts);

            $stream = $history === []
                ? $model->streamGenerateContent($userContent)
                : $model->startChat(history: $history)->streamSendMessage($userContent);

            return $this->consumeStream($stream, $onChunk);
        });

        return new GeminiResponse(text: '', tokenUsage: $tokenUsage);
    }

    /**
     * @phpstan-import-type GeminiStreamChunkHandler from GeminiClientInterface
     * @phpstan-import-type GeminiTokenUsage from GeminiClientInterface
     *
     * @param GeminiStreamChunkHandler $onChunk
     * @return GeminiTokenUsage
     */
    private function consumeStream(iterable $stream, callable $onChunk): array
    {
        $tokenUsage = ['prompt_tokens' => 0, 'completion_tokens' => 0, 'total_tokens' => 0];

        foreach ($stream as $chunk) {
            if (! $chunk instanceof GenerateContentResponse) {
                continue;
            }

            $tokenUsage = $this->responseParser->usage($chunk->usageMetadata);
            $delta = $this->responseParser->streamDelta($chunk);

            if ($delta !== '') {
                $onChunk($delta, false, $tokenUsage);
            }
        }

        $onChunk('', true, $tokenUsage);

        return $tokenUsage;
    }

    /**
     * Generate a text embedding vector using the configured embedding model.
     *
     * @return float[]
     */
    public function embed(string $text, string $taskType = 'RETRIEVAL_QUERY'): array
    {
        $model = config('gemini.embedding.model', 'text-embedding-004');

        $response = $this->withRetry(
            fn () => $this->client->embeddingModel($model)
                ->embedContent($text, TaskType::from($taskType))
        );

        return $response->embedding->values;
    }

    private function withRetry(\Closure $call): mixed
    {
        $lastException = null;
        $maxRetries    = (int) config('gemini.retry.max_retries', 2);
        $retryDelayMs  = (int) config('gemini.retry.retry_delay_ms', 1000);

        for ($attempt = 1; $attempt <= $maxRetries + 1; $attempt++) {
            try {
                return $call();
            } catch (BusinessException $e) {
                throw $e;
            } catch (\RuntimeException $e) {
                $lastException = $e;

                if ($attempt <= $maxRetries) {
                    usleep($retryDelayMs * 1000 * $attempt);
                    Log::channel(config('ai.logging.channel', 'stack'))->warning('Gemini transient failure, retrying', [
                        'attempt' => $attempt,
                        'error'   => mb_substr($e->getMessage(), 0, 200),
                    ]);
                }
            }
        }

        throw $lastException ?? new \RuntimeException('Gemini generation failed after retries.');
    }
}
