<?php

namespace App\Enums\Ai;

enum AiCopilotMessageStatusEnum: string
{
    case PENDING  = 'pending';
    case SUCCESS  = 'success';
    case FAILED   = 'failed';
    case ACCEPTED = 'accepted';
    case REJECTED = 'rejected';
}
