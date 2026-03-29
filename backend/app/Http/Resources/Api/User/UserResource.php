<?php
namespace App\Http\Resources\Api\User;

use App\Http\Resources\BaseJsonResource;
use App\Traits\HasAuthUser;

class UserResource extends BaseJsonResource
{
    use HasAuthUser;

    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'date_of_birth' => $this->date_of_birth->toDateString(),
            'bio' => $this->bio,
            'location' => $this->location,
            'website' => $this->website,
            'avatar' => $this->avatar_url,
            'verify' => $this->verify?->value,
            'following_count' => $this->following_count,
            'followers_count' => $this->followers_count,
            'likes_count' => $this->likes_count,
            'is_followed' => $this->is_followed,
            'is_owner' => $this->whenNotNull($this->is_owner),
            'role' => $this->role->value,
            'created_at' => $this->created_at->toDateTimeString(),
        ];
    }
}
