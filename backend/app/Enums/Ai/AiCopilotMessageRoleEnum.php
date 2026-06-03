<?php

namespace App\Enums\Ai;

enum AiCopilotMessageRoleEnum: string
{
    case USER      = 'user';
    case ASSISTANT = 'assistant';
    case SYSTEM    = 'system';
}
