<?php

namespace App\Enums\Ai;

enum AiModerationStatusEnum: string
{
    case OPEN     = 'open';
    case RESOLVED = 'resolved';
}
