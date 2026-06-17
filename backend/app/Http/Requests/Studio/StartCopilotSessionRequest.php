<?php

namespace App\Http\Requests\Studio;

use App\Http\Requests\BaseRequest;

class StartCopilotSessionRequest extends BaseRequest
{
    public function rules(): array
    {
        return $this->applyBaseRules([
            'upload_session_uuid'                => [self::NULLABLE, self::STRING, self::MAX . ':36'],
            'post_uuid'                          => [self::NULLABLE, self::STRING, self::MAX . ':36'],
            'post_id'                            => [self::NULLABLE, self::INTEGER],
            'video_size_bytes'                   => [self::NULLABLE, self::INTEGER, self::MIN . ':0'],
            'locale'                             => [self::NULLABLE, self::STRING, self::MAX . ':10'],
            'context_snapshot'                   => [self::NULLABLE, self::ARRAY],
            'context_snapshot.video_description' => [self::NULLABLE, self::STRING, self::MAX . ':2000'],
            'context_snapshot.video_category'    => [self::NULLABLE, self::STRING, self::MAX . ':100'],
            'context_snapshot.video_transcript'  => [self::NULLABLE, self::STRING, self::MAX . ':5000'],
            'context_snapshot.ocr_text'          => [self::NULLABLE, self::STRING, self::MAX . ':2000'],
            'context_snapshot.creator_language'  => [self::NULLABLE, self::STRING, self::MAX . ':10'],
            'context_snapshot.surface'           => [self::NULLABLE, self::STRING, self::MAX . ':50'],
        ]);
    }
}
