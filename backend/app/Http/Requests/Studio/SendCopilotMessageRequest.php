<?php

namespace App\Http\Requests\Studio;

use Illuminate\Foundation\Http\FormRequest;

class SendCopilotMessageRequest extends FormRequest
{
    private const MAX_FRAME_SIZE_KB = 512;
    private const MAX_FRAMES        = 5;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content'                           => ['required', 'string', 'min:1', 'max:2000'],
            'attachments'                       => ['nullable', 'array'],
            'attachments.timeline'              => ['nullable', 'array'],
            'attachments.timeline.start_seconds' => ['nullable', 'numeric', 'min:0'],
            'attachments.timeline.end_seconds'   => ['nullable', 'numeric', 'min:0', 'gt:attachments.timeline.start_seconds'],
            'attachments.frames'                => ['nullable', 'array', 'max:' . self::MAX_FRAMES],
            'attachments.frames.*'              => ['nullable', 'string'], // base64 strings validated in custom rule
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            $frames = $this->input('attachments.frames', []);
            foreach ($frames as $i => $frame) {
                // Strip data URI prefix before size check
                $data   = (string) preg_replace('/^data:image\/\w+;base64,/', '', (string) $frame);
                $bytes  = (int) ceil(strlen($data) * 3 / 4);
                if ($bytes > self::MAX_FRAME_SIZE_KB * 1024) {
                    $v->errors()->add("attachments.frames.{$i}", 'Each frame must be under 512KB.');
                }
            }
        });
    }
}
