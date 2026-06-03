<?php

namespace App\Models;

use App\Enums\Wellness\WellnessActionEnum;
use App\Enums\Wellness\WellnessRuleTypeEnum;
use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WellnessRule extends Model
{
    use HasUuidObservable;

    protected $fillable = [
        'uuid',
        'user_id',
        'type',
        'conditions',
        'action',
        'title',
        'message',
        'is_enabled',
        'natural_language_input',
    ];

    protected function casts(): array
    {
        return [
            'type'       => WellnessRuleTypeEnum::class,
            'action'     => WellnessActionEnum::class,
            'conditions' => 'array',
            'is_enabled' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
