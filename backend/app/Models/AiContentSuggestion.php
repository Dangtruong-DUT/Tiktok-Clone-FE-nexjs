<?php

namespace App\Models;

use App\Enums\Ai\AiContentIntentEnum;
use App\Enums\Ai\AiContentSuggestionStatusEnum;
use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AiContentSuggestion extends Model
{
    use HasUuidObservable, SoftDeletes;

    protected $fillable = [
        'uuid',
        'user_id',
        'post_id',
        'upload_file_id',
        'video_title',
        'video_description',
        'video_transcript',
        'ocr_text',
        'creator_language',
        'input_category',
        'short_caption',
        'professional_caption',
        'viral_caption',
        'hashtags',
        'topic',
        'category_suggestion',
        'target_audience',
        'content_intent',
        'confidence_score',
        'safety_notes',
        'provider',
        'model',
        'prompt_version',
        'status',
        'error_message',
        'request_hash',
        'raw_response',
        'token_usage',
        'generated_at',
        'applied_at',
    ];

    protected function casts(): array
    {
        return [
            'hashtags'         => 'array',
            'raw_response'     => 'array',
            'token_usage'      => 'array',
            'confidence_score' => 'float',
            'status'           => AiContentSuggestionStatusEnum::class,
            'content_intent'   => AiContentIntentEnum::class,
            'generated_at'     => 'datetime',
            'applied_at'       => 'datetime',
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
        return $this->belongsTo(UploadFile::class);
    }
}
