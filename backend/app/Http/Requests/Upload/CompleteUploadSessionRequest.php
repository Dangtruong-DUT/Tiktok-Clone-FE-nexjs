<?php

namespace App\Http\Requests\Upload;

use App\Http\Requests\BaseRequest;

class CompleteUploadSessionRequest extends BaseRequest
{
    /**
     * Validation rules for completing an upload session.
     *
     * The `parts` array is required only for multipart uploads; single-file
     * uploads send an empty body and the field is omitted entirely.
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'parts' => [
                self::SOMETIMES,
                self::NULLABLE,
                self::ARRAY,
                self::MIN . ':1',
            ],
            'parts.*.part_number' => [
                self::REQUIRED,
                self::INTEGER,
                self::MIN . ':1',
                self::MAX . ':10000',
            ],
            'parts.*.etag' => [
                self::REQUIRED,
                self::STRING,
                self::MAX . ':255',
            ],
        ]);
    }
}
