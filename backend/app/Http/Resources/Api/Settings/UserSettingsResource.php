<?php
namespace App\Http\Resources\Api\Settings;

use App\Http\Resources\BaseJsonResource;

class UserSettingsResource extends BaseJsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'liked_videos_visibility' => $this->liked_videos_visibility,
            'bookmarked_videos_visibility' => $this->bookmarked_videos_visibility,
            'followers_visibility' => $this->followers_visibility,
            'following_visibility' => $this->following_visibility,
            'updated_at' => $this->updated_at->toDateTimeString(),
            'created_at' => $this->created_at->toDateTimeString(),
        ];
    }
}
