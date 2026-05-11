<?php

namespace App\Models;

use App\Enums\User\RelationshipTypeEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Relationship extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
 */
    protected $fillable = [
        'user_id',
        'target_user_id',
        'type',
    ];

    /*
    * Get the attributes that should be cast.
    *
    * @return array<string, string>
    */
    protected function casts(): array
    {
        return [
            'type' => RelationshipTypeEnum::class,
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the user that has relationship with the target user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo The relationship instance.
 */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the target user that has relationship with the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo The relationship instance.
 */
    public function targetUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }
}
