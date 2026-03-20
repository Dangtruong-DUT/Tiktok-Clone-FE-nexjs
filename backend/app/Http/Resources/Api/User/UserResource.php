<?php
namespace App\Http\Resources\Api\User;

use App\Http\Resources\BaseJsonResource;
use App\Traits\HasAuthUser;

class UserResource extends BaseJsonResource
{
    use HasAuthUser;

    public function toArray($request): array
    {
        $currentUser = $this->guard()->user();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'date_of_birth' => $this->date_of_birth->toDateString(),
            'bio' => $this->bio,
            'location' => $this->location,
            'website' => $this->website,
            'avatar' => $this->relationLoaded('avatarFile') ? $this->avatar : null,
            'verify' => $this->verify?->value,
            'following_count' => (int) ($this->following_count ?? 0),
            'followers_count' => (int) ($this->followers_count ?? 0),
            'likes_count' => (int) ($this->likes_count ?? 0),
            'is_followed' => $currentUser ? (bool) ($this->is_followed ?? false) : false,
            'is_owner' => $currentUser ? (bool) (($this->is_owner ?? null) ?? ($currentUser->id === $this->id)) : false,
            'role' => $this->role->value,
            'created_at' => $this->created_at->toDateTimeString(),
        ];
    }
}
