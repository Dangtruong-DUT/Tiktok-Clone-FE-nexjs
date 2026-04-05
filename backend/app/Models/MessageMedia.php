<?php

namespace App\Models;

use App\Enums\Media\MediaTypeEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessageMedia extends Model
{
    protected $fillable = [
        'message_id',
        'upload_file_id',
        'type',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'message_id' => 'integer',
            'upload_file_id' => 'integer',
            'type' => MediaTypeEnum::class,
            'order' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'message_id');
    }

    public function uploadFile(): BelongsTo
    {
        return $this->belongsTo(UploadFile::class, 'upload_file_id');
    }
}
