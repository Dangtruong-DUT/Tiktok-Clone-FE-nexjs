<?php
namespace App\Http\Resources\Api\Auth;

use App\Http\Resources\BaseJsonResource;

class AuthResource extends BaseJsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            "uuid" => $this->uuid,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'verify' => $this->verify->value,
            'updated_at' => $this->updated_at->format(\DateTimeInterface::ATOM),
        ];
    }
}
