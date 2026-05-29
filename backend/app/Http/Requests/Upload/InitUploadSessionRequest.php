<?php

namespace App\Http\Requests\Upload;

use App\Http\Requests\BaseRequest;

class InitUploadSessionRequest extends BaseRequest
{
    /**
     * Validation rules for initiating a new video upload session.
     */
    public function rules(): array
    {
        $maxBytes     = (int) config('video.upload.max_file_size_bytes');
        $allowedTypes = implode(',', config('video.upload.allowed_mime_types', []));

        return $this->applyBaseRules([
            'file_name' => [
                self::REQUIRED,
                self::STRING,
                self::MAX . ':255',
            ],
            'file_size' => [
                self::REQUIRED,
                self::INTEGER,
                self::MIN . ':1',
                self::MAX . ':' . $maxBytes,
            ],
            'mime_type' => [
                self::REQUIRED,
                self::STRING,
                'in:' . $allowedTypes,
            ],
        ]);
    }

    /**
     * Custom validation messages for upload session fields.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        $maxMb = round(config('video.upload.max_file_size_bytes') / 1024 / 1024);

        return [
            'file_size.max' => "File size must not exceed {$maxMb} MB.",
            'mime_type.in'  => 'Only mp4, mov, and webm video files are supported.',
        ];
    }
}
