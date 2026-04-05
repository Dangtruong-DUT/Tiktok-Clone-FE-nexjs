<?php

namespace App\Models;

use App\Enums\Conversation\ConversationTypeEnum;
use App\Models\ConversationParticipant;
use App\Models\Message;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Conversation extends Model
{
    protected $fillable = [
        'type',
    ];

    protected function casts(): array
    {
        return [
            'type' => ConversationTypeEnum::class,
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'unread_count' => 'integer',
        ];
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'conversation_participants', 'conversation_id', 'user_id')
            ->withPivot('last_read_at');
    }

    public function participantRows(): HasMany
    {
        return $this->hasMany(ConversationParticipant::class, 'conversation_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'conversation_id');
    }

    public function latestMessage(): HasOne
    {
        return $this->hasOne(Message::class, 'conversation_id')->latestOfMany('created_at');
    }

    #[Scope]
    public function forParticipant(Builder $query, int $userId): Builder
    {
        return $query->whereHas('participants', fn (Builder $participantQuery) => $participantQuery->where('user_id', $userId));
    }
}
