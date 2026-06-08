<?php

namespace App\Enums\Wellness;

enum ScreenTimePeriodEnum: string
{
    case TODAY = 'today';
    case WEEK  = 'week';
    case MONTH = 'month';
}
