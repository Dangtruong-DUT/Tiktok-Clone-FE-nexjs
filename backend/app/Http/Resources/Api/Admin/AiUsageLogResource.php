<?php

namespace App\Http\Resources\Api\Admin;

use App\Http\Resources\BaseJsonResource;
use Illuminate\Http\Request;

class AiUsageLogResource extends BaseJsonResource
{
    /**
     * @return array<string,mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'user_id'      => $this->user_id,
            'intent'       => $this->intent,
            'total_tokens' => $this->total_tokens,
            'cost_usd'     => $this->cost_usd,
            'latency_ms'   => $this->latency_ms,
            'status'       => $this->status,
            'model'        => $this->model,
            'created_at'   => $this->created_at?->toISOString(),
            'user'         => $this->when($this->relationLoaded('user') && $this->user, [
                'uuid'       => $this->user->uuid,
                'username'   => $this->user->username,
                'avatar_url' => $this->user->avatar_url,
            ]),
        ];
    }
}
