<?php

namespace App\Enums\Ai;

enum AiCopilotMessageStatusEnum: string
{
    case PENDING  = 'pending';
    case ACCEPTED = 'accepted';
    case REJECTED = 'rejected';
}
