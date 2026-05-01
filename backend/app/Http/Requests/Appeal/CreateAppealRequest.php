<?php

namespace App\Http\Requests\Appeal;

use App\Http\Requests\BaseRequest;

/**
 * Validates appeal creation for two flows:
 * 1. Token flow (public): token + reason + optional evidence_files
 * 2. New appeal flow (auth): appeal_type + reason + optional resource_id + optional evidence_files
 */
class CreateAppealRequest extends BaseRequest
{
    /**
     * Get the validation rules.
     *
     * @return array<string, string|array>
     */
    public function rules(): array
    {
        $hasToken = $this->filled('token');

        $rules = [
            'reason' => [self::REQUIRED, self::STRING, self::MIN.':20', self::MAX.':1000'],
            'evidence_files' => [self::NULLABLE, self::ARRAY, self::MAX.':5'],
            'evidence_files.*' => [self::REQUIRED, self::IMAGE, self::MAX.':5120'],
        ];

        if ($hasToken) {
            // Token flow — submit evidence for an existing appeal via token
            $rules['token'] = [self::REQUIRED, self::STRING, self::MIN.':32', self::MAX.':128'];
        } else {
            // New appeal flow — create a new appeal (auth verified in service)
            $rules['appeal_type'] = [self::REQUIRED, new \Illuminate\Validation\Rules\Enum(\App\Enums\Appeal\AppealTypeEnum::class)];
            $rules['resource_type'] = [self::REQUIRED, new \Illuminate\Validation\Rules\Enum(\App\Enums\Common\ModelEntityTypeEnum::class)];
            $rules['resource_id'] = [self::REQUIRED, self::INTEGER];
        }

        return $this->applyBaseRules($rules);
    }
}
