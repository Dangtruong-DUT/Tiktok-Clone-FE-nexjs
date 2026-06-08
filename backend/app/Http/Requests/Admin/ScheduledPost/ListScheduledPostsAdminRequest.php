<?php

namespace App\Http\Requests\Admin\ScheduledPost;

use App\Http\Requests\BaseListRequest;
use Illuminate\Validation\Rule;

class ListScheduledPostsAdminRequest extends BaseListRequest
{
    /** @return array<string,mixed> */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'status'    => ['nullable', 'string', Rule::in(['pending', 'processing', 'published', 'failed', 'cancelled'])],
            'source'    => ['nullable', 'string', Rule::in(['manual', 'calendar'])],
            'user_uuid' => ['nullable', 'string', 'uuid'],
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to'   => ['nullable', 'date_format:Y-m-d'],
            'per_page'  => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
    }
}
