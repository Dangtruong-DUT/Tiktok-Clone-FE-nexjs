<?php

namespace App\Http\Requests\Studio;

use App\Enums\Post\PostPublishStatusEnum;
use App\Http\Requests\BaseListRequest;
use Illuminate\Validation\Rule;

class ListStudioPostsRequest extends BaseListRequest
{
    protected array $casts = [
        'per_page'     => 'integer',
        'has_schedule' => 'boolean',
    ];

    /** @return array<string,mixed> */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'q'            => [self::SOMETIMES, self::STRING, self::MAX . ':255'],
            'status'       => [self::SOMETIMES, self::STRING, Rule::in(array_column(PostPublishStatusEnum::cases(), 'value'))],
            'has_schedule' => [self::SOMETIMES, self::BOOLEAN],
            'per_page'     => [self::SOMETIMES, self::INTEGER, self::MIN . ':1', self::MAX . ':100'],
        ]);
    }
}
