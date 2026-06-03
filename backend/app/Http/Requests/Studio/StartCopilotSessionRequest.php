<?php

namespace App\Http\Requests\Studio;

use Illuminate\Foundation\Http\FormRequest;

class StartCopilotSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'upload_session_uuid'           => ['nullable', 'string', 'max:36'],
            'post_uuid'                     => ['nullable', 'string', 'max:36'],
            'post_id'                       => ['nullable', 'integer'],
            'video_size_bytes'              => ['nullable', 'integer', 'min:0'],
            'locale'                        => ['nullable', 'string', 'max:10'],
            'context_snapshot'              => ['nullable', 'array'],
            'context_snapshot.video_title'  => ['nullable', 'string', 'max:255'],
            'context_snapshot.video_description' => ['nullable', 'string', 'max:2000'],
            'context_snapshot.video_category'    => ['nullable', 'string', 'max:100'],
            'context_snapshot.video_transcript'  => ['nullable', 'string', 'max:5000'],
            'context_snapshot.ocr_text'          => ['nullable', 'string', 'max:2000'],
            'context_snapshot.creator_language'  => ['nullable', 'string', 'max:10'],
        ];
    }
}
