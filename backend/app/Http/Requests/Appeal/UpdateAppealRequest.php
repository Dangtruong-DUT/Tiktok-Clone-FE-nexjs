<?php

namespace App\Http\Requests\Appeal;

use App\Http\Requests\BaseRequest;

/**
 * Validates appeal update (edit reason + evidence).
 *
 * Two authentication flows (resolved in controller/service):
 * - Token flow (public): token query/body param proves ownership.
 * - Auth flow: authenticated user must own the appeal.
 *
 * Only pending appeals can be updated.
 */
class UpdateAppealRequest extends BaseRequest
{
    /**
     * Get the validation rules.
     *
     * @return array<string, string|array>
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'reason' => [self::REQUIRED, self::STRING, self::MIN.':20', self::MAX.':1000'],
            'evidence_files' => [self::NULLABLE, self::ARRAY, self::MAX.':5'],
            'evidence_files.*' => [self::REQUIRED, self::IMAGE, self::MAX.':5120'],
            'token' => [self::NULLABLE, self::STRING, self::MIN.':32', self::MAX.':128'],
        ]);
    }
}
