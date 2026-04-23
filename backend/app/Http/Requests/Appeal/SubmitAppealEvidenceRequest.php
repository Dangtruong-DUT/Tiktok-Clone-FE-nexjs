<?php

namespace App\Http\Requests\Appeal;

use App\Http\Requests\BaseRequest;

/**
 * Validates appeal evidence submission: token, reason, and evidence image files.
 */
class SubmitAppealEvidenceRequest extends BaseRequest
{
    /**
     * Get the validation rules.
     * @return array<string, string|array>
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'token' => [self::REQUIRED, self::STRING, self::MIN . ':32', self::MAX . ':128'],
            'reason' => [self::REQUIRED, self::STRING, self::MIN . ':20', self::MAX . ':1000'],
            'evidence_files' => [self::NULLABLE, self::ARRAY, self::MAX . ':5'],
            'evidence_files.*' => [self::REQUIRED, self::IMAGE, self::MAX . ':5120'],
        ]);
    }
}
