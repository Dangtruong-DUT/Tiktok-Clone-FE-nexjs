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

    /**
     * Custom validation messages from lang files.
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'evidence_files.max' => __('appeal.evidence_files.max'),
            'evidence_files.*.image' => __('appeal.evidence_files.item_image'),
            'evidence_files.*.max' => __('appeal.evidence_files.item_max'),
            'reason.min' => __('appeal.reason.min'),
            'reason.max' => __('appeal.reason.max'),
            'token.required' => __('appeal.token.required'),
        ];
    }
}
