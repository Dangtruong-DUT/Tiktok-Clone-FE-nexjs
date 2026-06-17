<?php

namespace App\Http\Requests\Studio;

use App\Http\Requests\BaseRequest;

class SendCopilotMessageRequest extends BaseRequest
{
    private const MAX_FRAME_SIZE_KB   = 512;
    private const MAX_FRAMES          = 5;
    private const MAX_VIDEO_CLIP_MB   = 15;

    public function rules(): array
    {
        return $this->applyBaseRules([
            'content'                            => [self::REQUIRED, self::STRING, self::MIN . ':1', self::MAX . ':2000'],
            'attachments'                        => [self::NULLABLE, self::ARRAY],
            'attachments.timeline'               => [self::NULLABLE, self::ARRAY],
            'attachments.timeline.start_seconds' => [self::NULLABLE, self::NUMERIC, self::MIN . ':0'],
            'attachments.timeline.end_seconds'   => [self::NULLABLE, self::NUMERIC, self::MIN . ':0', self::GT . ':attachments.timeline.start_seconds'],
            'attachments.frames'                 => [self::NULLABLE, self::ARRAY, self::MAX . ':' . self::MAX_FRAMES],
            'attachments.frames.*'               => [self::NULLABLE, self::STRING],
            'attachments.video_clip'             => [self::NULLABLE, self::STRING],
            'surface'                            => [self::NULLABLE, self::STRING, self::IN . ':admin,studio_editor,studio_general'],
            // Live form content — what the creator is currently writing
            'current_content'                    => [self::NULLABLE, self::ARRAY],
            'current_content.caption'            => [self::NULLABLE, self::STRING, self::MAX . ':2000'],
            'current_content.hashtags'           => [self::NULLABLE, self::STRING, self::MAX . ':500'],
        ]);
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            // Validate individual frame sizes
            $frames = $this->input('attachments.frames', []);
            foreach ($frames as $i => $frame) {
                $data  = (string) preg_replace('/^data:image\/\w+;base64,/', '', (string) $frame);
                $bytes = (int) ceil(strlen($data) * 3 / 4);
                if ($bytes > self::MAX_FRAME_SIZE_KB * 1024) {
                    $v->errors()->add("attachments.frames.{$i}", 'Each frame must be under 512KB.');
                }
            }

            // Validate video clip size
            $clip = $this->input('attachments.video_clip');
            if ($clip !== null) {
                $data  = (string) preg_replace('/^data:video\/\w+;base64,/', '', (string) $clip);
                $bytes = (int) ceil(strlen($data) * 3 / 4);
                if ($bytes > self::MAX_VIDEO_CLIP_MB * 1024 * 1024) {
                    $v->errors()->add('attachments.video_clip', 'Video clip must be under ' . self::MAX_VIDEO_CLIP_MB . 'MB.');
                }
            }
        });
    }
}
