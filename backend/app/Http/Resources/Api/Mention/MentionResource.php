<?php
namespace App\Http\Resources\Api\Mention;

use App\Http\Resources\BaseJsonResource;

class MentionResource extends BaseJsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'name' => $this->name,
            'email' => $this->email,
        ];
    }
}
