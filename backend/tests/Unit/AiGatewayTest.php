<?php

use App\Contracts\AI\GeminiClientInterface;
use App\DTOs\AI\Gemini\GeminiResponse;
use App\Models\AiStudioSetting;
use App\Repositories\AiPromptTemplateRepository;
use App\Repositories\AiStudioSettingRepository;
use App\Services\AI\Copilot\Gateway\AiGateway;
use Illuminate\Support\Facades\Cache;

function makeGatewayService(string $responseJson): AiGateway
{
    Cache::shouldReceive('remember')->andReturn([]);

    $gemini = Mockery::mock(GeminiClientInterface::class);
    $gemini->shouldReceive('send')
        ->once()
        ->andReturn(new GeminiResponse(
            $responseJson,
            ['prompt_tokens' => 1, 'completion_tokens' => 1, 'total_tokens' => 2]
        ));

    $templateRepo = Mockery::mock(AiPromptTemplateRepository::class);
    $templateRepo->shouldReceive('findByIntent')->andReturnNull();

    $settingRepo = Mockery::mock(AiStudioSettingRepository::class);
    $settingRepo->shouldReceive('current')->andReturn(new AiStudioSetting([
        'gemini_model'                     => 'gemini-1.5-flash',
        'temperature'                      => 0.1,
        'max_output_tokens'                => 5000,
        'timeout_seconds'                  => 30,
        'copilot_enabled'                  => true,
        'copilot_session_ttl_hours'        => 24,
        'copilot_max_messages_per_session' => 50,
    ]));

    return new AiGateway($gemini, $templateRepo, $settingRepo);
}

it('routes explicit segment analysis questions to video review', function () {
    $gateway = makeGatewayService('{"task_type":"unknown","scope":"creator","subject":"self","intent":"unclear","entities":[],"filters":{},"period":null,"compare_with":null,"needs_tools":false,"needs_rag":false,"needs_clarification":true,"clarification_question":"I am not fully sure what you need.","confidence":0.2}');

    $task = $gateway->understand(
        'Analyze this video segment from 00:00 to 00:05',
        'en',
        false,
        'studio_editor',
        []
    );

    expect($task->taskType)->toBe('video_review')
        ->and($task->intent)->toBe('analyze_video_segment')
        ->and($task->subject)->toBe('specific_video');
});

it('does not route segment analysis outside the editor surface', function () {
    $gateway = makeGatewayService('{"task_type":"unknown","scope":"creator","subject":"self","intent":"unclear","entities":[],"filters":{},"period":null,"compare_with":null,"needs_tools":false,"needs_rag":false,"needs_clarification":true,"clarification_question":"I am not fully sure what you need.","confidence":0.2}');

    $task = $gateway->understand(
        'Analyze this video segment from 00:00 to 00:05',
        'en',
        false,
        'studio_general',
        []
    );

    expect($task->taskType)->toBe('unknown');
});
