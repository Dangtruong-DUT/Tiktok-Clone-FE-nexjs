<?php

namespace App\Http\Requests;

use DateTimeInterface;

abstract class BaseListRequest extends BaseRequest
{
    /**
     * @var array casts
     */
    protected array $casts = [
        'limit' => 'integer',
        'offset' => 'integer',
    ];

    /**
    * set common rules
    */
    protected function setCommonRules(): void
    {
        $this->commonRules = [
            'keyword' => [self::STRING, self::MAX.':'.'100'],
            'created_date_from' => [self::DATE_FORMAT . ':' . DateTimeInterface::ATOM],
            'created_date_to' => [self::DATE_FORMAT . ':' . DateTimeInterface::ATOM],
        ];
    }

    /**
     * prepare for validation: remove null values
     * @return void
     */
    protected function prepareForValidation()
    {
        parent::prepareForValidation();
        $validationData = parent::validationData();
        foreach ($validationData as $key => $value) {
            if ((empty($value) || $value === 'null') && $value !== 0 && $value !== '0') {
                unset($validationData[$key]);
            }
        }
        $this->replace($validationData);
    }
}
