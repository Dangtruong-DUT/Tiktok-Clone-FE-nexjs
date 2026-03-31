<?php
namespace App\Models;

use App\Enums\Notification\EntityTypeEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use App\Enums\Notification\NotificationTypeEnum;

class Notification extends Model
{
    protected $fillable = [
        'actor_id',
        'notifiable_id',
        'type',
        'entity_type',
        'entity_id',
        'is_read',
        'data',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'data' => 'array',
        'is_read' => 'boolean',
        'type' => NotificationTypeEnum::class,
        'entity_type' => EntityTypeEnum::class,
        'entity_id' => 'integer',
    ];
    }

    /**
    * The default attributes for the model.
    *
    * @var array<string, mixed>
    */
    protected $attributes = [
        'is_read' => false,
    ];

    /**
     * Get the user who performed the action that triggered the notification.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo The relationship instance.
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /**
     * Get the user who is the recipient of the notification.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo The relationship instance.
     */
    public function notifiable(): BelongsTo
    {
        return $this->belongsTo(User::class, 'notifiable_id');
    }

    /**
     * Get the entity associated with the notification.
     *
     * @return \Illuminate\Database\Eloquent\Relations\MorphTo The relationship instance.
     */
    public function entity(): MorphTo
    {
        return $this->morphMap([
            EntityTypeEnum::POST->value => Post::class,
            EntityTypeEnum::USER->value => User::class,
            EntityTypeEnum::HASHTAG->value => Hashtag::class,
        ]);
    }
}
