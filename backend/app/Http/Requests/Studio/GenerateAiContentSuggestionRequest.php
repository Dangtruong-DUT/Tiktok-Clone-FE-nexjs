<?php

namespace App\Http\Requests\Studio;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class GenerateAiContentSuggestionRequest extends BaseRequest
{
    public function rules(): array
    {
        return $this->applyBaseRules([
            'video_title'       => [self::NULLABLE, self::STRING, self::MAX . ':300'],
            'video_description' => [self::NULLABLE, self::STRING, self::MAX . ':2000'],
            'video_transcript'  => [self::NULLABLE, self::STRING, self::MAX . ':5000'],
            'ocr_text'          => [self::NULLABLE, self::STRING, self::MAX . ':1000'],
            'creator_language'  => [self::REQUIRED, self::STRING, Rule::in(['vi', 'en', 'ja', 'ko', 'zh', 'other'])],
            'video_category'    => [self::NULLABLE, self::STRING, self::MAX . ':100'],
            'regenerate'        => [self::NULLABLE, self::BOOLEAN],
        ]);
    }

    public function withValidator(\Illuminate\Contracts\Validation\Validator $validator): void
    {
        $validator->after(function (\Illuminate\Contracts\Validation\Validator $v) {
            $hasContent = $this->filled('video_title')
                || $this->filled('video_description')
                || $this->filled('video_transcript')
                || $this->filled('ocr_text');

            if (! $hasContent) {
                $v->errors()->add(
                    'input',
                    'At least one of video_title, video_description, video_transcript, or ocr_text is required.'
                );
            }
        });
    }
}
