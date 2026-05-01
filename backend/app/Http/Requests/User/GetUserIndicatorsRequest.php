<?php

namespace App\Http\Requests\User;

use App\Http\Requests\BaseRequest;

class GetUserIndicatorsRequest extends BaseRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'fromDate' => $this->query('fromDate'),
            'toDate' => $this->query('toDate'),
        ]);
    }

    /**
     * Set rules
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'fromDate' => [
                self::REQUIRED,
                self::STRING,
                self::MIN.':10',
                self::MAX.':30',
                self::DATE,
            ],
            'toDate' => [
                self::REQUIRED,
                self::STRING,
                self::MIN.':10',
                self::MAX.':30',
                self::DATE,
                self::AFTER_OR_EQUAL.':fromDate',
            ],
        ]);
    }
}
