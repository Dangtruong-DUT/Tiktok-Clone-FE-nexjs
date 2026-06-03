<?php

namespace App\Http\Controllers\Api\Studio;

use App\Http\Controllers\Controller;
use App\Http\Requests\Studio\GenerateContentCalendarRequest;
use App\Http\Requests\Studio\SchedulePostRequest;
use App\Http\Resources\AiContentCalendarItemResource;
use App\Http\Resources\AiContentCalendarResource;
use App\Http\Resources\ScheduledPostResource;
use App\Http\Response\ApiResponse;
use App\Services\AI\Calendar\AiContentCalendarService;
use App\Services\AI\Schedule\PostScheduleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiContentCalendarController extends Controller
{
    public function __construct(
        private readonly AiContentCalendarService $calendarService,
        private readonly PostScheduleService      $scheduleService,
    ) {}

    public function generate(GenerateContentCalendarRequest $request): JsonResponse
    {
        $calendar = $this->calendarService->initiateAsync(
            (int) auth_user_id(),
            $request->validated(),
        );

        return ApiResponse::success(
            data: new AiContentCalendarResource($calendar),
            message: 'Content calendar generation started.',
            code: 202,
        );
    }

    public function index(Request $request): JsonResponse
    {
        $items = $this->calendarService->paginateCalendarsForUser(
            (int) auth_user_id(),
            $request->integer('per_page', 10),
        );

        return ApiResponse::success(
            data: AiContentCalendarResource::collection($items),
            message: 'Calendars retrieved.',
        );
    }

    public function show(string $uuid): JsonResponse
    {
        $calendar = $this->calendarService->findCalendarForUser($uuid, (int) auth_user_id());
        $calendar->load('items.scheduledPost');

        return ApiResponse::success(
            data: new AiContentCalendarResource($calendar),
            message: 'Calendar retrieved.',
        );
    }

    public function createDraft(string $itemUuid): JsonResponse
    {
        $userId = (int) auth_user_id();
        $item   = $this->calendarService->findItemForUser($itemUuid, $userId);
        $item   = $this->calendarService->createDraftPost($item, $userId);

        return ApiResponse::success(
            data: new AiContentCalendarItemResource($item),
            message: 'Draft post created.',
            code: 201,
        );
    }

    public function scheduleItem(SchedulePostRequest $request, string $itemUuid): JsonResponse
    {
        $userId        = (int) auth_user_id();
        $item          = $this->calendarService->findItemForUser($itemUuid, $userId);
        $item->load('draftPost');

        $scheduledPost = $this->scheduleService->scheduleFromCalendarItem(
            $item,
            $userId,
            $request->scheduledAt(),
            $request->timezone(),
        );

        return ApiResponse::success(
            data: new ScheduledPostResource($scheduledPost),
            message: 'Calendar item scheduled.',
            code: 201,
        );
    }
}
