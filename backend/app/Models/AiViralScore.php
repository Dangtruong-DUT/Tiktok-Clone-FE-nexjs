<?php

namespace App\Models;

use App\Enums\Ai\AiContentSuggestionStatusEnum;
use App\Enums\Ai\ViralScoreLevelEnum;
use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AiViralScore extends Model
{
    use HasUuidObservable;
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'user_id',
        'post_id',
        'upload_file_id',
        'caption',
        'hashtags',
        'overall_score',
        'level',
        'breakdown',
        'strengths',
        'weaknesses',
        'recommendations',
        'improved_caption',
        'suggested_hashtags',
        'status',
        'provider',
        'model',
        'prompt_version',
        'token_usage',
        'error_message',
        'analyzed_at',
    ];

    protected function casts(): array
    {
        return [
            'hashtags'           => 'array',
            'breakdown'          => 'array',
            'strengths'          => 'array',
            'weaknesses'         => 'array',
            'recommendations'    => 'array',
            'suggested_hashtags' => 'array',
            'token_usage'        => 'array',
            'overall_score'      => 'float',
            'status'             => AiContentSuggestionStatusEnum::class,
            'level'              => ViralScoreLevelEnum::class,
            'analyzed_at'        => 'datetime',
            'created_at'         => 'datetime',
            'updated_at'         => 'datetime',
            'deleted_at'         => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function uploadFile(): BelongsTo
    {
        return $this->belongsTo(UploadFile::class, 'upload_file_id');
    }
}
