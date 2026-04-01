<?php
namespace App\Models;

use App\Enums\Notification\EntityTypeEnum;
use App\Enums\Notification\NotificationTabEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use App\Enums\Notification\NotificationTypeEnum;
use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;

class Notification extends Model
{
    use HasUuidObservable;

    protected $fillable = [
        'uuid',
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
        return $this->morphTo(__FUNCTION__, 'entity_type', 'entity_id');
    }

    /**
     * Scope a query to filter notifications by tab.
     *
     * @param Builder $query The query builder instance.
     * @param string $tab The tab to filter by. Supported values: 'likes', 'comments', 'mentions', 'followers', 'all'.
     * @return Builder The modified query builder instance.
     */
    #[Scope]
    public function ofTypeByTab(Builder $query, string $tab): Builder
    {
        $tabEnum = NotificationTabEnum::tryFrom($tab) ?? NotificationTabEnum::ALL;
        $notificationTypeValue = $tabEnum->notificationTypeValue();

        return $query->when($notificationTypeValue !== null, function ($q) use ($notificationTypeValue) {
            $q->where('type', $notificationTypeValue);
        });
    }

    /**
     * Scope a query to filter notifications by notifiable_id.
     *
     * @param Builder $query The query builder instance.
     * @param int $notifiableId The ID of the notifiable user.
     * @return Builder The modified query builder instance.
     */
    #[Scope]
    public function ofNotifiable(Builder $query, int $notifiableId): Builder
    {
        return $query->where('notifiable_id', $notifiableId);
    }
}
