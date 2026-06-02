<?php

namespace App\Http\Requests\Wellness;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVideoTimeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    /** @return array<string,mixed> */
    public function rules(): array
    {
        return [
            'video_seconds' => ['required', 'integer', 'min:0', 'max:86400'],
        ];
    }
}
