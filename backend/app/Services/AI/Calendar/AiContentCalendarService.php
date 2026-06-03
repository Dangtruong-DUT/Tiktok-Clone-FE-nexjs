<?php

namespace App\Services\AI\Calendar;

use App\Enums\Ai\AiContentSuggestionStatusEnum;
use App\Enums\Ai\CalendarItemStatusEnum;
use App\Enums\Post\PostPublishStatusEnum;
use App\Exceptions\http\UnprocessableException;
use App\Jobs\AI\GenerateAiContentCalendarJob;
use App\Models\AiContentCalendar;
use App\Models\AiContentCalendarItem;
use App\Models\Post;
use App\Repositories\AiContentCalendarItemRepository;
use App\Repositories\AiContentCalendarRepository;
use App\Services\AI\AiPromptBuilderService;
use App\Services\AI\GeminiAiService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class AiContentCalendarService
{
    public function __construct(
        private readonly AiContentCalendarRepository     $calendarRepository,
        private readonly AiContentCalendarItemRepository $itemRepository,
        private readonly GeminiAiService                 $gemini,
        private readonly AiPromptBuilderService          $promptBuilder,
    ) {}

    public function initiateAsync(int $userId, array $input): AiContentCalendar
    {
        /** @var AiContentCalendar */
        $calendar = $this->calendarRepository->create([
            'uuid'              => (string) Str::uuid(),
            'user_id'           => $userId,
            'niche'             => $input['niche']             ?? null,
            'content_style'     => $input['content_style']     ?? null,
            'posting_frequency' => $input['posting_frequency'] ?? null,
            'primary_goals'     => $input['primary_goals']     ?? [],
            'target_audience'   => $input['target_audience']   ?? null,
            'creator_language'  => $input['creator_language']  ?? 'vi',
            'status'            => AiContentSuggestionStatusEnum::PENDING,
        ]);

        GenerateAiContentCalendarJob::dispatch($calendar->id);

        return $calendar;
    }

    public function generate(AiContentCalendar $calendar): void
    {
        $this->calendarRepository->update($calendar->id, [
            'status' => AiContentSuggestionStatusEnum::PROCESSING,
        ]);

        try {
            $systemPrompt = $this->promptBuilder->contentCalendarSystem();
            $userPrompt   = $this->promptBuilder->contentCalendarUser([
                'niche'              => $calendar->niche,
                'content_style'      => $calendar->content_style,
                'posting_frequency'  => $calendar->posting_frequency,
                'primary_goals'      => $calendar->primary_goals ?? [],
                'target_audience'    => $calendar->target_audience,
                'creator_language'   => $calendar->creator_language,
            ]);

            $result = $this->gemini->generateJson($systemPrompt, $userPrompt, ['items']);
            $data   = $result['data'];
            $items  = (array) ($data['items'] ?? []);

            $updated = $this->calendarRepository->update($calendar->id, [
                'status'         => AiContentSuggestionStatusEnum::COMPLETED,
                'weekly_themes'  => $data['weekly_themes']  ?? [],
                'strategy_notes' => $data['strategy_notes'] ?? null,
                'token_usage'    => $result['token_usage'],
                'generated_at'   => now(),
                'error_message'  => null,
            ]);

            foreach ($items as $itemData) {
                $this->itemRepository->create([
                    'uuid'                     => (string) Str::uuid(),
                    'calendar_id'              => $calendar->id,
                    'user_id'                  => $calendar->user_id,
                    'day_of_week'              => (int) ($itemData['day_of_week'] ?? 1),
                    'content_idea'             => (string) ($itemData['content_idea'] ?? ''),
                    'suggested_format'         => $itemData['suggested_format']         ?? null,
                    'suggested_hashtags'       => $itemData['suggested_hashtags']       ?? [],
                    'caption_draft'            => $itemData['caption_draft']            ?? null,
                    'hook_idea'                => $itemData['hook_idea']                ?? null,
                    'estimated_virality_score' => (float) ($itemData['estimated_virality_score'] ?? 0),
                    'status'                   => CalendarItemStatusEnum::IDEA,
                ]);
            }

        } catch (\Throwable $e) {
            $this->calendarRepository->update($calendar->id, [
                'status'        => AiContentSuggestionStatusEnum::FAILED,
                'error_message' => mb_substr($e->getMessage(), 0, 500),
                'generated_at'  => now(),
            ]);
        }
    }

    public function createDraftPost(AiContentCalendarItem $item, int $userId): AiContentCalendarItem
    {
        if ($item->draft_post_id) {
            throw new UnprocessableException('A draft post already exists for this calendar item.');
        }

        /** @var Post */
        $post = Post::create([
            'user_id'      => $userId,
            'content'      => $item->caption_draft ?? $item->content_idea,
            'type'         => \App\Enums\Post\PostTypeEnum::POST,
            'audience'     => \App\Enums\Post\AudienceTypeEnum::PUBLIC,
            'status'       => PostPublishStatusEnum::DRAFT,
        ]);

        /** @var AiContentCalendarItem */
        return $this->itemRepository->update($item->id, [
            'draft_post_id' => $post->id,
            'status'        => CalendarItemStatusEnum::DRAFT,
        ]);
    }

    public function findCalendarForUser(string $uuid, int $userId): AiContentCalendar
    {
        return $this->calendarRepository->findByUuidAndUserOrFail($uuid, $userId);
    }

    public function findItemForUser(string $uuid, int $userId): AiContentCalendarItem
    {
        return $this->itemRepository->findByUuidAndUserOrFail($uuid, $userId);
    }

    public function paginateCalendarsForUser(int $userId, int $perPage): LengthAwarePaginator
    {
        return $this->calendarRepository->paginateByUser($userId, $perPage);
    }
}
