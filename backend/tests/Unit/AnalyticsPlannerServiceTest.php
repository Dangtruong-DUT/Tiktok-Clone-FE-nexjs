<?php

use App\Contracts\AI\GeminiClientInterface;
use App\DTOs\AI\Gemini\GeminiResponse;
use App\Models\AiStudioSetting;
use App\Repositories\AiPromptTemplateRepository;
use App\Repositories\AiStudioSettingRepository;
use App\Services\AI\Copilot\Gateway\GatewayTask;
use App\Services\Analytics\AnalyticsPlannerService;
use App\Services\Analytics\MetricsCatalog;
use App\Services\Analytics\Tools\AbstractAnalyticsTool;
use Carbon\Carbon;

// ─── Helpers ────────────────────────────────────────────────────────────────

function makePlannerService(?string $geminiJson = null): AnalyticsPlannerService
{
    $gemini = Mockery::mock(GeminiClientInterface::class);
    $gemini->shouldReceive('send')
        ->once()
        ->andReturn(new GeminiResponse(
            $geminiJson ?? '{"needs_clarification":true,"clarification_question":"Which stats?"}',
            ['prompt_tokens' => 1, 'completion_tokens' => 1, 'total_tokens' => 2]
        ));

    $templateRepo = Mockery::mock(AiPromptTemplateRepository::class);
    $templateRepo->shouldReceive('findByIntent')->andReturnNull();

    $settingRepo = Mockery::mock(AiStudioSettingRepository::class);
    $settingRepo->shouldReceive('current')->andReturn(new AiStudioSetting([
        'gemini_model'                     => 'gemini-1.5-flash',
        'temperature'                      => 0.1,
        'max_output_tokens'                => 400,
        'timeout_seconds'                  => 30,
        'copilot_enabled'                  => true,
        'copilot_session_ttl_hours'        => 24,
        'copilot_max_messages_per_session' => 50,
    ]));

    return new AnalyticsPlannerService($gemini, $templateRepo, new MetricsCatalog(), $settingRepo);
}

function makeTask(array $overrides = []): GatewayTask
{
    return new GatewayTask(
        taskType:              $overrides['taskType'] ?? 'analytics',
        scope:                 $overrides['scope'] ?? 'creator',
        subject:               $overrides['subject'] ?? 'self',
        intent:                $overrides['intent'] ?? 'unclear',
        entities:              $overrides['entities'] ?? [],
        filters:               $overrides['filters'] ?? [],
        period:                $overrides['period'] ?? null,
        compareWith:           $overrides['compareWith'] ?? null,
        needsTools:            $overrides['needsTools'] ?? true,
        needsRag:              $overrides['needsRag'] ?? false,
        needsClarification:    $overrides['needsClarification'] ?? false,
        clarificationQuestion: $overrides['clarificationQuestion'] ?? null,
        confidence:            $overrides['confidence'] ?? 0.9,
    );
}

// ─── scopeDefaultPlan: intent hint ──────────────────────────────────────────

it('uses task intent as fallback when planner needs clarification — admin with appeal filters', function () {
    $task = makeTask([
        'scope'   => 'admin',
        'subject' => 'platform',
        'intent'  => 'get_appeal_overview',
        'filters' => ['appeal_status' => 'pending'],
    ]);

    $plan = makePlannerService()->plan($task, true, 'Kháng cáo đang chờ xử lý thế nào rồi?');

    expect($plan['needs_clarification'])->toBeFalse()
        ->and($plan['response_view'])->toBe('summary_with_breakdown')
        ->and($plan['tools'])->toHaveCount(1)
        ->and($plan['tools'][0]['tool_name'])->toBe('get_appeal_overview')
        ->and($plan['tools'][0]['params']['filters']['appeal_status'])->toBe('pending');
});

it('uses task intent as fallback for appeal SLA questions', function () {
    $task = makeTask([
        'scope'   => 'admin',
        'subject' => 'platform',
        'intent'  => 'get_appeal_sla_metrics',
    ]);

    $plan = makePlannerService()->plan($task, true, 'Hãy cho tôi biết backlog kháng cáo và SLA xử lý.');

    expect($plan['needs_clarification'])->toBeFalse()
        ->and($plan['response_view'])->toBe('summary_card')
        ->and($plan['tools'])->toHaveCount(1)
        ->and($plan['tools'][0]['tool_name'])->toBe('get_appeal_sla_metrics');
});

it('uses get_post_overview as creator default when intent is unclear', function () {
    // fromArray() coerces null intent to 'unclear' — use the same string
    $task = makeTask(['scope' => 'creator', 'intent' => 'unclear']);

    $plan = makePlannerService()->plan($task, false, 'Thống kê tài khoản của tôi');

    expect($plan['needs_clarification'])->toBeFalse()
        ->and($plan['tools'][0]['tool_name'])->toBe('get_post_overview');
});

it('uses get_user_growth as admin default when intent is unclear', function () {
    $task = makeTask(['scope' => 'admin', 'subject' => 'platform', 'intent' => 'unclear']);

    $plan = makePlannerService()->plan($task, true, 'Thống kê hệ thống');

    expect($plan['needs_clarification'])->toBeFalse()
        ->and($plan['tools'][0]['tool_name'])->toBe('get_user_growth');
});

