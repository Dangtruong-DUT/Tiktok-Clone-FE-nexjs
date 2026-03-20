<?php
namespace App\Http\Resources\Api\User;

use App\Http\Resources\BaseJsonResource;

class UserResource extends BaseJsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'date_of_birth' => $this->date_of_birth->toDateString(),
            'bio' => $this->bio,
            'location' => $this->location,
            'website' => $this->website,
            'avatar' => $this->avatar,
            'cover_photo' => $this->cover_photo,
            'following_count' => $this->following_count,
            'followers_count' => $this->followers_count,
            'likes_count' => $this->likes_count,
            'is_followed' => $this->is_followed,
            'is_owner' => $this->is_owner,
            'role' => $this->role->value,
            'created_at' => $this->created_at->toDateTimeString(),
        ];
    }
}

// export interface UserType {
//     _id: string;
//     name: string;
//     email: string;
//     password: string;
//     date_of_birth: string;
//     updated_at: string;
//     created_at: string;
//     verify: UserVerifyStatus;
//     bio: string;
//     location: string;
//     website: string;
//     username: string;
//     avatar: string;
//     cover_photo: string;
//     following_count: number;
//     followers_count: number;
//     likes_count: number;
//     is_followed: boolean;
//     isOwner: boolean;
//     role: Role;
// }