it('does not use admin-only tool hint for non-admin user', function () {
    $task = makeTask(['scope' => 'creator', 'intent' => 'get_user_growth']); // admin-only

    $plan = makePlannerService()->plan($task, false, 'Thống kê người dùng');

    expect($plan['needs_clarification'])->toBeFalse()
        ->and($plan['tools'][0]['tool_name'])->toBe('get_post_overview'); // scope default
});

// ─── Period resolution in fallback plan ─────────────────────────────────────

it('falls back to tool default_period when task period is null', function () {
    $task = makeTask(['scope' => 'creator', 'intent' => 'get_screen_time_overview', 'period' => null]);

    $plan = makePlannerService()->plan($task, false, 'Thời gian sử dụng của tôi');

    expect($plan['tools'][0]['params']['period'])->toBe('current_week');
});

it('uses task period when valid', function () {
    $task = makeTask(['scope' => 'creator', 'intent' => 'get_post_overview', 'period' => 'today']);

    $plan = makePlannerService()->plan($task, false, 'Bài đăng hôm nay');

    expect($plan['tools'][0]['params']['period'])->toBe('today');
});

it('falls back to current_week when planner returns invalid period for a tool', function () {
    $geminiJson = json_encode([
        'tools'               => [['tool_name' => 'get_post_overview', 'params' => ['period' => 'invalid_period']]],
        'response_view'       => 'summary_card',
        'needs_clarification' => false,
        'clarification_question' => null,
    ]);

    $task = makeTask(['scope' => 'creator', 'intent' => 'get_post_overview']);
    $plan = makePlannerService($geminiJson)->plan($task, false, 'Bài đăng của tôi');

    expect($plan['tools'][0]['params']['period'])->toBe('current_week');
});

// ─── resolveDateRange — primary periods ─────────────────────────────────────

function makeConcreteTool(): object
{
    return new class extends AbstractAnalyticsTool {
        public function name(): string { return 'test_tool'; }
        public function adminOnly(): bool { return false; }
        public function run(array $params, ?int $userId, bool $isAdmin): array { return []; }
        public function resolveRange(string $period): array { return $this->resolveDateRange($period); }
    };
}

it('resolveDateRange today returns start and end of current day', function () {
    Carbon::setTestNow('2026-06-18 14:30:00');
    $range = makeConcreteTool()->resolveRange('today');

    expect($range['from']->toDateString())->toBe('2026-06-18')
        ->and($range['to']->toDateString())->toBe('2026-06-18')
        ->and($range['from']->hour)->toBe(0)
        ->and($range['to']->hour)->toBe(23);

    Carbon::setTestNow();
});

it('resolveDateRange current_week returns Monday to Sunday', function () {
    Carbon::setTestNow('2026-06-18 14:30:00'); // Thursday
    $range = makeConcreteTool()->resolveRange('current_week');

    expect($range['from']->dayOfWeek)->toBe(Carbon::MONDAY)
        ->and($range['to']->dayOfWeek)->toBe(Carbon::SUNDAY)
        ->and($range['from']->lte($range['to']))->toBeTrue();

    Carbon::setTestNow();
});

it('resolveDateRange current_month spans first to last day of month', function () {
    Carbon::setTestNow('2026-06-18 14:30:00');
    $range = makeConcreteTool()->resolveRange('current_month');

    expect($range['from']->day)->toBe(1)
        ->and($range['from']->month)->toBe(6)
        ->and($range['to']->month)->toBe(6)
        ->and($range['from']->lte($range['to']))->toBeTrue();

    Carbon::setTestNow();
});

it('resolveDateRange current_week from is before to', function () {
    $range = makeConcreteTool()->resolveRange('current_week');
    expect($range['from']->lt($range['to']))->toBeTrue();
});

it('resolveDateRange current_month from is before to', function () {
    $range = makeConcreteTool()->resolveRange('current_month');
    expect($range['from']->lt($range['to']))->toBeTrue();
});

// ─── Config: all tools have primary periods as valid defaults ────────────────

it('all tools have default_period set to one of the primary or system periods', function () {
    $validDefaults = ['today', 'yesterday', 'current_week', 'current_month'];
    $tools         = config('analytics.tools', []);

    foreach ($tools as $name => $def) {
        $default = $def['default_period'] ?? null;
        expect($default)
            ->not->toBeNull("Tool '{$name}' has no default_period")
            ->toBeIn($validDefaults, "Tool '{$name}' has unexpected default_period '{$default}'");
    }
});

it('primary_periods config contains today, current_week, and current_month', function () {
    $primary = config('analytics.primary_periods', []);

    expect($primary)->toContain('today')
        ->toContain('current_week')
        ->toContain('current_month');
});

it('all tool default_periods exist in the global periods list', function () {
    $validPeriods = config('analytics.periods', []);
    $tools        = config('analytics.tools', []);

    foreach ($tools as $name => $def) {
        $default = $def['default_period'] ?? '';
        expect(in_array($default, $validPeriods, true))
            ->toBeTrue("Tool '{$name}' default_period '{$default}' is not in the global periods list");
    }
});
